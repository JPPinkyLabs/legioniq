import { cloneElement, isValidElement } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/other/use-mobile";

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actionButton?: React.ReactNode;
  onCancel?: () => void;
  cancelText?: string;
  actionText?: string;
}

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = "",
  actionButton,
  onCancel,
  cancelText = "Cancel",
  actionText = "Save"
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b bg-background px-4 py-3 flex-shrink-0">
          <div className="flex items-center flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="mr-2 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {actionButton && (
            <div className="ml-2">
              {actionButton}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden sm:block">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className={`sm:max-w-[425px] ${className}`} 
          autoFocus={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description || title}
          </DialogDescription>
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="mb-6">
            {children}
          </div>

          {(actionButton || onCancel) && (
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  {cancelText}
                </Button>
              )}
              {actionButton && (
                <>
                  {isValidElement(actionButton) ? (
                    cloneElement(actionButton, {
                      className: `${onCancel ? "flex-1" : "w-full"} ${actionButton.props.className || ""}`.trim(),
                    })
                  ) : (
                    actionButton
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

