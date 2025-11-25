import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type CategoryAdvice = Tables<"category_advices">;

interface UseCategoryAdvicesProps {
  categoryId: string | undefined;
  enabled?: boolean;
}

export const useCategoryAdvices = ({
  categoryId,
  enabled = true,
}: UseCategoryAdvicesProps) => {
  const {
    data: advices,
    isLoading,
    error,
    refetch,
  } = useQuery<CategoryAdvice[]>({
    queryKey: ["categoryAdvices", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }

      const { data, error } = await supabase
        .from("category_advices")
        .select("*")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: true });

      if (error) throw error;

      return (data || []) as CategoryAdvice[];
    },
    enabled: enabled && !!categoryId,
  });

  return {
    advices: advices || [],
    isLoading,
    error,
    refetch,
  };
};

