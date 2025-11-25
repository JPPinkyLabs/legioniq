import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type CategoryScreenshot = Tables<"categories_screenshots">;

interface UseCategoryScreenshotsProps {
  categoryId: string | undefined;
  enabled?: boolean;
}

export const useCategoryScreenshots = ({
  categoryId,
  enabled = true,
}: UseCategoryScreenshotsProps) => {
  const {
    data: screenshots,
    isLoading,
    error,
    refetch,
  } = useQuery<CategoryScreenshot[]>({
    queryKey: ["categoryScreenshots", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      const { data, error } = await supabase
        .from("categories_screenshots")
        .select("*")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return (data || []) as CategoryScreenshot[];
    },
    enabled: enabled && !!categoryId,
  });

  return {
    screenshots: screenshots || [],
    isLoading,
    error,
    refetch,
  };
};

