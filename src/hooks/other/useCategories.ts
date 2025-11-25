import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type CategoryData = Tables<"categories">;

export const useCategories = () => {
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery<CategoryData[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      return (data || []) as CategoryData[];
    },
  });

  return {
    categories: categories || [],
    isLoading,
    error,
    refetch,
  };
};

