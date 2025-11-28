import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export interface DeleteAccountResult {
  success: true;
  message: string;
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<DeleteAccountResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to delete account");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to delete account");
      }

      return {
        success: true,
        message: data.message || "Account deleted successfully",
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
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to delete account",
      });
    },
  });
};

