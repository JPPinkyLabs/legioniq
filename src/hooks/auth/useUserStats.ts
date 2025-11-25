import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserStats {
  totalRequests: number;
  totalImages: number;
  totalLogins: number;
  mostUsedCategory: {
    category: string;
    count: number;
    percentage: number;
  } | null;
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export const useUserStats = () => {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<UserStats>({
    queryKey: ["userStats", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const [requestsResult, imagesResult, loginsResult, categoryResult] = await Promise.all([
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        
        supabase
          .from("requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .not("image_url", "is", null),
        
        supabase
          .from("sessions_log")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        
        supabase
          .from("requests")
          .select("category_id, category:categories!inner(category)")
          .eq("user_id", user.id),
      ]);

      const totalRequests = requestsResult.count || 0;
      const totalImages = imagesResult.count || 0;
      const totalLogins = loginsResult.count || 0;

      const categoryCounts: Record<string, number> = {};
      (categoryResult.data || []).forEach((req: any) => {
        const categoryEnum = req.category?.category || '';
        if (categoryEnum) {
          categoryCounts[categoryEnum] = (categoryCounts[categoryEnum] || 0) + 1;
        }
      });

      const categoryBreakdown = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalRequests > 0 ? (count / totalRequests) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      const mostUsedCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

      return {
        totalRequests,
        totalImages,
        totalLogins,
        mostUsedCategory,
        categoryBreakdown,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};

