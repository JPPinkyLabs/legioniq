// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_MAX_DAILY_IMAGES = 15;

// Helper: Calculate SHA-256 hash
async function calculateHash(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  let buffer: ArrayBuffer;
  
  if (typeof data === "string") {
    buffer = encoder.encode(data).buffer;
  } else {
    const sliced = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    buffer = new ArrayBuffer(sliced.byteLength);
    new Uint8Array(buffer).set(new Uint8Array(sliced));
  }
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper: Calculate image hash
async function calculateImageHash(base64Image: string): Promise<string> {
  let base64Data = base64Image.trim();
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }
  base64Data = base64Data.replace(/\s/g, "");
  
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    throw new Error("Invalid base64 format");
  }
  
  const binaryString = atob(base64Data);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }
  
  return await calculateHash(imageBytes);
}

// Helper: Normalize image array
function normalizeImageArray(imageBase64: string | string[]): string[] {
  return Array.isArray(imageBase64) ? imageBase64 : (imageBase64 ? [imageBase64] : []);
}

// Helper: Normalize OCR text
function normalizeOcrText(ocrText?: string | string[]): string {
  if (Array.isArray(ocrText)) {
    return ocrText.join("\n\n--- Image Separator ---\n\n");
  } else if (typeof ocrText === "string") {
    return ocrText;
  }
  return "";
}

// Helper: Normalize user message
function normalizeUserMessage(userMessage?: string | null): string | null {
  if (userMessage && typeof userMessage === "string" && userMessage.trim().length > 0) {
    return userMessage.trim();
  }
  return null;
}

// Helper: Calculate text hash
async function calculateTextHash(ocrText: string, userMessage: string | null): Promise<string> {
  const normalizedText = `${ocrText || ""}|${userMessage || ""}`;
  return await calculateHash(normalizedText);
}

// Helper: Calculate images key
async function calculateImagesKey(images: string[]): Promise<string> {
  const imageHashes = await Promise.all(images.map((img) => calculateImageHash(img)));
  const combinedHashes = imageHashes.sort().join(":");
  return await calculateHash(combinedHashes);
}

// Helper: Generate cache key
async function generateCacheKey(
  categoryId: string,
  adviceId: string,
  textHash: string,
  imagesKey: string,
  model: string
): Promise<string> {
  const keyString = `${categoryId}:${adviceId}:${textHash}:${imagesKey}:${model}`;
  return await calculateHash(keyString);
}

