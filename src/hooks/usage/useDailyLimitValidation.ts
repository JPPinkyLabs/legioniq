import { toast } from "sonner";

interface UseDailyLimitValidationProps {
  screenshots: string[];
  currentImages: number;
  maxImages: number;
  isUnlimited?: boolean;
}

export const useDailyLimitValidation = ({
  screenshots,
  currentImages,
  maxImages,
  isUnlimited = false,
}: UseDailyLimitValidationProps) => {
  // For unlimited users, all validations pass
  if (isUnlimited) {
    return {
      remainingImages: Infinity,
      remainingAfterSelection: Infinity,
      dailyLimitExceeded: false,
      canMakeRequest: true,
      validateFileAddition: () => ({
        isValid: true,
        wouldExceed: false,
        maxCanAdd: Infinity,
        message: null,
      }),
      validateBeforeSend: () => ({
        isValid: true,
        wouldExceed: false,
        message: null,
      }),
      handleFileSelectWithValidation: async (
        files: FileList | null,
        onFileUpload: (file: File) => Promise<{ success: boolean; base64?: string; error?: string }>
      ) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        for (const file of fileArray) {
          await onFileUpload(file);
        }
      },
      validateAndHandleSend: () => true,
    };
  }

  const remainingImages = maxImages - currentImages;
  const totalAfterSelection = currentImages + screenshots.length;
  const dailyLimitExceeded = totalAfterSelection > maxImages;
  // Remaining images that can still be added (not including already selected)
  const remainingAfterSelection = Math.max(0, remainingImages - screenshots.length);
  // Can make request if total doesn't exceed limit
  const canMakeRequest = totalAfterSelection <= maxImages;

  /**
   * Validates if adding files would exceed daily limit
   * @param filesToAdd Number of files trying to add
   * @param currentScreenshotsCount Optional: current number of screenshots (if different from state)
   * @returns Object with validation result and max files that can be added
   */
  const validateFileAddition = (filesToAdd: number, currentScreenshotsCount?: number) => {
    const currentSelected = currentScreenshotsCount ?? screenshots.length;
    const totalAfterAdd = currentSelected + filesToAdd;
    const totalWouldBe = currentImages + totalAfterAdd;
    const wouldExceedDailyLimit = totalWouldBe > maxImages;

    if (wouldExceedDailyLimit) {
      // Calculate how many images can still be added today (based on daily limit, not current selection)
      const maxCanAdd = Math.max(0, remainingImages);
      return {
        isValid: false,
        wouldExceed: true,
        maxCanAdd,
        message: maxCanAdd <= 0
          ? `You have reached your daily limit of ${maxImages} images. You have used ${currentImages} images today.`
          : `You tried to add ${filesToAdd} image${filesToAdd !== 1 ? 's' : ''}, but your daily limit is ${maxImages} images. You can only add ${maxCanAdd} more image${maxCanAdd !== 1 ? 's' : ''} today.`,
      };
    }

    return {
      isValid: true,
      wouldExceed: false,
      maxCanAdd: filesToAdd,
      message: null,
    };
  };

  /**
   * Validates if sending request would exceed daily limit
   * @returns Object with validation result and error message if invalid
   */
  const validateBeforeSend = () => {
    const totalAfterRequest = currentImages + screenshots.length;
    const wouldExceedDailyLimit = totalAfterRequest > maxImages;

    if (wouldExceedDailyLimit) {
      const remaining = maxImages - currentImages;
      return {
        isValid: false,
        wouldExceed: true,
        message: `You have used ${currentImages} of ${maxImages} images today. You tried to send ${screenshots.length} images, but only ${remaining} ${remaining === 1 ? 'image is' : 'images are'} remaining. Please remove ${screenshots.length - remaining} image${screenshots.length - remaining !== 1 ? 's' : ''} and try again.`,
      };
    }

    return {
      isValid: true,
      wouldExceed: false,
      message: null,
    };
  };

  /**
   * Handles file selection with daily limit validation
   * @param files FileList from input
   * @param onFileUpload Callback to upload a single file
   * @param currentScreenshotsCount Optional: current number of screenshots (to avoid stale state)
   */
  const handleFileSelectWithValidation = async (
    files: FileList | null,
    onFileUpload: (file: File) => Promise<{ success: boolean; base64?: string; error?: string }>,
    currentScreenshotsCount?: number
  ) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    // Use provided count or fallback to state (which might be stale)
    // If currentScreenshotsCount is provided, use it; otherwise use state value
    const currentSelected = currentScreenshotsCount !== undefined ? currentScreenshotsCount : screenshots.length;
    const validation = validateFileAddition(fileArray.length, currentSelected);

    if (!validation.isValid) {
      toast.error(validation.maxCanAdd <= 0 ? "Daily limit exceeded" : "Too many images", {
        description: validation.message || undefined,
      });

      if (validation.maxCanAdd > 0) {
        // Calculate how many files can actually be added considering current selection
        const currentSelected = currentScreenshotsCount ?? screenshots.length;
        const actualMaxCanAdd = Math.max(0, remainingImages - currentSelected);
        if (actualMaxCanAdd > 0) {
          // Only process files that fit within the limit
          const filesToProcess = fileArray.slice(0, actualMaxCanAdd);
          for (const file of filesToProcess) {
            await onFileUpload(file);
          }
        }
      }
      return;
    }

    // Process files sequentially to avoid race conditions with state updates
    for (const file of fileArray) {
      await onFileUpload(file);
    }
  };

  /**
   * Handles send validation with daily limit check
   * @returns true if validation passes, false otherwise
   */
  const validateAndHandleSend = () => {
    const validation = validateBeforeSend();

    if (!validation.isValid) {
      toast.error("Daily limit exceeded", {
        description: validation.message || undefined,
      });
      return false;
    }

    return true;
  };

  return {
    remainingImages,
    remainingAfterSelection,
    dailyLimitExceeded,
    canMakeRequest,
    validateFileAddition,
    validateBeforeSend,
    handleFileSelectWithValidation,
    validateAndHandleSend,
  };
};
