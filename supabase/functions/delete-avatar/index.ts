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
        "Avatar deletion failed",
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
        "Avatar deletion failed",
        userError?.message || "Invalid or expired session."
      );
    }

    const userId = user.id;

    // Get current avatar URL
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        return errorResponse(
          404,
          "NOT_FOUND",
          "Avatar deletion failed",
          "Profile not found."
        );
      }
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Avatar deletion failed",
        "Failed to get profile: " + profileError.message
      );
    }

    if (!currentProfile?.avatar_url) {
      return errorResponse(
        404,
        "NO_AVATAR",
        "Avatar deletion failed",
        "No avatar to delete."
      );
    }

    // Extract file path from URL
    const urlParts = currentProfile.avatar_url.split("/avatars/");
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      // Delete from storage
      const { error: deleteError } = await supabaseAdmin.storage
        .from("avatars")
        .remove([filePath]);

      if (deleteError) {
        console.error("[delete-avatar] Error deleting avatar from storage:", deleteError);
        // Continue with profile update even if storage delete fails
      }
    }

    // Update profile to remove avatar_url
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (updateError) {
      return errorResponse(
        500,
        "UPDATE_FAILED",
        "Avatar deletion failed",
        "Failed to update profile: " + updateError.message
      );
    }

    return successResponse({ avatarDeleted: true });
  } catch (error: any) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Avatar deletion failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
