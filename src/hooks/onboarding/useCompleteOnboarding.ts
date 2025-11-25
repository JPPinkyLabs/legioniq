import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth/useAuth";

export const useCompleteOnboarding = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Only invalidate onboarding status - no need to invalidate userProfile
      // since we only updated has_completed_onboarding, not avatar or other profile data
      queryClient.invalidateQueries({ queryKey: ["onboardingStatus", user?.id] });
    },
  });
};

