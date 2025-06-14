
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Team } from "@/types";
import { api } from "@/services/unifiedApi";
import { logger } from "@/utils/logger";

const teamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }),
  ageGroup: z.string().min(1, { message: "Age group is required" }),
  category: z.enum(["Junior", "Senior", "Mixed"], {
    required_error: "Please select a team category",
  }),
  description: z.string().optional(),
  profileImage: z.string().optional(),
  bannerImage: z.string().optional(),
  icon: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamFormProps {
  team?: Team;
  mode: "create" | "edit";
}

const TeamForm = ({ team, mode }: TeamFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with existing team data or defaults
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: team ? {
      name: team.name,
      ageGroup: team.ageGroup,
      category: team.category,
      description: team.description || "",
      profileImage: team.profileImage || "",
      bannerImage: team.bannerImage || "",
      icon: team.icon || "",
    } : {
      name: "",
      ageGroup: "",
      category: "Junior" as const,
      description: "",
      profileImage: "",
      bannerImage: "",
      icon: "",
    },
  });
  
  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // Ensure we pass all required properties with their proper types
        const newTeam = await api.createTeam({
          name: data.name,          // Required field
          ageGroup: data.ageGroup,  // Required field
          category: data.category,  // Required field
          description: data.description,
          profileImage: data.profileImage,
          bannerImage: data.bannerImage,
          icon: data.icon,
        });
        toast.success("Team created successfully");
        navigate(`/teams/${newTeam.id}`);
      } else if (team) {
        // Update not yet implemented in Supabase API
        toast.info("Team update functionality coming soon");
        navigate(`/teams/${team.id}`);
      }
    } catch (error) {
      logger.error("Error saving team:", error);
      toast.error("Failed to save team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter team name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ageGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Group</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., U12, U14, Senior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Junior">Junior</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter team description"
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="profileImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bannerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/banner.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Icon URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/icon.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create Team" : "Update Team"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeamForm;
