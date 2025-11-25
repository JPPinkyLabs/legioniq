import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'range';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface PreferenceQuestion {
  id: string;
  question_key: string;
  question_text: string;
  question_type: QuestionType;
  options: { options: QuestionOption[] } | null;
  is_required: boolean;
  display_order: number;
  help_text: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const usePreferenceQuestions = () => {
  const {
    data: questions,
    isLoading,
    error,
    refetch,
  } = useQuery<PreferenceQuestion[]>({
    queryKey: ["preferenceQuestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preference_questions")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data as unknown as PreferenceQuestion[]) || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    questions: questions || [],
    isLoading,
    error,
    refetch,
  };
};

