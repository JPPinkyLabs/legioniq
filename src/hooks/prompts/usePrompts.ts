import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Prompt = Tables<"prompts"> & {
  category: {
    id: string;
    label: string;
    color: string;
    display_order: number;
  };
  last_edited: string;
};

export const usePrompts = () => {
  const {
    data: prompts,
    isLoading,
    error,
    refetch,
  } = useQuery<Prompt[]>({
    queryKey: ["prompts"],
    queryFn: async () => {
      // First, get all prompts with category info
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select(`
          *,
          category:categories!inner (
            id,
            label,
            color,
            display_order
          )
        `)
        .order("category(display_order)", { ascending: true });

      if (promptsError) throw promptsError;
      if (!promptsData) return [];

      // For each prompt, get the last edit date from prompts_logs
      const promptsWithLastEdited = await Promise.all(
        promptsData.map(async (prompt) => {
          // Get the most recent log entry for this prompt
          const { data: lastLog, error: logError } = await supabase
            .from("prompts_logs")
            .select("created_at")
            .eq("prompt_id", prompt.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Use last log date if exists, otherwise use prompt created_at
          const last_edited = lastLog?.created_at || prompt.created_at || new Date().toISOString();

          return {
            ...prompt,
            last_edited,
          } as Prompt;
        })
      );

      return promptsWithLastEdited;
    },
  });

  return {
    prompts: prompts || [],
    isLoading,
    error,
    refetch,
  };
};

