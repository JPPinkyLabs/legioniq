import { useRef } from "react";
import { Plus, X } from "lucide-react";

const MAX_IMAGES = 5;

const ImageCard = ({
  imageUrl,
  onRemove,
  index,
}: {
  imageUrl: string;
  onRemove: () => void;
  index: number;
}) => {
  return (
    <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted/20 shrink-0">
      <img
        src={imageUrl}
        alt={`Preview ${index + 1}`}
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        className="absolute top-0.5 right-0.5 md:top-1 md:right-1 p-0.5 md:p-1 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Remove image ${index + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3 md:w-3 md:h-3" />
      </button>
    </div>
  );
};

const EmptyImageCard = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent/50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
    >
      <Plus className="h-4 w-4 md:h-4 md:w-4 text-muted-foreground" />
    </button>
  );
};

interface ImageSelectorProps {
  screenshots: string[];
  onRemoveScreenshot: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canAddMoreImages: boolean;
  dailyLimitExceeded: boolean;
  remainingAfterSelection: number;
  maxImages: number;
  loading?: boolean;
  dailyUsageLoading?: boolean;
}

export const ImageSelector = ({
  screenshots,
  onRemoveScreenshot,
  onFileSelect,
  canAddMoreImages,
  dailyLimitExceeded,
  remainingAfterSelection,
  maxImages,
  loading = false,
}: ImageSelectorProps) => {
  // Only show limit message when daily usage data is loaded (maxImages > 0)
  const isDailyUsageReady = maxImages > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (canAddMoreImages && !loading) {
      fileInputRef.current?.click();
    }
  };

  // Criar array de 5 slots (sempre exibir 5 cards)
  const imageSlots = Array.from({ length: MAX_IMAGES }, (_, index) => {
    const screenshot = screenshots[index];
    return screenshot
      ? { type: "image" as const, url: screenshot, index }
      : { type: "empty" as const, index };
  });

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-sm font-medium">Images</h3>
        {screenshots.length > 0 && (
          <span className="text-xs md:text-sm text-muted-foreground">
            {screenshots.length}/{MAX_IMAGES}
          </span>
        )}
      </div>

      {/* Cards de Imagem - Sempre 5 cards lado a lado */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {imageSlots.map((slot, index) => {
          if (slot.type === "image") {
            return (
              <ImageCard
                key={index}
                imageUrl={slot.url}
                onRemove={() => onRemoveScreenshot(slot.index)}
                index={slot.index}
              />
            );
          } else {
            // Card vazio só é clicável se ainda puder adicionar mais imagens
            return (
              <EmptyImageCard
                key={index}
                onClick={handleUploadClick}
                disabled={!canAddMoreImages || loading}
              />
            );
          }
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          onFileSelect(e);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        disabled={!canAddMoreImages || loading}
      />

      {!canAddMoreImages && screenshots.length < MAX_IMAGES && isDailyUsageReady && (
        <p className="text-xs md:text-sm text-muted-foreground">
          {dailyLimitExceeded || remainingAfterSelection === 0
            ? "Daily image limit reached"
            : `You can add ${remainingAfterSelection} more image${remainingAfterSelection !== 1 ? "s" : ""} today`}
        </p>
      )}
    </div>
  );
};

