import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { ChatMessage } from "./ChatMessage";
import { Gamepad2, Joystick, Zap, Trophy, Target, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ConversationMessage {
  id: string;
  from: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  screenshot?: string | string[] | null;
  requestId?: string | null;
  interrupted?: boolean;
}

interface ConversationViewProps {
  loading: boolean;
  currentRequestId: string | null;
  aiResponse: string | null;
  error: string | null;
  onViewAnalysis?: (requestId: string) => void;
}

export interface ConversationViewHandle {
  addScreenshotEntry: (screenshot: string | string[] | null, category: string) => void;
  isTypingComplete: () => boolean;
}

export const ConversationView = forwardRef<ConversationViewHandle, ConversationViewProps>(({
  loading,
  currentRequestId,
  aiResponse,
  error,
  onViewAnalysis,
}, ref) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const [isTypingComplete, setIsTypingComplete] = useState(true);
  const processedRequestIdRef = useRef<string | null>(null);
  const pendingRequestIdRef = useRef<string | null>(null);

  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  useEffect(() => {
    if (loading) {
      const loadingMessages = ["Thinking...", "Analyzing image...", "Processing data...", "Generating insights..."];
      setLoadingMessage(loadingMessages[0]);
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[currentIndex]);
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setLoadingMessage("Thinking...");
    }
  }, [loading]);

  useEffect(() => {
    if (currentRequestId && aiResponse && currentRequestId !== processedRequestIdRef.current) {
      const assistantMsg: ConversationMessage = {
        id: generateMessageId(),
        from: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        requestId: currentRequestId,
      };

      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => msg.id !== 'typing-indicator');
        return [...withoutTyping, assistantMsg];
      });
      
      processedRequestIdRef.current = currentRequestId;
      pendingRequestIdRef.current = null;
      // Reset typing complete when new response arrives (typing will start)
      setIsTypingComplete(false);
    }
  }, [currentRequestId, aiResponse]);

  useEffect(() => {
    // Handle error: remove typing indicator immediately when error occurs
    if (error) {
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => msg.id !== 'typing-indicator');
        return withoutTyping;
      });
      pendingRequestIdRef.current = null;
      processedRequestIdRef.current = null;
      setIsTypingComplete(true);
    }
  }, [error]);

  useImperativeHandle(ref, () => ({
    addScreenshotEntry: (
      screenshot: string | string[] | null,
      category: string
    ) => {
      // Mark the last assistant message as interrupted if it exists and is not complete
      setMessages((prev) => {
        // Find the last assistant message index (polyfill for findLastIndex)
        let lastAssistantIndex = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].from === 'assistant' && prev[i].id !== 'typing-indicator') {
            lastAssistantIndex = i;
            break;
          }
        }

        const updated = prev.map((msg, index) => {
          // If this is the last assistant message and typing is not complete, mark as interrupted
          if (index === lastAssistantIndex && !isTypingComplete) {
            return { ...msg, interrupted: true };
          }
          return msg;
        });

        const userEntry: ConversationMessage = {
          id: generateMessageId(),
          from: 'user',
          content: `[Screenshot uploaded - ${category}]`,
          timestamp: new Date(),
          screenshot: screenshot,
        };

        const typingIndicator: ConversationMessage = {
          id: 'typing-indicator',
          from: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        return [...updated, userEntry, typingIndicator];
      });
      
      pendingRequestIdRef.current = 'pending';
      setIsTypingComplete(false);
    },
    isTypingComplete: () => isTypingComplete,
  }));

  const { getUserName } = useUserUtils();
  const hasMessages = messages.length > 0;
  const userName = getUserName();

  if (hasMessages) {
    return (
      <div className="w-full max-w-3xl mx-auto h-full overflow-hidden">
        <Conversation className="relative w-full h-full">
          <ScrollArea className="h-full">
            <ConversationContent>
              {messages.map((message, index) => {
                const isTyping = message.id === 'typing-indicator' && loading;
                // Check if this is the last assistant message
                const isLastAssistantMessage = message.from === 'assistant' && 
                  !isTyping && 
                  messages.slice(index + 1).every(msg => msg.from !== 'assistant' || msg.id === 'typing-indicator');
                
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    userName={userName}
                    isTyping={isTyping}
                    typingMessage={loadingMessage}
                    onViewAnalysis={onViewAnalysis}
                    onTypingComplete={(complete) => {
                      // Only update if this is the last assistant message
                      if (isLastAssistantMessage) {
                        setIsTypingComplete(complete);
                      }
                    }}
                  />
                );
              })}
              {error && (
                <div className="px-4 py-2">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error processing request</AlertTitle>
                    <AlertDescription>
                      {error}
                      <br />
                      <span className="text-xs mt-1 block">Please try again later.</span>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </ConversationContent>
          </ScrollArea>
          <ConversationScrollButton />
        </Conversation>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full max-w-3xl mx-auto px-4">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <ChatMessage
            message={{
              id: 'loading',
              from: 'assistant',
              content: '',
              timestamp: new Date(),
            }}
            userName={userName}
            isTyping={true}
            typingMessage={loadingMessage}
          />
        </div>
      ) : (
        <div className="w-full py-8">
          <div className="text-center">
            {/* Gaming Icons Layout */}
            <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
              <div className="flex flex-col items-center gap-2 group">
                <div className="relative">
                  <Gamepad2 className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
                  <Joystick className="w-6 h-6 text-muted-foreground absolute -bottom-1 -right-1 transition-transform group-hover:scale-110" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-7 h-7 text-primary animate-pulse" />
                  <Sparkles className="w-6 h-6 text-primary/70" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 group">
                <div className="relative">
                  <Trophy className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
                  <Target className="w-6 h-6 text-muted-foreground absolute -top-1 -right-1 transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-semibold mb-3 text-foreground">
              How can I help you today?
            </h1>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Upload a screenshot and LegionIQ will help you with gameplay tips, technical support, or strategic advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

ConversationView.displayName = 'ConversationView';

