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

type Prompt = {
  id: string;
  category_id: string;
  prompt_text: string;
  created_at: string;
  created_by: string | null;
  category: {
    id: string;
    category: string;
    label: string;
    display_order: number;
  };
  last_edited: string;
};

interface PromptListItemProps {
  prompt: Prompt;
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

export const PromptListItem = ({ prompt, isLast = false }: PromptListItemProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(prompt.last_edited);

  const categoryEnum = prompt.category?.category || '';
  const categoryBadgeLabel = categoryBadgeLabels[categoryEnum] || categoryEnum;
  const categoryColor = categoryColors[categoryEnum] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  
  const title = prompt.category?.label || categoryBadgeLabel;
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
              {categoryBadgeLabel}
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

