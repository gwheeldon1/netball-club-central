
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Child } from "@/types";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { children } from "@/data/mockData";
import { toast } from "sonner";

const ChildDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, we'd fetch this from an API
    const childData = children.find(c => c.id === id);
    
    if (childData) {
      // Check if this child belongs to the current user
      if (childData.parentId !== currentUser?.id) {
        navigate("/unauthorized");
        return;
      }
      setChild(childData);
    } else {
      toast.error("Child not found");
      navigate("/children");
    }
    
    setLoading(false);
  }, [id, currentUser, navigate]);

  const getStatusBadgeColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!child) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Child Not Found</h2>
          <Button onClick={() => navigate("/children")}>Return to My Children</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/children")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Children
          </Button>
          
          <h1 className="text-3xl font-bold">{child.name}</h1>
          
          <div 
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(child.status)}`}
          >
            {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <div className="h-48 bg-gray-100">
              {child.profileImage ? (
                <img 
                  src={child.profileImage} 
                  alt={child.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No profile image</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Age Group</p>
                  <p className="font-medium">{child.ageGroup || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="font-medium">{child.teamId ? "Assigned" : "Not assigned"}</p>
                </div>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Edit functionality will be implemented soon.")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {child.medicalInfo && (
                <div>
                  <h3 className="font-medium mb-1">Medical Information</h3>
                  <p className="text-sm bg-amber-50 border border-amber-200 p-3 rounded">
                    {child.medicalInfo}
                  </p>
                </div>
              )}
              
              {child.notes && (
                <div>
                  <h3 className="font-medium mb-1">Additional Notes</h3>
                  <p className="text-sm bg-gray-50 p-3 border rounded">
                    {child.notes}
                  </p>
                </div>
              )}
              
              {(!child.medicalInfo && !child.notes) && (
                <p className="text-muted-foreground">No additional information provided.</p>
              )}
              
              {child.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <h3 className="font-medium mb-1">Registration Status</h3>
                  <p className="text-sm">
                    Your child's registration is currently pending approval. 
                    You will be notified once it has been reviewed by our staff.
                  </p>
                </div>
              )}
              
              {child.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <h3 className="font-medium mb-1">Registration Status</h3>
                  <p className="text-sm">
                    Your child's registration has been rejected. Please contact
                    the club administrators for more information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChildDetailPage;
