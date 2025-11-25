import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";

export const RequestListSkeleton = () => {
  return (
    <ItemGroup>
      {Array.from({ length: 6 }).map((_, index) => (
        <React.Fragment key={index}>
          <Item>
            <ItemMedia>
              <Skeleton className="h-10 w-10 rounded-full" />
            </ItemMedia>
            <ItemContent className="gap-1">
              <div className="flex items-center gap-2">
                <ItemTitle>
                  <Skeleton className="h-4 w-32" />
                </ItemTitle>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <ItemDescription>
                <Skeleton className="h-4 w-48" />
              </ItemDescription>
              <Skeleton className="h-3 w-20 mt-1" />
            </ItemContent>
            <ItemActions>
              <Skeleton className="h-8 w-8 rounded-full" />
            </ItemActions>
          </Item>
          {index !== 5 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  );
};