// Helper: Validate image file size
function validateImageSize(base64Image: string): void {
  const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1024KB
  
  try {
    let base64Data = base64Image.trim();
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
    base64Data = base64Data.replace(/\s/g, '');
    
    // Calculate actual file size from base64
    // Base64: 4 characters represent 3 bytes, so size = (base64Length * 3) / 4
    const actualFileSizeBytes = (base64Data.length * 3) / 4;
    
    if (actualFileSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Image size exceeds maximum limit of 1MB (1024KB). Actual size: ${Math.round(actualFileSizeBytes / 1024)}KB`
      );
    }
  } catch (error: any) {
    if (error.message.includes('exceeds maximum limit')) {
      throw error;
    }
    throw new Error("Failed to validate image size. Please ensure the image is a valid base64 encoded image.");
  }
}

// Helper: Validate input
function validateProcessScreenshotInput(params: any): void {
  const { category_id, advice_id, imageBase64 } = params;
  const imagesArray = normalizeImageArray(imageBase64);
  
  if (!category_id) {
    throw new Error("Missing required field: category_id is required");
  }
  
  if (!advice_id) {
    throw new Error("Missing required field: advice_id is required");
  }
  
  if (imagesArray.length === 0) {
    throw new Error("Missing required fields: at least one image is required");
  }
  
  if (imagesArray.length > 5) {
    throw new Error("Too many images: maximum 5 images per request");
  }
  
  // Validate each image size
  imagesArray.forEach((image, index) => {
    try {
      validateImageSize(image);
    } catch (error: any) {
      throw new Error(`Image ${index + 1}: ${error.message}`);
    }
  });
}

// Helper: Check cache
async function checkCache(supabaseAdmin: any, cacheKey: string): Promise<any> {
  try {
    const { data, error } = await supabaseAdmin
      .from("requests_cache")
      .select("result, request_id")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn("[cache] Error checking cache (non-fatal):", error);
    return null;
  }
}

// Helper: Save to cache
async function saveToCache(
  supabaseAdmin: any,
  cacheKey: string,
  requestId: string,
  categoryId: string,
  adviceId: string,
  textHash: string,
  imagesKey: string,
  result: { model_response: string; ocr_text: string }
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const { error } = await supabaseAdmin.from("requests_cache").insert({
    cache_key: cacheKey,
    request_id: requestId,
    category_id: categoryId,
    advice_id: adviceId,
    text_hash: textHash,
    images_key: imagesKey,
    result,
    expires_at: expiresAt.toISOString(),
  });
  
  if (error) {
    console.error("[cache] Failed to save cache (non-fatal):", error);
  }
}

// Helper: Check daily limit
async function checkDailyLimit(
  supabaseAdmin: any,
  userId: string,
  imageCount: number,
  maxDailyImages: number
): Promise<void> {
  const { data: dailyUsageResult, error: dailyUsageError } = await supabaseAdmin.rpc(
    "get_daily_usage_status",
    {
      p_user_id: userId,
      p_max_images: maxDailyImages,
    }
  );
  
  if (dailyUsageError || !dailyUsageResult) {
    return;
  }
  
  const currentImages = dailyUsageResult.current_count || 0;
  const totalAfterRequest = currentImages + imageCount;
  
  if (totalAfterRequest > maxDailyImages) {
    const resetTime = new Date(dailyUsageResult.reset_at);
    const remaining = maxDailyImages - currentImages;
    
    throw {
      error: "Daily limit exceeded",
      message: `You have reached your daily limit of ${maxDailyImages} images. You have used ${currentImages} images today and tried to add ${imageCount} more. Your limit will reset at ${resetTime.toISOString()}.`,
      retryAfter: resetTime.toISOString(),
      currentCount: currentImages,
      maxImages: maxDailyImages,
      remainingImages: remaining > 0 ? remaining : 0,
    };
  }
}

// Helper: Get category enum from category_id
async function getCategoryFromId(supabaseAdmin: any, categoryId: string): Promise<string> {
  const { data: categoryData, error: categoryError } = await supabaseAdmin
    .from("categories")
    .select("category")
    .eq("id", categoryId)
    .single();
  
  if (categoryError || !categoryData) {
    throw new Error("Failed to fetch category: " + (categoryError?.message || "Unknown error"));
  }
  
  return categoryData.category;
}

// Helper: Get advice details from advice_id
async function getAdviceFromId(supabaseAdmin: any, adviceId: string): Promise<{ name: string; description: string }> {
  const { data: adviceData, error: adviceError } = await supabaseAdmin
    .from("category_advices")
    .select("name, description")
    .eq("id", adviceId)
    .single();
  
  if (adviceError || !adviceData) {
    throw new Error("Failed to fetch advice: " + (adviceError?.message || "Unknown error"));
  }
  
  return {
    name: adviceData.name,
    description: adviceData.description,
  };
}

// Helper: Get user preferences
async function getUserPreferences(supabaseAdmin: any, userId: string): Promise<any[]> {
  const { data: preferences, error: preferencesError } = await supabaseAdmin
    .from("user_preferences")
    .select("question_key, answer_value, answer_values, answer_number")
    .eq("user_id", userId);
  
  if (preferencesError) {
    console.warn("[preferences] Error fetching user preferences (non-fatal):", preferencesError);
    return [];
  }
  
  return preferences || [];
}

// Helper: Format user preferences for prompt
async function formatUserPreferences(supabaseAdmin: any, preferences: any[]): Promise<string> {
  if (!preferences || preferences.length === 0) {
    return "";
  }
  
  // Get question texts for better context
  const questionKeys = preferences.map(p => p.question_key);
  const { data: questions, error: questionsError } = await supabaseAdmin
    .from("preference_questions")
    .select("question_key, question_text, question_type, options")
    .in("question_key", questionKeys);
  
  if (questionsError) {
    console.warn("[preferences] Error fetching question texts (non-fatal):", questionsError);
  }
  
  const questionsMap = new Map();
  if (questions) {
    questions.forEach(q => questionsMap.set(q.question_key, q));
  }
  
  let formatted = "\n\nUser Gaming Profile:\n";
  
  for (const pref of preferences) {
    const question = questionsMap.get(pref.question_key);
    const questionText = question?.question_text || pref.question_key;
    
    let answerText = "";
    
    if (pref.answer_value) {
      // Single choice or text - try to get label from options
      if (question?.options?.options) {
        const option = question.options.options.find((opt: any) => opt.value === pref.answer_value);
        answerText = option?.label || pref.answer_value;
      } else {
        answerText = pref.answer_value;
      }
    } else if (pref.answer_values && pref.answer_values.length > 0) {
      // Multiple choice - try to get labels from options
      if (question?.options?.options) {
        const labels = pref.answer_values.map((val: string) => {
          const option = question.options.options.find((opt: any) => opt.value === val);
          return option?.label || val;
        });
        answerText = labels.join(", ");
      } else {
        answerText = pref.answer_values.join(", ");
      }
    } else if (pref.answer_number !== null && pref.answer_number !== undefined) {
      answerText = String(pref.answer_number);
    }
    
    if (answerText) {
      formatted += `- ${questionText}: ${answerText}\n`;
    }
  }
  
  return formatted;
}

// Helper: Get prompt from database
async function getPromptFromDatabase(supabaseAdmin: any, categoryId: string): Promise<string> {
  const { data: promptData, error: promptError } = await supabaseAdmin
    .from("prompts")
    .select("prompt_text")
    .eq("category_id", categoryId)
    .single();
  
  if (promptError || !promptData) {
    throw new Error("Failed to fetch prompt: " + (promptError?.message || "Unknown error"));
  }
  
  return promptData.prompt_text;
}

// Helper: Build user prompt
async function buildUserPrompt(
  supabaseAdmin: any,
  ocrText: string,
  userMessage: string | null,
  category: string,
  adviceId: string,
  userId: string,
  imageCount: number
): Promise<string> {
  let prompt = "";
  
  // Get advice details
  const advice = await getAdviceFromId(supabaseAdmin, adviceId);
  
  // Get user preferences
  const preferences = await getUserPreferences(supabaseAdmin, userId);
  const preferencesText = await formatUserPreferences(supabaseAdmin, preferences);
  
  // Add advice type information
  prompt += `Advice Type: ${advice.name}\n`;
  prompt += `Advice Description: ${advice.description}\n\n`;
  
  // Add user preferences if available
  if (preferencesText) {
    prompt += preferencesText + "\n";
  }
  
  if (userMessage) {
    prompt += `User question/request: ${userMessage}\n\n`;
  }
  
  if (ocrText && ocrText.trim().length > 0) {
    if (imageCount > 1) {
      prompt += `Here is the text extracted from ${imageCount} game screenshots:\n\n${ocrText}\n\n`;
    } else {
      prompt += `Here is the text extracted from a game screenshot:\n\n${ocrText}\n\n`;
    }
    prompt += "Please analyze this and provide helpful recommendations.";
  } else {
    if (imageCount > 1) {
      prompt += `I'm analyzing ${imageCount} game screenshots, but no readable text was extracted from them. Please provide general recommendations based on the ${category} category and what you might typically see in game screenshots.`;
    } else {
      prompt += `I'm analyzing a game screenshot, but no readable text was extracted from it. Please provide general recommendations based on the ${category} category and what you might typically see in game screenshots.`;
    }
  }
  
  return prompt;
}

