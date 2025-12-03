import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCategoryColorClasses } from "@/lib/category-colors";

type AdminRequest = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    color: string;
  };
  advice: {
    id: string;
    name: string;
    description: string;
  } | null;
  user: {
    id: string;
    name: string | null;
  } | null;
};

interface AdminRequestListItemProps {
  request: AdminRequest;
  isLast?: boolean;
}

export const AdminRequestListItem = ({ request, isLast = false }: AdminRequestListItemProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(request.created_at);

  const categoryLabel = request.category?.label || 'Untitled';
  const categoryColor = getCategoryColorClasses(request.category?.color);
  const adviceName = request.advice?.name;
  const title = adviceName 
    ? `${categoryLabel} (${adviceName})` 
    : categoryLabel;
  
  const previewText = request.model_response?.substring(0, 100) || '';
  const userName = request.user?.name || 'Unknown User';
  const userInitials = request.user?.name 
    ? request.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  const handleClick = () => {
    navigate(`/admin/requests/${request.id}`);
  };

  return (
    <React.Fragment>
      <Item 
        onClick={handleClick}
        className="cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <ItemMedia>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm flex items-center justify-center">
              {userInitials}
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
              {categoryLabel}
            </Badge>
          </div>
          <ItemDescription>
            {previewText}{previewText.length >= 100 ? '...' : ''}
          </ItemDescription>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <ItemDescription className="text-xs text-muted-foreground">
              {formattedDate}
            </ItemDescription>
            <ItemDescription className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {userName}
            </ItemDescription>
          </div>
        </ItemContent>
      </Item>
      {!isLast && <ItemSeparator />}
    </React.Fragment>
  );
};

interface AdminRequestListProps {
  requests: AdminRequest[];
}

export const AdminRequestList = ({ requests }: AdminRequestListProps) => {
  return (
    <ItemGroup>
      {requests.map((request, index) => (
        <AdminRequestListItem
          key={request.id}
          request={request}
          isLast={index === requests.length - 1}
        />
      ))}
    </ItemGroup>
  );
};

