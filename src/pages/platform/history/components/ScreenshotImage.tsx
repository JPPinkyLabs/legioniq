import { cn } from "@/lib/utils";

interface ScreenshotImageProps {
  src: string;
  alt: string;
  index: number;
  isLoaded: boolean;
  onLoad: () => void;
  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  className?: string;
}

export const ScreenshotImage = ({
  src,
  alt,
  index,
  isLoaded,
  onLoad,
  onError,
  className,
}: ScreenshotImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "w-full h-full object-contain transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

