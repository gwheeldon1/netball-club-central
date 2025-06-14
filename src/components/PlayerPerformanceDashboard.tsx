import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { matchStatsApi, MatchStatistics } from '@/services/matchStatsApi';
import { Child } from '@/types';
import { 
  Trophy, 
  Target, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

interface PlayerPerformanceDashboardProps {
  player: Child;
}

interface PlayerSummary {
  totalGames: number;
  totalGoals: number;
  totalShotAttempts: number;
  shootingAccuracy: number;
  totalIntercepts: number;
  totalTips: number;
  playerOfMatchCount: number;
}

export function PlayerPerformanceDashboard({ player }: PlayerPerformanceDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [recentStats, setRecentStats] = useState<MatchStatistics[]>([]);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  useEffect(() => {
    loadPlayerStats();
  }, [player.id]);

  const loadPlayerStats = async () => {
    setLoading(true);
    try {
      const [stats, summaryData] = await Promise.all([
        matchStatsApi.getByPlayerId(player.id),
        matchStatsApi.getPlayerSummary(player.id)
      ]);

      setRecentStats(stats.slice(0, 5)); // Last 5 games
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading performance data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.totalGames === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No match statistics available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Games Played</div>
            </div>
            <div className="text-2xl font-bold mt-1">{summary.totalGames}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium">Goals Scored</div>
            </div>
            <div className="text-2xl font-bold mt-1">{summary.totalGoals}</div>
            <div className="text-xs text-muted-foreground">
              {summary.shootingAccuracy}% accuracy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium">Defensive Actions</div>
            </div>
            <div className="text-2xl font-bold mt-1">
              {summary.totalIntercepts + summary.totalTips}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.totalIntercepts} intercepts, {summary.totalTips} tips
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <div className="text-sm font-medium">Player of Match</div>
            </div>
            <div className="text-2xl font-bold mt-1">{summary.playerOfMatchCount}</div>
            <div className="text-xs text-muted-foreground">
              {summary.totalGames > 0 
                ? Math.round((summary.playerOfMatchCount / summary.totalGames) * 100)
                : 0}% of games
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shooting Performance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Shooting Accuracy</div>
              <div className="text-sm text-muted-foreground">
                {summary.totalGoals} / {summary.totalShotAttempts}
              </div>
            </div>
            <Progress 
              value={summary.shootingAccuracy} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {summary.shootingAccuracy}% accuracy
            </div>
          </div>

          <Separator />

          {/* Goals per Game */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Goals per Game</div>
              <div className="text-sm text-muted-foreground">
                {(summary.totalGoals / summary.totalGames).toFixed(1)} avg
              </div>
            </div>
            <Progress 
              value={Math.min((summary.totalGoals / summary.totalGames) * 10, 100)} 
              className="h-2"
            />
          </div>

          <Separator />

          {/* Defensive Impact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Defensive Actions per Game</div>
              <div className="text-sm text-muted-foreground">
                {((summary.totalIntercepts + summary.totalTips) / summary.totalGames).toFixed(1)} avg
              </div>
            </div>
            <Progress 
              value={Math.min(((summary.totalIntercepts + summary.totalTips) / summary.totalGames) * 5, 100)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      {recentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStats.map((stat, index) => {
                const gameNumber = recentStats.length - index;
                const accuracy = stat.shotAttempts > 0 
                  ? Math.round((stat.goals / stat.shotAttempts) * 100) 
                  : 0;

                return (
                  <div key={stat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Game {gameNumber}</div>
                      <div className="flex gap-2">
                        {stat.playerOfMatchCoach && (
                          <Badge variant="default">Coach's Pick</Badge>
                        )}
                        {stat.playerOfMatchPlayers && (
                          <Badge variant="secondary">Players' Pick</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Goals</div>
                        <div className="font-medium">{stat.goals}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Accuracy</div>
                        <div className="font-medium">{accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Intercepts</div>
                        <div className="font-medium">{stat.intercepts}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Quarters</div>
                        <div className="font-medium">{stat.quartersPlayed}/4</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}