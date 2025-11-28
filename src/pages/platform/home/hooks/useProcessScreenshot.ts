import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

export interface ProcessScreenshotParams {
  category: string;
  imageBase64: string | string[];
  ocrText?: string | string[];
}

export interface ProcessScreenshotData {
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
    mutationFn: async (params: ProcessScreenshotParams): Promise<ProcessScreenshotData> => {
      const response = await api.invoke<ProcessScreenshotData>("process-screenshot", {
        category: params.category,
        imageBase64: params.imageBase64,
        ocrText: params.ocrText,
      });

      if (!response.success || !response.data) {
        throw new ApiError(
          response.message || response.error || "Failed to process screenshot",
          response
        );
      }

      return response.data;
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
