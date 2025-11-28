import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { usePrompts } from "./hooks/usePrompts";
import { PromptList } from "@/components/prompts/PromptList";
import { PromptListSkeleton } from "@/components/skeletons/PromptListSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const Prompts = () => {
  const navigate = useNavigate();
  const { prompts, isLoading, error, refetch } = usePrompts();

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        <div className="space-y-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Prompts</h1>
            <p className="text-muted-foreground mt-1">
              Manage AI prompts for each category
            </p>
          </div>
        </div>

        {isLoading ? (
          <PromptListSkeleton />
        ) : error ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading prompts"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load prompts. Please try again."
            }
            buttons={[
              {
                label: "Try Again",
                onClick: () => refetch(),
                variant: "default",
              },
              {
                label: "Go Back",
                onClick: () => navigate("/platform"),
                variant: "outline",
              },
            ]}
          />
        ) : prompts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No prompts found.</p>
            <p className="text-sm mt-2">Prompts will appear here once they are created.</p>
          </div>
        ) : (
          <PromptList prompts={prompts} />
        )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Prompts;

