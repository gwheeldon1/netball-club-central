import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { matchStatsApi, MatchStatistics } from '@/services/matchStatsApi';
import { Child } from '@/types';
import { Trophy, Target, Shield, AlertTriangle, Users } from 'lucide-react';
import { logger } from '@/utils/logger';

interface MatchStatsFormProps {
  eventId: string;
  players: Child[];
  onClose: () => void;
  onSave: () => void;
}

interface PlayerStats {
  playerId: string;
  goals: number;
  shotAttempts: number;
  intercepts: number;
  tips: number;
  turnoversWon: number;
  turnoversLost: number;
  contacts: number;
  obstructions: number;
  footworkErrors: number;
  quartersPlayed: number;
  playerOfMatchCoach: boolean;
  playerOfMatchPlayers: boolean;
}

export function MatchStatsForm({ eventId, players, onClose, onSave }: MatchStatsFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({});

  useEffect(() => {
    loadExistingStats();
  }, [eventId, players]);

  const loadExistingStats = async () => {
    setLoading(true);
    try {
      const existingStats = await matchStatsApi.getByEventId(eventId);
      const statsMap: Record<string, PlayerStats> = {};

      // Initialize all players with empty stats
      players.forEach(player => {
        statsMap[player.id] = {
          playerId: player.id,
          goals: 0,
          shotAttempts: 0,
          intercepts: 0,
          tips: 0,
          turnoversWon: 0,
          turnoversLost: 0,
          contacts: 0,
          obstructions: 0,
          footworkErrors: 0,
          quartersPlayed: 0,
          playerOfMatchCoach: false,
          playerOfMatchPlayers: false,
        };
      });

      // Override with existing stats
      existingStats.forEach(stat => {
        if (statsMap[stat.playerId]) {
          statsMap[stat.playerId] = {
            playerId: stat.playerId,
            goals: stat.goals,
            shotAttempts: stat.shotAttempts,
            intercepts: stat.intercepts,
            tips: stat.tips,
            turnoversWon: stat.turnoversWon,
            turnoversLost: stat.turnoversLost,
            contacts: stat.contacts,
            obstructions: stat.obstructions,
            footworkErrors: stat.footworkErrors,
            quartersPlayed: stat.quartersPlayed,
            playerOfMatchCoach: stat.playerOfMatchCoach,
            playerOfMatchPlayers: stat.playerOfMatchPlayers,
          };
        }
      });

      setPlayerStats(statsMap);
    } catch (error) {
      logger.error('Error loading existing stats:', error);
      toast.error('Failed to load existing statistics');
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerStat = (playerId: string, field: keyof PlayerStats, value: number | boolean) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savePromises = Object.values(playerStats).map(stats =>
        matchStatsApi.upsert({
          playerId: stats.playerId,
          eventId,
          goals: stats.goals,
          shotAttempts: stats.shotAttempts,
          intercepts: stats.intercepts,
          tips: stats.tips,
          turnoversWon: stats.turnoversWon,
          turnoversLost: stats.turnoversLost,
          contacts: stats.contacts,
          obstructions: stats.obstructions,
          footworkErrors: stats.footworkErrors,
          quartersPlayed: stats.quartersPlayed,
          playerOfMatchCoach: stats.playerOfMatchCoach,
          playerOfMatchPlayers: stats.playerOfMatchPlayers,
        })
      );

      await Promise.all(savePromises);
      toast.success('Match statistics saved successfully');
      onSave();
      onClose();
    } catch (error) {
      logger.error('Error saving match stats:', error);
      toast.error('Failed to save match statistics');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading statistics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Match Statistics Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {players.map(player => {
          const stats = playerStats[player.id];
          if (!stats) return null;

          const shootingAccuracy = stats.shotAttempts > 0 
            ? Math.round((stats.goals / stats.shotAttempts) * 100) 
            : 0;

          return (
            <Card key={player.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <div className="flex gap-2">
                    {stats.playerOfMatchCoach && (
                      <Badge variant="default" className="bg-primary">
                        Coach's Pick
                      </Badge>
                    )}
                    {stats.playerOfMatchPlayers && (
                      <Badge variant="default" className="bg-secondary">
                        Players' Pick
                      </Badge>
                    )}
                  </div>
                </div>
                {stats.shotAttempts > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Shooting Accuracy: {shootingAccuracy}%
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scoring Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4 text-primary" />
                    Scoring
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`goals-${player.id}`}>Goals</Label>
                      <Input
                        id={`goals-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.goals}
                        onChange={(e) => updatePlayerStat(player.id, 'goals', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`shots-${player.id}`}>Shot Attempts</Label>
                      <Input
                        id={`shots-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.shotAttempts}
                        onChange={(e) => updatePlayerStat(player.id, 'shotAttempts', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`quarters-${player.id}`}>Quarters Played</Label>
                      <Input
                        id={`quarters-${player.id}`}
                        type="number"
                        min="0"
                        max="4"
                        value={stats.quartersPlayed}
                        onChange={(e) => updatePlayerStat(player.id, 'quartersPlayed', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Defensive Stats */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-green-600" />
                    Defensive
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`intercepts-${player.id}`}>Intercepts</Label>
                      <Input
                        id={`intercepts-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.intercepts}
                        onChange={(e) => updatePlayerStat(player.id, 'intercepts', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tips-${player.id}`}>Tips</Label>
                      <Input
                        id={`tips-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.tips}
                        onChange={(e) => updatePlayerStat(player.id, 'tips', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`turnovers-won-${player.id}`}>Turnovers Won</Label>
                      <Input
                        id={`turnovers-won-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.turnoversWon}
                        onChange={(e) => updatePlayerStat(player.id, 'turnoversWon', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`turnovers-lost-${player.id}`}>Turnovers Lost</Label>
                      <Input
                        id={`turnovers-lost-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.turnoversLost}
                        onChange={(e) => updatePlayerStat(player.id, 'turnoversLost', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Penalties */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Penalties
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`contacts-${player.id}`}>Contacts</Label>
                      <Input
                        id={`contacts-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.contacts}
                        onChange={(e) => updatePlayerStat(player.id, 'contacts', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`obstructions-${player.id}`}>Obstructions</Label>
                      <Input
                        id={`obstructions-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.obstructions}
                        onChange={(e) => updatePlayerStat(player.id, 'obstructions', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`footwork-${player.id}`}>Footwork Errors</Label>
                      <Input
                        id={`footwork-${player.id}`}
                        type="number"
                        min="0"
                        value={stats.footworkErrors}
                        onChange={(e) => updatePlayerStat(player.id, 'footworkErrors', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Player of Match */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-yellow-600" />
                    Player of the Match
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`coach-pick-${player.id}`}
                        checked={stats.playerOfMatchCoach}
                        onCheckedChange={(checked) => updatePlayerStat(player.id, 'playerOfMatchCoach', checked)}
                      />
                      <Label htmlFor={`coach-pick-${player.id}`}>Coach's Pick</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`players-pick-${player.id}`}
                        checked={stats.playerOfMatchPlayers}
                        onCheckedChange={(checked) => updatePlayerStat(player.id, 'playerOfMatchPlayers', checked)}
                      />
                      <Label htmlFor={`players-pick-${player.id}`}>Players' Pick</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Statistics'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}