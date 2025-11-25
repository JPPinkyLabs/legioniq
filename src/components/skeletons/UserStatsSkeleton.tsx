import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Activity, Target } from "lucide-react";
import * as React from "react";

export const UserStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage & Analytics
          </CardTitle>
          <CardDescription>
            Your account usage statistics and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ItemGroup className="flex-1 flex flex-col justify-between">
            {[1, 2, 3].map((i, index) => (
              <React.Fragment key={i}>
                <Item className="px-0 flex-1 flex items-center">
                  <ItemMedia>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle>
                      <Skeleton className="h-4 w-24" />
                    </ItemTitle>
                    <ItemDescription>
                      <Skeleton className="h-4 w-32" />
                    </ItemDescription>
                  </ItemContent>
                </Item>
                {index !== 2 && <ItemSeparator className="mx-0" />}
              </React.Fragment>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Category Usage
          </CardTitle>
          <CardDescription>
            Most frequently used analysis categories
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex flex-col justify-between h-full gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 flex-1 flex flex-col justify-center min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

