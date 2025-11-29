import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { getCategoryColorClasses } from "@/lib/category-colors";

type Request = Tables<"requests"> & {
  category: {
    id: string;
    label: string;
    color: string;
  };
};

interface RequestCardProps {
  request: Request;
}

export const RequestCard = ({ request }: RequestCardProps) => {
  const navigate = useNavigate();
  const formattedDate = useFormattedDate(request.created_at);

  const categoryLabel = request.category?.label || 'Untitled';
  const categoryColor = getCategoryColorClasses(request.category?.color);

  const handleClick = () => {
    navigate(`/platform/history/${request.id}`);
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
            {categoryLabel}
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

