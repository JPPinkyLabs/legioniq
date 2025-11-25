import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PreferenceQuestion } from "@/hooks/onboarding/usePreferenceQuestions";

interface TextQuestionProps {
  question: PreferenceQuestion;
  value?: string;
  onAnswer: (value: string) => void;
}

export function TextQuestion({
  question,
  value,
  onAnswer,
}: TextQuestionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={question.question_key} className="text-base font-semibold">
          {question.question_text}
        </Label>
        {question.help_text && (
          <p className="text-sm text-muted-foreground mt-2">{question.help_text}</p>
        )}
      </div>

      <Textarea
        id={question.question_key}
        value={value || ""}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder={question.is_required ? "Please enter your answer..." : "Optional..."}
        className="min-h-[100px]"
      />
    </div>
  );
}

