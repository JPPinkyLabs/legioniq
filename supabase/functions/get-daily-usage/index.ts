// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

const DEFAULT_MAX_DAILY_IMAGES = 15;

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
        "Usage data error",
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
        "Usage data error",
        userError?.message || "Invalid or expired session."
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Usage data error",
        "Failed to fetch user profile."
      );
    }

    const isAdmin = profile?.role === "admin";

    // If admin, return unlimited
    if (isAdmin) {
      // Calculate next midnight UTC for consistency
      const now = new Date();
      const resetAt = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));

      return successResponse({
        can_make_request: true,
        current_count: 0,
        max_images: -1, // -1 indicates unlimited
        reset_at: resetAt.toISOString(),
        is_unlimited: true,
      });
    }

    // For non-admin users, get the daily limit from environment
    const maxDailyImages = parseInt(
      Deno.env.get("DAILY_LIMIT_MAX_IMAGES") || String(DEFAULT_MAX_DAILY_IMAGES),
      10
    ) || DEFAULT_MAX_DAILY_IMAGES;

    // Call the existing RPC function with the limit from environment
    const { data: usageData, error: usageError } = await supabaseAdmin.rpc(
      "get_daily_usage_status",
      {
        p_user_id: user.id,
        p_max_images: maxDailyImages,
      }
    );

    if (usageError) {
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Usage data error",
        usageError.message || "Failed to fetch usage data."
      );
    }

    return successResponse({
      ...usageData,
      is_unlimited: false,
    });
  } catch (error: any) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Usage data error",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
