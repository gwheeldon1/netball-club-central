import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: string;
}

/**
 * Hook for optimized image loading with lazy loading and format conversion
 */
export function useOptimizedImage(
  src: string,
  options: ImageOptimizationOptions = {}
) {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
    lazy = true,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNlZWUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkZGQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+'
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string>(placeholder);
  const imgRef = useRef<HTMLImageElement>();
  const observerRef = useRef<IntersectionObserver>();

  const optimizeImage = useCallback(async (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(imageSrc); // Fallback to original
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          
          const optimizedDataUrl = canvas.toDataURL(
            format === 'webp' ? 'image/webp' : `image/${format}`,
            quality
          );
          
          resolve(optimizedDataUrl);
        } catch (err) {
          resolve(imageSrc); // Fallback to original
        }
      };
      
      img.onerror = () => resolve(imageSrc); // Fallback to original
      img.src = imageSrc;
    });
  }, [quality, maxWidth, maxHeight, format]);

  const loadImage = useCallback(async () => {
    if (!src) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const optimized = await optimizeImage(src);
      setOptimizedSrc(optimized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image');
      setOptimizedSrc(src); // Fallback to original
    } finally {
      setIsLoading(false);
    }
  }, [src, optimizeImage]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy) {
      loadImage();
      return;
    }

    if (imgRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            loadImage();
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(imgRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage();
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, loadImage]);

  return {
    src: optimizedSrc,
    isLoading,
    error,
    ref: imgRef,
  };
}

/**
 * Component for optimized image rendering
 */
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  optimization?: ImageOptimizationOptions;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  optimization = {},
  fallbackSrc,
  className,
  ...props
}: OptimizedImageProps) {
  const { src: optimizedSrc, isLoading, error, ref } = useOptimizedImage(src, optimization);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setHasError(true);
    }
  };

  const finalSrc = hasError && fallbackSrc ? fallbackSrc : optimizedSrc;

  return (
    <img
      ref={ref}
      src={finalSrc}
      alt={alt}
      className={className}
      onError={handleError}
      style={{
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
      {...props}
    />
  );
}

/**
 * Hook for preloading multiple images
 */
export function useImagePreloader(urls: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    setLoadedCount(0);
    setIsComplete(false);

    const promises = urls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          setLoadedCount(count => count + 1);
          resolve(void 0);
        };
        img.src = url;
      });
    });

    Promise.all(promises).then(() => {
      setIsComplete(true);
    });
  }, [urls]);

  return {
    loadedCount,
    totalCount: urls.length,
    isComplete,
    progress: urls.length > 0 ? loadedCount / urls.length : 1,
  };
}