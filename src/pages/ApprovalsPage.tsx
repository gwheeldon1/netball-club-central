
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { children, teams, users } from "@/data/mockData";
import { Child, Team } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, User, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ApprovalsPage = () => {
  const { hasRole } = useAuth();
  const [pendingChildren, setPendingChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // Get pending children
    const pending = children.filter(child => child.status === 'pending');
    setPendingChildren(pending);
  }, []);
  
  // Find parent of a child
  const getParent = (parentId: string) => {
    return users.find(user => user.id === parentId);
  };
  
  // Get child's age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Handle approve child
  const handleApprove = (child: Child, teamId?: string) => {
    // In a real app, this would be an API call
    toast.success(`${child.name} has been approved`);
    
    // Filter out the approved child
    setPendingChildren(pendingChildren.filter(c => c.id !== child.id));
    setIsDialogOpen(false);
  };
  
  // Handle reject child
  const handleReject = (child: Child) => {
    // In a real app, this would be an API call
    toast.error(`${child.name}'s registration has been rejected`);
    
    // Filter out the rejected child
    setPendingChildren(pendingChildren.filter(c => c.id !== child.id));
    setIsDialogOpen(false);
  };
  
  // Open child details dialog
  const openChildDetails = (child: Child) => {
    setSelectedChild(child);
    setIsDialogOpen(true);
  };

  if (!hasRole("admin") && !hasRole("coach") && !hasRole("manager")) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve new player registrations
          </p>
        </div>
        
        {/* Pending registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Player Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingChildren.length > 0 ? (
              <div className="space-y-4">
                {pendingChildren.map((child) => {
                  const parent = getParent(child.parentId);
                  
                  return (
                    <div key={child.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={child.profileImage} alt={child.name} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{child.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Age: {calculateAge(child.dateOfBirth)}, {child.ageGroup}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Parent: {parent?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openChildDetails(child)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700" 
                          size="sm"
                          onClick={() => openChildDetails(child)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(child)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Check className="h-12 w-12 mx-auto text-green-500" />
                <p className="mt-4">No pending approvals to review.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Child details dialog */}
        {selectedChild && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Player Registration Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedChild.profileImage} alt={selectedChild.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-bold text-xl">{selectedChild.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth: {new Date(selectedChild.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Medical Information</h3>
                  <p className="text-sm border rounded-md p-3 bg-gray-50">
                    {selectedChild.medicalInfo || "No medical information provided."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Additional Notes</h3>
                  <p className="text-sm border rounded-md p-3 bg-gray-50">
                    {selectedChild.notes || "No additional notes provided."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Assign Team</h3>
                  <Select defaultValue={selectedChild.teamId || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter(team => team.ageGroup === selectedChild.ageGroup)
                        .map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(selectedChild)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedChild)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalsPage;
