import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePreferenceQuestions } from "@/hooks/onboarding/usePreferenceQuestions";
import { useSaveAllPreferences } from "@/hooks/onboarding/useSaveAllPreferences";
import { OnboardingStep } from "./OnboardingStep";
import { SendingStep } from "./SendingStep";
import { OnboardingLoader } from "./OnboardingLoader";
import { IntroductionStep } from "./IntroductionStep";
import type { PreferenceAnswer } from "@/hooks/onboarding/useSaveAllPreferences";
import { ChevronLeft, ChevronRight } from "lucide-react";
import legionIQLogo from "@/assets/legionIQ_logo_golden.png";

interface OnboardingOverlayProps {
  onComplete: () => void;
}

type SlideDirection = "forward" | "backward" | null;

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  // -1 = introduction step, 0+ = question steps
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSending, setIsSending] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const { questions, isLoading: isLoadingQuestions } = usePreferenceQuestions();
  const saveAllPreferences = useSaveAllPreferences();
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  // Block body scroll when overlay is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isLoading = isLoadingQuestions;
  const totalSteps = questions.length;
  const isIntroduction = currentStep === -1;
  const currentQuestion = isIntroduction ? null : questions[currentStep];
  const isLastQuestion = currentStep === totalSteps - 1;

  // Get initial value for current question from answers state
  const getInitialValue = useCallback(() => {
    if (!currentQuestion) return undefined;
    return answers[currentQuestion.question_key];
  }, [currentQuestion, answers]);

  const handleAnswerChange = useCallback((questionKey: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: answer,
    }));
  }, []);

  const handleValidationChange = useCallback((valid: boolean) => {
    setIsValid(valid);
  }, []);

  const handleNext = useCallback(async () => {
    setSlideDirection("forward");
    
    if (isIntroduction) {
      // Move from introduction to first question
      setCurrentStep(0);
      setIsValid(false);
      return;
    }

    if (isLastQuestion) {
      // Save all answers before showing sending step
      setIsSending(true);
      
      try {
        const answersToSave: PreferenceAnswer[] = questions
          .filter((q) => answers[q.question_key] !== undefined)
          .map((q) => {
            const answer = answers[q.question_key];
            const preferenceAnswer: PreferenceAnswer = {
              question_key: q.question_key,
              question_type: q.question_type,
            };

            if (q.question_type === 'single_choice' || q.question_type === 'text') {
              preferenceAnswer.answer_value = answer as string;
            } else if (q.question_type === 'multiple_choice') {
              preferenceAnswer.answer_values = answer as string[];
            }

            return preferenceAnswer;
          });

        await saveAllPreferences.mutateAsync(answersToSave);
      } catch (error) {
        console.error("Error saving preferences:", error);
        setIsSending(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
      setIsValid(false);
    }
  }, [isIntroduction, isLastQuestion, questions, answers, saveAllPreferences]);

  const handlePrevious = useCallback(() => {
    setSlideDirection("backward");
    
    if (currentStep === 0) {
      // Go back to introduction
      setCurrentStep(-1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
    setIsSending(false);
    setIsValid(true); // Previous answers are valid
  }, [currentStep]);

  // Handle completion with exit animation
  const handleComplete = useCallback(() => {
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      onComplete();
    }, 300); // Match animation duration
  }, [onComplete]);

  const getTitle = () => {
    if (isSending) return "Completing Onboarding";
    if (isIntroduction) return "";
    if (currentQuestion) {
      return `Question ${currentStep + 1} of ${totalSteps}`;
    }
    return "";
  };

  const getDescription = () => {
    if (isSending) return "Please wait while we save your preferences";
    if (isIntroduction) return "";
    if (currentQuestion) {
      return "Help us personalize your experience";
    }
    return "";
  };

  const showHeader = !isIntroduction && !isLoading && !isSending;
  const showNavigation = !isLoading && !isSending;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col bg-background ${
        isExiting ? "animate-overlay-exit" : ""
      }`}
    >
      {/* Content - Centered vertically and horizontally */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <ScrollArea className="w-full max-h-full">
          <div className="flex items-center justify-center min-h-full px-4 py-8">
            <div 
              key={`step-${currentStep}-${isSending}`}
              className={`w-full max-w-2xl ${
                slideDirection === "forward" ? "animate-slide-in-forward" : 
                slideDirection === "backward" ? "animate-slide-in-backward" : ""
              }`}
            >
              {/* Header - Inside content, above questions */}
              {showHeader && (
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img 
                      src={legionIQLogo} 
                      alt="Legion IQ" 
                      className="h-8 w-8 object-contain"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">{getTitle()}</h2>
                      {getDescription() && (
                        <p className="text-sm text-muted-foreground">{getDescription()}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Step counter */}
                  {currentQuestion && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span className={currentStep + 1 === totalSteps ? "text-primary" : "text-muted-foreground"}>
                        {currentStep + 1}
                      </span>
                      <span className="text-primary">/</span>
                      <span className="text-primary">{totalSteps}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step Content */}
              {isLoading ? (
                <OnboardingLoader />
              ) : isSending ? (
                <SendingStep onComplete={handleComplete} />
              ) : isIntroduction ? (
                <IntroductionStep />
              ) : currentQuestion ? (
                <OnboardingStep
                  question={currentQuestion}
                  initialValue={getInitialValue()}
                  onAnswerChange={handleAnswerChange}
                  onValidationChange={handleValidationChange}
                />
              ) : null}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Navigation */}
      {showNavigation && (
        <div className="border-t bg-background px-4 py-4 flex-shrink-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === -1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isIntroduction && !isValid}
              className="flex items-center gap-2"
            >
              {isLastQuestion ? (
                "Complete"
              ) : (
                <>
                  {isIntroduction ? "Get Started" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

