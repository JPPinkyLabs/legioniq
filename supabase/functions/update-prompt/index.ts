// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

interface UpdatePromptRequest {
  prompt_id: string;
  category_id: string;
  prompt_text: string;
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
        "Prompt update failed",
        "Authentication required."
      );
    }

    const { prompt_id, category_id, prompt_text }: UpdatePromptRequest = await req.json();

    if (!prompt_id || typeof prompt_id !== "string") {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Prompt update failed",
        "Prompt ID is required."
      );
    }

    if (!category_id || typeof category_id !== "string") {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Prompt update failed",
        "Category ID is required."
      );
    }

    if (!prompt_text || typeof prompt_text !== "string" || prompt_text.trim().length === 0) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Prompt update failed",
        "Prompt text is required and cannot be empty."
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
        "Prompt update failed",
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
        "Prompt update failed",
        "Failed to fetch user profile."
      );
    }

    if (profile.role !== "admin") {
      return errorResponse(
        403,
        "FORBIDDEN",
        "Prompt update failed",
        "Only admins can update prompts."
      );
    }

    // Get current prompt to save old values in log and check for changes
    const { data: currentPrompt, error: fetchError } = await supabaseAdmin
      .from("prompts")
      .select("id, category_id, prompt_text, created_at, created_by")
      .eq("id", prompt_id)
      .single();

    if (fetchError || !currentPrompt) {
      return errorResponse(
        404,
        "NOT_FOUND",
        "Prompt update failed",
        fetchError?.message || "Prompt not found."
      );
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .single();

    if (categoryError || !category) {
      return errorResponse(
        400,
        "INVALID_CATEGORY",
        "Prompt update failed",
        "Invalid category ID."
      );
    }

    // Check if values have changed
    const trimmedPromptText = prompt_text.trim();
    const categoryChanged = category_id !== currentPrompt.category_id;
    const textChanged = trimmedPromptText !== currentPrompt.prompt_text.trim();

    // If no changes, return success without updating
    if (!categoryChanged && !textChanged) {
      return successResponse({
        id: currentPrompt.id,
        category_id: currentPrompt.category_id,
        prompt_text: currentPrompt.prompt_text,
        created_at: currentPrompt.created_at,
        created_by: currentPrompt.created_by,
      });
    }

    // Update prompt only if values changed
    const { data: updatedPrompt, error: updateError } = await supabaseAdmin
      .from("prompts")
      .update({
        category_id,
        prompt_text: trimmedPromptText,
      })
      .eq("id", prompt_id)
      .select()
      .single();

    if (updateError || !updatedPrompt) {
      return errorResponse(
        400,
        "UPDATE_FAILED",
        "Prompt update failed",
        updateError?.message || "Failed to update prompt."
      );
    }

    // Create log entry with NEW values (after update) only if update was made
    const { error: logError } = await supabaseAdmin
      .from("prompts_logs")
      .insert({
        prompt_id,
        edited_by: user.id,
        category_id: category_id, // NEW category_id
        prompt_text: trimmedPromptText, // NEW prompt_text
      });

    if (logError) {
      // Log error but don't fail the update
      console.error("Failed to create prompt log:", logError);
    }

    return successResponse({
      id: updatedPrompt.id,
      category_id: updatedPrompt.category_id,
      prompt_text: updatedPrompt.prompt_text,
      created_at: updatedPrompt.created_at,
      created_by: updatedPrompt.created_by,
    });
  } catch (error) {
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Prompt update failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
