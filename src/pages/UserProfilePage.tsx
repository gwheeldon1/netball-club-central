
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  Shield,
  Edit,
  Save,
  X,
  Settings,
  Bell,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  profile_image: string | null;
}

const UserProfilePage = () => {
  const { currentUser, userRoles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Try to get guardian profile first
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .select('id, first_name, last_name, email, phone, profile_image')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (guardianError && guardianError.code !== 'PGRST116') {
        throw guardianError;
      }

      if (guardianData) {
        setProfile(guardianData);
        setFormData({
          firstName: guardianData.first_name || '',
          lastName: guardianData.last_name || '',
          email: guardianData.email || currentUser.email || '',
          phone: guardianData.phone || '',
        });
      } else {
        // Fallback to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone, profile_image')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          setProfile({
            id: profileData.id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            phone: profileData.phone,
            profile_image: profileData.profile_image,
          });
          setFormData({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: profileData.email || currentUser.email || '',
            phone: profileData.phone || '',
          });
        } else {
          // Create basic profile from auth user
          setFormData({
            firstName: currentUser.user_metadata?.first_name || '',
            lastName: currentUser.user_metadata?.last_name || '',
            email: currentUser.email || '',
            phone: '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryRole = () => {
    if (userRoles.includes('admin')) return 'Administrator';
    if (userRoles.includes('coach')) return 'Coach';
    if (userRoles.includes('manager')) return 'Manager';
    if (userRoles.includes('parent')) return 'Parent';
    return 'Member';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-600';
      case 'coach': return 'bg-blue-500/10 text-blue-600';
      case 'manager': return 'bg-green-500/10 text-green-600';
      case 'parent': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Try to update guardian profile first
      if (profile && profile.id) {
        const { error: guardianError } = await supabase
          .from('guardians')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          })
          .eq('id', profile.id);

        if (guardianError) {
          // If guardian update fails, try profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: currentUser.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
            });

          if (profileError) throw profileError;
        }
      } else {
        // Create/update in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: currentUser.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          });

        if (profileError) throw profileError;
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      await loadUserProfile(); // Reload the profile
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: profile?.email || currentUser?.email || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-1">Loading your profile...</p>
            </div>
          </div>
          <div className="grid gap-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div className="h-24 w-24 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-48"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleSave} className="flex-1 sm:w-auto" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1 sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid gap-6">
              {/* Profile Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        {profile?.profile_image ? (
                          <AvatarImage src={profile.profile_image} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {formData.firstName[0]}{formData.lastName[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Button variant="outline" size="sm" disabled>
                        Change Photo
                      </Button>
                    </div>

                    {/* Form */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Primary Role</Label>
                      <p className="text-lg font-semibold mt-1">{getPrimaryRole()}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">All Roles</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userRoles.length > 0 ? (
                          userRoles.map(role => (
                            <Badge key={role} className={`capitalize ${getRoleColor(role)}`}>
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-600">
                            No roles assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">••••••••</span>
                      <Button variant="outline" size="sm" disabled>
                        Change Password
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Not enabled</span>
                      <Button variant="outline" size="sm" disabled>
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
