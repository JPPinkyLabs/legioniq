import { useState } from "react";
import { toast } from "sonner";

const MAX_SCREENSHOTS = 5;

export const useScreenshotUpload = () => {
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const uploadScreenshot = async (file: File): Promise<{ success: boolean; base64?: string; error?: string }> => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file", {
          description: "Please select an image file",
        });
        return { success: false, error: "Invalid file type" };
      }

      // OCR API maximum file size is 1024KB
      const MAX_FILE_SIZE = 1024 * 1024; // 1024KB in bytes
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large", {
          description: "Please select an image under 1MB (1024KB).",
        });
        return { success: false, error: "File too large" };
      }

      setLoading(true);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });

      // Use functional update to check limit and add image atomically
      setScreenshots((prev) => {
        if (prev.length >= MAX_SCREENSHOTS) {
          toast.error("Maximum images reached", {
            description: `You can only upload up to ${MAX_SCREENSHOTS} images per request`,
          });
          return prev;
        }
        return [...prev, base64];
      });
      
      return { success: true, base64 };
    } catch (error: any) {
      toast.error("Image upload failed", {
        description: error.message || "Failed to process image",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const clearScreenshots = () => {
    setScreenshots([]);
  };

  return {
    screenshots,
    loading,
    uploadScreenshot,
    removeScreenshot,
    clearScreenshots,
    canAddMore: screenshots.length < MAX_SCREENSHOTS,
  };
};

