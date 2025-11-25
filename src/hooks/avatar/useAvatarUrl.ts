import { useEffect } from "react";
import { useUserProfile } from "../auth/useUserProfile";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to get a signed URL for a private Supabase Storage avatar
 * Uses authStore as the primary source to avoid unnecessary reloads
 * @returns Object with avatarUrl, isLoading state
 */
export const useAvatarUrl = () => {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { avatarUrl, profileUpdatedAt, loadAvatarUrl } = useAuthStore();

  // Check if profile was updated and reload avatar if needed
  // This single useEffect handles profile changes - no need for queryCache subscription
  useEffect(() => {
    if (isProfileLoading) {
      return;
    }

    if (!profile) {
      return;
    }

    const currentProfileUpdatedAt = profile.updated_at || profile.created_at || "";
    
    // If profile was updated since last load, reload avatar
    // Pass profile data to avoid redundant fetch
    if (currentProfileUpdatedAt !== profileUpdatedAt) {
      loadAvatarUrl(false, {
        avatar_url: profile.avatar_url,
        updated_at: profile.updated_at,
        created_at: profile.created_at,
      });
    }
  }, [profile?.updated_at, profile?.created_at, profile?.avatar_url, profileUpdatedAt, isProfileLoading, loadAvatarUrl]);

  const handleImageError = () => {
    // If image fails to load, force refresh the avatar URL
    // This handles cases where signed URLs expire - pass profile data if available
    if (avatarUrl && profile) {
      loadAvatarUrl(true, {
        avatar_url: profile.avatar_url,
        updated_at: profile.updated_at,
        created_at: profile.created_at,
      });
    } else if (avatarUrl) {
      loadAvatarUrl(true);
    }
  };

  return { 
    avatarUrl, 
    isLoading: isProfileLoading,
    handleImageError
  };
};
