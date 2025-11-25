// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
      return new Response(
        JSON.stringify({ success: false, error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ocrApiKey = Deno.env.get("OCR_SPACE_API_KEY");
    if (!ocrApiKey) {
      console.error('[extract-ocr] OCR_SPACE_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ success: false, error: "OCR API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log('[extract-ocr] OCR API key found, processing request');

    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      console.error('[extract-ocr] base64Image is missing from request body');
      return new Response(
        JSON.stringify({ success: false, error: "base64Image is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log('[extract-ocr] Received base64Image, length:', base64Image?.length || 0);

    // Validate file size: OCR API maximum is 1024KB
    // Base64 encoding increases size by ~33%, so we need to decode to get actual file size
    try {
      let base64Data = base64Image.trim();
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }
      base64Data = base64Data.replace(/\s/g, '');
      
      // Calculate actual file size from base64
      // Base64: 4 characters represent 3 bytes, so size = (base64Length * 3) / 4
      const actualFileSizeBytes = (base64Data.length * 3) / 4;
      const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1024KB
      
      if (actualFileSizeBytes > MAX_FILE_SIZE_BYTES) {
        console.error('[extract-ocr] File size exceeds limit:', {
          actualSize: actualFileSizeBytes,
          maxSize: MAX_FILE_SIZE_BYTES,
          base64Length: base64Data.length
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `File size exceeds maximum limit of 1MB (1024KB). Actual size: ${Math.round(actualFileSizeBytes / 1024)}KB` 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      console.log('[extract-ocr] File size validated:', {
        actualSizeBytes: actualFileSizeBytes,
        actualSizeKB: Math.round(actualFileSizeBytes / 1024),
        maxSizeKB: MAX_FILE_SIZE_BYTES / 1024
      });
    } catch (sizeError) {
      console.error('[extract-ocr] Error validating file size:', sizeError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to validate file size. Please ensure the image is a valid base64 encoded image." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
    // OCR.space expects the full data URL format (data:image/...;base64,...)
    const formData = new FormData();
    formData.append('base64Image', base64ToSend);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', fileType);

    console.log('[extract-ocr] Request prepared, fileType:', fileType, 'base64Length:', base64ToSend.length);

    // Set timeout (30 seconds) - use Promise.race for Deno compatibility
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OCR request timeout')), 30000);
    });

    try {
      console.log('[extract-ocr] Sending request to OCR.space API...');
      const fetchPromise = fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': ocrApiKey,
          // Don't set Content-Type - let fetch set it automatically with boundary for FormData
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
          errorText: errorText.substring(0, 500), // Limit error text length
        });
        return new Response(
          JSON.stringify({
            success: false,
            error: `OCR API HTTP error: ${response.status} - ${errorText.substring(0, 200)}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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
        return new Response(
          JSON.stringify({
            success: false,
            error: errorMsg,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            ocrText: '',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const ocrText = data.ParsedResults[0]?.ParsedText?.trim() || '';

      return new Response(
        JSON.stringify({
          success: true,
          ocrText,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      if (error.message === 'OCR request timeout' || error.name === 'AbortError') {
        console.error('[extract-ocr] Request timeout after 30 seconds');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'OCR request timeout - the image may be too large or the API is slow',
          }),
          {
            status: 504,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      // Log the actual error for debugging
      console.error('[extract-ocr] Unexpected error in OCR API call:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 500),
      });
      throw error;
    }
  } catch (error: any) {
    // Log detailed error information
    console.error('[extract-ocr] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause,
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

