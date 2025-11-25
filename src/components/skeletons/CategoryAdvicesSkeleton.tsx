import { Skeleton } from "@/components/ui/skeleton";

export const CategoryAdvicesSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-24 bg-muted-foreground/30" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-32 rounded-full bg-muted-foreground/30" />
        ))}
      </div>
    </div>
  );
};

