import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DailyUsageDisplaySkeletonProps {
  compact?: boolean;
  className?: string;
}

export const DailyUsageDisplaySkeleton = ({ compact = false, className }: DailyUsageDisplaySkeletonProps) => {
  if (compact) {
    return (
      <div className={cn("flex flex-col gap-1.5 px-2 py-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-20 bg-muted-foreground/30" />
          <Skeleton className="h-5 w-16 rounded-full bg-primary" />
        </div>
        <Skeleton className="h-3 w-32 bg-primary" />
        <Skeleton className="h-3 w-40 bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 p-3 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
};

