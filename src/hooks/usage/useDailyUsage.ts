import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";

export interface DailyUsageStatus {
  can_make_request: boolean;
  current_count: number;
  max_images: number;
  reset_at: string;
  is_unlimited: boolean;
}

export const useDailyUsage = () => {
  const {
    data: dailyUsage,
    isLoading,
    error,
  } = useQuery<DailyUsageStatus>({
    queryKey: ["dailyUsage"],
    queryFn: async () => {
      const response = await api.invoke<DailyUsageStatus>("get-daily-usage");

      if (!response.success || !response.data) {
        throw new ApiError(
          response.message || response.error || "Failed to get daily usage",
          response
        );
      }

      return response.data;
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
