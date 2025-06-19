
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EditMatchStatsPage = () => {
  const navigate = useNavigate();
  const { matchStatsId } = useParams<{ matchStatsId: string }>();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Match Statistics</h1>
            <p className="text-muted-foreground">Update match statistics</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Edit match statistics form will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default EditMatchStatsPage;
