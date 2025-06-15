
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Wand2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";

interface TeamImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  currentBannerImage?: string;
  currentProfileImage?: string;
  onImagesUpdated: (bannerImage?: string, profileImage?: string) => void;
}

export const TeamImageManager = ({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName,
  currentBannerImage,
  currentProfileImage,
  onImagesUpdated 
}: TeamImageManagerProps) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'avatar'>('banner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  
  const handleAIGeneration = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for image generation");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-team-image', {
        body: {
          prompt: prompt.trim(),
          type: activeTab,
          teamName
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate image');
      }

      if (response.data?.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        setUploadedImage(null);
        toast.success("Image generated successfully!");
      } else {
        throw new Error('No image returned from generation service');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setGeneratedImage(null);
    toast.success("Image uploaded successfully!");
  };

  const handleSaveImage = async () => {
    const imageToSave = generatedImage || uploadedImage;
    if (!imageToSave) {
      toast.error("No image to save");
      return;
    }

    setIsSaving(true);
    try {
      let updateData: any = {};
      
      if (activeTab === 'banner') {
        updateData.bannerImage = imageToSave;
      } else {
        updateData.profileImage = imageToSave;
      }

      const { error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId);

      if (error) throw error;

      // Update parent component
      if (activeTab === 'banner') {
        onImagesUpdated(imageToSave, currentProfileImage);
      } else {
        onImagesUpdated(currentBannerImage, imageToSave);
      }

      toast.success(`Team ${activeTab} updated successfully!`);
      
      // Reset state
      setGeneratedImage(null);
      setUploadedImage(null);
      setPrompt('');
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setGeneratedImage(null);
    setUploadedImage(null);
    setPrompt('');
    onClose();
  };

  const currentImage = activeTab === 'banner' ? currentBannerImage : currentProfileImage;
  const previewImage = generatedImage || uploadedImage || currentImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Manage Team Images - {teamName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'banner' | 'avatar')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="banner">Banner Image</TabsTrigger>
            <TabsTrigger value="avatar">Team Avatar</TabsTrigger>
          </TabsList>

          <TabsContent value="banner" className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Banner images work best in landscape format (16:9 aspect ratio recommended)
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Avatar images work best as square images (1:1 aspect ratio recommended)
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Management */}
          <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="ai">AI Generate</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onUpload={handleImageUpload}
                      currentImage={uploadedImage}
                      aspectRatio={activeTab === 'banner' ? 16/9 : 1}
                      bucket="team-images"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      AI Generate Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">Describe the image you want</Label>
                      <Textarea
                        id="prompt"
                        placeholder={activeTab === 'banner' 
                          ? "e.g., Dynamic netball action shot with blue and white colors, energetic team spirit"
                          : "e.g., Modern netball logo with a ball and net, blue and white colors, clean design"
                        }
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleAIGeneration}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`relative overflow-hidden rounded-lg border bg-muted ${
                  activeTab === 'banner' ? 'aspect-video' : 'aspect-square'
                }`}>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt={`Team ${activeTab} preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No {activeTab} image
                    </div>
                  )}
                </div>

                {(generatedImage || uploadedImage) && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleSaveImage}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save {activeTab === 'banner' ? 'Banner' : 'Avatar'}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setGeneratedImage(null);
                        setUploadedImage(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
