import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export interface UpdatePromptParams {
  prompt_id: string;
  category_id: string;
  prompt_text: string;
  current_category_id: string;
  current_prompt_text: string;
}

export interface PromptData {
  id: string;
  category_id: string;
  prompt_text: string;
  created_at: string;
  created_by: string | null;
}

export interface UpdatePromptResult {
  updated: boolean;
  data?: PromptData;
}

/**
 * Hook for updating prompts using TanStack Query
 */
export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePromptParams): Promise<UpdatePromptResult> => {
      const { prompt_id, category_id, prompt_text, current_category_id, current_prompt_text } = params;

      if (!prompt_id || typeof prompt_id !== "string") {
        throw new Error("prompt_id is required");
      }

      if (!category_id || typeof category_id !== "string") {
        throw new Error("category_id is required");
      }

      if (!prompt_text || typeof prompt_text !== "string" || prompt_text.trim().length === 0) {
        throw new Error("prompt_text is required and cannot be empty");
      }

      // Check if values have changed
      const trimmedPromptText = prompt_text.trim();
      const categoryChanged = category_id !== current_category_id;
      const textChanged = trimmedPromptText !== current_prompt_text.trim();

      if (!categoryChanged && !textChanged) {
        toast.info("No changes detected", {
          description: "The prompt values are the same. No update was made.",
        });
        // Return a success result without making the API call
        return {
          updated: false,
          data: undefined,
        };
      }

      const response = await api.invoke<PromptData>("update-prompt", {
        prompt_id,
        category_id,
        prompt_text: trimmedPromptText,
      });

      if (!response.success) {
        throw new ApiError(
          response.message || response.error || "Failed to update prompt",
          response
        );
      }

      return {
        updated: true,
        data: response.data,
      };
    },
    onSuccess: (result, variables) => {
      // Only invalidate queries if update was actually made
      if (result.updated && result.data) {
        queryClient.invalidateQueries({ queryKey: ["prompt", variables.prompt_id] });
        queryClient.invalidateQueries({ queryKey: ["prompts"] });
        
        toast.success("Prompt updated", {
          description: "The prompt has been updated successfully.",
        });
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError 
        ? error.getUserMessage() 
        : error instanceof Error 
          ? error.message 
          : "Failed to update the prompt. Please try again.";
      
      toast.error("Error updating prompt", {
        description: message,
      });
    },
  });
};
