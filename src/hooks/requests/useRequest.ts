import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Request = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    color: string;
  };
  advice: {
    id: string;
    name: string;
    description: string;
  } | null;
};

export const useRequest = (id: string | undefined) => {
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      if (!id) throw new Error("Request ID is required");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          category:categories!inner (
            id,
            label,
            color
          ),
          advice:category_advices!inner (
            id,
            name,
            description
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Request not found");

      return data as Request;
    },
    enabled: !!id,
  });

  return {
    request,
    isLoading,
    error,
    refetch,
  };
};

