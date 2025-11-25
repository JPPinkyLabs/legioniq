import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { UserStatsSkeleton } from "./UserStatsSkeleton";

export const UsageSkeleton = () => {
  return (
    <div className="space-y-6">

        {/* Daily Usage Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Usage
            </CardTitle>
            <CardDescription>
              Your daily image analysis limit and remaining quota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Usage & Analytics - Using centralized UserStatsSkeleton */}
        <UserStatsSkeleton />
    </div>
  );
};

