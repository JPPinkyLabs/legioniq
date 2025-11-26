import * as React from "react";
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

export const PromptListSkeleton = () => {
  return (
    <ItemGroup>
      {Array.from({ length: 3 }).map((_, index) => (
        <React.Fragment key={index}>
          <Item>
            <ItemMedia>
              <Skeleton className="h-10 w-10 rounded-full bg-muted-foreground/30" />
            </ItemMedia>
            <ItemContent className="gap-1">
              <div className="flex items-center gap-2">
                <ItemTitle>
                  <Skeleton className="h-4 w-32 bg-muted-foreground/30" />
                </ItemTitle>
                <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/30" />
              </div>
              <ItemDescription>
                <Skeleton className="h-4 w-full bg-muted-foreground/30" />
                <Skeleton className="h-4 w-3/4 mt-1 bg-muted-foreground/30" />
              </ItemDescription>
              <Skeleton className="h-3 w-32 mt-1 bg-muted-foreground/30" />
            </ItemContent>
          </Item>
          {index !== 2 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  );
};

