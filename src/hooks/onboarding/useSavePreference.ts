import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth/useAuth";
import type { QuestionType } from "./usePreferenceQuestions";

export interface SavePreferenceParams {
  question_key: string;
  question_type: QuestionType;
  answer_value?: string;
  answer_values?: string[];
  answer_number?: number;
}

export const useSavePreference = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SavePreferenceParams): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { question_key, question_type, answer_value, answer_values, answer_number } = params;

      // Prepare the data object based on question type
      const preferenceData: {
        user_id: string;
        question_key: string;
        answer_value?: string | null;
        answer_values?: string[] | null;
        answer_number?: number | null;
      } = {
        user_id: user.id,
        question_key,
        answer_value: null,
        answer_values: null,
        answer_number: null,
      };

      // Set the appropriate field based on question type
      if (question_type === 'single_choice' || question_type === 'text') {
        preferenceData.answer_value = answer_value || null;
      } else if (question_type === 'multiple_choice') {
        preferenceData.answer_values = answer_values || null;
      } else if (question_type === 'number' || question_type === 'range') {
        preferenceData.answer_number = answer_number || null;
      }

      // Use upsert to insert or update
      const { error } = await supabase
        .from("user_preferences")
        .upsert(preferenceData, {
          onConflict: "user_id,question_key",
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate user preferences cache
      queryClient.invalidateQueries({ queryKey: ["userPreferences", user?.id] });
    },
  });
};

