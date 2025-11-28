import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Standard API response from edge functions
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  title?: string;
  message?: string;
}

/**
 * Options for API calls
 */
export interface ApiOptions {
  /** Whether the endpoint requires authentication (default: true) */
  requireAuth?: boolean;
  /** Whether to show error toast automatically (default: false) */
  showErrorToast?: boolean;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly response?: ApiResponse,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  getUserMessage(): string {
    return this.response?.message || this.response?.error || this.message;
  }

  getTitle(): string {
    return this.response?.title || "Error";
  }
}

/**
 * Get the current session access token
 */
async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Extract error response from FunctionsHttpError
 */
async function extractErrorFromFunctionsError(error: FunctionsHttpError): Promise<ApiResponse> {
  try {
    const errorBody = await error.context.json();
    if (errorBody && typeof errorBody === "object") {
      return {
        success: false,
        error: errorBody.error || "FUNCTION_ERROR",
        title: errorBody.title || "Error",
        message: errorBody.message || errorBody.error || error.message,
      };
    }
  } catch {
    // Ignore parse errors
  }

  return {
    success: false,
    error: "FUNCTION_ERROR",
    title: "Error",
    message: error.message || "An error occurred",
  };
}

/**
 * Invoke a Supabase Edge Function
 */
export async function invoke<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, showErrorToast = false } = options;

  try {
    // Get access token if required
    let accessToken: string | null = null;
    if (requireAuth) {
      accessToken = await getAccessToken();
      if (!accessToken) {
        const errorResponse: ApiResponse<T> = {
          success: false,
          error: "AUTH_REQUIRED",
          title: "Authentication required",
          message: "Please sign in to continue.",
        };
        
        if (showErrorToast) {
          toast.error(errorResponse.title, { description: errorResponse.message });
        }
        
        return errorResponse;
      }
    }

    // Build headers
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // Invoke edge function
    const { data, error } = await supabase.functions.invoke<ApiResponse<T>>(
      functionName,
      { body, headers }
    );

    // Handle Supabase client error
    if (error) {
      let errorResponse: ApiResponse<T>;

      if (error instanceof FunctionsHttpError) {
        errorResponse = await extractErrorFromFunctionsError(error) as ApiResponse<T>;
      } else {
        errorResponse = {
          success: false,
          error: "FUNCTION_ERROR",
          title: "Error",
          message: error.message || "An error occurred",
        };
      }

      if (showErrorToast) {
        toast.error(errorResponse.title || "Error", {
          description: errorResponse.message,
        });
      }

      return errorResponse;
    }

    // Handle null response
    if (!data) {
      const errorResponse: ApiResponse<T> = {
        success: false,
        error: "NO_RESPONSE",
        title: "Error",
        message: "No response from server",
      };

      if (showErrorToast) {
        toast.error(errorResponse.title, { description: errorResponse.message });
      }

      return errorResponse;
    }

    // Handle error response from edge function
    if (!data.success) {
      if (showErrorToast) {
        toast.error(data.title || "Error", {
          description: data.message || data.error || "An error occurred",
        });
      }

      return data;
    }

    // Success
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    const errorResponse: ApiResponse<T> = {
      success: false,
      error: "UNEXPECTED_ERROR",
      title: "Error",
      message: errorMessage,
    };

    if (showErrorToast) {
      toast.error(errorResponse.title, { description: errorMessage });
    }

    return errorResponse;
  }
}

/**
 * Invoke edge function and throw ApiError on failure
 */
export async function invokeOrThrow<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  options: ApiOptions = {}
): Promise<T> {
  const response = await invoke<T>(functionName, body, options);

  if (!response.success) {
    throw new ApiError(
      response.message || response.error || "API call failed",
      response,
      response.error
    );
  }

  return response.data as T;
}

/**
 * Show error toast from ApiError or Error
 */
export function showErrorToast(error: unknown): void {
  if (error instanceof ApiError) {
    toast.error(error.getTitle(), { description: error.getUserMessage() });
  } else if (error instanceof Error) {
    toast.error("Error", { description: error.message });
  } else {
    toast.error("Error", { description: "An error occurred" });
  }
}

/**
 * Show success toast
 */
export function showSuccessToast(title: string, description?: string): void {
  toast.success(title, { description });
}

// Export as namespace
export const api = {
  invoke,
  invokeOrThrow,
  showErrorToast,
  showSuccessToast,
  ApiError,
};

export default api;
