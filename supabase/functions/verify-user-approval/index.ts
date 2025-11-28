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
        "Verification failed",
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
        "Verification failed",
        userError?.message || "Invalid or expired session."
      );
    }

    // Check if user is approved
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        return errorResponse(
          403,
          "NOT_APPROVED",
          "Verification failed",
          "Your account is pending approval."
        );
      }
      
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Verification failed",
        profileError.message || "Failed to check approval status."
      );
    }

    if (!profile || !profile.is_approved) {
      return errorResponse(
        403,
        "NOT_APPROVED",
        "Verification failed",
        "Your account is pending approval."
      );
    }

    return successResponse({ userId: user.id });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Verification failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
