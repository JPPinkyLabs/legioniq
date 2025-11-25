import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth/useAuth";

export interface UserPreference {
  id: string;
  user_id: string;
  question_key: string;
  answer_value: string | null;
  answer_values: string[] | null;
  answer_number: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useUserPreferences = () => {
  const { user } = useAuth();

  const {
    data: preferences,
    isLoading,
    error,
    refetch,
  } = useQuery<UserPreference[]>({
    queryKey: ["userPreferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      return (data as UserPreference[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    preferences: preferences || [],
    isLoading,
    error,
    refetch,
  };
};

