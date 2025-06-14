import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, Shield, AlertTriangle, TrendingUp, Award, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface PlayerPerformanceData {
  player_id: string;
  player_name: string;
  total_goals: number;
  total_shot_attempts: number;
  total_intercepts: number;
  total_tips: number;
  total_turnovers_won: number;
  total_turnovers_lost: number;
  total_contacts: number;
  total_obstructions: number;
  total_footwork_errors: number;
  total_quarters_played: number;
  matches_played: number;
  player_of_match_count: number;
  shooting_accuracy: number;
}

interface TeamPerformanceData {
  team_id: string;
  team_name: string;
  total_matches: number;
  total_goals: number;
  average_goals_per_match: number;
  top_scorer: string;
  top_defender: string;
}

const PlayerPerformanceDashboard: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, age_group')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch player performance data
  const { data: playerPerformance = [], isLoading: playersLoading } = useQuery({
    queryKey: ['player-performance', selectedTeam],
    queryFn: async () => {
      let query = supabase
        .from('match_statistics')
        .select(`
          player_id,
          goals,
          shot_attempts,
          intercepts,
          tips,
          turnovers_won,
          turnovers_lost,
          contacts,
          obstructions,
          footwork_errors,
          quarters_played,
          player_of_match_coach,
          player_of_match_players,
          events!inner(
            id,
            event_type,
            team_id,
            teams(name)
          ),
          players!inner(
            first_name,
            last_name
          )
        `);

      if (selectedTeam !== 'all') {
        query = query.eq('events.team_id', selectedTeam);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate stats by player
      const playerStats: Record<string, PlayerPerformanceData> = {};
      
      data.forEach((stat: any) => {
        const playerId = stat.player_id;
        const playerName = `${stat.players.first_name} ${stat.players.last_name}`;
        
        if (!playerStats[playerId]) {
          playerStats[playerId] = {
            player_id: playerId,
            player_name: playerName,
            total_goals: 0,
            total_shot_attempts: 0,
            total_intercepts: 0,
            total_tips: 0,
            total_turnovers_won: 0,
            total_turnovers_lost: 0,
            total_contacts: 0,
            total_obstructions: 0,
            total_footwork_errors: 0,
            total_quarters_played: 0,
            matches_played: 0,
            player_of_match_count: 0,
            shooting_accuracy: 0
          };
        }

        const player = playerStats[playerId];
        player.total_goals += stat.goals || 0;
        player.total_shot_attempts += stat.shot_attempts || 0;
        player.total_intercepts += stat.intercepts || 0;
        player.total_tips += stat.tips || 0;
        player.total_turnovers_won += stat.turnovers_won || 0;
        player.total_turnovers_lost += stat.turnovers_lost || 0;
        player.total_contacts += stat.contacts || 0;
        player.total_obstructions += stat.obstructions || 0;
        player.total_footwork_errors += stat.footwork_errors || 0;
        player.total_quarters_played += stat.quarters_played || 0;
        player.matches_played += 1;
        
        if (stat.player_of_match_coach || stat.player_of_match_players) {
          player.player_of_match_count += 1;
        }
      });

      // Calculate shooting accuracy
      Object.values(playerStats).forEach(player => {
        player.shooting_accuracy = player.total_shot_attempts > 0 
          ? Math.round((player.total_goals / player.total_shot_attempts) * 100)
          : 0;
      });

      return Object.values(playerStats);
    }
  });

  // Fetch recent match statistics for trends
  const { data: recentMatches = [] } = useQuery({
    queryKey: ['recent-matches', selectedTeam],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          event_date,
          event_type,
          team_id,
          teams(name),
          match_statistics(
            goals,
            shot_attempts,
            intercepts,
            player_id,
            players(first_name, last_name)
          )
        `)
        .eq('event_type', 'match')
        .order('event_date', { ascending: false })
        .limit(10);

      if (selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const topScorer = playerPerformance.reduce((top, player) => 
    player.total_goals > (top?.total_goals || 0) ? player : top
  , playerPerformance[0]);

  const topDefender = playerPerformance.reduce((top, player) => 
    (player.total_intercepts + player.total_tips) > ((top?.total_intercepts || 0) + (top?.total_tips || 0)) ? player : top
  , playerPerformance[0]);

  const totalMatches = recentMatches.length;
  const totalGoals = playerPerformance.reduce((sum, player) => sum + player.total_goals, 0);
  const averageGoalsPerMatch = totalMatches > 0 ? Math.round((totalGoals / totalMatches) * 10) / 10 : 0;

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#ff7300', '#8dd1e1'];

  if (playersLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.age_group})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="players">Player Statistics</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMatches}</div>
                <p className="text-xs text-muted-foreground">
                  Recent matches analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGoals}</div>
                <p className="text-xs text-muted-foreground">
                  {averageGoalsPerMatch} avg per match
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Scorer</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{topScorer?.player_name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {topScorer?.total_goals || 0} goals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Defender</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{topDefender?.player_name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {((topDefender?.total_intercepts || 0) + (topDefender?.total_tips || 0))} defensive actions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Player Goal Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playerPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="player_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_goals" fill="hsl(var(--primary))" name="Goals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          {/* Player Statistics */}
          <div className="grid gap-6">
            {playerPerformance.map((player) => (
              <Card key={player.player_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {player.player_name}
                      {player.player_of_match_count > 0 && (
                        <Badge variant="outline">
                          <Award className="mr-1 h-3 w-3" />
                          {player.player_of_match_count}x POTM
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant="secondary">
                      {player.matches_played} matches
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scoring Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Target className="h-4 w-4 text-primary" />
                        Scoring
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Goals</span>
                          <span className="font-medium">{player.total_goals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Accuracy</span>
                          <span className="font-medium">{player.shooting_accuracy}%</span>
                        </div>
                        <Progress value={player.shooting_accuracy} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Attempts: {player.total_shot_attempts}</span>
                          <span>Avg: {(player.total_goals / player.matches_played).toFixed(1)}/match</span>
                        </div>
                      </div>
                    </div>

                    {/* Defensive Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4 text-green-600" />
                        Defense
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Intercepts</span>
                          <span className="font-medium">{player.total_intercepts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tips</span>
                          <span className="font-medium">{player.total_tips}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Turnovers Won</span>
                          <span className="font-medium">{player.total_turnovers_won}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Total Defensive Actions</span>
                          <span>{player.total_intercepts + player.total_tips + player.total_turnovers_won}</span>
                        </div>
                      </div>
                    </div>

                    {/* Discipline */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Discipline
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Contacts</span>
                          <span className="font-medium">{player.total_contacts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Obstructions</span>
                          <span className="font-medium">{player.total_obstructions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Footwork Errors</span>
                          <span className="font-medium">{player.total_footwork_errors}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Per Match</span>
                          <span>
                            {((player.total_contacts + player.total_obstructions + player.total_footwork_errors) / player.matches_played).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Shooting Accuracy Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playerPerformance.filter(p => p.total_shot_attempts > 0).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="player_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                  <Bar dataKey="shooting_accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defensive vs Offensive Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={playerPerformance.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="player_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_goals" fill="hsl(var(--primary))" name="Goals" />
                  <Bar dataKey="total_intercepts" fill="hsl(var(--secondary))" name="Intercepts" />
                  <Bar dataKey="total_tips" fill="hsl(var(--accent))" name="Tips" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Player Efficiency Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerPerformance.slice(0, 5).map((player, index) => (
                  <div key={player.player_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{player.player_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.matches_played} matches • {player.total_quarters_played} quarters
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(player.total_goals / player.matches_played).toFixed(1)} goals/match
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.shooting_accuracy}% accuracy
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerPerformanceDashboard;