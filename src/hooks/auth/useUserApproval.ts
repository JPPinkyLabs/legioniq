import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserApproval = () => {
  const { user } = useAuth();

  const {
    data: isApproved,
    isLoading,
    error,
    refetch,
  } = useQuery<boolean>({
    queryKey: ["userApproval", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return false;
        }
        throw error;
      }

      return data?.is_approved ?? false;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
  });

  return {
    isApproved: isApproved ?? false,
    isLoading,
    error,
    refetch,
  };
};

