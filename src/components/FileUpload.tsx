
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  className?: string;
}

const FileUpload = ({ onUpload, currentImage, className }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
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
    
    setIsUploading(true);
    
    try {
      // In a real app, we would upload the file to a storage service
      // For now, we'll create a local URL for demo purposes
      const imageUrl = URL.createObjectURL(file);
      
      // Simulate a delay for the upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpload(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-32 h-32 relative mb-3 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border">
        {currentImage ? (
          <img 
            src={currentImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-12 w-12 text-gray-400" />
        )}
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="profileImage">
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
                  Uploading...
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
  );
};

export default FileUpload;
