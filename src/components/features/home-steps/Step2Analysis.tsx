import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIResponseContent } from "./AIResponseContent";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { ChatActions } from "@/components/features/ChatActions";
import { AnalysisActions } from "./AnalysisActions";
import Lottie from "lottie-react";
import aiLogoAnimation from "@/assets/ai_logo.json";
import legionLogo from "@/assets/legioniq-logo.png";
import legionLogoGolden from "@/assets/legionIQ_logo_golden.png";
import { useTheme } from "@/contexts/ThemeContext";

interface Step2AnalysisProps {
  requestId: string | null;
  aiResponse: string | null;
  error: string | null;
  loading: boolean;
  onBack: () => void;
}

export const Step2Analysis = ({
  requestId,
  aiResponse,
  error,
  loading,
  onBack,
}: Step2AnalysisProps) => {
  const { theme } = useTheme();
  const logo = theme === "dark" ? legionLogoGolden : legionLogo;
  
  // Show empty state if no content, no loading, and no error
  const isEmpty = !loading && !aiResponse && !error;
  // Show loading if loading is true, regardless of aiResponse (to show loader immediately)
  const showLoading = loading;
  // Show error state if there's an error and not loading
  const showError = !loading && error;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {/* Content area with scroll */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="pr-4 pt-4 px-4 pb-8">
          {showLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-300">
              <div className="h-48 w-48">
                <Lottie 
                  animationData={aiLogoAnimation} 
                  loop={true}
                  className="w-full h-full"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-medium text-foreground">Analyzing your screenshots...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          )}

          {showError && (
            <div className="flex items-center justify-center min-h-[400px]">
              <ErrorEmpty
                icon={AlertCircle}
                title="Error processing analysis"
                description={
                  error || "Failed to process your screenshots. Please try again."
                }
                buttons={[
                  {
                    label: "Go Back",
                    onClick: onBack,
                    variant: "outline" as const,
                  },
                ]}
              />
            </div>
          )}

          {aiResponse && !loading && !error && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-2">
              <AIResponseContent
                content={aiResponse}
                error={null}
                loading={false}
              />
              <ChatActions content={aiResponse} showActions={true} />
              {requestId && (
                <AnalysisActions requestId={requestId} />
              )}
            </div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
              <img 
                src={logo} 
                alt="LegionIQ Logo" 
                className="w-24 h-24 object-contain opacity-50"
              />
              <p>Your results will appear here.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

