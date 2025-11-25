// @ts-nocheck
// deno-lint-ignore-file
export interface AuthResponse {
  success: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, any>;
    };
  };
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  isApproved?: boolean;
  error?: string;
}

export interface CheckApprovalResponse {
  isApproved: boolean;
  error?: string;
}

export interface SessionResponse {
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, any>;
    };
  };
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  isApproved?: boolean;
  error?: string;
}

