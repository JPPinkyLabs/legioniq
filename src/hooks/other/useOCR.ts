import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useOCR = () => {
  const mutation = useMutation({
    mutationFn: async (base64Image: string): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("extract-ocr", {
        body: {
          base64Image,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to extract text from image");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to extract text from image");
      }

      return data.ocrText || '';
    },
    onError: (error: Error) => {
      if (error.message.includes('OCR processing failed') || error.message.includes('API') || error.message.includes('OCR')) {
        toast.error("OCR Error", {
          description: error.message || "Failed to extract text from image",
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
