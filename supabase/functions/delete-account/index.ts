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
        "Account deletion failed",
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
        "Account deletion failed",
        userError?.message || "Invalid or expired session."
      );
    }

    // Check if user is approved
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_approved) {
      return errorResponse(
        403,
        "NOT_APPROVED",
        "Account deletion failed",
        "Your account is pending approval."
      );
    }

    // Call RPC function to delete user account
    const { error: rpcError } = await supabaseAdmin.rpc("delete_user_account");

    if (rpcError) {
      return errorResponse(
        400,
        "DELETE_FAILED",
        "Account deletion failed",
        rpcError.message || "Failed to delete account. Please try again."
      );
    }

    return successResponse({ accountDeleted: true });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Account deletion failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
