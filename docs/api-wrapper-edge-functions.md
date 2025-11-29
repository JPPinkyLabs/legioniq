# API Wrapper and Edge Functions

This document explains how `src/lib/api.ts` and Supabase Edge Functions communicate using a standardized response format.

## Response Format

All Edge Functions must return responses in this format:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, title: string, message: string }
```

- `error`: Machine-readable code (e.g., "AUTH_REQUIRED", "VALIDATION_ERROR")
- `title`: User-friendly title for toast notifications
- `message`: Detailed error description

## Creating Edge Functions

### Basic Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "AUTH_REQUIRED", "Error title", "Authentication required.");
    }

    // 2. Validate token
    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createAdminClient();
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return errorResponse(401, "INVALID_TOKEN", "Error title", "Invalid session.");
    }

    // 3. Parse and validate body
    const { field1, field2 } = await req.json();
    if (!field1) {
      return errorResponse(400, "VALIDATION_ERROR", "Error title", "field1 is required.");
    }

    // 4. Business logic
    const result = await someOperation();

    // 5. Return success
    return successResponse(result);

  } catch (error: any) {
    return errorResponse(500, "INTERNAL_ERROR", "Error", error?.message || "Unexpected error.");
  }
});
```

### Available Response Helpers

```typescript
successResponse<T>(data: T, status = 200): Response
errorResponse(status: number, error: string, title: string, message: string): Response

// Pre-defined errors
errors.authRequired()           // 401
errors.invalidAuth(message)     // 401
errors.notApproved()            // 403
errors.forbidden(message)       // 403
errors.validation(title, msg)   // 400
errors.notFound(title, msg)     // 404
errors.rateLimit(title, msg)    // 429
errors.internal(title, msg)     // 500
```

## Frontend Usage

### API Wrapper Methods

```typescript
// Returns ApiResponse - handle success/error manually
const response = await api.invoke<DataType>("function-name", body);
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.message);
}

// Throws ApiError on failure
const data = await api.invokeOrThrow<DataType>("function-name", body);
```

### Options

```typescript
api.invoke("endpoint", body, {
  requireAuth: true,      // Add auth token (default: true)
  showErrorToast: false,  // Show toast on error (default: false)
});
```

### Hook Pattern with TanStack Query

**GET requests (useQuery):**

```typescript
export const useDailyUsage = () => {
  return useQuery<DailyUsageStatus>({
    queryKey: ["dailyUsage"],
    queryFn: async () => {
      const response = await api.invoke<DailyUsageStatus>("get-daily-usage");
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed", response);
      }
      return response.data;
    },
  });
};
```

**POST/PUT/DELETE requests (useMutation):**

```typescript
export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitRatingParams) => {
      const response = await api.invoke<RatingData>("submit-rating", params);
      if (!response.success || !response.data) {
        throw new ApiError(response.message || "Failed", response);
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["request", variables.requestId] });
    },
  });
};
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_REQUIRED | 401 | Authentication needed |
| INVALID_TOKEN | 401 | Invalid or expired token |
| NOT_APPROVED | 403 | Account pending approval |
| FORBIDDEN | 403 | No permission |
| VALIDATION_ERROR | 400 | Invalid input |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| DATABASE_ERROR | 500 | Database operation failed |
