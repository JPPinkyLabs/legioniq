import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const PromptDetailsSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-32 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-64 bg-muted-foreground/30" />
          </div>
          <Skeleton className="h-6 w-20 bg-muted-foreground/30" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-32 bg-muted-foreground/30" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-40 bg-muted-foreground/30" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-32 bg-muted-foreground/30" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-40 bg-muted-foreground/30" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-4 w-32 bg-muted-foreground/30" />
          </div>
          <div className="sm:col-span-2">
            <Skeleton className="h-4 w-24 bg-muted-foreground/30 mb-2" />
            <Skeleton className="h-32 w-full bg-muted-foreground/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

