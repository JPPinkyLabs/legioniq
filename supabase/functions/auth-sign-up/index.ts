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
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Sign up failed",
        "Email, password, and name are required."
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
      return errorResponse(
        400,
        "SIGNUP_FAILED",
        "Sign up failed",
        signUpError?.message || "Failed to create account. Please try again."
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

    // Check if user is approved and get role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_approved, role")
      .eq("id", signUpData.user.id)
      .single();

    const isApproved = profile?.is_approved ?? false;
    const role = profile?.role ?? "user";

    if (!isApproved) {
      // Sign out user if not approved
      if (session) {
        await supabaseAdmin.auth.admin.signOut(session.access_token);
      }

      return successResponse({
        user: {
          id: signUpData.user.id,
          email: signUpData.user.email,
          user_metadata: signUpData.user.user_metadata,
        },
        isApproved: false,
        role,
      });
    }

    // Create session log if approved and session exists
    if (session && isApproved) {
      await supabaseAdmin.from("sessions_log").insert({
        user_id: signUpData.user.id,
      });
    }

    return successResponse({
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
      role,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Sign up failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
