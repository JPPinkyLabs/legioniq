import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIResponseContent } from "../home-steps/AIResponseContent";
import { ChatActions } from "../ChatActions";
import { ChatRating } from "../ChatRating";
import { ExternalLink } from "lucide-react";

interface AnalysisOverlayContentProps {
  aiResponse: string;
  requestId: string | null;
  requestScreenshots: string[];
  categoryDisplayText: string;
  categoryTypingComplete: boolean;
  onViewFullAnalysis: () => void;
}

export function AnalysisOverlayContent({
  aiResponse,
  requestId,
  requestScreenshots,
  categoryDisplayText,
  categoryTypingComplete,
  onViewFullAnalysis,
}: AnalysisOverlayContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Category Info with Typing Effect - Only show after response is received */}
      {categoryDisplayText && requestId && (
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <span className="text-lg font-semibold text-foreground block">
            {categoryDisplayText}
            {!categoryTypingComplete && <span className="animate-pulse">|</span>}
          </span>
          <span className="text-xs text-muted-foreground font-mono mt-1 block">
            {requestId}
          </span>
        </div>
      )}

      {/* Screenshots Gallery */}
      {requestScreenshots.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4 px-4 pt-2 flex-shrink-0">
          {requestScreenshots.map((screenshot, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden border border-border"
            >
              <img
                src={screenshot}
                alt={`Screenshot ${index + 1}`}
                className="w-24 h-24 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Content area with scroll */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="px-4 pb-4">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AIResponseContent
              content={aiResponse}
              error={null}
              loading={false}
            />
            <ChatActions content={aiResponse} showActions={true} />
          </div>
        </div>
      </ScrollArea>

      {/* Actions Footer */}
      <div className="border-t bg-background px-4 py-4 flex-shrink-0 space-y-3">
        {requestId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onViewFullAnalysis}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View full analysis
            </Button>
          </div>
        )}
        {requestId && (
          <div>
            <ChatRating requestId={requestId} />
          </div>
        )}
      </div>
    </div>
  );
}

