// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import type { UpdatePromptRequest, UpdatePromptResponse } from "../_shared/types.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization header required" } as UpdatePromptResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { prompt_id, category_id, prompt_text }: UpdatePromptRequest = await req.json();

    if (!prompt_id || typeof prompt_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "prompt_id is required" } as UpdatePromptResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!category_id || typeof category_id !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "category_id is required" } as UpdatePromptResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!prompt_text || typeof prompt_text !== "string" || prompt_text.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "prompt_text is required and cannot be empty" } as UpdatePromptResponse),
        {
          status: 400,
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
        JSON.stringify({ success: false, error: userError?.message || "Invalid authentication" } as UpdatePromptResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch user profile" } as UpdatePromptResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (profile.role !== "admin") {
      return new Response(
        JSON.stringify({ success: false, error: "Only admins can update prompts" } as UpdatePromptResponse),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get current prompt to save old values in log and check for changes
    const { data: currentPrompt, error: fetchError } = await supabaseAdmin
      .from("prompts")
      .select("id, category_id, prompt_text, created_at, created_by")
      .eq("id", prompt_id)
      .single();

    if (fetchError || !currentPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: fetchError?.message || "Prompt not found" } as UpdatePromptResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .single();

    if (categoryError || !category) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid category_id" } as UpdatePromptResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if values have changed
    const trimmedPromptText = prompt_text.trim();
    const categoryChanged = category_id !== currentPrompt.category_id;
    const textChanged = trimmedPromptText !== currentPrompt.prompt_text.trim();

    // If no changes, return success without updating
    if (!categoryChanged && !textChanged) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: currentPrompt.id,
            category_id: currentPrompt.category_id,
            prompt_text: currentPrompt.prompt_text,
            created_at: currentPrompt.created_at,
            created_by: currentPrompt.created_by,
          },
        } as UpdatePromptResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: updateError?.message || "Failed to update prompt" } as UpdatePromptResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: updatedPrompt.id,
          category_id: updatedPrompt.category_id,
          prompt_text: updatedPrompt.prompt_text,
          created_at: updatedPrompt.created_at,
          created_by: updatedPrompt.created_by,
        },
      } as UpdatePromptResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Internal server error" } as UpdatePromptResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

