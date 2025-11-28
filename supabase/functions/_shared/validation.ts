// @ts-nocheck
// deno-lint-ignore-file

const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1024KB (1MB)

/**
 * Validate image file size from base64 string
 * @throws Error if image exceeds maximum size
 */
export function validateImageSize(base64Image: string): void {
  try {
    let base64Data = base64Image.trim();
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
    base64Data = base64Data.replace(/\s/g, '');
    
    const actualFileSizeBytes = (base64Data.length * 3) / 4;
    
    if (actualFileSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Image size exceeds maximum limit of 1MB. Actual size: ${Math.round(actualFileSizeBytes / 1024)}KB.`
      );
    }
  } catch (error: any) {
    if (error.message.includes('exceeds maximum limit')) {
      throw error;
    }
    throw new Error("Failed to validate image size. Please ensure the image is a valid base64 encoded image.");
  }
}

/**
 * Normalize image input to array format
 */
export function normalizeImageArray(imageBase64: string | string[]): string[] {
  return Array.isArray(imageBase64) ? imageBase64 : (imageBase64 ? [imageBase64] : []);
}

/**
 * Normalize OCR text from array or string to single string
 */
export function normalizeOcrText(ocrText?: string | string[]): string {
  if (Array.isArray(ocrText)) {
    return ocrText.join("\n\n--- Image Separator ---\n\n");
  } else if (typeof ocrText === "string") {
    return ocrText;
  }
  return "";
}

/**
 * Validate process screenshot input parameters
 * @returns Error message if validation fails, null if valid
 */
export function validateProcessScreenshotInput(params: {
  category_id?: string;
  advice_id?: string;
  imageBase64?: string | string[];
}): string | null {
  const { category_id, advice_id, imageBase64 } = params;
  const imagesArray = normalizeImageArray(imageBase64 || "");
  
  if (!category_id) {
    return "Category ID is required.";
  }
  
  if (!advice_id) {
    return "Advice ID is required.";
  }
  
  if (imagesArray.length === 0) {
    return "At least one image is required.";
  }
  
  if (imagesArray.length > 5) {
    return "Maximum 5 images per request.";
  }
  
  // Validate each image size
  for (let index = 0; index < imagesArray.length; index++) {
    try {
      validateImageSize(imagesArray[index]);
    } catch (error: any) {
      return `Image ${index + 1}: ${error.message}`;
    }
  }
  
  return null;
}

