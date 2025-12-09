// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";
import { getPromptFromDatabase, buildUserPrompt } from "../_shared/prompts.ts";

interface GetRequestPromptRequest {
  request_id: string;
}

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
        "Get request prompt failed",
        "Authentication required."
      );
    }

    const { request_id }: GetRequestPromptRequest = await req.json();

    if (!request_id || typeof request_id !== "string") {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Get request prompt failed",
        "Request ID is required."
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
        "Get request prompt failed",
        userError?.message || "Invalid or expired session."
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse(
        500,
        "DATABASE_ERROR",
        "Get request prompt failed",
        "Failed to fetch user profile."
      );
    }

    if (profile.role !== "admin") {
      return errorResponse(
        403,
        "FORBIDDEN",
        "Get request prompt failed",
        "Only admins can view request prompts."
      );
    }

    // Fetch request with category and advice
    const { data: request, error: requestError } = await supabaseAdmin
      .from("requests")
      .select(`
        id,
        user_id,
        category_id,
        advice_id,
        ocr_text,
        image_url
      `)
      .eq("id", request_id)
      .single();

    if (requestError || !request) {
      return errorResponse(
        404,
        "NOT_FOUND",
        "Get request prompt failed",
        requestError?.message || "Request not found."
      );
    }

    // Get system prompt from database
    const systemPrompt = await getPromptFromDatabase(supabaseAdmin, request.category_id);

    // Get image count
    const imageCount = Array.isArray(request.image_url) ? request.image_url.length : (request.image_url ? 1 : 0);

    // Reconstruct the user prompt using the same logic
    const userPrompt = await buildUserPrompt(
      supabaseAdmin,
      request.ocr_text || "",
      request.category_id,
      request.advice_id,
      request.user_id,
      imageCount
    );

    return successResponse({
      systemPrompt,
      userPrompt,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Get request prompt failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});

