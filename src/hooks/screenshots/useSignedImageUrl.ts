import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get a signed URL for a private Supabase Storage image
 * @param imageUrl - The public URL of the image from the database
 * @returns Object with signedUrl and isLoading state
 */
export const useSignedImageUrl = (imageUrl: string | null | undefined) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!imageUrl); // Inicia como true se imageUrl existe

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!imageUrl) {
        setSignedUrl(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const urlParts = imageUrl.split('/screenshots/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        const { data, error } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
          console.error('Error creating signed URL:', error);
          setSignedUrl(imageUrl); // Fallback to original URL
        } else {
          setSignedUrl(data.signedUrl);
        }
      } else {
        setSignedUrl(imageUrl);
      }

      setIsLoading(false);
    };

    getSignedUrl();
  }, [imageUrl]);

  return { signedUrl, isLoading };
};

