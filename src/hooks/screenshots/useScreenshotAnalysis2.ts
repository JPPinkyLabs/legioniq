import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOCR } from "../other/useOCR";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  requestId: string;
  aiResponse: string;
  ocrText: string;
}

interface DailyLimitError extends Error {
  error: "Daily limit exceeded";
  message: string;
  remainingImages: number;
}

export const useScreenshotAnalysis2 = () => {
  const [loading, setLoading] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { extractText, isLoading: ocrLoading } = useOCR();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const analyzeScreenshot = async (
    categoryId: string,
    adviceId: string,
    base64Images: string | string[]
  ) => {
    if (!adviceId) {
      throw new Error("Advice ID is required");
    }
    // Reset previous results and set loading immediately
    setAiResponse(null);
    setCurrentRequestId(null);
    setError(null);
    setLoading(true);
    
    const imagesArray = Array.isArray(base64Images) ? base64Images : [base64Images];

    try {
      // Process OCR for all images in parallel
      console.log(`[OCR] Starting OCR processing for ${imagesArray.length} image(s)`);
      
      let hasOcrErrors = false;
      const ocrPromises = imagesArray.map(async (image, index) => {
        try {
          const extractedOcrText = await extractText(image);
          
          if (!extractedOcrText || extractedOcrText.trim().length === 0) {
            console.log(`[OCR] Image ${index + 1}/${imagesArray.length}: No text extracted`);
            return { text: '', error: null };
          } else {
            console.log(`[OCR] Image ${index + 1}/${imagesArray.length}: Extracted ${extractedOcrText.length} characters`);
            return { text: extractedOcrText, error: null };
          }
        } catch (ocrError: unknown) {
          const errorMessage = ocrError instanceof Error ? ocrError.message : 'OCR processing failed';
          console.error(`[OCR] Image ${index + 1}/${imagesArray.length}: Error -`, errorMessage);
          hasOcrErrors = true;
          return { text: '', error: errorMessage };
        }
      });

      const ocrResults = await Promise.all(ocrPromises);
      console.log(`[OCR] Processing complete for ${imagesArray.length} image(s)`);

      const ocrTexts = ocrResults.map(r => r.text);
      const ocrErrors = ocrResults.filter(r => r.error).map(r => r.error);
      
      if (ocrErrors.length === imagesArray.length) {
        const errorMessage = ocrErrors[0] || 'Failed to process OCR for all images';
        throw new Error(`OCR Error: ${errorMessage}`);
      }
      
      if (hasOcrErrors && ocrErrors.length > 0) {
        console.warn(`[OCR] Partial failure: ${ocrErrors.length}/${imagesArray.length} images failed`);
        toast.warning("Partial OCR failure", {
          description: `Failed to extract text from ${ocrErrors.length} image(s). Analysis will proceed with available text.`,
        });
      }

      // Check if any text was extracted
      const hasAnyText = ocrTexts.some(text => text.trim().length > 0);
      if (!hasAnyText && !hasOcrErrors) {
        toast.warning("No text detected", {
          description: "No readable text was found in the images. Analysis will proceed without OCR text.",
        });
      }
      
      // Get session for edge function call
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      // Call edge function to process screenshot
      const { data, error: functionError } = await supabase.functions.invoke("process-screenshot", {
        body: {
          category_id: categoryId,
          advice_id: adviceId,
          imageBase64: imagesArray,
          ocrText: ocrTexts,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to process screenshot");
      }

      if (!data.success) {
        // Check if it's a daily limit error (edge function returns detailed error object)
        if (data.error === "Daily limit exceeded") {
          const dailyLimitError = {
            error: data.error,
            message: data.message || data.error,
            retryAfter: data.retryAfter,
            currentCount: data.currentCount,
            maxImages: data.maxImages,
            remainingImages: data.remainingImages,
          };
          throw dailyLimitError;
        }
        throw new Error(data.error || "Failed to process screenshot");
      }

      setCurrentRequestId(data.requestId);
      setAiResponse(data.aiResponse);
      setOcrText(data.ocrText);
      setError(null);

      await queryClient.invalidateQueries({ queryKey: ["dailyUsage"] });
      
      // Silently refetch recent chats without showing loading skeleton
      queryClient.refetchQueries({ 
        queryKey: ["requests"],
        type: "active",
      }).catch(() => {
        // Silently handle errors - don't show loading if refetch fails
      });

      return { success: true, data };
    } catch (error: unknown) {
      // Check if it's an approval pending error
      const errorMessage = error instanceof Error ? error.message : "Failed to process screenshot";
      
      if (errorMessage.includes("pending approval") || errorMessage.includes("Account pending approval")) {
        await signOut();
        navigate("/auth?pending=true");
        toast.error("Account pending approval", {
          description: "Your account is pending approval. Please wait for approval before using this feature.",
        });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Check if it's a daily limit error (from edge function response)
      if (
        (error && typeof error === "object" && "error" in error && error.error === "Daily limit exceeded") ||
        errorMessage.includes("Daily limit") ||
        errorMessage.includes("daily limit")
      ) {
        await queryClient.invalidateQueries({ queryKey: ["dailyUsage"] });
        const limitMessage = 
          (error && typeof error === "object" && "message" in error && typeof error.message === "string")
            ? error.message
            : errorMessage;
        setError(limitMessage);
        toast.error("Daily limit exceeded", {
          description: limitMessage,
          duration: 5000,
        });
        return { success: false, error: limitMessage };
      }

      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setLoading(false);
    setCurrentRequestId(null);
    setAiResponse(null);
    setOcrText(null);
    setError(null);
  };

  return {
    loading: loading || ocrLoading,
    currentRequestId,
    aiResponse,
    ocrText,
    error,
    analyzeScreenshot,
    resetAnalysis,
  };
};

