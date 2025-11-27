import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProcessScreenshotParams {
  category: string;
  imageBase64: string | string[];
  ocrText?: string | string[];
}

export interface ProcessScreenshotResult {
  success: true;
  requestId: string;
  ocrText: string;
  aiResponse: string;
  cached?: boolean;
}

/**
 * Hook for processing screenshots using TanStack Query
 */
export const useProcessScreenshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ProcessScreenshotParams): Promise<ProcessScreenshotResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("process-screenshot", {
        body: {
          category: params.category,
          imageBase64: params.imageBase64,
          ocrText: params.ocrText,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to process screenshot");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to process screenshot");
      }

      return {
        success: true,
        requestId: data.requestId,
        ocrText: data.ocrText,
        aiResponse: data.aiResponse,
        cached: data.cached,
      };
    },
    onSuccess: () => {
      // Invalidate daily usage query to refresh the count
      queryClient.invalidateQueries({ queryKey: ["dailyUsage"] });
    },
    onError: (error: Error) => {
      // Error handling is done in the component using this hook
      console.error("[useProcessScreenshot] Error:", error);
    },
  });
};
