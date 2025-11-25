import { cn } from "@/lib/utils";
import type { PreferenceQuestion } from "@/hooks/onboarding/usePreferenceQuestions";
import { getOptionIcon } from "../utils/getOptionIcon";

interface SingleChoiceQuestionProps {
  question: PreferenceQuestion;
  value?: string;
  onAnswer: (value: string) => void;
}

export function SingleChoiceQuestion({
  question,
  value,
  onAnswer,
}: SingleChoiceQuestionProps) {
  const options = question.options?.options || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-2">{question.question_text}</h3>
        {question.help_text && (
          <p className="text-sm text-muted-foreground mb-4">{question.help_text}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = getOptionIcon(option.value);
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswer(option.value)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-accent-foreground/20 hover:bg-accent/50"
              )}
            >
              <Icon className={cn(
                "h-3.5 w-3.5 transition-colors",
                isSelected ? "text-primary" : "text-muted-foreground"
              )} />
              
              <span className={cn(
                "text-xs font-medium whitespace-nowrap",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

