import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  passwordChanged?: boolean;
  sessionRefreshed?: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
  };
}

export const useChangePassword = () => {
  const mutation = useMutation({
    mutationFn: async (params: ChangePasswordParams): Promise<ChangePasswordResult> => {
      const { currentPassword, newPassword } = params;

      if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
      }

      const response = await api.invoke<ChangePasswordResult>("change-password", {
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        throw new ApiError(
          response.message || response.error || "Failed to update password",
          response
        );
      }

      const result = response.data;

      // If we got a new session, update it in the Supabase client
      if (result?.sessionRefreshed && result?.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }

      return result || { passwordChanged: true };
    },
    onSuccess: () => {
      toast.success("Password updated", {
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.getTitle(), {
          description: error.getUserMessage(),
        });
      } else {
        const message = error instanceof Error ? error.message : "Failed to update password";
        toast.error("Password change failed", {
          description: message,
        });
      }
    },
  });

  return {
    changePassword: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
