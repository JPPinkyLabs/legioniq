import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
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

type Prompt = {
  id: string;
  category_id: string;
  prompt_text: string;
  created_at: string;
  created_by: string | null;
  category: {
    id: string;
    label: string;
    color: string;
    display_order: number;
  };
  last_edited: string;
};

interface PromptListItemProps {
  prompt: Prompt;
  isLast?: boolean;
}

export const PromptListItem = ({ prompt, isLast = false }: PromptListItemProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(prompt.last_edited);

  const categoryLabel = prompt.category?.label || 'Untitled';
  const categoryColor = getCategoryColorClasses(prompt.category?.color);
  
  const title = categoryLabel;
  const previewText = prompt.prompt_text?.substring(0, 100) || '';

  const handleClick = () => {
    navigate(`/admin/prompts/${prompt.id}`);
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
              <FileText className="h-5 w-5" />
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
          <ItemDescription className="text-xs text-muted-foreground mt-1">
            Last edited {formattedDate}
          </ItemDescription>
        </ItemContent>
      </Item>
      {!isLast && <ItemSeparator />}
    </React.Fragment>
  );
};

interface PromptListProps {
  prompts: Prompt[];
}

export const PromptList = ({ prompts }: PromptListProps) => {
  return (
    <ItemGroup>
      {prompts.map((prompt, index) => (
        <PromptListItem
          key={prompt.id}
          prompt={prompt}
          isLast={index === prompts.length - 1}
        />
      ))}
    </ItemGroup>
  );
};

