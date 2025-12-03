import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface RequestPromptResponse {
  prompt: string;
}

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

      const response = await api.invoke<RequestPromptResponse>("get-request-prompt", {
        request_id: requestId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to get request prompt");
      }

      return response.data.prompt;
    },
    enabled: !!requestId,
  });

  return {
    prompt: data,
    isLoading,
    error,
    refetch,
  };
};

