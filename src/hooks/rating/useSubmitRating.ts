import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

export interface SubmitRatingParams {
  requestId: string;
  rating: number;
}

export interface RatingData {
  id: string;
  rating: number;
  [key: string]: unknown;
}

/**
 * Hook for submitting ratings using TanStack Query
 */
export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitRatingParams): Promise<RatingData> => {
      const { requestId, rating } = params;

      if (!requestId || typeof requestId !== "string") {
        throw new Error("requestId is required");
      }

      if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new Error("rating must be a number between 1 and 5");
      }

      const response = await api.invoke<RatingData>("submit-rating", {
        requestId,
        rating,
      });

      if (!response.success || !response.data) {
        throw new ApiError(
          response.message || response.error || "Failed to submit rating",
          response
        );
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate request query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["request", variables.requestId] });
      // Also invalidate requests list if needed
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (error: Error) => {
      // Error handling is done in the component using this hook
      console.error("[useSubmitRating] Error:", error);
    },
  });
};
