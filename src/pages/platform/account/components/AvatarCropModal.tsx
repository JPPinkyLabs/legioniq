import { useState, useRef, type ChangeEvent } from "react";
import { XIcon, RotateCcwIcon } from "lucide-react";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useAvatarUpload } from "@/hooks/avatar/useAvatarUpload";
import { Loader2 } from "lucide-react";

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Internal component that has access to ImageCrop context
const CropControls = ({ 
  onClose, 
  isUploading,
  applyButtonRef
}: { 
  onClose: () => void; 
  isUploading: boolean;
  applyButtonRef: React.RefObject<HTMLButtonElement>;
}) => {
  return (
    <>
      <div className="flex items-center justify-center gap-2 pt-4">
        <ImageCropReset asChild>
          <Button variant="outline" disabled={isUploading} size="icon" type="button">
            <RotateCcwIcon className="size-4" />
          </Button>
        </ImageCropReset>
        <Button
          onClick={onClose}
          size="icon"
          type="button"
          variant="outline"
          disabled={isUploading}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      {/* Hidden Apply button that will be triggered from actionButton */}
      <ImageCropApply asChild>
        <Button 
          ref={applyButtonRef}
          disabled={isUploading}
          className="hidden"
        >
          Apply
        </Button>
      </ImageCropApply>
    </>
  );
};

export const AvatarCropModal = ({ isOpen, onClose }: AvatarCropModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const applyButtonRef = useRef<HTMLButtonElement | null>(null);
  const { uploadAvatar, isUploading } = useAvatarUpload();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return;
      }
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        return;
      }
      setSelectedFile(file);
      setCroppedImage(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCroppedImage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCropComplete = async (croppedImageData: string) => {
    setCroppedImage(croppedImageData);
    try {
      await uploadAvatar(croppedImageData);
      handleClose();
    } catch (error) {
      // Error is handled by the hook
      console.error("Error uploading avatar:", error);
    }
  };

  // Initial file selection state
  if (!selectedFile) {
    return (
      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Upload Photo"
        description="Select an image file to upload as your profile picture"
        onCancel={handleClose}
        cancelText="Close"
      >
        <div className="space-y-4">
          <Input
            accept="image/*"
            className="w-full"
            onChange={handleFileChange}
            type="file"
            disabled={isUploading}
          />
          <p className="text-sm text-muted-foreground">
            Maximum file size: 2MB. Supported formats: PNG, JPEG, JPG, WEBP
          </p>
        </div>
      </ResponsiveModal>
    );
  }

  // Cropped image preview state (shouldn't normally show, but included for completeness)
  if (croppedImage && !isUploading) {
    return (
      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Upload Photo"
        description="Your photo has been uploaded successfully"
        onCancel={handleClose}
        cancelText="Close"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              alt="Cropped"
              className="h-32 w-32 rounded-full object-cover"
              src={croppedImage}
            />
          </div>
        </div>
      </ResponsiveModal>
    );
  }

  // Crop interface
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crop Photo"
      description="Adjust your profile picture"
      onCancel={handleClose}
      cancelText="Close"
      actionButton={
        <Button 
          disabled={isUploading}
          onClick={() => {
            // Trigger click on the actual Apply button inside ImageCrop
            applyButtonRef.current?.click();
          }}
        >
          Apply
        </Button>
      }
    >
      <div className="space-y-4">
        <ImageCrop
          aspect={1}
          circularCrop
          file={selectedFile}
          maxImageSize={2 * 1024 * 1024} // 2MB
          onCrop={handleCropComplete}
        >
          <ImageCropContent className="max-w-md mx-auto" />
          <CropControls 
            onClose={handleClose} 
            isUploading={isUploading}
            applyButtonRef={applyButtonRef}
          />
        </ImageCrop>
      </div>
    </ResponsiveModal>
  );
};

