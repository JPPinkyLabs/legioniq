import { toast } from "sonner";
import { useDailyLimitValidation } from "../usage/useDailyLimitValidation";

interface UseScreenshotSendProps {
  screenshots: string[];
  selectedCategory: string | undefined;
  userMessage: string;
  currentImages: number;
  maxImages: number;
  onClearScreenshots: () => void;
  onClearMessage: () => void;
  onAddUserMessage: (message: string, screenshots: string[], category: string) => void;
  analyzeScreenshot: (category: string, base64Images: string | string[], userMessage: string | null) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useScreenshotSend = ({
  screenshots,
  selectedCategory,
  userMessage,
  currentImages,
  maxImages,
  onClearScreenshots,
  onClearMessage,
  onAddUserMessage,
  analyzeScreenshot,
}: UseScreenshotSendProps) => {
  const { validateAndHandleSend } = useDailyLimitValidation({
    screenshots,
    currentImages,
    maxImages,
  });

  const handleSend = async () => {
    // Validate category
    if (!selectedCategory) {
      toast.error("Category required", {
        description: "Please select a category first",
      });
      return;
    }

    // Validate screenshots
    if (screenshots.length === 0) {
      toast.error("Screenshot required", {
        description: "Please upload at least one screenshot",
      });
      return;
    }

    // Validate daily limit
    if (!validateAndHandleSend()) {
      return;
    }

    // Prepare message
    const messageToSend = userMessage.trim().length > 0 ? userMessage.trim() : null;

    // Add user message to conversation view
    onAddUserMessage(messageToSend || '', screenshots, selectedCategory);

    // Clear state
    onClearMessage();
    onClearScreenshots();

    // Analyze screenshot
    // analyzeScreenshot handles errors internally and sets the error state
    // We don't need to catch here as the hook manages its own error state
    const result = await analyzeScreenshot(selectedCategory, screenshots, messageToSend);

    if (!result.success) {
      // Error is already handled in the hook and displayed via toast
      // The error state is also set in the hook, which will be passed to ConversationView
      console.error('[useScreenshotSend] Analysis failed:', result.error);
    }
  };

  return {
    handleSend,
  };
};

