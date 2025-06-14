import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Plus, 
  Trash2,
  Star,
  Users,
  Shield,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { supabaseTeamApi } from "@/services/supabaseApi";

interface ChildData {
  id: string;
  name: string;
  dateOfBirth: string;
  ageGroup: string;
}

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  
  // Simplified form data
  const [formData, setFormData] = useState({
    // Parent info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    
    // Children (simplified)
    children: [{
      id: crypto.randomUUID(),
      name: "",
      dateOfBirth: "",
      ageGroup: ""
    }] as ChildData[],
    
    // Required consents only
    agreeToTerms: false
  });

  // Calculate UK school year age group
  const calculateAgeGroup = (dateOfBirth: string): string => {
    if (!dateOfBirth) return "";
    
    const dob = new Date(dateOfBirth);
    const now = new Date();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map(child => {
        if (child.id === id) {
          const updated = { ...child, [field]: value };
          if (field === 'dateOfBirth') {
            updated.ageGroup = calculateAgeGroup(value);
          }
          return updated;
        }
        return child;
      })
    }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, {
        id: crypto.randomUUID(),
        name: "",
        dateOfBirth: "",
        ageGroup: ""
      }]
    }));
  };

  const removeChild = (id: string) => {
    if (formData.children.length > 1) {
      setFormData(prev => ({
        ...prev,
        children: prev.children.filter(child => child.id !== id)
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return false;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    for (const child of formData.children) {
      if (!child.name || !child.dateOfBirth) {
        toast.error("Please complete all children details");
        return false;
      }
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Sign up the parent user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      // Create guardian record
      const { error: guardianError } = await supabase
        .from('guardians')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          relationship: 'parent',
          terms_accepted: formData.agreeToTerms,
          code_of_conduct_accepted: formData.agreeToTerms,
          photo_consent: false,
          approval_status: 'pending'
        });

      if (guardianError) {
        console.error('Guardian creation error:', guardianError);
        toast.error("Registration failed");
        return;
      }

      // Create player records
      for (const child of formData.children) {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({
            first_name: child.name.split(' ')[0],
            last_name: child.name.split(' ').slice(1).join(' ') || '',
            date_of_birth: child.dateOfBirth,
            approval_status: 'pending'
          })
          .select()
          .single();

        if (playerError) {
          console.error('Player creation error:', playerError);
          toast.error(`Failed to register ${child.name}`);
          return;
        }

        // Link guardian to player
        await supabase
          .from('guardians')
          .update({ player_id: playerData.id })
          .eq('id', authData.user.id);
      }

      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full shadow-lg">
              <Star className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Join Our Netball Club
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get your children involved in the sport they'll love. Professional coaching, friendly environment, and a community that cares.
              </p>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>200+ Active Players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Safeguarding Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>England Netball Approved</span>
                  </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-card">
            <CardHeader className="text-center py-8">
              <CardTitle className="text-3xl font-bold text-foreground">
                Create Your Account
              </CardTitle>
              <p className="text-muted-foreground text-lg mt-2">
                Quick registration - takes less than 2 minutes
              </p>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Parent Details Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-3 pb-2 border-b border-border">
                  <User className="h-5 w-5 text-primary" />
                  Your Information
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        className="h-12 bg-background border-input"
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        className="h-12 bg-background border-input"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="h-12 bg-background border-input"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="h-12 bg-background border-input"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Create Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-12 bg-background border-input"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>
              </div>

              {/* Children Details Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    Children Information
                  </h3>
                  {formData.children.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addChild}
                      className="text-primary border-primary hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.children.map((child, index) => (
                    <Card key={child.id} className="border border-muted bg-muted/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <span className="font-semibold text-foreground">Child {index + 1}</span>
                          {formData.children.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChild(child.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Full Name *</Label>
                              <Input
                                value={child.name}
                                onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                                required
                                className="h-12 bg-background border-input"
                                placeholder="Child's full name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Date of Birth *</Label>
                              <Input
                                type="date"
                                value={child.dateOfBirth}
                                onChange={(e) => handleChildChange(child.id, 'dateOfBirth', e.target.value)}
                                required
                                className="h-12 bg-background border-input"
                              />
                            </div>
                          </div>

                          {child.ageGroup && (
                            <div>
                              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                                Age Group: {child.ageGroup}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Terms Agreement Section */}
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the <span className="text-primary font-medium underline">Terms & Conditions</span> and 
                    <span className="text-primary font-medium underline"> Code of Conduct</span>. 
                    I understand my registration requires approval from club administrators. *
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold"
              >
                {isLoading ? "Creating Account..." : "Join the Club"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;