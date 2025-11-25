import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAvatarUpload = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { loadAvatarUrl } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uploadAvatar = useMutation({
    mutationFn: async (base64Image: string) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      setIsUploading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("Invalid authentication");
        }

        const { data, error } = await supabase.functions.invoke("upload-avatar", {
          body: {
            base64Image,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw new Error(error.message || "Failed to upload avatar");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to upload avatar");
        }

        // Invalidate and refetch to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });
        await queryClient.refetchQueries({ queryKey: ["userProfile", user.id] });

        // Force a small delay to ensure database update is complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Refetch again to get the updated profile with new avatar_url
        await queryClient.refetchQueries({ queryKey: ["userProfile", user.id] });

        // Update avatar URL in authStore (force refresh to get new avatar)
        await loadAvatarUrl(true);

        toast.success("Avatar updated", {
          description: "Your profile picture has been updated successfully.",
        });

        return data.publicUrl;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar";
        toast.error("Error", {
          description: errorMessage,
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
  });

  const deleteAvatar = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      setIsDeleting(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("Invalid authentication");
        }

        const { data, error } = await supabase.functions.invoke("delete-avatar", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw new Error(error.message || "Failed to delete avatar");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to delete avatar");
        }

        // Invalidate and refetch to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ["userProfile", user.id] });
        await queryClient.refetchQueries({ queryKey: ["userProfile", user.id] });

        // Force a small delay to ensure database update is complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Refetch again to get the updated profile
        await queryClient.refetchQueries({ queryKey: ["userProfile", user.id] });

        // Update avatar URL in authStore (force refresh, will clear it if avatar was deleted)
        await loadAvatarUrl(true);

        toast.success("Avatar removed", {
          description: "Your profile picture has been removed successfully.",
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete avatar";
        toast.error("Error", {
          description: errorMessage,
        });
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
  });

  return {
    uploadAvatar: uploadAvatar.mutateAsync,
    deleteAvatar: deleteAvatar.mutateAsync,
    isUploading: isUploading || uploadAvatar.isPending,
    isDeleting: isDeleting || deleteAvatar.isPending,
  };
};
