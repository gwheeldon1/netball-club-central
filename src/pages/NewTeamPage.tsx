import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from '@/services/unifiedApi';
import { usePermissions } from "@/hooks/usePermissions";
import FileUpload from "@/components/FileUpload";
import { logger } from '@/utils/logger';

const NewTeamPage = () => {
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // currentUser removed
  const permissions = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    category: "Junior" as "Junior" | "Senior" | "Mixed",
    description: "",
    profileImage: "",
    bannerImage: "",
    iconImage: "",
  });

  // Check permissions
  if (!permissions.isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only administrators can create teams.</p>
          <Button onClick={() => navigate("/teams")} className="mt-4">
            Back to Teams
          </Button>
        </div>
      </Layout>
    );
  }

  const ageGroups = [
    "U6", "U7", "U8", "U9", "U10", "U11", 
    "U12", "U13", "U14", "U15", "U16", "U17", "U18"
  ];

  const categories = [
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" },
    { value: "Mixed", label: "Mixed" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: string, url: string) => {
    setFormData(prev => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.ageGroup) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const teamData = {
        name: formData.name.trim(),
        ageGroup: formData.ageGroup,
        category: formData.category,
        description: formData.description,
        profileImage: formData.profileImage,
        bannerImage: formData.bannerImage,
        icon: formData.iconImage,
      };

      await api.createTeam(teamData);
      
      toast.success("Team created successfully!");
      navigate("/teams");
    } catch (error) {
      logger.error("Error creating team:", error);
      toast.error("Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/teams")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Team</h1>
            <p className="text-muted-foreground mt-1">
              Set up a new team with all the details and images
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter team name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group *</Label>
                  <Select value={formData.ageGroup} onValueChange={(value) => handleInputChange('ageGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map(age => (
                        <SelectItem key={age} value={age}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value: "Junior" | "Senior" | "Mixed") => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the team, training schedule, goals, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Images */}
          <Card>
            <CardHeader>
              <CardTitle>Team Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <Label>Profile Image</Label>
                  <FileUpload
                    currentImage={formData.profileImage}
                    onUpload={(url) => handleImageUpload('profileImage', url)}
                    bucket="team-profiles"
                    aspectRatio={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Square image for team profile
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Banner Image</Label>
                  <FileUpload
                    currentImage={formData.bannerImage}
                    onUpload={(url) => handleImageUpload('bannerImage', url)}
                    bucket="team-banners"
                    aspectRatio={16/9}
                  />
                  <p className="text-xs text-muted-foreground">
                    Wide banner for team header
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Team Icon</Label>
                  <FileUpload
                    currentImage={formData.iconImage}
                    onUpload={(url) => handleImageUpload('iconImage', url)}
                    bucket="team-icons"
                    aspectRatio={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Small circular icon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/teams")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewTeamPage;