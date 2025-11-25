import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, AlertCircle, Sparkles } from "lucide-react";
import { AnalysisOverlayLoader } from "./AnalysisOverlayLoader";
import { AnalysisOverlayContent } from "./AnalysisOverlayContent";
import { ErrorEmpty } from "@/components/ErrorEmpty";

interface AnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  aiResponse: string | null;
  error: string | null;
  requestId: string | null;
  requestScreenshots: string[];
  categoryDisplayText: string;
  categoryTypingComplete: boolean;
  onViewFullAnalysis: () => void;
  onBack: () => void;
}

export function AnalysisOverlay({
  isOpen,
  onClose,
  loading,
  aiResponse,
  error,
  requestId,
  requestScreenshots,
  categoryDisplayText,
  categoryTypingComplete,
  onViewFullAnalysis,
  onBack,
}: AnalysisOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Block body scroll when overlay is mounted
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 300);
  };

  if (!isOpen) {
    return null;
  }

  const showError = !loading && error;
  const showContent = !loading && !error && aiResponse;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col bg-background ${
        isExiting ? "animate-overlay-exit" : ""
      }`}
    >
      {/* Header */}
      <div className="bg-background px-4 py-3 flex items-center justify-between flex-shrink-0">
        {showContent && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-foreground animate-pulse" />
            <span className="text-xs font-medium text-foreground">AI Analysis</span>
          </div>
        )}
        {!showContent && <div />}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <AnalysisOverlayLoader />
          </div>
        )}
        
        {showError && (
          <div className="flex-1 flex items-center justify-center px-4">
            <ErrorEmpty
              icon={AlertCircle}
              title="Error processing analysis"
              description={
                error || "Failed to process your screenshots. Please try again."
              }
              buttons={[
                {
                  label: "Go Back",
                  onClick: () => {
                    handleClose();
                    onBack();
                  },
                  variant: "outline" as const,
                },
              ]}
            />
          </div>
        )}

        {showContent && (
          <AnalysisOverlayContent
            aiResponse={aiResponse}
            requestId={requestId}
            requestScreenshots={requestScreenshots}
            categoryDisplayText={categoryDisplayText}
            categoryTypingComplete={categoryTypingComplete}
            onViewFullAnalysis={onViewFullAnalysis}
          />
        )}
      </div>
    </div>
  );
}

