import { memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MoreVertical, EyeOff } from 'lucide-react';
import { Team } from '@/types';
import { OptimizedImage } from '@/hooks/useImageOptimization';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  team: Team;
  onView?: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  onToggleActive?: (team: Team) => void;
  className?: string;
  variant?: 'default' | 'compact';
  showInactive?: boolean;
}

function TeamCardComponent({
  team,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  className,
  variant = 'default',
  showInactive = false
}: TeamCardProps) {
  const handleView = useCallback(() => {
    onView?.(team);
  }, [onView, team]);

  const handleEdit = useCallback(() => {
    onEdit?.(team);
  }, [onEdit, team]);

  const handleDelete = useCallback(() => {
    onDelete?.(team);
  }, [onDelete, team]);

  const handleToggleActive = useCallback(() => {
    onToggleActive?.(team);
  }, [onToggleActive, team]);

  const isInactive = team.active === false;

  // Don't show inactive teams unless explicitly requested
  if (isInactive && !showInactive) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors",
        isInactive && "opacity-60 border-dashed",
        className
      )}>
        <OptimizedImage
          src={team.profileImage || '/placeholder.svg'}
          alt={`${team.name} logo`}
          className="w-12 h-12 rounded-full object-cover"
          optimization={{ lazy: true, maxWidth: 48, maxHeight: 48 }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{team.name}</h3>
            {isInactive && <EyeOff className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">{team.ageGroup}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isInactive ? "outline" : "secondary"}>{team.category}</Badge>
          {isInactive && <Badge variant="outline" className="text-orange-600 border-orange-200">Inactive</Badge>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleView}>
          View
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200", 
      isInactive && "opacity-60 border-dashed",
      className
    )}>
      <CardHeader className="relative">
        {team.bannerImage && (
          <div className="absolute inset-0 rounded-t-lg overflow-hidden">
            <OptimizedImage
              src={team.bannerImage}
              alt={`${team.name} banner`}
              className="w-full h-full object-cover opacity-20"
              optimization={{ lazy: true, maxWidth: 400, maxHeight: 200 }}
            />
          </div>
        )}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <OptimizedImage
              src={team.profileImage || '/placeholder.svg'}
              alt={`${team.name} logo`}
              className="w-16 h-16 rounded-full object-cover border-2 border-background"
              optimization={{ lazy: true, maxWidth: 64, maxHeight: 64 }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {team.name}
                </CardTitle>
                {isInactive && <EyeOff className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-2">
                <CardDescription>{team.ageGroup} • {team.category}</CardDescription>
                {isInactive && <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">Inactive</Badge>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{team.players?.length || 0} players</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{isInactive ? 'Inactive' : 'Active'}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleView}
          >
            View Team
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          {onToggleActive && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleActive}
            >
              {isInactive ? 'Activate' : 'Deactivate'}
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const TeamCard = memo(TeamCardComponent);

// Pre-built team list component with virtualization
interface TeamListProps {
  teams: Team[];
  onTeamView?: (team: Team) => void;
  onTeamEdit?: (team: Team) => void;
  onTeamDelete?: (team: Team) => void;
  onTeamToggleActive?: (team: Team) => void;
  variant?: 'default' | 'compact';
  className?: string;
  loading?: boolean;
  showInactive?: boolean;
}

export const TeamList = memo(function TeamList({
  teams,
  onTeamView,
  onTeamEdit,
  onTeamDelete,
  onTeamToggleActive,
  variant = 'default',
  className,
  loading = false,
  showInactive = false
}: TeamListProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="flex space-x-2">
              <div className="h-8 bg-muted rounded flex-1" />
              <div className="h-8 bg-muted rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredTeams = showInactive ? teams : teams.filter(team => team.active !== false);

  if (filteredTeams.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          {showInactive ? 'No inactive teams found' : 'No teams found'}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {showInactive ? 'All teams are currently active.' : 'Create your first team to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      variant === 'compact' ? "space-y-2" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {filteredTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onView={onTeamView}
          onEdit={onTeamEdit}
          onDelete={onTeamDelete}
          onToggleActive={onTeamToggleActive}
          variant={variant}
          showInactive={showInactive}
        />
      ))}
    </div>
  );
});
