import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export const useUserProfile = () => {
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery<Profile | null>({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    // Disable automatic refetches - we only want manual invalidation
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
  };
};

