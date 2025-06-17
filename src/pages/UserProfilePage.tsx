
import { useState, useEffect, startTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, X, Users, Shield, User, Mail, Phone, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";
import { Link } from "react-router-dom";
import { useAsyncTransition } from "@/hooks/useAsyncTransition";

const UserProfilePage = () => {
  const { currentUser, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [userTeams, setUserTeams] = useState<Team[]>([]); // userTeams removed
  const [userRoles, setUserRoles] = useState<{ role: string; teamId?: string; isActive: boolean }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });
  const { executeWithTransition } = useAsyncTransition();

  // Use the user from auth context, with fallback to currentUser for backward compatibility
  const authUser = user || currentUser;

  useEffect(() => {
    if (authUser) {
      startTransition(() => {
        setFormData({
          name: `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() || authUser.email?.split('@')[0] || '',
          email: authUser.email || "",
          phone: authUser.user_metadata?.phone || "",
          profileImage: authUser.user_metadata?.profile_image || "",
        });
      });
      
      loadUserRoles();
    }
  }, [authUser]);

  const loadUserRoles = async () => {
    if (!authUser) return;
    
    try {
      // TODO: Implement actual role loading from API
      const roles: { role: string; teamId?: string; isActive: boolean }[] = [];
      
      startTransition(() => {
        setUserRoles(roles);
        // setUserTeams([]); // userTeams removed
      });
    } catch (error) {
      console.error("Error loading user roles:", error);
      toast.error("Failed to load user roles");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    startTransition(() => {
      setFormData(prev => ({ ...prev, [field]: value }));
    });
  };

  const handleImageUpload = (url: string) => {
    startTransition(() => {
      setFormData(prev => ({ ...prev, profileImage: url }));
    });
  };

  const handleSave = async () => {
    if (!authUser) return;
    
    executeWithTransition(async () => {
      setLoading(true);
      try {
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ');

        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: authUser.id,
            first_name: firstName,
            last_name: lastName,
            email: formData.email,
            phone: formData.phone,
            profile_image: formData.profileImage,
          });

        if (error) throw error;

        toast.success("Profile updated successfully");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCancel = () => {
    executeWithTransition(() => {
      if (authUser) {
        setFormData({
          name: `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() || authUser.email?.split('@')[0] || '',
          email: authUser.email || "",
          phone: authUser.user_metadata?.phone || "",
          profileImage: authUser.user_metadata?.profile_image || "",
        });
      }
      setIsEditing(false);
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return "destructive" as const;
      case 'coach':
        return "default" as const;
      case 'manager':
        return "secondary" as const;
      case 'parent':
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  const getInitials = () => {
    if (authUser?.user_metadata?.first_name && authUser?.user_metadata?.last_name) {
      return authUser.user_metadata.first_name[0] + authUser.user_metadata.last_name[0];
    }
    return authUser?.email?.[0]?.toUpperCase() || 'U';
  };

  if (!authUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="Loading profile">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
          
          {!isEditing ? (
            <Button 
              size="lg" 
              onClick={() => executeWithTransition(() => setIsEditing(true))} 
              className="w-full sm:w-auto" 
              aria-label="Edit profile"
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                size="lg" 
                onClick={handleSave} 
                disabled={loading}
                className="w-full sm:w-auto"
                aria-label="Save profile changes"
              >
                <Save className="mr-2 h-5 w-5" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleCancel} 
                disabled={loading}
                className="w-full sm:w-auto"
                aria-label="Cancel profile editing"
              >
                <X className="mr-2 h-5 w-5" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="border-0 shadow-lg lg:col-span-1">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                {isEditing ? (
                  <div className="space-y-4 w-full max-w-sm">
                    <FileUpload
                      currentImage={formData.profileImage}
                      onUpload={handleImageUpload}
                      aspectRatio={1}
                      bucket="profile-images"
                      accept="image/*"
                      maxSize={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Upload a profile picture (max 5MB)
                    </p>
                  </div>
                ) : (
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={formData.profileImage} alt={`${formData.name || 'User'} profile picture`} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {!isEditing && (
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {formData.name || 'User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {authUser.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Role Badges */}
              {!isEditing && userRoles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Current Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((roleAssignment, index) => (
                      <Badge 
                        key={index} 
                        variant={getRoleBadgeVariant(roleAssignment.role)}
                        className="font-medium"
                      >
                        {roleAssignment.role.charAt(0).toUpperCase() + roleAssignment.role.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-3 sm:col-span-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12"
                      aria-describedby="name-description"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30 border border-border">
                      <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-base">{formData.name || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                      className="h-12"
                      aria-describedby="email-description"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30 border border-border">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-base truncate">{formData.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="h-12"
                      aria-describedby="phone-description"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30 border border-border">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-base">{formData.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Teams Card */}
          <Card className="border-0 shadow-lg lg:col-span-3">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Roles & Team Assignments
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Your current roles and team memberships across the organization
                  </CardDescription>
                </div>
                <Link 
                  to="/teams" 
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  aria-label="View all teams"
                >
                  View teams <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {userRoles.length > 0 ? (
                <div className="space-y-4">
                  {userRoles.map((roleAssignment, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/30 hover:bg-accent/30 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getRoleBadgeVariant(roleAssignment.role)} className="font-medium">
                            {roleAssignment.role.charAt(0).toUpperCase() + roleAssignment.role.slice(1)}
                          </Badge>
                          <Badge variant={roleAssignment.isActive ? "default" : "secondary"} className="text-xs">
                            {roleAssignment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {roleAssignment.teamId && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Team: {roleAssignment.teamId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No role assignments</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        You don't have any role assignments yet. Contact your administrator to get assigned to teams and roles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
