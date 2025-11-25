import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useCompleteOnboarding } from "@/hooks/onboarding/useCompleteOnboarding";

interface SendingStepProps {
  onComplete: () => void;
}

export function SendingStep({ onComplete }: SendingStepProps) {
  const completeOnboarding = useCompleteOnboarding();
  // Use ref to ensure mutation is only called once
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    const sendPreferences = async () => {
      try {
        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Complete onboarding
        await completeOnboarding.mutateAsync();
        
        // Close modal immediately after completion
        onComplete();
      } catch (error) {
        console.error("Error completing onboarding:", error);
        // On error, still close the modal
        onComplete();
      }
    };

    sendPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - we use ref to ensure single execution

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Sending your preferences...</h3>
        <p className="text-sm text-muted-foreground">
          We're saving your answers to improve your experience on the platform.
        </p>
      </div>
    </div>
  );
}

