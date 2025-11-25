import { Skeleton } from "@/components/ui/skeleton";

export const CategoryScreenshotsSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-32 bg-muted-foreground/30" />
      <div className="space-y-1.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-2">
            <Skeleton className="h-2 w-2 rounded-full mt-1 bg-primary" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-32 bg-primary" />
              <Skeleton className="h-3 w-full bg-muted-foreground/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

