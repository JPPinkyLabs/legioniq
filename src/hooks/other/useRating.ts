import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useSubmitRating } from "../rating/useSubmitRating";

export const useRating = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { mutateAsync: submitRating } = useSubmitRating();

  const handleSubmitRating = async (requestId: string, rating: number) => {
    setSubmitting(true);
    try {
      await submitRating({ requestId, rating });

      toast.success("Thank you for your feedback!", {
        description: "Your rating has been submitted successfully.",
      });

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit rating";

      // Check for approval pending error
      if (
        errorMessage.includes("pending approval") ||
        errorMessage.includes("Account pending approval") ||
        errorMessage.includes("Invalid authentication")
      ) {
        await signOut();
        navigate("/auth?pending=true");
        toast.error("Account pending approval", {
          description:
            "Your account is pending approval. Please wait for approval before using this feature.",
        });
        return { success: false, error: "Account pending approval" };
      }

      toast.error("Rating failed", {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    submitRating: handleSubmitRating,
  };
};
