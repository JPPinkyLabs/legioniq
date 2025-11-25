import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../auth/useAuth";
import type { QuestionType } from "./usePreferenceQuestions";

export interface PreferenceAnswer {
  question_key: string;
  question_type: QuestionType;
  answer_value?: string;
  answer_values?: string[];
  answer_number?: number;
}

export const useSaveAllPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: PreferenceAnswer[]): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      if (answers.length === 0) {
        return;
      }

      // Prepare all preference data
      const preferencesData = answers.map((answer) => {
        const { question_key, question_type, answer_value, answer_values, answer_number } = answer;

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

        return preferenceData;
      });

      // Use upsert to insert or update all preferences
      const { error } = await supabase
        .from("user_preferences")
        .upsert(preferencesData, {
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

