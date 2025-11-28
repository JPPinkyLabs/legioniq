import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useOCR } from "./useOCR";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { api, ApiError } from "@/lib/api";

interface AnalysisData {
  requestId: string;
  aiResponse: string;
  ocrText: string;
}

export const useScreenshotAnalysis = () => {
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

      // Call edge function to process screenshot
      const response = await api.invoke<AnalysisData>("process-screenshot", {
        category_id: categoryId,
        advice_id: adviceId,
        imageBase64: imagesArray,
        ocrText: ocrTexts,
      });

      if (!response.success) {
        // Check if it's a daily limit error
        if (response.error === "Daily limit exceeded") {
          throw new ApiError(
            response.message || response.error,
            response,
            "DAILY_LIMIT_EXCEEDED"
          );
        }
        throw new ApiError(
          response.message || response.error || "Failed to process screenshot",
          response
        );
      }

      setCurrentRequestId(response.data?.requestId || null);
      setAiResponse(response.data?.aiResponse || null);
      setOcrText(response.data?.ocrText || null);
      setError(null);

      await queryClient.invalidateQueries({ queryKey: ["dailyUsage"] });
      
      // Silently refetch recent chats without showing loading skeleton
      queryClient.refetchQueries({ 
        queryKey: ["requests"],
        type: "active",
      }).catch(() => {
        // Silently handle errors - don't show loading if refetch fails
      });

      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = error instanceof ApiError 
        ? error.getUserMessage() 
        : error instanceof Error 
          ? error.message 
          : "Failed to process screenshot";
      
      // Check if it's an approval pending error
      if (errorMessage.includes("pending approval") || errorMessage.includes("Account pending approval")) {
        await signOut();
        navigate("/auth?pending=true");
        toast.error("Account pending approval", {
          description: "Your account is pending approval. Please wait for approval before using this feature.",
        });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Check if it's a daily limit error
      const isDailyLimitError = 
        (error instanceof ApiError && error.code === "DAILY_LIMIT_EXCEEDED") ||
        errorMessage.includes("Daily limit") ||
        errorMessage.includes("daily limit");

      if (isDailyLimitError) {
        await queryClient.invalidateQueries({ queryKey: ["dailyUsage"] });
        setError(errorMessage);
        toast.error("Daily limit exceeded", {
          description: errorMessage,
          duration: 5000,
        });
        return { success: false, error: errorMessage };
      }

      setError(errorMessage);
      if (error instanceof ApiError) {
        toast.error(error.getTitle(), {
          description: error.getUserMessage(),
        });
      } else {
        toast.error("Screenshot analysis failed", {
          description: errorMessage,
        });
      }
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
