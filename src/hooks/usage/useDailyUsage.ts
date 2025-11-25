import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyUsageStatus {
  can_make_request: boolean;
  current_count: number;
  max_images: number;
  reset_at: string;
}

export const useDailyUsage = () => {
  const {
    data: dailyUsage,
    isLoading,
    error,
  } = useQuery<DailyUsageStatus>({
    queryKey: ["dailyUsage"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await (supabase.rpc as any)("get_daily_usage_status", {
        p_user_id: user.id,
        p_max_images: 15,
      });

      if (error) throw error;
      if (!data) throw new Error("No data returned from function");

      return data as DailyUsageStatus;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider stale for revalidation
  });

  return {
    canMakeRequest: dailyUsage?.can_make_request ?? true,
    currentImages: dailyUsage?.current_count ?? 0,
    maxImages: dailyUsage?.max_images ?? 15,
    resetAt: dailyUsage?.reset_at ? new Date(dailyUsage.reset_at) : null,
    isLoading,
    error,
  };
};

