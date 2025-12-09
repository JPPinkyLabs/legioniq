import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRequestPrompt = (requestId: string | undefined) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["request-prompt", requestId],
    queryFn: async () => {
      if (!requestId) throw new Error("Request ID is required");

      const { data: requestData, error: queryError } = await supabase
        .from("requests")
        .select("system_prompt, user_prompt")
        .eq("id", requestId)
        .single();

      if (queryError) throw queryError;
      if (!requestData) throw new Error("Request not found");

      return {
        systemPrompt: requestData.system_prompt || null,
        userPrompt: requestData.user_prompt || null,
      };
    },
    enabled: !!requestId,
  });

  return {
    systemPrompt: data?.systemPrompt,
    userPrompt: data?.userPrompt,
    isLoading,
    error,
    refetch,
  };
};

