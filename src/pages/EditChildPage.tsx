
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from '@/services/api';
import { Child } from "@/types";

const EditChildPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChild = async () => {
      if (!childId) {
        toast.error("Child ID is missing");
        navigate("/children");
        return;
      }

      try {
        const children = await api.getChildren();
        const childData = children.find(c => c.id === childId);
        
        if (!childData) {
          toast.error("Child not found");
          navigate("/children");
          return;
        }

        setChild(childData);
      } catch (error) {
        console.error("Error loading child:", error);
        toast.error("Failed to load child data");
        navigate("/children");
      } finally {
        setLoading(false);
      }
    };

    loadChild();
  }, [childId, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading child details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Child</h1>
            <p className="text-muted-foreground">Update child information</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-muted-foreground">Edit child form will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default EditChildPage;
