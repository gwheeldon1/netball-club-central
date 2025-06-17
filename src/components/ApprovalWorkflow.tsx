import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check, X, Clock, User, Heart, Shield, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Interfaces moved to @/types/interfaces

interface PendingRegistration {
  player: any; // Database player object
  guardian: any; // Database guardian object  
  teamName?: string;
}

const ApprovalWorkflow = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      setLoading(true);
      
      // Get pending players with their guardians
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          teams!players_team_preference_fkey(name)
        `)
        .eq('approval_status', 'pending')
        .order('sign_up_date', { ascending: false });

      if (playersError) throw playersError;

      const { data: guardiansData, error: guardiansError } = await supabase
        .from('guardians')
        .select('*')
        .eq('approval_status', 'pending');

      if (guardiansError) throw guardiansError;

      // Combine player and guardian data
      const registrations: PendingRegistration[] = playersData?.map((player: any) => {
        const guardian = guardiansData?.find(g => g.player_id === player.id);
        return {
          player,
          guardian: guardian!,
          teamName: player.teams?.name
        };
      }).filter(reg => reg.guardian) || [];

      setPendingRegistrations(registrations);
    } catch (error) {
      logger.error('Error loading pending registrations:', error);
      toast.error("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = (registration: PendingRegistration, action: 'approve' | 'reject') => {
    setSelectedRegistration(registration);
    setApprovalAction(action);
    setShowApprovalDialog(true);
    setRejectionReason("");
  };

  const processApproval = async () => {
    if (!selectedRegistration) return;

    setIsProcessing(true);
    try {
      const status = approvalAction === 'approve' ? 'approved' : 'rejected';
      const currentUser = await supabase.auth.getUser();
      
      // Update player status
      const playerUpdate: Record<string, any> = {
        approval_status: status,
        approved_at: approvalAction === 'approve' ? new Date().toISOString() : null,
        approved_by: currentUser.data.user?.id,
      };

      if (approvalAction === 'reject') {
        playerUpdate.rejection_reason = rejectionReason;
      }

      const { error: playerError } = await supabase
        .from('players')
        .update(playerUpdate)
        .eq('id', selectedRegistration.player.id);

      if (playerError) throw playerError;

      // Update guardian status
      const guardianUpdate: Record<string, any> = {
        approval_status: status,
        approved_at: approvalAction === 'approve' ? new Date().toISOString() : null,
        approved_by: currentUser.data.user?.id,
      };

      if (approvalAction === 'reject') {
        guardianUpdate.rejection_reason = rejectionReason;
      }

      const { error: guardianError } = await supabase
        .from('guardians')
        .update(guardianUpdate)
        .eq('id', selectedRegistration.guardian.id);

      if (guardianError) throw guardianError;

      // If approved and team preference exists, create team assignment
      if (approvalAction === 'approve' && selectedRegistration.player.team_preference) {
        const { error: teamError } = await supabase
          .from('player_teams')
          .insert([{
            player_id: selectedRegistration.player.id,
            team_id: selectedRegistration.player.team_preference,
            join_date: new Date().toISOString().split('T')[0]
          }]);

        if (teamError) {
          logger.error('Error assigning team:', teamError);
          // Don't throw here as the approval was successful
        }
      }

      toast.success(`Registration ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      
      // Reload data
      await loadPendingRegistrations();
      
      setShowApprovalDialog(false);
      setSelectedRegistration(null);
    } catch (error) {
      logger.error('Error processing approval:', error);
      toast.error(`Failed to ${approvalAction} registration`);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={`skeleton-${i}`} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted h-12 w-12"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingRegistrations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Check className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pending Registrations</h3>
          <p className="text-muted-foreground">All registrations have been processed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pending Registrations</h2>
        <Badge variant="secondary">
          {pendingRegistrations.length} pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingRegistrations.map((registration) => (
          <Card key={registration.player.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={registration.player.profile_image} />
                    <AvatarFallback>
                      {registration.player.first_name[0]}{registration.player.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {registration.player.first_name} {registration.player.last_name}
                    </CardTitle>
                    <CardDescription>
                      Age {calculateAge(registration.player.date_of_birth)} • {registration.player.gender}
                      {registration.teamName && ` • Prefers ${registration.teamName}`}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Player Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold flex items-center gap-1 mb-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="space-y-1 text-muted-foreground">
                    {registration.player.email && <p>Email: {registration.player.email}</p>}
                    {registration.player.phone && <p>Phone: {registration.player.phone}</p>}
                    <p>Address: {registration.player.address}, {registration.player.city}, {registration.player.postal_code}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold flex items-center gap-1 mb-2">
                    <Shield className="h-4 w-4" />
                    Guardian Information
                  </h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>{registration.guardian.first_name} {registration.guardian.last_name}</p>
                    <p>Email: {registration.guardian.email}</p>
                    <p>Phone: {registration.guardian.phone}</p>
                    <p>Relationship: {registration.guardian.relationship}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="font-semibold flex items-center gap-1 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Emergency Contact
                </h4>
                <div className="text-sm text-muted-foreground">
                  <p>{registration.player.emergency_contact_name} - {registration.player.emergency_contact_relationship}</p>
                  <p>{registration.player.emergency_contact_phone}</p>
                </div>
              </div>

              {/* Medical Information */}
              {(registration.player.medical_conditions || registration.player.medications || 
                registration.player.allergies || registration.player.dietary_requirements) && (
                <div>
                  <h4 className="font-semibold flex items-center gap-1 mb-2">
                    <Heart className="h-4 w-4" />
                    Medical Information
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {registration.player.medical_conditions && (
                      <p><span className="font-medium">Conditions:</span> {registration.player.medical_conditions}</p>
                    )}
                    {registration.player.medications && (
                      <p><span className="font-medium">Medications:</span> {registration.player.medications}</p>
                    )}
                    {registration.player.allergies && (
                      <p><span className="font-medium">Allergies:</span> {registration.player.allergies}</p>
                    )}
                    {registration.player.dietary_requirements && (
                      <p><span className="font-medium">Dietary:</span> {registration.player.dietary_requirements}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Consent Status */}
              <div>
                <h4 className="font-semibold flex items-center gap-1 mb-2">
                  <FileText className="h-4 w-4" />
                  Consent Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={registration.player.terms_accepted ? "default" : "destructive"}>
                    Terms: {registration.player.terms_accepted ? "Accepted" : "Not Accepted"}
                  </Badge>
                  <Badge variant={registration.player.code_of_conduct_accepted ? "default" : "destructive"}>
                    Code of Conduct: {registration.player.code_of_conduct_accepted ? "Accepted" : "Not Accepted"}
                  </Badge>
                  <Badge variant={registration.player.photo_consent ? "default" : "secondary"}>
                    Photo Consent: {registration.player.photo_consent ? "Given" : "Not Given"}
                  </Badge>
                  <Badge variant={registration.player.data_processing_consent ? "default" : "destructive"}>
                    Data Processing: {registration.player.data_processing_consent ? "Consented" : "Not Consented"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprovalAction(registration, 'approve')}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApprovalAction(registration, 'reject')}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Registration
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? `Are you sure you want to approve the registration for ${selectedRegistration?.player.first_name} ${selectedRegistration?.player.last_name}?`
                : `Please provide a reason for rejecting the registration for ${selectedRegistration?.player.first_name} ${selectedRegistration?.player.last_name}.`
              }
            </DialogDescription>
          </DialogHeader>

          {approvalAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                placeholder="Please explain why this registration is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={processApproval}
              disabled={isProcessing || (approvalAction === 'reject' && !rejectionReason.trim())}
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflow;