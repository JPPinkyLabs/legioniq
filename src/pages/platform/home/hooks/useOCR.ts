import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

interface OCRResult {
  ocrText?: string;
}

export const useOCR = () => {
  const mutation = useMutation({
    mutationFn: async (base64Image: string): Promise<string> => {
      const response = await api.invoke<OCRResult>("extract-ocr", {
        base64Image,
      });

      if (!response.success) {
        throw new ApiError(
          response.message || response.error || "Failed to extract text from image",
          response
        );
      }

      return response.data?.ocrText || '';
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof ApiError 
        ? error.getUserMessage() 
        : error instanceof Error 
          ? error.message 
          : "Failed to extract text from image";
      
      if (errorMessage.includes('OCR processing failed') || errorMessage.includes('API') || errorMessage.includes('OCR')) {
        toast.error("OCR Error", {
          description: errorMessage,
        });
      }
    },
  });

  return {
    extractText: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
