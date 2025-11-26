// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import type { SessionResponse } from "../_shared/types.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
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
        JSON.stringify({ error: userError?.message || "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is approved and get role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_approved, role")
      .eq("id", user.id)
      .single();

    const isApproved = profile?.is_approved ?? false;
    const role = profile?.role ?? "user";

    if (!isApproved) {
      return new Response(
        JSON.stringify({
          session: undefined,
          user: undefined,
          isApproved: false,
          role: role,
          error: "Account pending approval",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build session from token and user
    const response: SessionResponse = {
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
      role: role,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

