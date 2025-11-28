// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

// Import shared modules
import { generateCacheKey, calculateTextHash, calculateImagesKey } from "../_shared/hash.ts";
import { validateProcessScreenshotInput, normalizeImageArray, normalizeOcrText } from "../_shared/validation.ts";
import { checkCache, saveToCache } from "../_shared/cache.ts";
import { uploadAllImagesToStorage, deleteImagesFromStorage } from "../_shared/storage.ts";
import { callOpenAI, getOpenAIModel } from "../_shared/openai.ts";
import { checkDailyLimit, getMaxDailyImages } from "../_shared/daily-limit.ts";
import { getCategoryLabelFromId, getPromptFromDatabase, buildUserPrompt } from "../_shared/prompts.ts";

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Create a request record in the database
 */
async function createRequest(
  supabaseAdmin: any,
  params: {
    requestId: string;
    userId: string;
    categoryId: string;
    adviceId: string;
    ocrText: string;
    modelResponse: string;
    imageUrls: string[];
  }
): Promise<void> {
  const { requestId, userId, categoryId, adviceId, ocrText, modelResponse, imageUrls } = params;
  
  const { error: insertError } = await supabaseAdmin
    .from("requests")
    .insert({
      id: requestId,
      user_id: userId,
      category_id: categoryId,
      advice_id: adviceId,
      ocr_text: ocrText,
      model_response: modelResponse,
      image_url: imageUrls,
    });
  
  if (insertError) {
    throw new Error("Failed to save request: " + insertError.message);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Step 1: Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "AUTH_REQUIRED", "Screenshot processing failed", "Authentication required.");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return errorResponse(401, "INVALID_TOKEN", "Screenshot processing failed", userError?.message || "Invalid or expired session.");
    }

    // Step 2: Check approval and role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_approved, role")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_approved) {
      return errorResponse(403, "NOT_APPROVED", "Screenshot processing failed", "Your account is pending approval.");
    }

    const userId = user.id;
    const isAdmin = profile.role === "admin";
    const body = await req.json();

    // Step 3: Validate input
    const validationError = validateProcessScreenshotInput(body);
    if (validationError) {
      return errorResponse(400, "VALIDATION_ERROR", "Screenshot processing failed", validationError);
    }

    // Step 4: Normalize data
    const imagesArray = normalizeImageArray(body.imageBase64);
    const normalizedOcrText = normalizeOcrText(body.ocrText);
    const categoryId = body.category_id;
    const adviceId = body.advice_id;

    // Step 5: Check daily limit (skip for admins)
    if (!isAdmin) {
      const maxDailyImages = getMaxDailyImages();
      const limitCheck = await checkDailyLimit(supabaseAdmin, userId, imagesArray.length, maxDailyImages);
      if (limitCheck.exceeded) {
        return errorResponse(429, "DAILY_LIMIT_EXCEEDED", "Daily limit reached", limitCheck.message || "You have reached your daily limit.");
      }
    }

    // Step 6: Generate cache components
    const textHash = await calculateTextHash(normalizedOcrText);
    const imagesKey = await calculateImagesKey(imagesArray);
    const openaiModel = getOpenAIModel();
    const cacheKey = await generateCacheKey(categoryId, adviceId, textHash, imagesKey, openaiModel);

    // Step 7: Check cache
    const cachedData = await checkCache(supabaseAdmin, cacheKey);

    if (cachedData) {
      // Handle cached response
      const cachedResult = cachedData.result;
      const cachedModelResponse = cachedResult.model_response || "";
      const cachedOcrText = cachedResult.ocr_text || normalizedOcrText;

      // Re-check daily limit for cache hits (defense in depth)
      if (!isAdmin) {
        const maxDailyImages = getMaxDailyImages();
        const limitCheck = await checkDailyLimit(supabaseAdmin, userId, imagesArray.length, maxDailyImages);
        if (limitCheck.exceeded) {
          return errorResponse(429, "DAILY_LIMIT_EXCEEDED", "Daily limit reached", limitCheck.message || "You have reached your daily limit.");
        }
      }

      const requestId = generateRequestId();
      let imageUrls: string[] = [];

      try {
        imageUrls = await uploadAllImagesToStorage(supabaseAdmin, imagesArray, userId, requestId);
        await createRequest(supabaseAdmin, {
          requestId,
          userId,
          categoryId,
          adviceId,
          ocrText: cachedOcrText,
          modelResponse: cachedModelResponse,
          imageUrls,
        });

        return successResponse({
          requestId,
          ocrText: cachedOcrText,
          aiResponse: cachedModelResponse,
          cached: true,
        });
      } catch (uploadError: any) {
        if (imageUrls.length > 0) {
          await deleteImagesFromStorage(supabaseAdmin, imageUrls);
        }
        throw new Error("Failed to upload images: " + uploadError?.message);
      }
    }

    // Step 8: Get category and prompt from database
    const categoryLabel = await getCategoryLabelFromId(supabaseAdmin, categoryId);
    const systemPrompt = await getPromptFromDatabase(supabaseAdmin, categoryId);

    // Step 9: Upload images to storage
    const requestId = generateRequestId();
    let imageUrls: string[] = [];

    try {
      imageUrls = await uploadAllImagesToStorage(supabaseAdmin, imagesArray, userId, requestId);
    } catch (uploadError: any) {
      throw new Error("Failed to upload images: " + uploadError?.message);
    }

    // Step 10: Build user prompt and call OpenAI
    const userPrompt = await buildUserPrompt(
      supabaseAdmin,
      normalizedOcrText,
      categoryLabel,
      adviceId,
      userId,
      imagesArray.length
    );

    let aiResponse: string;
    try {
      aiResponse = await callOpenAI(userPrompt, systemPrompt);
    } catch (openaiError: any) {
      if (imageUrls.length > 0) {
        await deleteImagesFromStorage(supabaseAdmin, imageUrls);
      }
      throw openaiError;
    }

    // Step 11: Save request to database
    try {
      await createRequest(supabaseAdmin, {
        requestId,
        userId,
        categoryId,
        adviceId,
        ocrText: normalizedOcrText,
        modelResponse: aiResponse,
        imageUrls,
      });
    } catch (insertError: any) {
      if (imageUrls.length > 0) {
        await deleteImagesFromStorage(supabaseAdmin, imageUrls);
      }
      throw insertError;
    }

    // Step 12: Save to cache
    await saveToCache(supabaseAdmin, {
      cacheKey,
      requestId,
      categoryId,
      adviceId,
      textHash,
      imagesKey,
      result: {
        model_response: aiResponse,
        ocr_text: normalizedOcrText,
      },
    });

    return successResponse({
      requestId,
      ocrText: normalizedOcrText,
      aiResponse,
    });
  } catch (error: any) {
    return errorResponse(500, "INTERNAL_ERROR", "Screenshot processing failed", error?.message || "An unexpected error occurred. Please try again.");
  }
});
