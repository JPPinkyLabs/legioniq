import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronRight, MessageSquare } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Request = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    category: string;
  };
};

interface RequestListItemProps {
  request: Request;
  isLast?: boolean;
}

const categoryBadgeLabels: Record<string, string> = {
  gameplay: "Gameplay",
  technical: "Technical",
  strategy: "Strategy",
};

const categoryColors: Record<string, string> = {
  gameplay: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  technical: "bg-green-500/10 text-green-500 border-green-500/20",
  strategy: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};


export const RequestListItem = ({ request, isLast = false }: RequestListItemProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(request.created_at);

  const categoryEnum = request.category?.category || '';
  const categoryLabel = request.category?.label || 'Untitled';
  const categoryBadgeLabel = categoryBadgeLabels[categoryEnum] || categoryEnum;
  const categoryColor = categoryColors[categoryEnum] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  
  // Use category label as title
  const title = categoryLabel;

  const handleClick = () => {
    navigate(`/platform/history/requests/${request.id}`);
  };

  return (
    <React.Fragment>
      <Item 
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={handleClick}
      >
        <ItemMedia>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent className="gap-1">
          <div className="flex items-center gap-2">
            <ItemTitle>{title}</ItemTitle>
            <Badge 
              variant="outline" 
              className={`${categoryColor} text-xs px-2 py-0.5`}
            >
              {categoryBadgeLabel}
            </Badge>
          </div>
          <ItemDescription>
            {formattedDate}
            {request.model_response && (
              <span className="ml-2">• {request.model_response.substring(0, 60)}...</span>
            )}
          </ItemDescription>
          {request.rating && (
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < request.rating!
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </ItemActions>
      </Item>
      {!isLast && <ItemSeparator />}
    </React.Fragment>
  );
};

interface RequestListProps {
  requests: Request[];
}

export const RequestList = ({ requests }: RequestListProps) => {
  return (
    <ItemGroup>
      {requests.map((request, index) => (
        <RequestListItem
          key={request.id}
          request={request}
          isLast={index === requests.length - 1}
        />
      ))}
    </ItemGroup>
  );
};

