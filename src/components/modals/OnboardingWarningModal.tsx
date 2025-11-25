import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface OnboardingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWarningModal({
  isOpen,
  onClose,
}: OnboardingWarningModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboarding Not Completed"
      description="You haven't completed the onboarding process yet"
      className="max-w-md"
      actionButton={
        <Button onClick={onClose} className="w-full sm:w-auto">
          Got it
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            For a better experience, we recommend completing the onboarding process.
            This will help us personalize content and recommendations for you.
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
}

