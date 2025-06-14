
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Child } from "@/types";
import { supabaseChildrenApi } from "@/services/supabaseApi";

const ChildrenPage = () => {
  const { currentUser } = useAuth();
  const [myChildren, setMyChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChildren = async () => {
      if (currentUser) {
        try {
          const allChildren = await api.getChildren();
          const children = allChildren.filter(child => child.parentId === currentUser.id);
          setMyChildren(children);
        } catch (error) {
          console.error('Error fetching children:', error);
          toast.error('Failed to load children');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChildren();
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Children</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your children's profiles and registration
            </p>
          </div>
          
          <Button asChild className="w-full sm:w-auto">
            <Link to="/children/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Child
            </Link>
          </Button>
        </div>
        
        {myChildren.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {myChildren.map((child) => (
              <Card key={child.id} className="overflow-hidden">
                <div className="relative h-24 sm:h-32 bg-muted">
                  {child.profileImage ? (
                    <img 
                      src={child.profileImage} 
                      alt={child.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground text-xs sm:text-sm">No profile image</span>
                    </div>
                  )}
                  <div 
                    className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(child.status)}`}
                  >
                    {getStatusText(child.status)}
                  </div>
                </div>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg truncate">{child.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {child.ageGroup || "Age group not assigned"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                  <div className="text-xs sm:text-sm">
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Date of Birth:</span>
                      <span className="truncate ml-2">{new Date(child.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Team:</span>
                      <span className="truncate ml-2">{child.teamId ? "Assigned" : "Not assigned"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditChild(child.id)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Edit Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto"
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
          <div className="text-center py-8 sm:py-12 bg-muted rounded-lg">
            <h3 className="text-base sm:text-lg font-medium mb-2">No Children Registered</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base px-4">
              Register your children to get started with the netball club.
            </p>
            <Button asChild className="w-full sm:w-auto">
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
