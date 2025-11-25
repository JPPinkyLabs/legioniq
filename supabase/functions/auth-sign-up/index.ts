// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import type { AuthResponse } from "../_shared/types.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, password, and name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Create user account
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError || !signUpData.user) {
      return new Response(
        JSON.stringify({ success: false, error: signUpError?.message || "Failed to create account" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Wait a bit for the profile to be created (if there's a trigger)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get session if available
    let session = null;
    if (signUpData.session) {
      session = signUpData.session;
    } else {
      // Try to get session
      const { data: sessionData } = await supabaseAdmin.auth.getSession();
      session = sessionData?.session || null;
    }

    // Check if user is approved
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_approved")
      .eq("id", signUpData.user.id)
      .single();

    const isApproved = profile?.is_approved ?? false;

    if (!isApproved) {
      // Sign out user if not approved
      if (session) {
        await supabaseAdmin.auth.admin.signOut(session.access_token);
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: signUpData.user.id,
            email: signUpData.user.email,
            user_metadata: signUpData.user.user_metadata,
          },
          isApproved: false,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create session log if approved and session exists
    if (session && isApproved) {
      await supabaseAdmin.from("sessions_log").insert({
        user_id: signUpData.user.id,
      });
    }

    const response: AuthResponse = {
      success: true,
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in || 3600,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: {
          id: signUpData.user.id,
          email: signUpData.user.email,
          user_metadata: signUpData.user.user_metadata,
        },
      } : undefined,
      user: {
        id: signUpData.user.id,
        email: signUpData.user.email,
        user_metadata: signUpData.user.user_metadata,
      },
      isApproved: true,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

