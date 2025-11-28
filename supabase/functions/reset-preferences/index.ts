// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(
        401,
        "AUTH_REQUIRED",
        "Reset preferences failed",
        "Authentication required."
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return errorResponse(
        401,
        "INVALID_TOKEN",
        "Reset preferences failed",
        userError?.message || "Invalid or expired session."
      );
    }

    // Delete all user preferences
    const { error: deleteError } = await supabaseAdmin
      .from("user_preferences")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return errorResponse(
        400,
        "DELETE_FAILED",
        "Reset preferences failed",
        deleteError.message || "Failed to delete preferences."
      );
    }

    // Reset has_completed_onboarding flag in profiles table
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ has_completed_onboarding: false })
      .eq("id", user.id);

    if (updateError) {
      return errorResponse(
        400,
        "UPDATE_FAILED",
        "Reset preferences failed",
        updateError.message || "Failed to update onboarding status."
      );
    }

    return successResponse({ preferencesReset: true });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Reset preferences failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
