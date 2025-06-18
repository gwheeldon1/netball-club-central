
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { groupApi, GroupWithTeams } from "@/services/api/groups";

const EditGroupPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<GroupWithTeams | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar_image: "",
  });

  useEffect(() => {
    const loadGroup = async () => {
      if (!id) return;
      try {
        const groupData = await groupApi.getGroupById(id);
        if (groupData) {
          setGroup(groupData);
          setFormData({
            name: groupData.name,
            description: groupData.description || "",
            avatar_image: groupData.avatar_image || "",
          });
        }
      } catch (error) {
        console.error('Error loading group:', error);
        toast.error('Failed to load group');
      }
    };

    loadGroup();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);
    try {
      await groupApi.updateGroup(id, formData);
      toast.success("Group updated successfully!");
      navigate("/groups");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !group) return;
    
    if (!confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await groupApi.deleteGroup(id);
      toast.success("Group deleted successfully!");
      navigate("/groups");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!group) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading group...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Group</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Update group details and manage teams
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Under 12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Description of this age group..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_image">Avatar Image URL</Label>
                  <Input
                    id="avatar_image"
                    type="url"
                    value={formData.avatar_image}
                    onChange={(e) => handleInputChange("avatar_image", e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Group"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/groups">Cancel</Link>
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={loading}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Teams ({group.teams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {group.teams.length > 0 ? (
                  <div className="space-y-2">
                    {group.teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{team.name}</span>
                        <span className="text-sm text-muted-foreground">{team.age_group}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No teams assigned to this group yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff ({group.staff.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {group.staff.length > 0 ? (
                  <div className="space-y-2">
                    {group.staff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{staff.name}</span>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                        <span className="text-sm bg-accent px-2 py-1 rounded capitalize">{staff.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No staff assigned to this group yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditGroupPage;
