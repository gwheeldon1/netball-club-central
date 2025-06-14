
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
import { supabaseChildrenApi } from "@/services/supabaseApi";
import { Child } from "@/types";

const NewChildPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    medicalInfo: "",
    notes: "",
    profileImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, profileImage: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dateOfBirth) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!currentUser) {
      toast.error("You must be logged in to register a child");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate age group based on date of birth
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      if (
        today.getMonth() < dob.getMonth() || 
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      
      // Determine age group
      let ageGroup: string;
      if (age <= 8) ageGroup = 'U8';
      else if (age <= 10) ageGroup = 'U10';
      else if (age <= 12) ageGroup = 'U12';
      else if (age <= 14) ageGroup = 'U14';
      else if (age <= 16) ageGroup = 'U16';
      else ageGroup = 'U18';
      
      // Create the new child record
      const newChild: Omit<Child, 'id'> = {
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        medicalInfo: formData.medicalInfo,
        notes: formData.notes,
        profileImage: formData.profileImage,
        parentId: currentUser.id,
        status: 'pending',
        ageGroup,
      };
      
      const createdChild = await supabaseChildrenApi.create(newChild);
      
      toast.success("Child registration submitted successfully!");
      navigate("/children");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was a problem submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/children")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Children
          </Button>
          
          <h1 className="text-3xl font-bold">Register New Child</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Child Registration Form</CardTitle>
            <CardDescription>
              Please provide your child's details to register them with the netball club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <FileUpload 
                  onUpload={handleImageUpload}
                  currentImage={formData.profileImage}
                  className="mb-4"
                  aspectRatio={1}
                />
                
                <div className="space-y-4 flex-1">
                  <div>
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                    <Input 
                      id="dateOfBirth" 
                      name="dateOfBirth" 
                      type="date" 
                      value={formData.dateOfBirth} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medicalInfo">Medical Information</Label>
                  <Textarea 
                    id="medicalInfo" 
                    name="medicalInfo" 
                    placeholder="Please provide any relevant medical information (allergies, conditions, medications, etc.)"
                    value={formData.medicalInfo} 
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Any additional information that might be useful for coaches and managers"
                    value={formData.notes} 
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="pt-4 space-x-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/children")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewChildPage;
