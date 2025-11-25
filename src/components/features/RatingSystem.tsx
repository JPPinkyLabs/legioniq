import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useRating } from "@/hooks/other/useRating";

interface RatingSystemProps {
  requestId: string;
  onRated: () => void;
}

const RatingSystem = ({ requestId, onRated }: RatingSystemProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { submitting, submitRating } = useRating();

  const handleSubmitRating = async () => {
    if (!rating) return;

    const result = await submitRating(requestId, rating);
    
    if (result.success) {
      // Wait a moment before resetting
      setTimeout(() => {
        onRated();
      }, 1500);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Rate This Response</CardTitle>
        <CardDescription>
          How helpful was this AI analysis? Your feedback helps us improve.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="transition-transform hover:scale-110"
              disabled={submitting}
            >
              <Star
                 className={`w-10 h-10 ${
                  (hoveredRating !== null ? star <= hoveredRating : rating !== null && star <= rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        {rating && (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              You rated this response {rating} out of 5 stars
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRating(null)}
                disabled={submitting}
                className="flex-1"
              >
                Change Rating
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Submitting..." : "Submit & Get New Help"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RatingSystem;