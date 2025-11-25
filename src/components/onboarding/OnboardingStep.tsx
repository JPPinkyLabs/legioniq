import { useState, useEffect } from "react";
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { TextQuestion } from "./questions/TextQuestion";
import type { PreferenceQuestion } from "@/hooks/onboarding/usePreferenceQuestions";

interface OnboardingStepProps {
  question: PreferenceQuestion;
  initialValue?: string | string[];
  onAnswerChange: (questionKey: string, answer: string | string[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function OnboardingStep({
  question,
  initialValue,
  onAnswerChange,
  onValidationChange,
}: OnboardingStepProps) {
  const [answer, setAnswer] = useState<string | string[] | undefined>(initialValue);

  useEffect(() => {
    setAnswer(initialValue);
  }, [initialValue, question.question_key]);

  useEffect(() => {
    const isValid = () => {
      if (!question.is_required) return true;
      
      if (question.question_type === 'multiple_choice') {
        return Array.isArray(answer) && answer.length > 0;
      }
      
      if (question.question_type === 'text') {
        return typeof answer === 'string' && answer.trim().length > 0;
      }
      
      return answer !== undefined && answer !== null && answer !== '';
    };

    onValidationChange(isValid());
  }, [answer, question.is_required, question.question_type, onValidationChange]);

  const handleAnswerChange = (newAnswer: string | string[]) => {
    setAnswer(newAnswer);
    onAnswerChange(question.question_key, newAnswer);
  };

  return (
    <div>
      {question.question_type === 'single_choice' && (
        <SingleChoiceQuestion
          question={question}
          value={answer as string}
          onAnswer={handleAnswerChange}
        />
      )}

      {question.question_type === 'multiple_choice' && (
        <MultipleChoiceQuestion
          question={question}
          value={answer as string[]}
          onAnswer={handleAnswerChange}
        />
      )}

      {question.question_type === 'text' && (
        <TextQuestion
          question={question}
          value={answer as string}
          onAnswer={handleAnswerChange}
        />
      )}
    </div>
  );
}

