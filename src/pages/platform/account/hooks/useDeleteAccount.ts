import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export interface DeleteAccountResult {
  message?: string;
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<DeleteAccountResult> => {
      const response = await api.invoke<DeleteAccountResult>("delete-account");

      if (!response.success) {
        throw new ApiError(
          response.message || response.error || "Failed to delete account",
          response
        );
      }

      return {
        message: response.data?.message || response.message || "Account deleted successfully",
      };
    },
    onSuccess: async () => {
      await signOut();
      queryClient.clear();
      navigate("/auth");
      toast.success("Account deleted", {
        description: "Your account has been deleted successfully.",
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.getTitle(), {
          description: error.getUserMessage(),
        });
      } else {
        const message = error instanceof Error ? error.message : "Failed to delete account";
        toast.error("Account deletion failed", {
          description: message,
        });
      }
    },
  });
};
