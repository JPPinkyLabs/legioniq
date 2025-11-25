import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Actions, Action } from "@/components/ai/actions";
import { toast } from "sonner";

interface ChatActionsProps {
  content: string;
  showActions: boolean;
}

export const ChatActions = ({ content, showActions }: ChatActionsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  if (!showActions) {
    return null;
  }

  return (
    <Actions className="mt-2">
      <Action
        label="Copy"
        tooltip={copied ? "Copied!" : "Copy response"}
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
      </Action>
    </Actions>
  );
};

