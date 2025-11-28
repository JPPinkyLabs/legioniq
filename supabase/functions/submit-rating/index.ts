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
        "Rating failed",
        "Authentication required."
      );
    }

    const { requestId, rating } = await req.json();

    if (!requestId || typeof requestId !== "string") {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Rating failed",
        "Request ID is required."
      );
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Rating failed",
        "Rating must be a number between 1 and 5."
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
        "Rating failed",
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
        "Rating failed",
        "Your account is pending approval."
      );
    }

    // Check if request already has a rating
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from("requests")
      .select("rating")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      return errorResponse(
        400,
        "FETCH_FAILED",
        "Rating failed",
        fetchError.message || "Failed to fetch request."
      );
    }

    if (!existingRequest) {
      return errorResponse(
        404,
        "NOT_FOUND",
        "Rating failed",
        "Request not found."
      );
    }

    // Prevent updating if rating already exists
    if (existingRequest.rating !== null && existingRequest.rating !== undefined) {
      return errorResponse(
        400,
        "ALREADY_RATED",
        "Rating failed",
        "This request already has a rating."
      );
    }

    // Update the request with the rating
    const { data, error } = await supabaseAdmin
      .from("requests")
      .update({ rating })
      .eq("id", requestId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(
        400,
        "UPDATE_FAILED",
        "Rating failed",
        error.message || "Failed to update rating."
      );
    }

    if (!data) {
      return errorResponse(
        400,
        "UPDATE_FAILED",
        "Rating failed",
        "Failed to update rating: No data returned."
      );
    }

    return successResponse(data);
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Rating failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
