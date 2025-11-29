import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Response } from "@/components/ai/response";
import { useTypingEffect } from "@/hooks/other/useTypingEffect";
import { ChatActions } from "./ChatActions";
import { ChatRating } from "./ChatRating";

export interface ChatMessageContentProps {
  type: 'user' | 'assistant';
  content: string;
  screenshot?: string | string[] | null;
  isTyping?: boolean;
  typingMessage?: string;
  requestId?: string | null;
  interrupted?: boolean;
  onViewAnalysis?: (requestId: string) => void;
  onTypingComplete?: (complete: boolean) => void;
  skipTypingEffect?: boolean; // When true, show full content immediately without typing effect
  hideActions?: boolean; // When true, hide ChatActions and ChatRating (for detail pages like Details)
}


export const ChatMessageContent = ({
  type,
  content,
  screenshot,
  isTyping,
  typingMessage,
  requestId,
  interrupted = false,
  onViewAnalysis,
  onTypingComplete,
  skipTypingEffect = false,
  hideActions = false,
}: ChatMessageContentProps): JSX.Element | null => {
  const navigate = useNavigate();
  
  if (type === 'assistant') {
    // Use typing effect only if not skipped
    const { displayedText, isComplete } = useTypingEffect({
      text: content && content.trim().length > 0 ? content : '',
      speed: 0, // 2ms per character for typing effect (lower = faster)
      enabled: !skipTypingEffect && !isTyping && !!content && content.trim().length > 0,
      interrupted: interrupted,
    });

    // If skipping typing effect, show full content immediately
    const finalText = skipTypingEffect ? content : displayedText;
    const finalIsComplete = skipTypingEffect ? true : isComplete;

    const [showActions, setShowActions] = useState(skipTypingEffect);

    useEffect(() => {
      if (skipTypingEffect) {
        // If skipping typing effect, show actions immediately
        setShowActions(true);
        onTypingComplete?.(true);
        return;
      }
      
      if (finalIsComplete) {
        const timer = setTimeout(() => {
          setShowActions(true);
          onTypingComplete?.(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setShowActions(false);
        onTypingComplete?.(false);
      }
    }, [finalIsComplete, onTypingComplete, skipTypingEffect]);

    if (!content || content.trim().length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="space-y-2">
          <Response className="text-sm">
            {finalText}
          </Response>
          {interrupted && requestId && (
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span>Message interrupted.</span>
              <button
                onClick={() => {
                  if (onViewAnalysis) {
                    onViewAnalysis(requestId);
                  } else {
                    navigate(`/platform/history/${requestId}`);
                  }
                }}
                className="text-primary hover:underline"
              >
                View full message →
              </button>
            </div>
          )}
          {!interrupted && !hideActions && requestId && onViewAnalysis && showActions && (
            <button
              onClick={() => onViewAnalysis(requestId)}
              className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
            >
              View full analysis →
            </button>
          )}
          {!interrupted && !hideActions && requestId && showActions && (
            <ChatRating requestId={requestId} />
          )}
          {!interrupted && !hideActions && (
            <ChatActions
              content={content}
              showActions={showActions}
            />
          )}
        </div>
      </div>
    );
  }

  const screenshots = screenshot 
    ? (Array.isArray(screenshot) ? screenshot : [screenshot])
    : [];

  const maxHeight = screenshots.length > 1 ? 'max-h-20' : 'max-h-32';

  return (
    <div className="space-y-2">
      {screenshots.length > 0 && (
        <div className={screenshots.length === 1 
          ? "rounded-lg overflow-hidden border border-border/50 max-w-xs" 
          : "grid grid-cols-2 gap-2 max-w-md"
        }>
          {screenshots.map((img, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden border border-border/50"
            >
              <img
                src={img}
                alt={`Screenshot ${index + 1}`}
                className={`w-full h-auto ${maxHeight} object-contain bg-muted/20`}
              />
            </div>
          ))}
        </div>
      )}
      {content && (
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      )}
    </div>
  );
};

