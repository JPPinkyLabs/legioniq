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
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");

    let userId: string | null = null;
    const supabaseAdmin = createAdminClient();

    // Try to get userId from query param first
    if (userIdParam) {
      userId = userIdParam;
    } else if (authHeader) {
      // Otherwise get from JWT token
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !user) {
        return errorResponse(
          401,
          "INVALID_TOKEN",
          "Approval check failed",
          userError?.message || "Invalid or expired session."
        );
      }
      
      userId = user.id;
    }

    if (!userId) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Approval check failed",
        "User ID is required."
      );
    }

    // Check if user is approved
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_approved")
      .eq("id", userId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Profile not found
        return successResponse({ isApproved: false });
      }
      
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Approval check failed",
        profileError.message || "Failed to check approval status."
      );
    }

    return successResponse({
      isApproved: profile?.is_approved ?? false,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Approval check failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
