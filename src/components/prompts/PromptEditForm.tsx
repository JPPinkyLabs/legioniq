import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormattedDate } from "@/hooks/formatting/useFormattedDate";
import type { CategoryData } from "@/hooks/other/useCategories";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { cn } from "@/lib/utils";

const promptEditSchema = z.object({
  category_id: z.string().uuid("Category is required"),
  prompt_text: z.string().min(10, "Prompt text must be at least 10 characters"),
});

type PromptEditFormInput = z.infer<typeof promptEditSchema>;

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
  creator: {
    id: string;
    name: string;
  } | null;
  last_edited: string;
  last_edited_by: {
    id: string;
    name: string;
  } | null;
};

interface PromptEditFormProps {
  prompt: Prompt;
  categories: CategoryData[];
  onSubmit: (data: PromptEditFormInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PromptEditForm = ({
  prompt,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: PromptEditFormProps) => {
  const isMobile = useIsMobile();
  const formattedCreatedAt = useFormattedDate(prompt.created_at);
  const formattedLastEdited = useFormattedDate(prompt.last_edited);

  const form = useForm<PromptEditFormInput>({
    resolver: zodResolver(promptEditSchema),
    defaultValues: {
      category_id: prompt.category_id,
      prompt_text: prompt.prompt_text,
    },
  });

  const handleSubmit = async (data: PromptEditFormInput) => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{prompt.category.label}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              ID: {prompt.id}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  {isMobile ? (
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[200px] resize-none"
                      disabled={isSubmitting}
                      placeholder="Enter prompt text..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

