import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, X, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { User, Team } from "@/types";
import { api } from '@/services/unifiedApi';
import { supabase } from "@/integrations/supabase/client";
import FileUpload from "@/components/FileUpload";

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userRoles, setUserRoles] = useState<{ role: string; teamId?: string; isActive: boolean }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.user_metadata?.first_name || "",
        email: currentUser.email || "",
        phone: currentUser.user_metadata?.phone || "",
        profileImage: "",
      });
      
      // Load user roles and teams
      loadUserRoles();
    }
  }, [currentUser]);

  const loadUserRoles = async () => {
    if (!currentUser) return;
    
    try {
      // User roles not yet implemented in unified API
      const roles: any[] = [];
      setUserRoles(roles);
      
      // Get unique team IDs from roles
      const teamIds = [...new Set(roles.filter(r => r.teamId).map(r => r.teamId))];
      
      // For now, we'll just show the team IDs since we don't have a full team API integration
      // In a full implementation, you'd fetch team details here
      setUserTeams([]);
    } catch (error) {
      console.error("Error loading user roles:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, profileImage: url }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Parse the name into first and last name
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Update guardian record in Supabase
      const { error } = await supabase
        .from('guardians')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          phone: formData.phone,
          profile_image: formData.profileImage,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Note: In a full implementation, you'd want to refresh the user context
      // For now, the profile image and other changes will show after page refresh
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.user_metadata?.first_name || "",
        email: currentUser.email || "",
        phone: currentUser.user_metadata?.phone || "",
        profileImage: "",
      });
    }
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-destructive/10 text-destructive";
      case 'coach':
        return "bg-primary/10 text-primary";
      case 'manager':
        return "bg-secondary text-secondary-foreground";
      case 'parent':
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!currentUser) {
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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and account settings
            </p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Image and Basic Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {isEditing ? (
                  <FileUpload
                    currentImage={formData.profileImage}
                    onUpload={handleImageUpload}
                    aspectRatio={1}
                    bucket="avatars"
                  />
                ) : (
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={formData.profileImage} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {(currentUser.user_metadata?.first_name?.[0] || '') + (currentUser.user_metadata?.last_name?.[0] || '') || currentUser.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {!isEditing && (
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">{formData.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {userRoles.map((roleAssignment, index) => (
                      <Badge key={index} className={getRoleBadgeColor(roleAssignment.role)}>
                        {roleAssignment.role.charAt(0).toUpperCase() + roleAssignment.role.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.phone || "Not provided"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles and Teams */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Team Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userRoles.length > 0 ? (
                <div className="space-y-4">
                  {userRoles.map((roleAssignment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleBadgeColor(roleAssignment.role)}>
                          {roleAssignment.role.charAt(0).toUpperCase() + roleAssignment.role.slice(1)}
                        </Badge>
                        {roleAssignment.teamId && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Team: {roleAssignment.teamId}
                          </div>
                        )}
                      </div>
                      <Badge variant={roleAssignment.isActive ? "default" : "secondary"}>
                        {roleAssignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No role assignments found</p>
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
