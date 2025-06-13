import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Plus, 
  Trash2,
  Heart,
  Shield,
  Camera
} from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
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

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

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
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsData = await supabaseTeamApi.getAll();
        setTeams(teamsData);
      } catch (error) {
        console.error('Error loading teams:', error);
      }
    };
    loadTeams();
  }, []);

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!parentData.firstName || !parentData.lastName || !parentData.email || !parentData.password) {
          toast.error("Please fill in all required parent fields");
          return false;
        }
        if (parentData.password !== parentData.confirmPassword) {
          toast.error("Passwords do not match");
          return false;
        }
        if (parentData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        return true;
      
      case 2:
        for (const child of children) {
          if (!child.name || !child.dateOfBirth) {
            toast.error("Please fill in required fields for all children");
            return false;
          }
        }
        return true;
      
      case 3:
        if (!consents.termsAccepted || !consents.codeOfConductAccepted) {
          toast.error("Please accept the Terms & Conditions and Code of Conduct");
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
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

  const getStepIcon = (step: number) => {
    if (step < currentStep) return <Check className="h-4 w-4" />;
    if (step === currentStep) return step;
    return step;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ParentStep 
          parentData={parentData} 
          handleParentChange={handleParentChange}
          setParentData={setParentData}
        />;
      case 2:
        return <ChildrenStep 
          children={children}
          handleChildChange={handleChildChange}
          addChild={addChild}
          removeChild={removeChild}
          teams={teams}
        />;
      case 3:
        return <ConsentStep 
          consents={consents}
          setConsents={setConsents}
        />;
      case 4:
        return <ReviewStep 
          parentData={parentData}
          children={children}
          consents={consents}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
              <Award className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Join Our Netball Family
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Create your account and register your children in just a few simple steps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${step <= currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    {getStepIcon(step)}
                  </div>
                  {step < 4 && (
                    <div className={`
                      flex-1 h-1 mx-4 rounded-full transition-all
                      ${step < currentStep ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progressPercentage} className="w-full h-2" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Parent Info</span>
              <span>Children</span>
              <span>Consent</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="animate-fade-in">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={currentStep === 1 ? () => navigate("/login") : prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? "Back to Login" : "Previous"}
            </Button>
            
            <Button 
              onClick={currentStep === totalSteps ? handleSubmit : nextStep}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {currentStep === totalSteps ? (
                isLoading ? "Submitting..." : "Submit Registration"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const ParentStep = ({ parentData, handleParentChange, setParentData }: any) => (
  <Card className="border-0 shadow-xl">
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl flex items-center justify-center gap-3">
        <User className="h-6 w-6 text-primary" />
        Parent/Guardian Information
      </CardTitle>
      <p className="text-muted-foreground">Tell us about yourself</p>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex flex-col items-center">
          <Label className="text-sm font-medium mb-4">Profile Picture</Label>
          <FileUpload 
            onUpload={(url) => setParentData((prev: any) => ({ ...prev, profileImage: url }))}
            currentImage={parentData.profileImage}
            aspectRatio={1}
            bucket="avatars"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={parentData.firstName} 
                  onChange={handleParentChange} 
                  required
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                  placeholder="Enter your first name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={parentData.lastName} 
                  onChange={handleParentChange} 
                  required
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={parentData.email} 
                onChange={handleParentChange} 
                required
                className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={parentData.phone} 
                onChange={handleParentChange}
                className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={parentData.password} 
                  onChange={handleParentChange} 
                  required
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                  placeholder="Create a password"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  value={parentData.confirmPassword} 
                  onChange={handleParentChange} 
                  required
                  className="pl-10 border-0 bg-muted/50 focus:bg-background transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ChildrenStep = ({ children, handleChildChange, addChild, removeChild, teams }: any) => (
  <Card className="border-0 shadow-xl">
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl flex items-center justify-center gap-3">
        <Heart className="h-6 w-6 text-primary" />
        Children Information
      </CardTitle>
      <p className="text-muted-foreground">Tell us about your children</p>
    </CardHeader>
    <CardContent className="space-y-8">
      {children.map((child: any, index: number) => (
        <div key={child.id} className="relative border border-muted/50 rounded-2xl p-6 bg-gradient-to-br from-muted/20 to-background">
          <div className="absolute -top-3 left-6">
            <Badge variant="secondary" className="bg-primary text-primary-foreground px-3 py-1">
              Child #{index + 1}
            </Badge>
          </div>
          
          {children.length > 1 && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => removeChild(child.id)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex flex-col lg:flex-row gap-6 mt-4">
            <div className="lg:w-48 flex flex-col items-center">
              <Label className="text-sm font-medium mb-4">Profile Picture</Label>
              <FileUpload 
                onUpload={(url) => handleChildChange(child.id, 'profileImage', url)}
                currentImage={child.profileImage}
                aspectRatio={1}
                bucket="avatars"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    value={child.name} 
                    onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                    required
                    className="border-0 bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Enter child's full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    value={child.dateOfBirth} 
                    onChange={(e) => handleChildChange(child.id, 'dateOfBirth', e.target.value)}
                    required
                    className="border-0 bg-muted/50 focus:bg-background transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Age Group (Auto-calculated)</Label>
                  <Input 
                    value={child.ageGroup} 
                    disabled 
                    className="border-0 bg-muted/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Team Preference (Optional)</Label>
                  <Select value={child.teamPreference} onValueChange={(value) => handleChildChange(child.id, 'teamPreference', value)}>
                    <SelectTrigger className="border-0 bg-muted/50 focus:bg-background transition-colors">
                      <SelectValue placeholder="Select preferred team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter((team: any) => team.ageGroup === child.ageGroup)
                        .map((team: any) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Medical Information</Label>
                <Textarea 
                  placeholder="Please provide any relevant medical information (allergies, conditions, medications, etc.)"
                  value={child.medicalInfo} 
                  onChange={(e) => handleChildChange(child.id, 'medicalInfo', e.target.value)}
                  className="border-0 bg-muted/50 focus:bg-background transition-colors resize-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea 
                  placeholder="Any additional information that might be useful for coaches and managers"
                  value={child.notes} 
                  onChange={(e) => handleChildChange(child.id, 'notes', e.target.value)}
                  className="border-0 bg-muted/50 focus:bg-background transition-colors resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={addChild}
          className="border-dashed border-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Child
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ConsentStep = ({ consents, setConsents }: any) => (
  <Card className="border-0 shadow-xl">
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl flex items-center justify-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        Terms & Conditions
      </CardTitle>
      <p className="text-muted-foreground">Please review and accept our terms</p>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-muted/50">
          <Checkbox 
            id="terms" 
            checked={consents.termsAccepted}
            onCheckedChange={(checked) => setConsents((prev: any) => ({ ...prev, termsAccepted: checked as boolean }))}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I agree to the <a href="#" className="text-primary hover:underline font-medium">Terms & Conditions</a> of the netball club 
            <span className="text-destructive ml-1">*</span>
          </Label>
        </div>
        
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-muted/50">
          <Checkbox 
            id="conduct" 
            checked={consents.codeOfConductAccepted}
            onCheckedChange={(checked) => setConsents((prev: any) => ({ ...prev, codeOfConductAccepted: checked as boolean }))}
            className="mt-1"
          />
          <Label htmlFor="conduct" className="text-sm leading-relaxed cursor-pointer">
            I agree to abide by the <a href="#" className="text-primary hover:underline font-medium">Code of Conduct</a>
            <span className="text-destructive ml-1">*</span>
          </Label>
        </div>
        
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-muted/50">
          <Checkbox 
            id="photos" 
            checked={consents.photoConsent}
            onCheckedChange={(checked) => setConsents((prev: any) => ({ ...prev, photoConsent: checked as boolean }))}
            className="mt-1"
          />
          <Label htmlFor="photos" className="text-sm leading-relaxed cursor-pointer flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            I consent to photos/videos of my child(ren) being taken and used for club promotional purposes
          </Label>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ReviewStep = ({ parentData, children, consents }: any) => (
  <Card className="border-0 shadow-xl">
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-2xl flex items-center justify-center gap-3">
        <Check className="h-6 w-6 text-primary" />
        Review Your Information
      </CardTitle>
      <p className="text-muted-foreground">Please review your information before submitting</p>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-muted/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Parent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-medium">Name:</span> {parentData.firstName} {parentData.lastName}</div>
            <div><span className="font-medium">Email:</span> {parentData.email}</div>
            <div><span className="font-medium">Phone:</span> {parentData.phone || 'Not provided'}</div>
          </CardContent>
        </Card>

        <Card className="border-muted/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Children ({children.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {children.map((child: any, index: number) => (
              <div key={child.id} className="border-l-2 border-primary pl-3">
                <div className="font-medium">{child.name}</div>
                <div className="text-sm text-muted-foreground">
                  Born: {child.dateOfBirth} • Age Group: {child.ageGroup}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/50 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Consents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Terms & Conditions accepted
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Code of Conduct accepted
          </div>
          {consents.photoConsent && (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Photo consent given
            </div>
          )}
        </CardContent>
      </Card>
    </CardContent>
  </Card>
);

export default RegistrationPage;