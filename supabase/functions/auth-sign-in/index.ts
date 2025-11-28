// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse, errors } from "../_shared/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Sign in failed",
        "Email and password are required."
      );
    }

    const supabaseAdmin = createAdminClient();

    // Sign in user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return errorResponse(
        401,
        "INVALID_CREDENTIALS",
        "Sign in failed",
        authError?.message || "Invalid email or password."
      );
    }

    // Check if user is approved and get role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_approved, role")
      .eq("id", authData.user.id)
      .single();

    const isApproved = profile?.is_approved ?? false;
    const role = profile?.role ?? "user";

    if (!isApproved) {
      // Sign out user if not approved
      if (authData.session?.access_token) {
        await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      }
      
      return successResponse({
        isApproved: false,
        role,
      });
    }

    // Create session log if approved
    if (authData.session && isApproved) {
      await supabaseAdmin.from("sessions_log").insert({
        user_id: authData.user.id,
      });
    }

    return successResponse({
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
        expires_at: authData.session.expires_at,
        token_type: authData.session.token_type,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          user_metadata: authData.user.user_metadata,
        },
      },
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_metadata: authData.user.user_metadata,
      },
      isApproved: true,
      role,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Sign in failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
