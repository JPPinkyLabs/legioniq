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
        "Sign out failed",
        "Authentication required."
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();

    // Sign out user
    const { error } = await supabaseAdmin.auth.admin.signOut(token);

    if (error) {
      return errorResponse(
        400,
        "SIGNOUT_FAILED",
        "Sign out failed",
        error.message || "Failed to sign out. Please try again."
      );
    }

    return successResponse({ signedOut: true });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Sign out failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
