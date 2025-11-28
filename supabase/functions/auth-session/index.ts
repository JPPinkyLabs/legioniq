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
        "Session error",
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
        "Session error",
        userError?.message || "Invalid or expired session."
      );
    }

    // Check if user is approved and get role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_approved, role")
      .eq("id", user.id)
      .single();

    const isApproved = profile?.is_approved ?? false;
    const role = profile?.role ?? "user";

    if (!isApproved) {
      return successResponse({
        session: undefined,
        user: undefined,
        isApproved: false,
        role,
      });
    }

    // Build session from token and user
    return successResponse({
      session: {
        access_token: token,
        refresh_token: "", // Refresh token not available from getUser
        expires_in: 3600,
        expires_at: undefined,
        token_type: "bearer",
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
      },
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
      isApproved: true,
      role,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Session error",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
