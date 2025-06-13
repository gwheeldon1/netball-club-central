import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, LockIcon, MailIcon, UserIcon, PhoneIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";
import { supabaseTeamApi } from "@/services/supabaseApi";

interface ChildData {
  id: string;
  name: string;
  dateOfBirth: string;
  medicalInfo: string;
  notes: string;
  profileImage: string;
  teamPreference: string;
  ageGroup: string;
}

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Parent form data
  const [parentData, setParentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
    password: "",
    confirmPassword: "",
    relationship: "parent"
  });

  // Children form data
  const [children, setChildren] = useState<ChildData[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      dateOfBirth: "",
      medicalInfo: "",
      notes: "",
      profileImage: "",
      teamPreference: "",
      ageGroup: ""
    }
  ]);

  // Consent checkboxes
  const [consents, setConsents] = useState({
    termsAccepted: false,
    codeOfConductAccepted: false,
    photoConsent: false
  });

  // Calculate UK school year age group
  const calculateAgeGroup = (dateOfBirth: string): string => {
    if (!dateOfBirth) return "";
    
    const dob = new Date(dateOfBirth);
    const now = new Date();
    
    // UK school year starts September 1st
    let schoolYearStart = new Date(now.getFullYear(), 8, 1); // September 1st
    if (now < schoolYearStart) {
      schoolYearStart = new Date(now.getFullYear() - 1, 8, 1);
    }
    
    // Calculate age as of September 1st
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

  // Load teams for selection
  useState(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await supabaseTeamApi.getAll();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  });

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentData(prev => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (id: string, field: string, value: string) => {
    setChildren(prev => prev.map(child => {
      if (child.id === id) {
        const updated = { ...child, [field]: value };
        
        // Auto-calculate age group when date of birth changes
        if (field === 'dateOfBirth') {
          updated.ageGroup = calculateAgeGroup(value);
        }
        
        return updated;
      }
      return child;
    }));
  };

  const addChild = () => {
    setChildren(prev => [...prev, {
      id: crypto.randomUUID(),
      name: "",
      dateOfBirth: "",
      medicalInfo: "",
      notes: "",
      profileImage: "",
      teamPreference: "",
      ageGroup: ""
    }]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!parentData.firstName || !parentData.lastName || !parentData.email || !parentData.password) {
      toast.error("Please fill in all required parent fields");
      return;
    }

    if (parentData.password !== parentData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (parentData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!consents.termsAccepted || !consents.codeOfConductAccepted) {
      toast.error("Please accept the Terms & Conditions and Code of Conduct");
      return;
    }

    // Validate children
    for (const child of children) {
      if (!child.name || !child.dateOfBirth) {
        toast.error("Please fill in required fields for all children");
        return;
      }
    }

    setIsLoading(true);

    try {
      // 1. Sign up the parent user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parentData.email,
        password: parentData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: parentData.firstName,
            last_name: parentData.lastName
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create user account");
        return;
      }

      // 2. Create guardian record
      const { error: guardianError } = await supabase
        .from('guardians')
        .insert({
          id: authData.user.id,
          first_name: parentData.firstName,
          last_name: parentData.lastName,
          email: parentData.email,
          phone: parentData.phone,
          relationship: parentData.relationship,
          profile_image: parentData.profileImage,
          terms_accepted: consents.termsAccepted,
          code_of_conduct_accepted: consents.codeOfConductAccepted,
          photo_consent: consents.photoConsent,
          approval_status: 'pending'
        });

      if (guardianError) {
        console.error('Guardian creation error:', guardianError);
        toast.error("Failed to create guardian profile");
        return;
      }

      // 3. Create player records
      for (const child of children) {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({
            first_name: child.name.split(' ')[0],
            last_name: child.name.split(' ').slice(1).join(' ') || '',
            date_of_birth: child.dateOfBirth,
            profile_image: child.profileImage,
            team_preference: child.teamPreference || null,
            approval_status: 'pending'
          })
          .select()
          .single();

        if (playerError) {
          console.error('Player creation error:', playerError);
          toast.error(`Failed to register child: ${child.name}`);
          return;
        }

        // Create guardian-player relationship
        const { error: relationshipError } = await supabase
          .from('guardians')
          .update({ player_id: playerData.id })
          .eq('id', authData.user.id);

        if (relationshipError) {
          console.error('Relationship creation error:', relationshipError);
        }
      }

      toast.success("Registration submitted successfully! Please check your email to verify your account. Your registration is pending approval.");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Award className="h-9 w-9 md:h-11 md:w-11 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Register with Netball Club</h1>
          <p className="text-muted-foreground mt-2">Create your account and register your children</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48">
                  <Label className="text-sm font-medium mb-3 block">Profile Picture</Label>
                  <FileUpload 
                    onUpload={(url) => setParentData(prev => ({ ...prev, profileImage: url }))}
                    currentImage={parentData.profileImage}
                    aspectRatio={1}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="firstName" 
                          name="firstName" 
                          value={parentData.firstName} 
                          onChange={handleParentChange} 
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="lastName" 
                          name="lastName" 
                          value={parentData.lastName} 
                          onChange={handleParentChange} 
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={parentData.email} 
                        onChange={handleParentChange} 
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={parentData.phone} 
                        onChange={handleParentChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          name="password" 
                          type="password" 
                          value={parentData.password} 
                          onChange={handleParentChange} 
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword" 
                          type="password" 
                          value={parentData.confirmPassword} 
                          onChange={handleParentChange} 
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Children Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Children Information</CardTitle>
              <Button type="button" variant="outline" onClick={addChild}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Child
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {children.map((child, index) => (
                <div key={child.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Child #{index + 1}</h4>
                    {children.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeChild(child.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48">
                      <Label className="text-sm font-medium mb-3 block">Profile Picture</Label>
                      <FileUpload 
                        onUpload={(url) => handleChildChange(child.id, 'profileImage', url)}
                        currentImage={child.profileImage}
                        aspectRatio={1}
                      />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name <span className="text-destructive">*</span></Label>
                          <Input 
                            value={child.name} 
                            onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label>Date of Birth <span className="text-destructive">*</span></Label>
                          <Input 
                            type="date" 
                            value={child.dateOfBirth} 
                            onChange={(e) => handleChildChange(child.id, 'dateOfBirth', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Age Group (Auto-calculated)</Label>
                          <Input value={child.ageGroup} disabled />
                        </div>
                        
                        <div>
                          <Label>Team Preference (Optional)</Label>
                          <Select value={child.teamPreference} onValueChange={(value) => handleChildChange(child.id, 'teamPreference', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams
                                .filter(team => team.ageGroup === child.ageGroup)
                                .map(team => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Medical Information</Label>
                        <Textarea 
                          placeholder="Please provide any relevant medical information (allergies, conditions, medications, etc.)"
                          value={child.medicalInfo} 
                          onChange={(e) => handleChildChange(child.id, 'medicalInfo', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea 
                          placeholder="Any additional information that might be useful for coaches and managers"
                          value={child.notes} 
                          onChange={(e) => handleChildChange(child.id, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={consents.termsAccepted}
                  onCheckedChange={(checked) => setConsents(prev => ({ ...prev, termsAccepted: checked as boolean }))}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a> of the netball club <span className="text-destructive">*</span>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="conduct" 
                  checked={consents.codeOfConductAccepted}
                  onCheckedChange={(checked) => setConsents(prev => ({ ...prev, codeOfConductAccepted: checked as boolean }))}
                />
                <Label htmlFor="conduct" className="text-sm leading-relaxed">
                  I agree to abide by the <a href="#" className="text-primary hover:underline">Code of Conduct</a> <span className="text-destructive">*</span>
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="photos" 
                  checked={consents.photoConsent}
                  onCheckedChange={(checked) => setConsents(prev => ({ ...prev, photoConsent: checked as boolean }))}
                />
                <Label htmlFor="photos" className="text-sm leading-relaxed">
                  I consent to photos/videos of my child(ren) being taken and used for club promotional purposes
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/login")}
              className="sm:w-auto"
            >
              Back to Login
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="sm:w-auto"
            >
              {isLoading ? "Submitting Registration..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;