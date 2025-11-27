import { toast } from "sonner";
import { useDailyLimitValidation } from "../usage/useDailyLimitValidation";

interface UseScreenshotSendProps {
  screenshots: string[];
  selectedCategory: string | undefined;
  currentImages: number;
  maxImages: number;
  isUnlimited?: boolean;
  onClearScreenshots: () => void;
  onAddScreenshotEntry: (screenshots: string[], category: string) => void;
  analyzeScreenshot: (category: string, base64Images: string | string[]) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useScreenshotSend = ({
  screenshots,
  selectedCategory,
  currentImages,
  maxImages,
  isUnlimited = false,
  onClearScreenshots,
  onAddScreenshotEntry,
  analyzeScreenshot,
}: UseScreenshotSendProps) => {
  const { validateAndHandleSend } = useDailyLimitValidation({
    screenshots,
    currentImages,
    maxImages,
    isUnlimited,
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

    // Add screenshot entry to conversation view
    onAddScreenshotEntry(screenshots, selectedCategory);

    // Clear state
    onClearScreenshots();

    // Analyze screenshot
    // analyzeScreenshot handles errors internally and sets the error state
    // We don't need to catch here as the hook manages its own error state
    const result = await analyzeScreenshot(selectedCategory, screenshots);

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

