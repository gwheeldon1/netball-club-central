
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2, Crop } from "lucide-react";
import { toast } from "sonner";
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
  aspectRatio?: number;
  bucket?: string;
}

const FileUpload = ({ onUpload, currentImage, className, aspectRatio = 1, bucket = 'default' }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  
  // Generate unique ID for this component instance
  const [inputId] = useState(() => `file-upload-${Math.random().toString(36).substring(2)}`);
  
  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image')) {
      toast.error("Please upload an image file");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    
    // Create a URL for the file to preview
    const imagePreviewUrl = URL.createObjectURL(file);
    setImageToCrop(imagePreviewUrl);
    setShowCropDialog(true);
  };
  
  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createCroppedImage = async () => {
    if (!imageToCrop || !croppedAreaPixels) return null;
    
    try {
      const image = new Image();
      image.src = imageToCrop;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Could not create cropped image");
        return null;
      }
      
      // Set canvas dimensions to the cropped size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      
      // Convert canvas to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob conversion failed"));
            return;
          }
          
          resolve(blob);
        }, 'image/jpeg', 0.95); // JPEG at 95% quality
      });
    } catch (error) {
      logger.error("Error creating cropped image:", error);
      return null;
    }
  };
  
  const handleCropConfirm = async () => {
    try {
      setIsUploading(true);
      const croppedImageBlob = await createCroppedImage();
      
      if (croppedImageBlob) {
        // Generate a unique filename
        const fileExtension = 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, croppedImageBlob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (error) {
          logger.error('Upload error:', error);
          toast.error('Failed to upload image');
          return;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        // Clean up the temporary URL
        if (imageToCrop) {
          URL.revokeObjectURL(imageToCrop);
        }
        
        onUpload(publicUrl);
        setShowCropDialog(false);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      logger.error("Error confirming crop:", error);
      toast.error("Failed to process image");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleCancelCrop = () => {
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setShowCropDialog(false);
    setImageToCrop(null);
  };
  
  return (
    <>
      <div className={`flex flex-col items-center ${className}`}>
        <div className="w-32 h-32 relative mb-3 bg-muted rounded-full overflow-hidden flex items-center justify-center border border-border">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex flex-col gap-2 items-center">
          <input
            type="file"
            id={inputId}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor={inputId}>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {currentImage ? "Change Image" : "Upload Image"}
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </div>
      
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-4 w-4" />
              Crop Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative h-80 w-full mt-4">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              Zoom
            </label>
            <Slider 
              value={[zoom]} 
              min={1} 
              max={3} 
              step={0.1}
              onValueChange={(value) => setZoom(value[0])} 
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancel
            </Button>
            <Button 
              disabled={isUploading} 
              onClick={handleCropConfirm}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUpload;
