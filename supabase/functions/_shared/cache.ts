// @ts-nocheck
// deno-lint-ignore-file

/**
 * Check if a cached result exists for the given cache key
 * @returns Cached data if found and not expired, null otherwise
 */
export async function checkCache(
  supabaseAdmin: any,
  cacheKey: string
): Promise<{ result: any; request_id: string } | null> {
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

/**
 * Save result to cache with 7 day expiration
 */
export async function saveToCache(
  supabaseAdmin: any,
  params: {
    cacheKey: string;
    requestId: string;
    categoryId: string;
    adviceId: string;
    textHash: string;
    imagesKey: string;
    result: { model_response: string; ocr_text: string };
  }
): Promise<void> {
  const { cacheKey, requestId, categoryId, adviceId, textHash, imagesKey, result } = params;
  
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