// Helper: Call OpenAI
async function callOpenAI(userPrompt: string, systemPrompt: string): Promise<string> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  const openaiModel = Deno.env.get("OPENAI_MODEL") || "gpt-4o";
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error("OpenAI API failed: " + (data.error?.message || "Unknown error"));
  }
  
  return data.choices[0].message.content;
}

// Helper: Upload image to storage
async function uploadImageToStorage(
  supabaseAdmin: any,
  base64Image: string,
  userId: string,
  requestId: string,
  index: number
): Promise<string> {
  const mimeMatch = base64Image.match(/data:image\/(\w+);base64/);
  const extension = mimeMatch ? mimeMatch[1] : "png";
  const fileName = `${userId}/${requestId}_${index}.${extension}`;
  
  let base64Data = base64Image.trim();
  if (base64Data.includes(",")) {
    base64Data = base64Data.split(",")[1];
  }
  base64Data = base64Data.replace(/\s/g, "");
  
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
    throw new Error("Invalid base64 format for image upload");
  }
  
  const binaryString = atob(base64Data);
  const imageBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    imageBytes[i] = binaryString.charCodeAt(i);
  }
  
  const { error: uploadError } = await supabaseAdmin.storage
    .from("screenshots")
    .upload(fileName, imageBytes, {
      contentType: `image/${extension}`,
      upsert: false,
    });
  
  if (uploadError) {
    throw new Error("Failed to upload image: " + uploadError.message);
  }
  
  const { data: urlData } = supabaseAdmin.storage
    .from("screenshots")
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

// Helper: Upload all images
async function uploadAllImagesToStorage(
  supabaseAdmin: any,
  images: string[],
  userId: string,
  requestId: string
): Promise<string[]> {
  const uploadPromises = images.map((img, index) =>
    uploadImageToStorage(supabaseAdmin, img, userId, requestId, index)
  );
  return await Promise.all(uploadPromises);
}

// Helper: Delete images from storage
async function deleteImagesFromStorage(
  supabaseAdmin: any,
  imageUrls: string[]
): Promise<void> {
  for (const imageUrl of imageUrls) {
    try {
      const urlParts = imageUrl.split("/screenshots/");
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabaseAdmin.storage.from("screenshots").remove([filePath]);
      }
    } catch (error) {
      console.error("[storage] Error deleting image:", error);
    }
  }
}

// Helper: Generate request ID
function generateRequestId(): string {
  return crypto.randomUUID();
}

