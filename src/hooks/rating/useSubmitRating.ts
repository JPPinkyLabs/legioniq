import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubmitRatingParams {
  requestId: string;
  rating: number;
}

export interface SubmitRatingResult {
  success: true;
  data: {
    id: string;
    rating: number;
    [key: string]: unknown;
  };
}

/**
 * Hook for submitting ratings using TanStack Query
 */
export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitRatingParams): Promise<SubmitRatingResult> => {
      const { requestId, rating } = params;

      if (!requestId || typeof requestId !== "string") {
        throw new Error("requestId is required");
      }

      if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new Error("rating must be a number between 1 and 5");
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("submit-rating", {
        body: {
          requestId,
          rating,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to update rating");
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to update rating");
      }

      return {
        success: true,
        data: data.data,
      };
    },
    onSuccess: (data, variables) => {
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
