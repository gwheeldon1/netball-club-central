
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUpload: (imageUrl: string) => void;
  currentImage?: string | null;
  aspectRatio?: number;
  bucket?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  onUpload,
  currentImage,
  aspectRatio = 1,
  bucket = "avatars",
  accept = "image/*",
  maxSize = 5,
  className = ""
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDetailedErrorMessage = (error: any): string => {
    // Check for common error types and provide helpful messages
    if (error?.message?.includes('new row violates row-level security')) {
      return 'Permission denied. Please make sure you are logged in and try again.';
    }
    
    if (error?.message?.includes('413') || error?.message?.includes('too large')) {
      return `File is too large. Please select an image smaller than ${maxSize}MB.`;
    }
    
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return 'Authentication failed. Please log out and log back in, then try again.';
    }
    
    if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      return 'You don\'t have permission to upload files. Please contact support if this continues.';
    }
    
    if (error?.message?.includes('404')) {
      return 'Upload destination not found. Please try again or contact support.';
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'Upload timed out. Please try again with a smaller file.';
    }
    
    // If we have a specific error message, use it
    if (error?.message && typeof error.message === 'string') {
      return `Upload failed: ${error.message}`;
    }
    
    // Generic fallback
    return 'Failed to upload image. Please try again or contact support if the problem persists.';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Generate unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }
      
      // Create file path with user ID folder
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file:', { bucket, filePath, fileSize: file.size, fileType: file.type });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      onUpload(publicUrl);
      toast.success('Image uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = getDetailedErrorMessage(error);
      toast.error(errorMessage);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      <div className={`relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 transition-colors hover:border-muted-foreground/50 ${
        aspectRatio === 16/9 ? 'aspect-video' : 'aspect-square'
      }`}>
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded"
            />
            {!uploading && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">Click to upload image</p>
            <p className="text-xs">Max {maxSize}MB</p>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
        variant="outline"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {preview ? 'Change Image' : 'Upload Image'}
          </>
        )}
      </Button>
    </div>
  );
}
