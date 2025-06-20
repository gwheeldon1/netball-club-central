
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Bell,
  Plus,
  Activity,
  Target,
  Award,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalPlayers: number;
  totalTeams: number;
  upcomingEvents: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const { hasRole, userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalTeams: 0,
    upcomingEvents: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get players count
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      // Get teams count
      const { count: teamsCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('archived', false);

      // Get upcoming events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', new Date().toISOString());

      // Get pending approvals count (if admin/manager)
      let approvalsCount = 0;
      if (hasRole('admin') || hasRole('manager')) {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');
        approvalsCount = count || 0;
      }

      setStats({
        totalPlayers: playersCount || 0,
        totalTeams: teamsCount || 0,
        upcomingEvents: eventsCount || 0,
        pendingApprovals: approvalsCount
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "primary",
    href 
  }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
    color?: string;
    href?: string;
  }) => {
    const CardWrapper = ({ children }: { children: React.ReactNode }) => (
      <Card className="transition-all duration-300 hover:shadow-elevation-medium hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <p className="text-xs text-muted-foreground">{trend}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-${color}/10`}>
              <Icon className={`h-6 w-6 text-${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );

    return href ? (
      <Link to={href}>
        <CardWrapper>{null}</CardWrapper>
      </Link>
    ) : (
      <CardWrapper>{null}</CardWrapper>
    );
  };

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hasRole('admin') && (
            <>
              <Button asChild className="justify-start h-auto py-3">
                <Link to="/teams/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-auto py-3">
                <Link to="/events/new">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Event
                </Link>
              </Button>
            </>
          )}
          {(hasRole('coach') || hasRole('manager')) && (
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link to="/attendance">
                <Clock className="h-4 w-4 mr-2" />
                Mark Attendance
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="justify-start h-auto py-3">
            <Link to="/analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back to Club Manager</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back{userProfile?.firstName && `, ${userProfile.firstName}`}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your club today
            </p>
          </div>
          {stats.pendingApprovals > 0 && (
            <Badge variant="destructive" className="w-fit">
              <Bell className="h-3 w-3 mr-1" />
              {stats.pendingApprovals} pending approvals
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Players"
            value={stats.totalPlayers}
            icon={Users}
            trend="Active members"
            href="/players"
          />
          <StatCard
            title="Active Teams"
            value={stats.totalTeams}
            icon={Trophy}
            trend="This season"
            color="chart-2"
            href="/teams"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            trend="Next 30 days"
            color="chart-3"
            href="/events"
          />
          <StatCard
            title="Performance Score"
            value="94%"
            icon={Target}
            trend="Club average"
            color="chart-success"
            href="/analytics"
          />
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New player registered</p>
                    <p className="text-xs text-muted-foreground">Sarah Johnson joined U12 team</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Training session completed</p>
                    <p className="text-xs text-muted-foreground">U14 team training</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5h ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Match statistics recorded</p>
                    <p className="text-xs text-muted-foreground">U16 vs Riverside Netball</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
