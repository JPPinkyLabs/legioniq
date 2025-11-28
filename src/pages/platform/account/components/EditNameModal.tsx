import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const nameSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

type NameFormInput = z.infer<typeof nameSchema>;

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditNameModal = ({ isOpen, onClose }: EditNameModalProps) => {
  const { user } = useAuth();
  const { setSession, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NameFormInput>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.user_metadata?.name || "",
    },
  });

  useEffect(() => {
    if (user?.user_metadata?.name) {
      form.reset({ name: user.user_metadata.name });
    }
  }, [user?.user_metadata?.name, form]);

  useEffect(() => {
    if (isOpen && user?.user_metadata?.name) {
      form.reset({ name: user.user_metadata.name });
    }
  }, [isOpen, user?.user_metadata?.name, form]);

  const handleClose = () => {
    if (user?.user_metadata?.name) {
      form.reset({ name: user.user_metadata.name });
    }
    onClose();
  };

  const onSubmit = async (data: NameFormInput) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
        data: { name: data.name },
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (session && updatedUser) {
        setSession(session);
        setUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: ["userStats"] });
      }
      
      toast.success("Name updated", {
        description: "Your name has been updated successfully.",
      });
      
      onClose();
    } catch (error: any) {
      toast.error("Name update failed", {
        description: error.message || "Failed to update name",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Name"
      description="Update your display name"
      onCancel={handleClose}
      cancelText="Cancel"
      actionButton={
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving || !form.formState.isValid}
          className="flex-1"
        >
          Save
        </Button>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="Enter your name"
                      className="pl-10"
                      disabled={isSaving}
                      autoFocus
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsiveModal>
  );
};