// Helper: Create request
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
  
  const insertData: any = {
    id: requestId,
    user_id: userId,
    category_id: categoryId,
    advice_id: adviceId,
    ocr_text: ocrText,
    model_response: modelResponse,
    image_url: imageUrls,
  };
  
  const { error: insertError } = await supabaseAdmin
    .from("requests")
    .insert(insertData);
  
  if (insertError) {
    throw new Error("Failed to save request: " + insertError.message);
  }
}

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

    // Check if user is approved
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_approved")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_approved) {
      return new Response(
        JSON.stringify({ success: false, error: "Account pending approval" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    const body = await req.json();

    // Step 1: Validate input
    validateProcessScreenshotInput(body);

    // Step 2: Normalize data
    const imagesArray = normalizeImageArray(body.imageBase64);
    const normalizedOcrText = normalizeOcrText(body.ocrText);
    const categoryId = body.category_id;
    const adviceId = body.advice_id;

    // Step 3: Check daily limit BEFORE cache check (prevents bypass via cache)
    const maxDailyImages =
      parseInt(Deno.env.get("DAILY_LIMIT_MAX_IMAGES") || String(DEFAULT_MAX_DAILY_IMAGES), 10) ||
      DEFAULT_MAX_DAILY_IMAGES;

    try {
      await checkDailyLimit(supabaseAdmin, userId, imagesArray.length, maxDailyImages);
    } catch (error: any) {
      if (error?.error === "Daily limit exceeded") {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.error,
            message: error.message,
            retryAfter: error.retryAfter,
            currentCount: error.currentCount,
            maxImages: error.maxImages,
            remainingImages: error.remainingImages,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    // Step 4: Generate cache components
    const textHash = await calculateTextHash(normalizedOcrText, null);
    const imagesKey = await calculateImagesKey(imagesArray);
    const openaiModel = Deno.env.get("OPENAI_MODEL") || "gpt-4o";
    const cacheKey = await generateCacheKey(categoryId, adviceId, textHash, imagesKey, openaiModel);

    // Step 5: Check cache
    const cachedData = await checkCache(supabaseAdmin, cacheKey);

    if (cachedData) {
      const cachedResult = cachedData.result;
      const cachedModelResponse = cachedResult.model_response || "";
      const cachedOcrText = cachedResult.ocr_text || normalizedOcrText;

      // Check daily limit again for cache hits (defense in depth)
      try {
        await checkDailyLimit(supabaseAdmin, userId, imagesArray.length, maxDailyImages);
      } catch (error: any) {
        if (error?.error === "Daily limit exceeded") {
          return new Response(
            JSON.stringify({
              success: false,
              error: error.error,
              message: error.message,
              retryAfter: error.retryAfter,
              currentCount: error.currentCount,
              maxImages: error.maxImages,
              remainingImages: error.remainingImages,
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        throw error;
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

        return new Response(
          JSON.stringify({
            success: true,
            requestId,
            ocrText: cachedOcrText,
            aiResponse: cachedModelResponse,
            cached: true,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (uploadError: any) {
        if (imageUrls.length > 0) {
          await deleteImagesFromStorage(supabaseAdmin, imageUrls);
        }
        throw new Error("Failed to upload images: " + uploadError?.message);
      }
    }

    // Step 6: Get category enum and prompt from database
    const categoryEnum = await getCategoryFromId(supabaseAdmin, categoryId);
    const systemPrompt = await getPromptFromDatabase(supabaseAdmin, categoryId);

    // Step 7: Upload images to storage
    const requestId = generateRequestId();
    let imageUrls: string[] = [];

    try {
      imageUrls = await uploadAllImagesToStorage(supabaseAdmin, imagesArray, userId, requestId);
    } catch (uploadError: any) {
      throw new Error("Failed to upload images: " + uploadError?.message);
    }

    // Step 8: Build user prompt with advice and preferences
    const userPrompt = await buildUserPrompt(
      supabaseAdmin,
      normalizedOcrText,
      null,
      categoryEnum,
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

    // Step 9: Save request to database
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

    // Step 10: Save to cache (non-blocking)
    const cacheResult = {
      model_response: aiResponse,
      ocr_text: normalizedOcrText,
    };

    await saveToCache(supabaseAdmin, cacheKey, requestId, categoryId, adviceId, textHash, imagesKey, cacheResult);

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        ocrText: normalizedOcrText,
        aiResponse,
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
        error: error?.message || error?.error || "Internal server error",
        ...(error?.error === "Daily limit exceeded" ? {
          message: error.message,
          retryAfter: error.retryAfter,
          currentCount: error.currentCount,
          maxImages: error.maxImages,
          remainingImages: error.remainingImages,
        } : {}),
      }),
      {
        status: error?.error === "Daily limit exceeded" ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

