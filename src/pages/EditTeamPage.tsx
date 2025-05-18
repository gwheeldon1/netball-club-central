
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import TeamForm from "@/components/TeamForm";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Team } from "@/types";
import { teamApi, childrenApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Trash } from "lucide-react";

const EditTeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const loadTeam = () => {
      if (!id) {
        toast.error("Team ID is missing");
        navigate("/teams");
        return;
      }
      
      try {
        const teamData = teamApi.getById(id);
        
        if (!teamData) {
          toast.error("Team not found");
          navigate("/teams");
          return;
        }
        
        setTeam(teamData);
      } catch (error) {
        console.error("Error loading team:", error);
        toast.error("Failed to load team data");
        navigate("/teams");
      } finally {
        setLoading(false);
      }
    };
    
    loadTeam();
  }, [id, navigate]);
  
  const handleDeleteTeam = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    
    try {
      // Check if team has players
      const players = childrenApi.getByTeamId(id);
      
      if (players.length > 0) {
        toast.error(`Cannot delete team. There are ${players.length} players assigned to this team.`);
        setDeleteDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      const success = teamApi.delete(id);
      
      if (success) {
        toast.success("Team deleted successfully");
        navigate("/teams");
      } else {
        toast.error("Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("An error occurred while deleting the team");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Only admins can edit teams
  useEffect(() => {
    if (!loading && !hasRole("admin")) {
      toast.error("You don't have permission to edit teams");
      navigate("/teams");
    }
  }, [loading, hasRole, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading team details...</p>
        </div>
      </Layout>
    );
  }
  
  if (!team) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Team not found.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/teams")}>
            Back to Teams
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
            <p className="text-muted-foreground mt-1">
              Update the team information and settings
            </p>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="sm:self-start"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Team
          </Button>
        </div>
        
        <TeamForm team={team} mode="edit" />
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete this team?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the team 
                "{team.name}" and remove it from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)} 
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteTeam} 
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default EditTeamPage;
