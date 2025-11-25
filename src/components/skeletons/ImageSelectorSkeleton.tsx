import { Skeleton } from "@/components/ui/skeleton";

export const ImageSelectorSkeleton = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="w-20 h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
};

