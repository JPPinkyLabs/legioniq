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
import { Avatar } from "@/components/ui/avatar";

export const AdminRequestListSkeleton = () => {
  return (
    <ItemGroup>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <Item>
            <ItemMedia>
              <Avatar className="h-10 w-10">
                <Skeleton className="h-10 w-10 rounded-full bg-muted-foreground/30" />
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1">
              <div className="flex items-center gap-2">
                <ItemTitle>
                  <Skeleton className="h-5 w-48 bg-muted-foreground/30" />
                </ItemTitle>
                <Skeleton className="h-5 w-20 rounded-full bg-muted-foreground/30" />
              </div>
              <ItemDescription>
                <Skeleton className="h-4 w-full bg-muted-foreground/30" />
              </ItemDescription>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <ItemDescription className="text-xs">
                  <Skeleton className="h-3 w-32 bg-muted-foreground/30" />
                </ItemDescription>
                <ItemDescription className="text-xs flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded bg-muted-foreground/30" />
                  <Skeleton className="h-3 w-24 bg-muted-foreground/30" />
                </ItemDescription>
              </div>
            </ItemContent>
          </Item>
          {index < 4 && <ItemSeparator />}
        </div>
      ))}
    </ItemGroup>
  );
};

