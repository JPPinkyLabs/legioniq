import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AdminRequest = Tables<"requests"> & {
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
  user: {
    id: string;
    name: string | null;
  } | null;
};

export const useAdminRequest = (id: string | undefined) => {
  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-request", id],
    queryFn: async () => {
      if (!id) throw new Error("Request ID is required");

      const { data: requestData, error } = await supabase
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
        .single();

      if (error) throw error;
      if (!requestData) throw new Error("Request not found");

      // Fetch user profile separately
      let user = null;
      if (requestData.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", requestData.user_id)
          .maybeSingle();
        
        if (profileData) {
          user = { id: profileData.id, name: profileData.name };
        }
      }

      return {
        ...requestData,
        user,
      } as AdminRequest;
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

