import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get signed URLs for multiple private Supabase Storage images
 * @param imageUrls - Array of public URLs of images from the database
 * @returns Object with signedUrls array and isLoading state
 */
export const useSignedImageUrls = (imageUrls: string[] | null | undefined) => {
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!!imageUrls && imageUrls.length > 0);
  const previousImageUrlsRef = useRef<string | null>(null);

  useEffect(() => {
    // Create a stable reference for comparison to avoid unnecessary re-renders
    const imageUrlsKey = imageUrls ? JSON.stringify(imageUrls) : null;
    
    // Skip if imageUrls haven't actually changed
    if (imageUrlsKey === previousImageUrlsRef.current) {
      return;
    }
    
    previousImageUrlsRef.current = imageUrlsKey;

    const getSignedUrls = async () => {
      if (!imageUrls || imageUrls.length === 0) {
        setSignedUrls([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const signedUrlPromises = imageUrls.map(async (imageUrl) => {
          const urlParts = imageUrl.split('/screenshots/');
          if (urlParts.length === 2) {
            const filePath = urlParts[1];
            const { data, error } = await supabase.storage
              .from('screenshots')
              .createSignedUrl(filePath, 3600); // 1 hour expiry

            if (error) {
              // Silently handle "Object not found" errors as they're expected for deleted/missing images
              if (error.message?.includes('Object not found') || error.message?.includes('404')) {
                return null; // Return null for missing images
              }
              // Only log unexpected errors
              console.error('Error creating signed URL:', error);
              return null;
            } else {
              return data.signedUrl;
            }
          } else {
            return imageUrl;
          }
        });

        const urls = await Promise.all(signedUrlPromises);
        // Filter out null values (missing images)
        setSignedUrls(urls.filter((url): url is string => url !== null));
      } catch (error) {
        console.error('Error processing signed URLs:', error);
        // Fallback to original URLs
        setSignedUrls(imageUrls);
      }

      setIsLoading(false);
    };

    getSignedUrls();
  }, [imageUrls]);

  return { signedUrls, isLoading };
};

