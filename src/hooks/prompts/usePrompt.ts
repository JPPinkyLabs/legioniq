import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Prompt = {
  id: string;
  category_id: string;
  prompt_text: string;
  created_at: string;
  created_by: string | null;
  category: {
    id: string;
    category: string;
    label: string;
    display_order: number;
  };
  creator: {
    id: string;
    name: string;
  } | null;
  last_edited: string;
  last_edited_by: {
    id: string;
    name: string;
  } | null;
};

export const usePrompt = (id: string | undefined) => {
  const {
    data: prompt,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["prompt", id],
    queryFn: async () => {
      if (!id) throw new Error("Prompt ID is required");

      // Get prompt with category info
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .select(`
          *,
          category:categories!inner (
            id,
            category,
            label,
            display_order
          )
        `)
        .eq("id", id)
        .single();

      if (promptError) throw promptError;
      if (!promptData) throw new Error("Prompt not found");

      // Get creator profile if created_by exists
      let creator = null;
      if (promptData.created_by) {
        const { data: creatorData } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", promptData.created_by)
          .maybeSingle();
        
        if (creatorData) {
          creator = creatorData;
        }
      }

      // Get the most recent log entry for this prompt
      const { data: lastLog, error: logError } = await supabase
        .from("prompts_logs")
        .select("created_at, edited_by")
        .eq("prompt_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Use last log date if exists, otherwise use prompt created_at
      const last_edited = lastLog?.created_at || promptData.created_at || new Date().toISOString();

      // Get last editor profile if edited_by exists in last log
      let last_edited_by = null;
      if (lastLog?.edited_by) {
        const { data: editorData } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", lastLog.edited_by)
          .maybeSingle();
        
        if (editorData) {
          last_edited_by = editorData;
        }
      }

      return {
        ...promptData,
        creator,
        last_edited,
        last_edited_by,
      } as Prompt;
    },
    enabled: !!id,
  });

  return {
    prompt,
    isLoading,
    error,
    refetch,
  };
};

