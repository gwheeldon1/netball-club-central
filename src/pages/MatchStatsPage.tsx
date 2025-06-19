
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const MatchStatsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Match Statistics</h1>
            <p className="text-muted-foreground">View and manage match statistics</p>
          </div>
          <Button asChild>
            <Link to="/match-stats/new">
              <Plus className="mr-2 h-4 w-4" />
              New Match Stats
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Match statistics will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default MatchStatsPage;
