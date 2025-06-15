
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Save, X, Loader2 } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    toast.success("Image uploaded successfully!");
  };

  const handleSaveImage = async () => {
    if (!uploadedImage) {
      toast.error("No image to save");
      return;
    }

    setIsSaving(true);
    try {
      let updateData: any = {};
      
      if (activeTab === 'banner') {
        updateData.banner_image = uploadedImage;
      } else {
        updateData.profile_image = uploadedImage;
      }

      const { error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', teamId);

      if (error) throw error;

      // Update parent component
      if (activeTab === 'banner') {
        onImagesUpdated(uploadedImage, currentProfileImage);
      } else {
        onImagesUpdated(currentBannerImage, uploadedImage);
      }

      toast.success(`Team ${activeTab} updated successfully!`);
      
      // Reset state
      setUploadedImage(null);
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setUploadedImage(null);
    onClose();
  };

  const currentImage = activeTab === 'banner' ? currentBannerImage : currentProfileImage;
  const previewImage = uploadedImage || currentImage;

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
          {/* Image Upload */}
          <div className="space-y-4">
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

                {uploadedImage && (
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
                      onClick={() => setUploadedImage(null)}
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
