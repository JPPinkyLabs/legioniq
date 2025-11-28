import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

interface UploadAvatarResult {
  publicUrl?: string;
}

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
        const response = await api.invoke<UploadAvatarResult>("upload-avatar", {
          base64Image,
        });

        if (!response.success) {
          throw new ApiError(
            response.message || response.error || "Failed to upload avatar",
            response
          );
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

        return response.data?.publicUrl;
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          toast.error(error.getTitle(), {
            description: error.getUserMessage(),
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : "Failed to upload avatar";
          toast.error("Avatar upload failed", {
            description: errorMessage,
          });
        }
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
        const response = await api.invoke("delete-avatar");

        if (!response.success) {
          throw new ApiError(
            response.message || response.error || "Failed to delete avatar",
            response
          );
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
        if (error instanceof ApiError) {
          toast.error(error.getTitle(), {
            description: error.getUserMessage(),
          });
        } else {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete avatar";
          toast.error("Avatar deletion failed", {
            description: errorMessage,
          });
        }
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
