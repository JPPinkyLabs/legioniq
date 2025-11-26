import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { PromptDetailsSkeleton } from "@/components/skeletons/PromptDetailsSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrompt } from "@/hooks/prompts/usePrompt";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptEditForm } from "@/components/prompts/PromptEditForm";
import { useCategories } from "@/hooks/other/useCategories";
import { useUpdatePrompt } from "@/hooks/prompts/useUpdatePrompt";

const PromptDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prompt, isLoading, error, refetch } = usePrompt(id);
  const { categories } = useCategories();
  const { mutateAsync: updatePrompt, isPending: isUpdating } = useUpdatePrompt();
  const [isEditing, setIsEditing] = useState(false);

  // Call useFormattedDate hook unconditionally (before early returns)
  const formattedCreatedAt = useFormattedDate(prompt?.created_at || new Date().toISOString());
  const formattedLastEdited = useFormattedDate(prompt?.last_edited || new Date().toISOString());

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/admin/prompts")}
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
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">
                  Prompt Details
                </h1>
                {isLoading ? (
                  <Skeleton className="h-4 w-64 bg-muted-foreground/30" />
                ) : prompt?.id ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    {prompt.id}
                  </p>
                ) : null}
              </div>
              {!isLoading && prompt && (
                <div>
                  {isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <PromptDetailsSkeleton />
          ) : error ? (
            <ErrorEmpty
              icon={AlertCircle}
              title="Error loading prompt"
              description={
                error instanceof Error
                  ? error.message
                  : "Failed to load the prompt. Please try again."
              }
              buttons={[
                {
                  label: "Try Again",
                  onClick: () => refetch(),
                  variant: "default",
                },
                {
                  label: "Go Back",
                  onClick: () => navigate("/admin/prompts"),
                  variant: "outline",
                },
              ]}
            />
          ) : !prompt ? (
            <ErrorEmpty
              icon={AlertCircle}
              title="Prompt not found"
              description="The prompt you're looking for doesn't exist or has been removed."
              buttons={[
                {
                  label: "Go Back",
                  onClick: () => navigate("/admin/prompts"),
                  variant: "outline",
                },
              ]}
            />
          ) : isEditing ? (
            <PromptEditForm
              prompt={prompt}
              categories={categories}
              onSubmit={async (data) => {
                await updatePrompt({
                  prompt_id: prompt.id,
                  category_id: data.category_id,
                  prompt_text: data.prompt_text,
                  current_category_id: prompt.category_id,
                  current_prompt_text: prompt.prompt_text,
                });
                setIsEditing(false);
                await refetch();
              }}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isUpdating}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{prompt.category.label}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      ID: {prompt.id}
                    </p>
                  </div>
                  <Badge variant="outline">{prompt.category.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{prompt.category.label}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">{formattedCreatedAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created By</p>
                    <p className="text-sm text-muted-foreground">
                      {prompt.creator?.name || prompt.created_by || "System"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Edited</p>
                    <p className="text-sm text-muted-foreground">{formattedLastEdited}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Edited By</p>
                    <p className="text-sm text-muted-foreground">
                      {prompt.last_edited_by?.name || 
                       prompt.creator?.name || 
                       prompt.created_by || 
                       "System"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium">Prompt Text</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {prompt.prompt_text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default PromptDetails;

