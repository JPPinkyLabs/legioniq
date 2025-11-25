import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  success: true;
  message: string;
}

export const useChangePassword = () => {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (params: ChangePasswordParams): Promise<ChangePasswordResult> => {
      const { currentPassword, newPassword } = params;

      if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Invalid authentication");
      }

      const { data, error } = await supabase.functions.invoke("change-password", {
        body: {
          currentPassword,
          newPassword,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to update password");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to update password");
      }

      return {
        success: true,
        message: data.message || "Password updated successfully",
      };
    },
    onSuccess: () => {
      form.reset();
      toast.success("Password updated", {
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to update password",
      });
    },
  });

  return {
    form,
    changePassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
