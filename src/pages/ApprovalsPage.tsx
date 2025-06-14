
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { api } from '@/services/api';
import { Child, Team, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, User as UserIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
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
  const { hasRole, currentUser } = useAuth();
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get pending registrations (guardians with their children)
        const { data: pendingGuardians, error } = await supabase
          .from('guardians')
          .select(`
            *,
            players (*)
          `)
          .eq('approval_status', 'pending');

        if (error) throw error;

        setPendingRegistrations(pendingGuardians || []);
        
        const teams = await api.getTeams();
        setAvailableTeams(teams);
      } catch (error) {
        logger.error('Error loading data:', error);
        toast.error('Failed to load pending registrations');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate age from date of birth
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
  
  // Handle approve registration (both parent and children)
  const handleApprove = async (registration: any) => {
    try {
      // Update guardian status
      const { error: guardianError } = await supabase
        .from('guardians')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id
        })
        .eq('id', registration.id);

      if (guardianError) throw guardianError;

      // Update all children status
      if (registration.players?.length > 0) {
        const { error: playersError } = await supabase
          .from('players')
          .update({
            approval_status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: currentUser?.id
          })
          .eq('id', registration.players[0].id);

        if (playersError) throw playersError;

        // If team was selected, create player-team relationship
        if (selectedTeamId && registration.players[0]) {
          const { error: teamError } = await supabase
            .from('player_teams')
            .insert({
              player_id: registration.players[0].id,
              team_id: selectedTeamId
            });

          if (teamError) {
            logger.error('Error assigning team:', teamError);
          }
        }
      }

      toast.success(`Registration for ${registration.first_name} ${registration.last_name} has been approved`);
      
      // Remove from pending list
      setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
      setIsDialogOpen(false);
      setSelectedTeamId("");
    } catch (error) {
      logger.error("Error approving registration:", error);
      toast.error("An error occurred while approving");
    }
  };
  
  // Handle reject registration
  const handleReject = async (registration: any, reason?: string) => {
    try {
      // Update guardian status
      const { error: guardianError } = await supabase
        .from('guardians')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason || 'Registration rejected',
          approved_by: currentUser?.id
        })
        .eq('id', registration.id);

      if (guardianError) throw guardianError;

      // Update all children status
      if (registration.players?.length > 0) {
        const { error: playersError } = await supabase
          .from('players')
          .update({
            approval_status: 'rejected',
            rejection_reason: reason || 'Registration rejected',
            approved_by: currentUser?.id
          })
          .eq('id', registration.players[0].id);

        if (playersError) throw playersError;
      }

      toast.success(`Registration for ${registration.first_name} ${registration.last_name} has been rejected`);
      
      // Remove from pending list
      setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
      setIsDialogOpen(false);
    } catch (error) {
      logger.error("Error rejecting registration:", error);
      toast.error("An error occurred while rejecting");
    }
  };
  
  // Open registration details dialog
  const openRegistrationDetails = (registration: any) => {
    setSelectedRegistration(registration);
    
    // Pre-select a team that matches the child's age group
    if (registration.players?.[0]) {
      const child = registration.players[0];
      const childAgeGroup = child.date_of_birth ? 
        calculateAgeGroup(child.date_of_birth) : '';
      const matchingTeam = availableTeams.find(team => team.ageGroup === childAgeGroup);
      if (matchingTeam) {
        setSelectedTeamId(matchingTeam.id);
      } else {
        setSelectedTeamId("");
      }
    }
    
    setIsDialogOpen(true);
  };

  // Calculate age group from date of birth
  const calculateAgeGroup = (dateOfBirth: string): string => {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    
    // UK school year starts September 1st
    let schoolYearStart = new Date(now.getFullYear(), 8, 1);
    if (now < schoolYearStart) {
      schoolYearStart = new Date(now.getFullYear() - 1, 8, 1);
    }
    
    let ageOnSept1 = schoolYearStart.getFullYear() - dob.getFullYear();
    if (dob > new Date(schoolYearStart.getFullYear(), dob.getMonth(), dob.getDate())) {
      ageOnSept1--;
    }
    
    if (ageOnSept1 <= 6) return 'U7';
    if (ageOnSept1 <= 7) return 'U8';
    if (ageOnSept1 <= 8) return 'U9';
    if (ageOnSept1 <= 9) return 'U10';
    if (ageOnSept1 <= 10) return 'U11';
    if (ageOnSept1 <= 11) return 'U12';
    if (ageOnSept1 <= 12) return 'U13';
    if (ageOnSept1 <= 13) return 'U14';
    if (ageOnSept1 <= 14) return 'U15';
    if (ageOnSept1 <= 15) return 'U16';
    if (ageOnSept1 <= 16) return 'U17';
    return 'U18';
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
            <CardTitle>Pending Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length > 0 ? (
              <div className="space-y-4">
                {pendingRegistrations.map((registration) => {
                  const child = registration.players?.[0];
                  
                  return (
                    <div key={registration.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={registration.profile_image} alt={`${registration.first_name} ${registration.last_name}`} />
                          <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{registration.first_name} {registration.last_name}</h3>
                          <p className="text-sm text-muted-foreground">{registration.email}</p>
                          {child && (
                            <p className="text-sm text-muted-foreground">
                              Child: {child.first_name} {child.last_name}
                              {child.date_of_birth && ` (Age: ${calculateAge(child.date_of_birth)})`}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Registered: {new Date(registration.registration_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openRegistrationDetails(registration)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700" 
                          size="sm"
                          onClick={() => openRegistrationDetails(registration)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(registration)}
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
                <p className="mt-4">No pending registrations to review.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Registration details dialog */}
        {selectedRegistration && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registration Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 my-4">
                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Parent/Guardian Information</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedRegistration.profile_image} alt={`${selectedRegistration.first_name} ${selectedRegistration.last_name}`} />
                      <AvatarFallback>
                        <UserIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-xl">{selectedRegistration.first_name} {selectedRegistration.last_name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedRegistration.email}</p>
                      {selectedRegistration.phone && (
                        <p className="text-sm text-muted-foreground">{selectedRegistration.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Terms Accepted:</span>
                      <p className={selectedRegistration.terms_accepted ? "text-green-600" : "text-red-600"}>
                        {selectedRegistration.terms_accepted ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Code of Conduct:</span>
                      <p className={selectedRegistration.code_of_conduct_accepted ? "text-green-600" : "text-red-600"}>
                        {selectedRegistration.code_of_conduct_accepted ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Photo Consent:</span>
                      <p className={selectedRegistration.photo_consent ? "text-green-600" : "text-red-600"}>
                        {selectedRegistration.photo_consent ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Child Information */}
                {selectedRegistration.players?.[0] && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Child Information</h3>
                    {selectedRegistration.players.map((child: any, index: number) => (
                      <div key={child.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={child.profile_image} alt={`${child.first_name} ${child.last_name}`} />
                            <AvatarFallback>
                              <UserIcon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{child.first_name} {child.last_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Date of Birth: {new Date(child.date_of_birth).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Age Group: {calculateAgeGroup(child.date_of_birth)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <h4 className="font-medium">Assign Team</h4>
                      <Select 
                        value={selectedTeamId} 
                        onValueChange={setSelectedTeamId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeams
                            .filter(team => {
                              const child = selectedRegistration.players?.[0];
                              return child && team.ageGroup === calculateAgeGroup(child.date_of_birth);
                            })
                            .map(team => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(selectedRegistration)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Registration
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedRegistration)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Registration
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
