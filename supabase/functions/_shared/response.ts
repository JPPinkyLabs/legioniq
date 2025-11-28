// @ts-nocheck
// deno-lint-ignore-file
import { corsHeaders } from "./cors.ts";

/**
 * Standard API response format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  title: string;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 */
export function successResponse<T>(data: T, status = 200): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Create an error response
 * @param status - HTTP status code
 * @param error - Error code (e.g., "AUTH_REQUIRED", "VALIDATION_ERROR")
 * @param title - User-friendly title for toast notification
 * @param message - Detailed error message
 */
export function errorResponse(
  status: number,
  error: string,
  title: string,
  message: string
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error,
    title,
    message,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Common error responses
export const errors = {
  // Authentication errors (401)
  authRequired: () =>
    errorResponse(401, "AUTH_REQUIRED", "Authentication required", "Please sign in to continue."),
  
  invalidAuth: (message = "Invalid authentication") =>
    errorResponse(401, "INVALID_AUTH", "Authentication failed", message),

  // Authorization errors (403)
  notApproved: () =>
    errorResponse(403, "NOT_APPROVED", "Account pending", "Your account is pending approval."),
  
  forbidden: (message = "You don't have permission to perform this action.") =>
    errorResponse(403, "FORBIDDEN", "Access denied", message),

  // Validation errors (400)
  validation: (title: string, message: string) =>
    errorResponse(400, "VALIDATION_ERROR", title, message),

  // Not found errors (404)
  notFound: (title: string, message: string) =>
    errorResponse(404, "NOT_FOUND", title, message),

  // Rate limit errors (429)
  rateLimit: (title: string, message: string) =>
    errorResponse(429, "RATE_LIMIT", title, message),

  // Server errors (500)
  internal: (title: string, message = "An unexpected error occurred. Please try again.") =>
    errorResponse(500, "INTERNAL_ERROR", title, message),
};

