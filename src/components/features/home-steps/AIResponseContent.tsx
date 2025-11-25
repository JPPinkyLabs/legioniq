import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Response } from "@/components/ai/response";

interface AIResponseContentProps {
  content: string | null;
  error: string | null;
  loading: boolean;
}

export const AIResponseContent = ({
  content,
  error,
  loading,
}: AIResponseContentProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error processing request</AlertTitle>
        <AlertDescription>
          {error}
          <br />
          <span className="text-xs mt-1 block">Please try again later.</span>
        </AlertDescription>
      </Alert>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="w-full">
      <Response className="text-sm">
        {content}
      </Response>
    </div>
  );
};

