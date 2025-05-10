
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
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would submit to an API
      // For now, just simulate a submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
                />
                
                <div className="space-y-4 flex-1">
                  <div>
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
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
                  className="bg-netball-500 hover:bg-netball-600"
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
