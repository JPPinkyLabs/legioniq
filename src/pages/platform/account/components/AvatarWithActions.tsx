import { useState } from "react";
import { Camera, Eye, Upload, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ResponsiveDropdown } from "@/components/ui/responsive-dropdown";
import { useAvatarUrl } from "@/hooks/avatar/useAvatarUrl";
import { useAvatarUpload } from "@/hooks/avatar/useAvatarUpload";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { AvatarCropModal } from "./AvatarCropModal";
import { AvatarViewModal } from "./AvatarViewModal";
import { Loader2 } from "lucide-react";

export const AvatarWithActions = () => {
  const { avatarUrl, isLoading, handleImageError } = useAvatarUrl();
  const { deleteAvatar, isDeleting } = useAvatarUpload();
  const { getUserInitials } = useUserUtils();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const hasAvatar = !!avatarUrl && !isLoading;

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
    } catch (error) {
      // Error is handled by the hook
      console.error("Error deleting avatar:", error);
    }
  };

  const dropdownItems = [
    ...(hasAvatar
      ? [
          {
            label: "View Photo",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => setIsViewModalOpen(true),
          },
          {
            label: "Change Photo",
            icon: <Upload className="h-4 w-4" />,
            onClick: () => setIsCropModalOpen(true),
            separator: true,
          },
          {
            label: "Delete Photo",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDeleteAvatar,
            variant: "destructive" as const,
            disabled: isDeleting,
          },
        ]
      : [
          {
            label: "Upload Photo",
            icon: <Upload className="h-4 w-4" />,
            onClick: () => setIsCropModalOpen(true),
          },
        ]),
  ];

  return (
    <>
      <ResponsiveDropdown
        trigger={
          <div className="relative group cursor-pointer">
            <Avatar className="h-20 w-20">
              {isLoading || isDeleting ? (
                <div className="flex items-center justify-center h-full w-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt="Profile"
                    onError={handleImageError}
                  />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
        }
        items={dropdownItems}
        align="start"
      />

      <AvatarCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
      />

      <AvatarViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </>
  );
};

