import { Skeleton } from "@/components/ui/skeleton";

interface RecentChatsSkeletonProps {
  count?: number;
}

export const RecentChatsSkeleton = ({ count = 15 }: RecentChatsSkeletonProps) => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center px-2 py-2 rounded-md"
        >
          <Skeleton className="h-4 w-3/4 bg-muted-foreground/30" />
        </div>
      ))}
    </div>
  );
};

