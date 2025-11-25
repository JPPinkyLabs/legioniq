import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";

type Request = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    category: string;
  };
};

interface RequestCardProps {
  request: Request;
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

export const RequestCard = ({ request }: RequestCardProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(request.created_at);

  const categoryEnum = request.category?.category || '';
  const categoryLabel = request.category?.label || 'Untitled';
  const categoryBadgeLabel = categoryBadgeLabels[categoryEnum] || categoryEnum;
  const categoryColor = categoryColors[categoryEnum] || "bg-gray-500/10 text-gray-500 border-gray-500/20";

  const handleClick = () => {
    navigate(`/platform/history/requests/${request.id}`);
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {categoryLabel}
            </CardTitle>
            <CardDescription className="text-sm">
              {formattedDate}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`${categoryColor} text-xs px-2 py-0.5 flex-shrink-0 whitespace-nowrap`}
          >
            {categoryBadgeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {request.model_response && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">AI Response</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {request.model_response}
            </p>
          </div>
        )}
        
         <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Rating:</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < request.rating! ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
      </CardContent>
    </Card>
  );
};

