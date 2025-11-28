// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

interface OCRResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: Array<{
    ParsedText: string;
  }>;
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
        "Text extraction failed",
        "Authentication required."
      );
    }

    const ocrApiKey = Deno.env.get("OCR_SPACE_API_KEY");
    if (!ocrApiKey) {
      console.error('[extract-ocr] OCR_SPACE_API_KEY not found in environment variables');
      return errorResponse(
        500,
        "CONFIG_ERROR",
        "Text extraction failed",
        "OCR service is not configured."
      );
    }
    
    console.log('[extract-ocr] OCR API key found, processing request');

    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      console.error('[extract-ocr] base64Image is missing from request body');
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Text extraction failed",
        "Image is required."
      );
    }
    
    console.log('[extract-ocr] Received base64Image, length:', base64Image?.length || 0);

    // Validate file size: OCR API maximum is 1024KB
    try {
      let base64Data = base64Image.trim();
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }
      base64Data = base64Data.replace(/\s/g, '');
      
      // Calculate actual file size from base64
      const actualFileSizeBytes = (base64Data.length * 3) / 4;
      const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1024KB
      
      if (actualFileSizeBytes > MAX_FILE_SIZE_BYTES) {
        console.error('[extract-ocr] File size exceeds limit:', {
          actualSize: actualFileSizeBytes,
          maxSize: MAX_FILE_SIZE_BYTES,
          base64Length: base64Data.length
        });
        return errorResponse(
          400,
          "FILE_TOO_LARGE",
          "Text extraction failed",
          `File size exceeds maximum limit of 1MB. Actual size: ${Math.round(actualFileSizeBytes / 1024)}KB.`
        );
      }
      
      console.log('[extract-ocr] File size validated:', {
        actualSizeBytes: actualFileSizeBytes,
        actualSizeKB: Math.round(actualFileSizeBytes / 1024),
        maxSizeKB: MAX_FILE_SIZE_BYTES / 1024
      });
    } catch (sizeError) {
      console.error('[extract-ocr] Error validating file size:', sizeError);
      return errorResponse(
        400,
        "INVALID_FORMAT",
        "Text extraction failed",
        "Failed to validate file size. Please ensure the image is a valid base64 encoded image."
      );
    }

    // Ensure base64Image has the data URL prefix
    let base64ToSend = base64Image;
    if (!base64Image.includes(',')) {
      base64ToSend = `data:image/png;base64,${base64Image}`;
    }
    
    const mimeMatch = base64ToSend.match(/data:image\/(\w+);base64/);
    const fileType = mimeMatch ? mimeMatch[1] : 'png';

    console.log('[extract-ocr] Processing image, fileType:', fileType, 'hasDataPrefix:', base64ToSend.includes(','));

    // Create FormData - OCR.space API requires multipart/form-data
    const formData = new FormData();
    formData.append('base64Image', base64ToSend);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', fileType);

    console.log('[extract-ocr] Request prepared, fileType:', fileType, 'base64Length:', base64ToSend.length);

    // Set timeout (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OCR request timeout')), 30000);
    });

    try {
      console.log('[extract-ocr] Sending request to OCR.space API...');
      const fetchPromise = fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': ocrApiKey,
        },
        body: formData,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      console.log('[extract-ocr] Received response, status:', response.status, 'ok:', response.ok);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }
        console.error('[extract-ocr] OCR.space API HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500),
        });
        return errorResponse(
          500,
          "OCR_API_ERROR",
          "Text extraction failed",
          `OCR API error: ${response.status} - ${errorText.substring(0, 200)}`
        );
      }

      const data: OCRResponse = await response.json();

      if (data.IsErroredOnProcessing) {
        let errorMsg = 'OCR processing failed';
        if (data.ErrorMessage) {
          if (Array.isArray(data.ErrorMessage)) {
            errorMsg = data.ErrorMessage.join('. ');
          } else if (typeof data.ErrorMessage === 'string') {
            errorMsg = data.ErrorMessage;
          }
        }
        console.error('[extract-ocr] API error:', errorMsg);
        return errorResponse(
          500,
          "OCR_PROCESSING_ERROR",
          "Text extraction failed",
          errorMsg
        );
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        return successResponse({ ocrText: '' });
      }

      const ocrText = data.ParsedResults[0]?.ParsedText?.trim() || '';

      return successResponse({ ocrText });
    } catch (error: any) {
      if (error.message === 'OCR request timeout' || error.name === 'AbortError') {
        console.error('[extract-ocr] Request timeout after 30 seconds');
        return errorResponse(
          504,
          "TIMEOUT",
          "Text extraction failed",
          "OCR request timeout - the image may be too large or the API is slow."
        );
      }
      console.error('[extract-ocr] Unexpected error in OCR API call:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500),
      });
      throw error;
    }
  } catch (error: any) {
    console.error('[extract-ocr] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause,
    });
    
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Text extraction failed",
      error?.message || "An unexpected error occurred. Please try again."
    );
  }
});
