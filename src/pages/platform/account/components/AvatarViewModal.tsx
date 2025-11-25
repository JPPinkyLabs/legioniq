import { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useAvatarUrl } from "@/hooks/avatar/useAvatarUrl";
import { Skeleton } from "@/components/ui/skeleton";

interface AvatarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarViewModal = ({ isOpen, onClose }: AvatarViewModalProps) => {
  const { avatarUrl, isLoading } = useAvatarUrl();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Reset image loaded state when modal opens/closes or avatarUrl changes
  useEffect(() => {
    if (isOpen && avatarUrl) {
      setImageLoaded(false);
    }
  }, [isOpen, avatarUrl]);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Photo"
      description="Your current profile picture"
      onCancel={onClose}
      cancelText="Close"
    >
      <div className="flex items-center justify-center py-8 min-h-[60vh] sm:min-h-0">
        {isLoading || !imageLoaded ? (
          <Skeleton className="h-[400px] w-[400px] max-w-full rounded-lg" />
        ) : null}
        {avatarUrl ? (
          <img
            alt="Profile"
            className={`max-h-[400px] max-w-full rounded-lg object-contain ${
              !imageLoaded ? "hidden" : ""
            }`}
            src={avatarUrl}
            onLoad={handleImageLoad}
          />
        ) : !isLoading ? (
          <p className="text-muted-foreground">No photo available</p>
        ) : null}
      </div>
    </ResponsiveModal>
  );
};

