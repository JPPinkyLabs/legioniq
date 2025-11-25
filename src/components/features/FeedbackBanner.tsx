import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRating } from "@/hooks/other/useRating";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";

interface FeedbackBannerProps {
  requestId: string;
  onClose: () => void;
}

export const FeedbackBanner = ({ requestId, onClose }: FeedbackBannerProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { submitting, submitRating } = useRating();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const handleSubmitRating = async () => {
    if (!rating) return;

    const result = await submitRating(requestId, rating);
    
    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/20 bg-gradient-to-r from-primary via-primary/90 to-primary shadow-lg animate-in slide-in-from-bottom">
      <div className="container mx-auto px-4 py-4 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center gap-3 max-w-4xl mx-auto pr-10">
          <div className="flex flex-col gap-1 text-center">
            <p className="text-sm font-semibold text-primary-foreground">How helpful was this analysis?</p>
            <p className="text-xs text-primary-foreground/80">
              Rate this response to help us improve
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition-transform hover:scale-110 disabled:opacity-50"
                disabled={submitting}
              >
                <Star
                  className={`w-6 h-6 ${
                    (hoveredRating !== null ? star <= hoveredRating : rating !== null && star <= rating)
                      ? theme === "light" 
                        ? "fill-orange-700 text-orange-700"
                        : "fill-yellow-400 text-yellow-400"
                      : "text-primary-foreground/60"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {rating && (
            <Button
              onClick={handleSubmitRating}
              disabled={submitting}
              size="sm"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

