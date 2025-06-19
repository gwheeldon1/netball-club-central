
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Team } from "@/types/core";
import { toast } from "@/hooks/use-toast";

interface TeamFormProps {
  team?: Team;
  onSubmit?: (team: Team) => void;
  onCancel?: () => void;
}

const ageGroups = [
  "U6", "U7", "U8", "U9", "U10", "U11", "U12", "U13", 
  "U14", "U15", "U16", "U17", "U18", "Senior", "Mixed"
];

const categories = ["Junior", "Senior", "Mixed"] as const;
type CategoryType = typeof categories[number];

export const TeamForm = ({ team, onSubmit, onCancel }: TeamFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: team?.name || "",
    ageGroup: team?.ageGroup || "",
    category: (team?.category || "Junior") as CategoryType,
    description: team?.description || "",
    archived: team?.archived || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Team name is required");
      }
      if (!formData.ageGroup) {
        throw new Error("Age group is required");
      }
      if (!formData.category) {
        throw new Error("Category is required");
      }

      let savedTeam: Team;
      
      if (team) {
        // Update existing team
        savedTeam = await api.updateTeam(team.id, formData);
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        // Create new team
        savedTeam = await api.createTeam(formData);
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      if (onSubmit) {
        onSubmit(savedTeam);
      } else {
        navigate("/teams");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save team";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/teams");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{team ? "Edit Team" : "Create New Team"}</CardTitle>
        <CardDescription>
          {team ? "Update team information" : "Add a new team to your organization"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select 
                value={formData.ageGroup} 
                onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as CategoryType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter team description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {team ? "Update Team" : "Create Team"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
