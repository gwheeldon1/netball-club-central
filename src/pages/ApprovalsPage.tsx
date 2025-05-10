
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { childrenApi, teamApi, userApi } from "@/services/api";
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
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get pending children
    const loadData = () => {
      const pending = childrenApi.getPending();
      setPendingChildren(pending);
      
      const teams = teamApi.getAll();
      setAvailableTeams(teams);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Find parent of a child
  const getParent = (parentId: string) => {
    return userApi.getById(parentId);
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
  const handleApprove = (child: Child) => {
    try {
      // Update child status
      const updatedChild = childrenApi.updateStatus(
        child.id, 
        'approved', 
        selectedTeamId || undefined
      );
      
      if (updatedChild) {
        toast.success(`${child.name} has been approved`);
        
        // Remove the approved child from the list
        setPendingChildren(pendingChildren.filter(c => c.id !== child.id));
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to update child status");
      }
    } catch (error) {
      console.error("Error approving child:", error);
      toast.error("An error occurred while approving");
    }
  };
  
  // Handle reject child
  const handleReject = (child: Child) => {
    try {
      // Update child status
      const updatedChild = childrenApi.updateStatus(child.id, 'rejected');
      
      if (updatedChild) {
        toast.error(`${child.name}'s registration has been rejected`);
        
        // Remove the rejected child from the list
        setPendingChildren(pendingChildren.filter(c => c.id !== child.id));
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to update child status");
      }
    } catch (error) {
      console.error("Error rejecting child:", error);
      toast.error("An error occurred while rejecting");
    }
  };
  
  // Open child details dialog
  const openChildDetails = (child: Child) => {
    setSelectedChild(child);
    
    // Pre-select a team that matches the child's age group
    const matchingTeam = availableTeams.find(team => team.ageGroup === child.ageGroup);
    if (matchingTeam) {
      setSelectedTeamId(matchingTeam.id);
    } else {
      setSelectedTeamId("");
    }
    
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading approvals data...</p>
        </div>
      </Layout>
    );
  }

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
                  <Select 
                    value={selectedTeamId} 
                    onValueChange={setSelectedTeamId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTeams
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
