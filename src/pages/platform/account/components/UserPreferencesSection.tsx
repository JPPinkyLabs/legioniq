import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/hooks/onboarding/useUserPreferences";
import { usePreferenceQuestions } from "@/hooks/onboarding/usePreferenceQuestions";
import { Settings, RotateCcw } from "lucide-react";
import { UserPreferencesSkeleton } from "@/components/skeletons/UserPreferencesSkeleton";

interface UserPreferencesSectionProps {
  onResetClick: () => void;
  showResetButton?: boolean;
}

export const UserPreferencesSection = ({ onResetClick, showResetButton = true }: UserPreferencesSectionProps) => {
  const { preferences, isLoading: isLoadingPreferences } = useUserPreferences();
  const { questions, isLoading: isLoadingQuestions } = usePreferenceQuestions();

  const isLoading = isLoadingPreferences || isLoadingQuestions;

  if (isLoading) {
    return <UserPreferencesSkeleton />;
  }

  // Create a map of question_key to question for easy lookup
  const questionsMap = new Map(
    questions.map((q) => [q.question_key, q])
  );

  // Filter preferences that have answers and match existing questions
  const preferencesWithAnswers = preferences
    .filter((pref) => {
      const question = questionsMap.get(pref.question_key);
      if (!question) return false;
      
      if (question.question_type === 'multiple_choice') {
        return pref.answer_values && pref.answer_values.length > 0;
      }
      return pref.answer_value && pref.answer_value.trim() !== '';
    })
    .map((pref) => {
      const question = questionsMap.get(pref.question_key);
      return {
        preference: pref,
        question: question!,
      };
    })
    .sort((a, b) => a.question.display_order - b.question.display_order);

  const getAnswerDisplay = (pref: typeof preferencesWithAnswers[0]) => {
    const { preference, question } = pref;

    if (question.question_type === 'multiple_choice' && preference.answer_values) {
      // Get labels for selected values
      const selectedOptions = preference.answer_values
        .map((value) => {
          const option = question.options?.options?.find((opt) => opt.value === value);
          return option?.label || value;
        })
        .filter(Boolean);
      
      return selectedOptions.join(", ");
    }

    if (preference.answer_value) {
      // For single choice, find the label
      if (question.options?.options) {
        const option = question.options.options.find(
          (opt) => opt.value === preference.answer_value
        );
        return option?.label || preference.answer_value;
      }
      return preference.answer_value;
    }

    return "—";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Your onboarding preferences and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preferencesWithAnswers.length > 0 ? (
            <>
              <div className="space-y-4">
                {preferencesWithAnswers.map(({ preference, question }) => (
                  <div key={preference.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                    <h3 className="text-sm font-semibold mb-1">{question.question_text}</h3>
                    <p className="text-sm text-muted-foreground">{getAnswerDisplay({ preference, question })}</p>
                  </div>
                ))}
              </div>
              
              {showResetButton && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={onResetClick}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Preferences
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-center">
                No preferences configured yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

