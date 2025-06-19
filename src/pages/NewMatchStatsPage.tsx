
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewMatchStatsPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Match Statistics</h1>
            <p className="text-muted-foreground">Record statistics for a match</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Match statistics form will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default NewMatchStatsPage;
