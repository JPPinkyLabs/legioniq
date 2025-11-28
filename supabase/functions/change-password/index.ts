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
        "Password change failed",
        "Authentication required."
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Password change failed",
        "Current password and new password are required."
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user || !user.email) {
      return errorResponse(
        401,
        "INVALID_TOKEN",
        "Password change failed",
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
        "Password change failed",
        "Your account is pending approval."
      );
    }

    // Validate current password by attempting to sign in
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return errorResponse(
        400,
        "INVALID_PASSWORD",
        "Password change failed",
        "Current password is incorrect."
      );
    }

    // Update password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      return errorResponse(
        400,
        "UPDATE_FAILED",
        "Password change failed",
        updateError.message || "Failed to update password. Please try again."
      );
    }

    // Re-authenticate user with new password to get a fresh session
    const { data: newAuthData, error: reAuthError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: newPassword,
    });

    if (reAuthError || !newAuthData.session) {
      // Password was changed but couldn't get new session - user will need to re-login
      return successResponse({
        passwordChanged: true,
        sessionRefreshed: false,
      });
    }

    // Return the new session so client can update
    return successResponse({
      passwordChanged: true,
      sessionRefreshed: true,
      session: {
        access_token: newAuthData.session.access_token,
        refresh_token: newAuthData.session.refresh_token,
        expires_in: newAuthData.session.expires_in || 3600,
        expires_at: newAuthData.session.expires_at,
        token_type: newAuthData.session.token_type,
      },
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Password change failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
