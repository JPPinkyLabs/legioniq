import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyUsageStatus {
  can_make_request: boolean;
  current_count: number;
  max_images: number;
  reset_at: string;
  is_unlimited: boolean;
}

interface DailyUsageResponse {
  success: boolean;
  data?: DailyUsageStatus;
  error?: string;
}

export const useDailyUsage = () => {
  const {
    data: dailyUsage,
    isLoading,
    error,
  } = useQuery<DailyUsageStatus>({
    queryKey: ["dailyUsage"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke<DailyUsageResponse>(
        "get-daily-usage",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;
      if (!data?.success || !data?.data) {
        throw new Error(data?.error || "No data returned from function");
      }

      return data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider stale for revalidation
  });

  const isUnlimited = dailyUsage?.is_unlimited ?? false;

  return {
    canMakeRequest: dailyUsage?.can_make_request ?? true,
    currentImages: dailyUsage?.current_count ?? 0,
    maxImages: dailyUsage?.max_images ?? 0,
    resetAt: dailyUsage?.reset_at ? new Date(dailyUsage.reset_at) : null,
    isUnlimited,
    isLoading,
    error,
  };
};
