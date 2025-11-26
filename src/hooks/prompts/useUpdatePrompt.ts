import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UpdatePromptParams {
  prompt_id: string;
  category_id: string;
  prompt_text: string;
  current_category_id: string;
  current_prompt_text: string;
}

export interface UpdatePromptResult {
  success: boolean;
  data?: {
    id: string;
    category_id: string;
    prompt_text: string;
    created_at: string;
    created_by: string | null;
  };
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
          success: true,
          data: undefined,
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("update-prompt", {
        body: {
          prompt_id,
          category_id,
          prompt_text: prompt_text.trim(),
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to update prompt");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to update prompt");
      }

      return {
        success: true,
        data: data.data,
      };
    },
    onSuccess: (data, variables) => {
      // Only invalidate queries if update was actually made (data.data exists)
      if (data.data) {
        queryClient.invalidateQueries({ queryKey: ["prompt", variables.prompt_id] });
        queryClient.invalidateQueries({ queryKey: ["prompts"] });
        
        toast.success("Prompt updated", {
          description: "The prompt has been updated successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Error updating prompt", {
        description: error.message || "Failed to update the prompt. Please try again.",
      });
    },
  });
};

