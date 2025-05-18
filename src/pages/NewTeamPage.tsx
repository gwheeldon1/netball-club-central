
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import TeamForm from "@/components/TeamForm";
import { useAuth } from "@/context/AuthContext";

const NewTeamPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  // Only admins can create teams
  useEffect(() => {
    if (!hasRole("admin")) {
      toast.error("You don't have permission to create teams");
      navigate("/teams");
    }
  }, [hasRole, navigate]);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
          <p className="text-muted-foreground mt-1">
            Add a new team to your netball club
          </p>
        </div>
        
        <TeamForm mode="create" />
      </div>
    </Layout>
  );
};

export default NewTeamPage;
