// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_MAX_DAILY_IMAGES = 15;

interface DailyUsageResponse {
  success: boolean;
  data?: {
    can_make_request: boolean;
    current_count: number;
    max_images: number;
    reset_at: string;
    is_unlimited: boolean;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization header required" } as DailyUsageResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: userError?.message || "Invalid authentication" } as DailyUsageResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch user profile" } as DailyUsageResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            can_make_request: true,
            current_count: 0,
            max_images: -1, // -1 indicates unlimited
            reset_at: resetAt.toISOString(),
            is_unlimited: true,
          },
        } as DailyUsageResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: usageError.message } as DailyUsageResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...usageData,
          is_unlimited: false,
        },
      } as DailyUsageResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Internal server error" } as DailyUsageResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

