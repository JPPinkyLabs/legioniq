// @ts-nocheck
// deno-lint-ignore-file

export const DEFAULT_MAX_DAILY_IMAGES = 15;

export interface DailyLimitResult {
  exceeded: boolean;
  message?: string;
  details?: {
    retryAfter: string;
    currentCount: number;
    maxImages: number;
    remainingImages: number;
  };
}

/**
 * Check if user has exceeded their daily image limit
 */
export async function checkDailyLimit(
  supabaseAdmin: any,
  userId: string,
  imageCount: number,
  maxDailyImages: number
): Promise<DailyLimitResult> {
  const { data: dailyUsageResult, error: dailyUsageError } = await supabaseAdmin.rpc(
    "get_daily_usage_status",
    {
      p_user_id: userId,
      p_max_images: maxDailyImages,
    }
  );
  
  if (dailyUsageError || !dailyUsageResult) {
    return { exceeded: false };
  }
  
  const currentImages = dailyUsageResult.current_count || 0;
  const totalAfterRequest = currentImages + imageCount;
  
  if (totalAfterRequest > maxDailyImages) {
    const resetTime = new Date(dailyUsageResult.reset_at);
    const remaining = maxDailyImages - currentImages;
    
    return {
      exceeded: true,
      message: `You have reached your daily limit of ${maxDailyImages} images. You have used ${currentImages} images today and tried to add ${imageCount} more. Your limit will reset at ${resetTime.toISOString()}.`,
      details: {
        retryAfter: resetTime.toISOString(),
        currentCount: currentImages,
        maxImages: maxDailyImages,
        remainingImages: remaining > 0 ? remaining : 0,
      }
    };
  }
  
  return { exceeded: false };
}

/**
 * Get maximum daily images from environment or default
 */
export function getMaxDailyImages(): number {
  return parseInt(
    Deno.env.get("DAILY_LIMIT_MAX_IMAGES") || String(DEFAULT_MAX_DAILY_IMAGES),
    10
  ) || DEFAULT_MAX_DAILY_IMAGES;
}

