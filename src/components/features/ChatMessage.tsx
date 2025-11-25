import { Message, MessageAvatar, MessageContent } from '@/components/ai/message';
import { ChatMessageContent } from './ChatMessageContent';
import { ChatLoadingMessage } from './ChatLoadingMessage';
import { ConversationMessage } from './ConversationView';
import legionLogo from '@/assets/legioniq-logo.png';
import legionLogoGolden from '@/assets/legionIQ_logo_golden.png';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserUtils } from '@/hooks/auth/useUserUtils';
import { useState } from 'react';

interface ChatMessageProps {
  message: ConversationMessage;
  userName: string;
  isTyping?: boolean;
  typingMessage?: string;
  onViewAnalysis?: (requestId: string) => void;
  onTypingComplete?: (complete: boolean) => void;
  skipTypingEffect?: boolean; // Skip typing effect and show full content immediately
  hideActions?: boolean; // Hide ChatActions and ChatRating
  messageClassName?: string; // Custom className for Message component
}

export const ChatMessage = ({
  message,
  userName,
  isTyping,
  onViewAnalysis,
  onTypingComplete,
  skipTypingEffect = false,
  hideActions = false,
  messageClassName,
}: ChatMessageProps) => {
  const isTypingIndicator = message.id === 'typing-indicator';
  const isTypingState = isTypingIndicator && isTyping;
  const { theme } = useTheme();
  const { getInitials } = useUserUtils();
  const aiLogo = theme === 'dark' ? legionLogoGolden : legionLogo;
  const [showAvatar, setShowAvatar] = useState(false);
  
  return (
    <Message from={message.from} className={messageClassName}>
      {message.from === 'assistant' && !isTypingState && showAvatar && (
        <MessageAvatar 
          src={aiLogo} 
          name="LegionIQ Assistant" 
        />
      )}
      <MessageContent className={isTypingState ? '!bg-transparent' : ''}>
        {isTypingIndicator && isTyping ? (
          <ChatLoadingMessage />
        ) : !isTypingIndicator ? (
          <ChatMessageContent
            type={message.from}
            content={message.content}
            screenshot={message.screenshot}
            isTyping={false}
            requestId={message.requestId}
            interrupted={message.interrupted}
            onViewAnalysis={onViewAnalysis}
            onTypingComplete={(complete) => {
              setShowAvatar(complete);
              onTypingComplete?.(complete);
            }}
            skipTypingEffect={skipTypingEffect}
            hideActions={hideActions}
          />
        ) : null}
      </MessageContent>
      {message.from === 'user' && (
        <MessageAvatar 
          name={getInitials(userName)}
        />
      )}
    </Message>
  );
};

