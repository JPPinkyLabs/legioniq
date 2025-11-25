import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useOnboardingStatus = () => {
  const { user } = useAuth();

  const {
    data: hasCompletedOnboarding,
    isLoading,
    error,
    refetch,
  } = useQuery<boolean>({
    queryKey: ["onboardingStatus", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return false;
        }
        throw error;
      }

      return (data as { has_completed_onboarding: boolean | null } | null)?.has_completed_onboarding ?? false;
    },
    enabled: !!user?.id,
    // Cache for 5 minutes - onboarding status rarely changes and we invalidate manually when needed
    staleTime: 1000 * 60 * 5,
    // Disable automatic refetches - we only want manual invalidation
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return {
    hasCompletedOnboarding: hasCompletedOnboarding ?? false,
    isLoading,
    error,
    refetch,
  };
};

