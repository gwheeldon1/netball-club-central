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

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

const Dashboard = () => {
  const { hasRole, userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalTeams: 0,
    upcomingEvents: 0,
    pendingApprovals: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get players count
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved');

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

      // Load recent activities from actual events and registrations
      await loadRecentActivities();

      setStats({
        totalPlayers: playersCount || 0,
        totalTeams: teamsCount || 0,
        upcomingEvents: eventsCount || 0,
        pendingApprovals: approvalsCount
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent player registrations
      const { data: recentPlayers } = await supabase
        .from('players')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentPlayers) {
        recentPlayers.forEach(player => {
          activities.push({
            id: `player-${player.id}`,
            type: 'registration',
            title: 'New player registered',
            description: `${player.first_name} ${player.last_name} joined the club`,
            timestamp: player.created_at
          });
        });
      }

      // Get recent events
      const { data: recentEvents } = await supabase
        .from('events')
        .select('id, title, event_type, event_date, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentEvents) {
        recentEvents.forEach(event => {
          const isPast = new Date(event.event_date) < new Date();
          activities.push({
            id: `event-${event.id}`,
            type: isPast ? 'completed' : 'upcoming',
            title: isPast ? `${event.event_type} completed` : `${event.event_type} scheduled`,
            description: event.title,
            timestamp: event.created_at
          });
        });
      }

      // Sort activities by timestamp and take the most recent 5
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return Users;
      case 'completed': return Trophy;
      case 'upcoming': return Calendar;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'registration': return 'bg-primary';
      case 'completed': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
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
    const cardContent = (
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
        {cardContent}
      </Link>
    ) : (
      cardContent
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
            <p className="text-muted-foreground mt-1">Loading your dashboard...</p>
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

  if (error) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
            <p className="text-lg font-medium mb-2">Failed to Load Dashboard</p>
            <p className="text-muted-foreground text-center mb-6">{error}</p>
            <Button onClick={loadDashboardData}>
              Try Again
            </Button>
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
            trend="Approved members"
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
            trend="Scheduled ahead"
            color="chart-3"
            href="/events"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Target}
            trend="Requires attention"
            color="destructive"
            href="/approvals"
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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);
                    
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
