import { Star } from "lucide-react";
import { useState } from "react";
import { useRating } from "@/hooks/other/useRating";
import { useRequest } from "@/hooks/requests/useRequest";

interface ChatRatingProps {
  requestId: string;
}

export const ChatRating = ({ requestId }: ChatRatingProps) => {
  const { request, isLoading } = useRequest(requestId);
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { submitting, submitRating } = useRating();

  // Check if request already has a rating
  const hasExistingRating = request?.rating !== null && request?.rating !== undefined;

  // Don't show anything while loading
  if (isLoading) {
    return null;
  }

  const handleStarClick = async (starValue: number) => {
    if (submitted) return;
    
    setRating(starValue);
    const result = await submitRating(requestId, starValue);
    
    if (result.success) {
      setSubmitted(true);
    }
  };

  // Don't show rating component if already has rating
  if (hasExistingRating || submitted) {
    return (
      <div className="flex items-center gap-2 mt-3 pt-2 pb-6 border-t border-border/50">
        <p className="text-xs text-muted-foreground">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-3 pt-2 pb-6 border-t border-border/50">
      <p className="text-xs text-muted-foreground whitespace-nowrap">Was this helpful?</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => !submitting && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || submitted}
            type="button"
          >
            <Star
              className={`w-4 h-4 ${
                (hoveredRating !== null ? star <= hoveredRating : rating !== null && star <= rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {submitting && (
        <span className="text-xs text-muted-foreground">Submitting...</span>
      )}
    </div>
  );
};

