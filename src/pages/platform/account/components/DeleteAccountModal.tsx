import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        // Modal will close automatically when user is redirected to /auth
        onClose();
      },
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      description="This action cannot be undone"
      onCancel={onClose}
      cancelText="Close"
      actionButton={
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2"
        >
          Confirm
        </Button>
      }
    >
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl"></div>
          <div className="relative rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Are you absolutely sure?</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            This will permanently delete your account. All your analyses and account data will be removed.
          </p>
        </div>

        <p className="text-sm font-medium text-destructive mt-4">
          This action cannot be undone.
        </p>
      </div>
    </ResponsiveModal>
  );
};

