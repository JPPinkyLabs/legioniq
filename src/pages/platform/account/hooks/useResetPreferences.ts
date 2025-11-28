import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResetPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("reset-preferences", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to reset preferences");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to reset preferences");
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
    onError: (error: Error) => {
      toast.error("Failed to reset preferences", {
        description: error.message || "An error occurred while resetting your preferences.",
      });
    },
  });
};

