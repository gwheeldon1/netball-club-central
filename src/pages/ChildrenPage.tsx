
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Child } from "@/types";
import { childrenApi } from "@/services/api";

const ChildrenPage = () => {
  const { currentUser } = useAuth();
  const [myChildren, setMyChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      const children = childrenApi.getByParentId(currentUser.id);
      setMyChildren(children);
      setLoading(false);
    }
  }, [currentUser]);

  const getStatusBadgeColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return "bg-primary/10 text-primary";
      case 'rejected':
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusText = (status: 'pending' | 'approved' | 'rejected') => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEditChild = (childId: string) => {
    // This would open an edit form in a real implementation
    toast.info(`Edit functionality for child ${childId} will be implemented soon.`);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
            <p className="text-muted-foreground mt-1">
              Manage your children's profiles and registration
            </p>
          </div>
          
          <Button asChild>
            <Link to="/children/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Child
            </Link>
          </Button>
        </div>
        
        {myChildren.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myChildren.map((child) => (
              <Card key={child.id} className="overflow-hidden">
                <div className="relative h-32 bg-muted">
                  {child.profileImage ? (
                    <img 
                      src={child.profileImage} 
                      alt={child.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground">No profile image</span>
                    </div>
                  )}
                  <div 
                    className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(child.status)}`}
                  >
                    {getStatusText(child.status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{child.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {child.ageGroup || "Age group not assigned"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Date of Birth:</span>
                      <span>{new Date(child.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Team:</span>
                      <span>{child.teamId ? "Assigned" : "Not assigned"}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => handleEditChild(child.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                    >
                      <Link to={`/children/${child.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">No Children Registered</h3>
            <p className="text-muted-foreground mb-6">
              Register your children to get started with the netball club.
            </p>
            <Button asChild>
              <Link to="/children/new">
                <Plus className="mr-2 h-4 w-4" />
                Register New Child
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChildrenPage;
