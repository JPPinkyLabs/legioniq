// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization header required" }),
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
        JSON.stringify({ success: false, error: userError?.message || "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return new Response(
        JSON.stringify({ success: false, error: "base64Image is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine file extension from base64 or default to png
    const mimeMatch = base64Image.match(/data:image\/(\w+);base64/);
    const extension = mimeMatch ? mimeMatch[1] : "png";
    const fileName = `${userId}/avatar.${extension}`;

    // Clean and validate base64 string
    let base64Data = base64Image.trim();

    if (base64Data.includes(",")) {
      base64Data = base64Data.split(",")[1];
    }

    base64Data = base64Data.replace(/\s/g, "");

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid base64 format for image upload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const binaryString = atob(base64Data);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    if (imageBytes.length > MAX_AVATAR_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: "Image size exceeds 2MB limit" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get current avatar URL to delete old one
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get current profile: " + profileError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upload to storage (upsert to replace if exists)
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(fileName, imageBytes, {
        contentType: `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload-avatar] Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to upload avatar: " + uploadError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId);

    if (updateError) {
      // If update fails, try to delete the uploaded file
      await supabaseAdmin.storage.from("avatars").remove([fileName]);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update profile: " + updateError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete old avatar if it exists and is different
    if (currentProfile?.avatar_url && currentProfile.avatar_url !== urlData.publicUrl) {
      const oldUrlParts = currentProfile.avatar_url.split("/avatars/");
      if (oldUrlParts.length === 2) {
        const oldFilePath = oldUrlParts[1];
        await supabaseAdmin.storage.from("avatars").remove([oldFilePath]);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: urlData.publicUrl,
        oldAvatarUrl: currentProfile?.avatar_url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

