import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Calendar, Download, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGoals: number;
  totalShots: number;
  shootingPercentage: number;
  totalIntercepts: number;
  totalTips: number;
  matchesPlayed: number;
  averageQuarters: number;
  playerOfMatchCount: number;
}

interface TeamPerformance {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  winPercentage: number;
  totalGoals: number;
  totalShots: number;
  averageAttendance: number;
}

interface AttendanceData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalPlayers: number;
  presentCount: number;
  absentCount: number;
  injuredCount: number;
  lateCount: number;
  attendanceRate: number;
}

const AnalyticsDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("season");
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTeam, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTeams(),
        loadPlayerStatistics(),
        loadTeamPerformance(),
        loadAttendanceAnalytics()
      ]);
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .order('name');

    if (error) throw error;
    setTeams(data || []);
  };

  const loadPlayerStatistics = async () => {
    let query = supabase
      .from('match_statistics')
      .select(`
        player_id,
        goals,
        shot_attempts,
        intercepts,
        tips,
        quarters_played,
        player_of_match_coach,
        player_of_match_players,
        players!inner(first_name, last_name),
        events!inner(team_id, event_date)
      `);

    if (selectedTeam !== "all") {
      query = query.eq('events.team_id', selectedTeam);
    }

    // Add date filtering based on selectedPeriod
    const now = new Date();
    if (selectedPeriod === "month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      query = query.gte('events.event_date', lastMonth.toISOString());
    } else if (selectedPeriod === "quarter") {
      const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      query = query.gte('events.event_date', lastQuarter.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate player statistics
    const playerStatsMap = new Map<string, PlayerStats>();

    data?.forEach((stat: any) => {
      const playerId = stat.player_id;
      const playerName = `${stat.players.first_name} ${stat.players.last_name}`;

      if (!playerStatsMap.has(playerId)) {
        playerStatsMap.set(playerId, {
          playerId,
          playerName,
          totalGoals: 0,
          totalShots: 0,
          shootingPercentage: 0,
          totalIntercepts: 0,
          totalTips: 0,
          matchesPlayed: 0,
          averageQuarters: 0,
          playerOfMatchCount: 0,
        });
      }

      const playerStat = playerStatsMap.get(playerId)!;
      playerStat.totalGoals += stat.goals;
      playerStat.totalShots += stat.shot_attempts;
      playerStat.totalIntercepts += stat.intercepts;
      playerStat.totalTips += stat.tips;
      playerStat.matchesPlayed += 1;
      playerStat.averageQuarters += stat.quarters_played;
      
      if (stat.player_of_match_coach || stat.player_of_match_players) {
        playerStat.playerOfMatchCount += 1;
      }
    });

    // Calculate percentages and averages
    const statsArray = Array.from(playerStatsMap.values()).map(stat => ({
      ...stat,
      shootingPercentage: stat.totalShots > 0 ? (stat.totalGoals / stat.totalShots) * 100 : 0,
      averageQuarters: stat.matchesPlayed > 0 ? stat.averageQuarters / stat.matchesPlayed : 0,
    }));

    setPlayerStats(statsArray.sort((a, b) => b.totalGoals - a.totalGoals));
  };

  const loadTeamPerformance = async () => {
    // This would need match results data which isn't in our current schema
    // For now, we'll create mock data based on existing events
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        team_id,
        event_date,
        teams!inner(name),
        event_responses(attendance_status)
      `)
      .eq('event_type', 'match');

    if (error) throw error;

    // Calculate basic team performance metrics
    const teamStats = new Map<string, TeamPerformance>();

    events?.forEach((event: any) => {
      const teamId = event.team_id;
      const teamName = event.teams.name;

      if (!teamStats.has(teamId)) {
        teamStats.set(teamId, {
          teamId,
          teamName,
          wins: 0,
          losses: 0,
          draws: 0,
          winPercentage: 0,
          totalGoals: 0,
          totalShots: 0,
          averageAttendance: 0,
        });
      }

      // For demo purposes, randomly assign wins/losses
      // In a real implementation, you'd have match results
      const random = Math.random();
      const teamStat = teamStats.get(teamId)!;
      
      if (random > 0.6) {
        teamStat.wins += 1;
      } else if (random > 0.3) {
        teamStat.losses += 1;
      } else {
        teamStat.draws += 1;
      }

      // Calculate attendance
      const presentCount = event.event_responses?.filter((r) => r.attendance_status === 'present').length || 0;
      teamStat.averageAttendance += presentCount;
    });

    // Calculate final percentages
    const performanceArray = Array.from(teamStats.values()).map(stat => {
      const totalMatches = stat.wins + stat.losses + stat.draws;
      return {
        ...stat,
        winPercentage: totalMatches > 0 ? (stat.wins / totalMatches) * 100 : 0,
        averageAttendance: totalMatches > 0 ? stat.averageAttendance / totalMatches : 0,
      };
    });

    setTeamPerformance(performanceArray);
  };

  const loadAttendanceAnalytics = async () => {
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        team_id,
        event_responses(attendance_status, player_id)
      `);

    if (selectedTeam !== "all") {
      query = query.eq('team_id', selectedTeam);
    }

    const { data, error } = await query.order('event_date', { ascending: false }).limit(20);
    if (error) throw error;

    const attendanceAnalytics = data?.map((event: any) => {
      const responses = event.event_responses || [];
      const totalPlayers = responses.length;
      const presentCount = responses.filter((r) => r.attendance_status === 'present').length;
      const absentCount = responses.filter((r) => r.attendance_status === 'absent').length;
      const injuredCount = responses.filter((r) => r.attendance_status === 'injured').length;
      const lateCount = responses.filter((r) => r.attendance_status === 'late').length;

      return {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: new Date(event.event_date).toLocaleDateString(),
        totalPlayers,
        presentCount,
        absentCount,
        injuredCount,
        lateCount,
        attendanceRate: totalPlayers > 0 ? (presentCount / totalPlayers) * 100 : 0,
      };
    }) || [];

    setAttendanceData(attendanceAnalytics);
  };

  const exportData = (type: string) => {
    let data: unknown[] = [];
    let filename = "";

    switch (type) {
      case 'player-stats':
        data = playerStats;
        filename = `player-statistics-${selectedPeriod}.csv`;
        break;
      case 'team-performance':
        data = teamPerformance;
        filename = `team-performance-${selectedPeriod}.csv`;
        break;
      case 'attendance':
        data = attendanceData;
        filename = `attendance-report-${selectedPeriod}.csv`;
        break;
    }

    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  const topPerformers = playerStats.slice(0, 5);
  const avgAttendanceRate = attendanceData.length > 0 
    ? attendanceData.reduce((sum, event) => sum + event.attendanceRate, 0) / attendanceData.length 
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive performance and participation insights</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">Season</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Players</p>
                <p className="text-2xl font-bold">{playerStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">
                  {playerStats.reduce((sum, player) => sum + player.totalGoals, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Teams Active</p>
                <p className="text-2xl font-bold">{teamPerformance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="player-stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="player-stats">Player Statistics</TabsTrigger>
          <TabsTrigger value="team-performance">Team Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Analytics</TabsTrigger>
        </TabsList>

        {/* Player Statistics Tab */}
        <TabsContent value="player-stats" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Individual Player Performance</h3>
            <Button 
              variant="outline" 
              onClick={() => exportData('player-stats')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Goal Scorers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="playerName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalGoals" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shooting Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="playerName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Shooting %']} />
                    <Bar dataKey="shootingPercentage" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Shots</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Intercepts</TableHead>
                    <TableHead>Tips</TableHead>
                    <TableHead>Player of Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((player) => (
                    <TableRow key={player.playerId}>
                      <TableCell className="font-medium">{player.playerName}</TableCell>
                      <TableCell>{player.matchesPlayed}</TableCell>
                      <TableCell>{player.totalGoals}</TableCell>
                      <TableCell>{player.totalShots}</TableCell>
                      <TableCell>{player.shootingPercentage.toFixed(1)}%</TableCell>
                      <TableCell>{player.totalIntercepts}</TableCell>
                      <TableCell>{player.totalTips}</TableCell>
                      <TableCell>
                        <Badge variant={player.playerOfMatchCount > 0 ? "default" : "secondary"}>
                          {player.playerOfMatchCount}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team-performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Team Performance Overview</h3>
            <Button 
              variant="outline" 
              onClick={() => exportData('team-performance')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Win Percentage by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teamName" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Win Rate']} />
                    <Bar dataKey="winPercentage" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Attendance by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teamName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageAttendance" fill="hsl(var(--chart-4))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Losses</TableHead>
                    <TableHead>Draws</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead>Avg Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformance.map((team) => (
                    <TableRow key={team.teamId}>
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>{team.wins}</TableCell>
                      <TableCell>{team.losses}</TableCell>
                      <TableCell>{team.draws}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {team.winPercentage.toFixed(1)}%
                          {team.winPercentage > 50 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{team.averageAttendance.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Analytics Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Attendance Analysis</h3>
            <Button 
              variant="outline" 
              onClick={() => exportData('attendance')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="eventDate" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="attendanceRate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Present', 
                          value: attendanceData.reduce((sum, event) => sum + event.presentCount, 0),
                          fill: 'hsl(var(--chart-1))'
                        },
                        { 
                          name: 'Absent', 
                          value: attendanceData.reduce((sum, event) => sum + event.absentCount, 0),
                          fill: 'hsl(var(--chart-2))'
                        },
                        { 
                          name: 'Injured', 
                          value: attendanceData.reduce((sum, event) => sum + event.injuredCount, 0),
                          fill: 'hsl(var(--chart-3))'
                        },
                        { 
                          name: 'Late', 
                          value: attendanceData.reduce((sum, event) => sum + event.lateCount, 0),
                          fill: 'hsl(var(--chart-4))'
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Attendance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Players</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Injured</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((event) => (
                    <TableRow key={event.eventId}>
                      <TableCell className="font-medium">{event.eventTitle}</TableCell>
                      <TableCell>{event.eventDate}</TableCell>
                      <TableCell>{event.totalPlayers}</TableCell>
                      <TableCell>{event.presentCount}</TableCell>
                      <TableCell>{event.absentCount}</TableCell>
                      <TableCell>{event.injuredCount}</TableCell>
                      <TableCell>{event.lateCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={event.attendanceRate} className="w-16" />
                          <span className="text-sm">{event.attendanceRate.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;