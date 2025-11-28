import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export const useResetPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await api.invoke("reset-preferences");

      if (!response.success) {
        throw new ApiError(
          response.message || response.error || "Failed to reset preferences",
          response
        );
      }
    },
    onSuccess: async () => {
      // Invalidate user preferences query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      
      // Invalidate onboarding status to trigger overlay display
      await queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
      
      toast.success("Preferences reset", {
        description: "Your preferences have been successfully reset. Please complete the onboarding again.",
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.getTitle(), {
          description: error.getUserMessage(),
        });
      } else {
        const message = error instanceof Error ? error.message : "An error occurred while resetting your preferences.";
        toast.error("Reset preferences failed", {
          description: message,
        });
      }
    },
  });
};
