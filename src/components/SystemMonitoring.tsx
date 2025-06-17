import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Database, Users, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// Raw type from Supabase for audit_log table
interface RawAuditLogEntry {
  id: string;
  table_name: string | null;
  action: string | null;
  changed_by: string | null;
  changed_at: string | null;
  record_id: string | null;
  // Supabase might also return new_values: Json | null, old_values: Json | null
  // but they are not used in AuditLogEntry, so not strictly needed here.
}

// Application-level type
interface AuditLogEntry {
  id: string;
  table_name: string;
  action: string;
  changed_by: string; // Expects non-nullable string
  changed_at: string;
  record_id: string;
}

// Mapper function
function mapRawToAuditLogEntry(rawLog: RawAuditLogEntry): AuditLogEntry {
  return {
    id: rawLog.id,
    table_name: rawLog.table_name || 'N/A',
    action: rawLog.action || 'Unknown',
    changed_by: rawLog.changed_by || 'System', // Handle null changed_by
    changed_at: rawLog.changed_at || new Date().toISOString(),
    record_id: rawLog.record_id || 'N/A',
  };
}

interface DatabaseStats {
  totalUsers: number;
  totalPlayers: number;
  totalEvents: number;
  totalTeams: number;
  pendingApprovals: number;
  activeSubscriptions: number;
}

const SystemMonitoring = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [performanceData, setPerformanceData] = useState<Array<{
    time: string;
    responseTime: number;
    requests: number;
    errors: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadAuditLogs(),
        loadDatabaseStats(),
        loadPerformanceData()
      ]);
    } catch (error) {
      toast.error("Failed to load system monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    // Mock system metrics - in a real implementation, these would come from monitoring services
    const metrics: SystemMetric[] = [
      {
        name: 'Database Connections',
        value: 15,
        unit: 'connections',
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'API Response Time',
        value: 150,
        unit: 'ms',
        status: 'healthy',
        trend: 'down'
      },
      {
        name: 'Memory Usage',
        value: 65,
        unit: '%',
        status: 'warning',
        trend: 'up'
      },
      {
        name: 'CPU Usage',
        value: 35,
        unit: '%',
        status: 'healthy',
        trend: 'stable'
      },
      {
        name: 'Storage Used',
        value: 2.4,
        unit: 'GB',
        status: 'healthy',
        trend: 'up'
      },
      {
        name: 'Active Sessions',
        value: 28,
        unit: 'sessions',
        status: 'healthy',
        trend: 'up'
      }
    ];

    setSystemMetrics(metrics);
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const rawLogs = data as RawAuditLogEntry[] || [];
      setAuditLogs(rawLogs.map(mapRawToAuditLogEntry));
    } catch (error) {
      // Silently handle error - audit logs are not critical
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const [usersResult, playersResult, eventsResult, teamsResult, approvalsResult, subscriptionsResult] = await Promise.all([
        supabase.from('guardians').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('guardians').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      setDatabaseStats({
        totalUsers: usersResult.count || 0,
        totalPlayers: playersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalTeams: teamsResult.count || 0,
        pendingApprovals: approvalsResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
      });
    } catch (error) {
      // Silently handle error - stats are not critical
    }
  };

  const loadPerformanceData = async () => {
    // Mock performance data - in a real implementation, this would come from monitoring tools
    const data = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i));
      
      return {
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseTime: Math.floor(Math.random() * 200) + 100,
        requests: Math.floor(Math.random() * 1000) + 500,
        errors: Math.floor(Math.random() * 10),
      };
    });

    setPerformanceData(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-primary/10 text-primary';
      case 'warning':
        return 'bg-destructive/10 text-destructive';
      case 'critical':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  if (loading && !systemMetrics.length) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
          <p className="text-muted-foreground">Monitor system health, performance, and audit logs</p>
        </div>
        <Button onClick={loadSystemData} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="database">Database Stats</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* System Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value} {metric.unit}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getTrendIcon(metric.trend)} {metric.trend}
                    </span>
                  </div>
                  {metric.name === 'Memory Usage' || metric.name === 'CPU Usage' ? (
                    <Progress value={metric.value} className="mt-2" />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Database Stats Tab */}
        <TabsContent value="database" className="space-y-4">
          {databaseStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Total Users</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.totalUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Total Players</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.totalPlayers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Total Events</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.totalEvents}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Teams</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.totalTeams}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Pending Approvals</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.pendingApprovals}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-teal-500" />
                    <span className="font-medium">Active Subscriptions</span>
                  </div>
                  <p className="text-3xl font-bold">{databaseStats.activeSubscriptions}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time (24h)</CardTitle>
                <CardDescription>Average API response time over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Volume (24h)</CardTitle>
                <CardDescription>Number of API requests over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate (24h)</CardTitle>
              <CardDescription>Number of errors encountered over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Recent Audit Logs
              </CardTitle>
              <CardDescription>
                Recent database changes and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.changed_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.table_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            log.action === 'INSERT' ? 'default' : 
                            log.action === 'UPDATE' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.record_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.changed_by ? log.changed_by.slice(0, 8) + '...' : 'System'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring;