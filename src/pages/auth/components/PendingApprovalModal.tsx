import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingApprovalModal = ({ isOpen, onClose }: PendingApprovalModalProps) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pending approval"
      description="Your account is currently pending approval from our team"
      className="sm:max-w-lg"
      actionButton={
        <Button onClick={onClose}>
          Ok
        </Button>
      }
    >
      <div className="flex flex-col space-y-8">
        {/* Icon and main message */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <p className="text-base text-muted-foreground">
            Your account has been created successfully, but it's currently pending approval from our team.
          </p>
        </div>

        {/* What happens next - simplified */}
        <div className="space-y-6 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground">What happens next?</h3>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Review Process</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team will review your account and approve it as soon as possible. This usually takes a few hours to a few days.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Stay Updated</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once your account is approved, you'll be able to access all features of LegionIQ. You can try logging in again later to check your status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};

