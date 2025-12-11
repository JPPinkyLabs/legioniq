<!-- 5b46d518-76f1-4f0c-a118-110ea7813c1a 8eb6d12d-8b82-4669-b8d2-657fc7000732 -->
# Technical and Operational Handoff Document

## 1. Project Overview

### Application Summary

LegionIQ is an AI-powered gaming assistance platform that analyzes game screenshots using OCR and GPT-4o to provide intelligent recommendations. Users can upload screenshots and receive expert advice across three categories: gameplay help, technical support, and strategic guidance.

### High-Level Architecture

The application follows this architecture flow:

```
Frontend (React + Vite) 
  → Supabase Edge Functions (Backend API)
    → Supabase (Auth, Database, Storage)
      → OCR.space API (Text Extraction)
      → OpenAI GPT-4o (AI Analysis)
```

**Key Flow:**

1. User uploads screenshot(s) via React frontend
2. Frontend calls `extract-ocr` Edge Function with base64 image
3. Edge Function calls OCR.space API to extract text
4. Frontend calls `process-screenshot` Edge Function with OCR text + images
5. Edge Function checks cache, validates limits, uploads images to Supabase Storage
6. Edge Function builds prompts using category, advice, user preferences, and OCR text
7. Edge Function calls OpenAI GPT-4o API
8. Response is cached and saved to database
9. Frontend displays AI response in conversation view

### User Flow Summary

1. **Landing Page** → User browses features
2. **Authentication** → Sign up (invite-only, requires approval) or Sign in
3. **Onboarding** → New users set gaming preferences
4. **Home/Platform** → Main dashboard:

   - Upload screenshot(s)
   - Select category (Gameplay Help, Technical Support, Strategic Advice)
   - Select specific advice type
   - Receive AI analysis
   - View conversation history

5. **History** → Browse past requests with full details
6. **Account** → Manage profile, preferences, avatar, password
7. **Usage** → View daily usage limits and statistics
8. **Admin Panel** → (Admin only) Manage prompts, view all requests

### Architecture Diagram

```
┌─────────────────┐
│  React Frontend │
│  (Vite + TS)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────┐
│  Supabase Edge Functions    │
│  (Deno Runtime)             │
│  - extract-ocr              │
│  - process-screenshot       │
│  - auth-* functions         │
│  - admin functions          │
└────────┬────────────────────┘
         │
    ┌────┴────┬──────────────┬─────────────┐
    │         │              │             │
    ▼         ▼              ▼             ▼
┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│Supabase│ │OCR.space│ │  OpenAI  │ │Supabase  │
│   DB   │ │   API   │ │ GPT-4o   │ │ Storage  │
│        │ │         │ │          │ │          │
│-Users  │ │Text     │ │AI Analysis│ │Screenshots│
│-Requests││Extraction││          │ │Avatars   │
│-Cache  │ │         │ │          │ │          │
│-Profiles││         │ │          │ │          │
└────────┘ └─────────┘ └──────────┘ └──────────┘
```

## 2. Tech Stack & Dependencies

### Frontend Framework

- **Vite** 5.4.19 - Build tool and dev server (NOT Next.js - this is a Vite + React SPA)
- **React** 18.3.1 - UI library
- **TypeScript** 5.8.3 - Type safety
- **React Router** 6.30.1 - Client-side routing

### UI & Styling

- **Tailwind CSS** 3.4.17 - Utility-first CSS
- **shadcn/ui** (Radix UI primitives) - Component library
- **Radix UI** - Accessible component primitives (20+ packages)
- **Lucide React** 0.462.0 - Icon library
- **next-themes** 0.3.0 - Dark/light theme management

### State Management & Data Fetching

- **TanStack Query (React Query)** 5.83.0 - Server state management, API calls
- **Zustand** 5.0.8 - Client state management (auth store)
- **React Hook Form** 7.61.1 - Form handling
- **Zod** 3.25.76 - Schema validation

### Backend & Infrastructure

- **Supabase** 2.81.1 - Backend-as-a-Service
  - Authentication (email/password)
  - PostgreSQL Database
  - Storage (screenshots, avatars)
  - Edge Functions (Deno runtime)

### AI & OCR

- **OpenAI GPT-4o** - AI analysis (via API)
- **OCR.space API** - Text extraction from images
- **AI SDK** 5.0.95 - OpenAI integration helpers

### Additional Libraries

- **date-fns** 3.6.0 - Date formatting
- **react-markdown** 10.1.0 - Markdown rendering
- **recharts** 2.15.4 - Charts and graphs
- **nprogress** 0.2.0 - Progress bar
- **@vercel/analytics** 1.5.0 - Analytics
- **react-image-crop** 11.0.10 - Image cropping
- And 50+ other dependencies (see package.json)

## 3. Codebase Structure

### Frontend Structure (`/src`)

#### `/src/pages` - Route Components

- **`/auth`** - Authentication pages
  - `Auth.tsx` - Main auth page (sign in/up)
  - `components/SignInForm.tsx`, `SignUpForm.tsx` - Forms
  - `components/PendingApprovalModal.tsx` - Shows when user not approved

- **`/landing`** - Public landing page
  - `Landing.tsx` - Main landing component
  - `components/` - Hero, Features, Pricing, CTA, Header, Footer

- **`/platform`** - Authenticated app pages
  - **`/home`** - Main dashboard for screenshot analysis
    - `Home.tsx` - Main component
    - `hooks/` - All business logic hooks
      - `useScreenshotUpload.ts` - Image upload handling
      - `useOCR.ts` - OCR extraction hook
      - `useScreenshotAnalysis.ts` - Main analysis orchestration
      - `useProcessScreenshot.ts` - API call to process-screenshot
      - `useScreenshotSend.ts` - Send button logic
  - **`/history`** - Request history
    - `History.tsx` - List all requests
    - `Details.tsx` - Single request details
    - `hooks/useSignedImageUrl.ts` - Get signed URLs for images
  - **`/account`** - User account management
    - `Account.tsx` - Main account page
    - `components/` - Avatar, password, preferences, stats sections
  - **`/usage`** - Daily usage statistics
    - `Usage.tsx` - Usage dashboard
  - **`/admin`** - Admin-only pages
    - **`/prompts`** - Manage system prompts
    - **`/requests`** - View all user requests

#### `/src/components` - Reusable Components

- **`/ui`** - shadcn/ui components (Button, Card, Dialog, etc.)
- **`/routes`** - Route guards
  - `PrivateRoute.tsx` - Requires auth + approval
  - `AdminRoute.tsx` - Requires admin role
  - `PublicRoute.tsx` - Public pages
- **`/navigation`** - Sidebar, breadcrumbs, navigation
- **`/skeletons`** - Loading skeletons
- **`/features`** - Feature-specific components
- **`/modals`** - Modal dialogs

#### `/src/hooks` - Custom React Hooks

Organized by domain:

- **`/auth`** - Authentication hooks
  - `useAuth.ts` - Auth state management
  - `useUserApproval.ts` - Check if user approved
  - `useUserProfile.ts` - User profile data
  - `useUserStats.ts` - User statistics
- **`/onboarding`** - Onboarding flow hooks
- **`/requests`** - Request data hooks
- **`/usage`** - Daily limit hooks
- **`/rating`** - Rating submission hooks
- **`/avatar`** - Avatar upload/display hooks
- **`/formatting`** - Date/number formatting utilities

#### `/src/stores` - Zustand Stores

- `authStore.ts` - Authentication state (session, user, role, sign in/up/out)

#### `/src/lib` - Utilities

- `api.ts` - API wrapper for Supabase Edge Functions
  - `invoke()` - Call edge function
  - `invokeOrThrow()` - Call with error throwing
  - Standardized error handling
- `utils.ts` - General utilities (cn, etc.)
- `category-colors.ts` - Category color mapping

#### `/src/integrations` - Third-party Integrations

- `supabase/client.ts` - Supabase client instance
- `supabase/types.ts` - Generated database types

#### `/src/contexts` - React Contexts

- `ThemeContext.tsx` - Theme management
- `SettingsModalContext.tsx` - Settings modal state

### Backend Structure (`/supabase`)

#### `/supabase/functions` - Edge Functions

**Shared Utilities (`/_shared`):**

- `supabase-admin.ts` - Admin client creation
- `cors.ts` - CORS headers
- `response.ts` - Standardized response helpers (successResponse, errorResponse)
- `validation.ts` - Input validation functions
- `hash.ts` - Cache key generation (SHA-256 hashing)
- `cache.ts` - Cache check and save operations
- `storage.ts` - Image upload/delete to Supabase Storage
- `openai.ts` - OpenAI API calls
- `prompts.ts` - Prompt building logic
  - `getPromptFromDatabase()` - Fetch system prompt for category
  - `buildUserPrompt()` - Build user prompt with category, advice, preferences, OCR text
  - `getUserPreferences()` - Fetch user gaming preferences
  - `formatUserPreferences()` - Format preferences for prompt
- `daily-limit.ts` - Daily usage limit checking
- `types.ts` - Shared types

**Edge Functions:**

- **`extract-ocr`** - OCR text extraction
  - Receives base64 image
  - Calls OCR.space API
  - Returns extracted text
  - Located: `supabase/functions/extract-ocr/index.ts`

- **`process-screenshot`** - Main screenshot processing
  - Authenticates user
  - Checks approval status
  - Validates daily limits
  - Checks cache
  - Uploads images to storage
  - Builds prompts
  - Calls OpenAI API
  - Saves to database and cache
  - Located: `supabase/functions/process-screenshot/index.ts`

- **Auth Functions:**
  - `auth-sign-up` - User registration (invite-only via approval flag)
  - `auth-sign-in` - User login with approval check
  - `auth-sign-out` - Session termination
  - `auth-session` - Get current session
  - `auth-check-approval` - Check if user approved
  - `verify-user-approval` - Verify approval status

- **Account Functions:**
  - `upload-avatar` - Upload user avatar
  - `delete-avatar` - Delete user avatar
  - `change-password` - Change user password
  - `delete-account` - Delete user account
  - `reset-preferences` - Reset user preferences

- **Admin Functions:**
  - `update-prompt` - Update system prompts
  - `get-request-prompt` - Get prompt used for request

- **Utility Functions:**
  - `get-daily-usage` - Get user's daily usage
  - `submit-rating` - Submit rating for request

#### `/supabase/migrations` - Database Migrations

33 migration files defining:

- `profiles` table - User profiles with `is_approved` and `role` columns
- `requests` table - Analysis requests with prompts, responses, images
- `requests_cache` table - Shared cache for OpenAI responses (7-day expiry)
- `categories` table - Analysis categories
- `category_advices` table - Advice types per category
- `prompts` table - System prompts per category
- `prompts_logs` table - Prompt change history
- `user_preferences` table - User gaming preferences
- `preference_questions` table - Preference question definitions
- `sessions_log` table - Login sessions
- Storage buckets: `screenshots`, `avatars`
- RLS policies for security
- Functions: `handle_new_user()`, `get_daily_usage_status()`, `delete_user_account()`

#### `/supabase/config.toml` - Supabase Configuration

- Project ID
- Edge function JWT verification settings

### Key Implementation Locations

#### OCR Logic

- **Frontend Hook:** `src/pages/platform/home/hooks/useOCR.ts`
- **Edge Function:** `supabase/functions/extract-ocr/index.ts`
- **Integration:** Calls OCR.space API with base64 image

#### GPT Prompt Assembly

- **Location:** `supabase/functions/_shared/prompts.ts`
- **Functions:**
  - `getPromptFromDatabase()` - Gets system prompt for category
  - `buildUserPrompt()` - Assembles user prompt with:
    - Category name and description
    - Advice type name and description
    - User gaming preferences (formatted)
    - OCR text (if available)
    - Image count context

#### Invite-Only Validation

- **Database:** `profiles.is_approved` column (default: `false`)
- **Sign Up:** `supabase/functions/auth-sign-up/index.ts`
  - Creates user account
  - Profile created with `is_approved = false` via trigger
  - User signed out if not approved
  - Returns `isApproved: false` to frontend
- **Sign In:** `supabase/functions/auth-sign-in/index.ts`
  - Checks `profiles.is_approved`
  - Signs out user if not approved
- **Frontend:** 
  - `PrivateRoute.tsx` - Redirects to `/auth` if not approved
  - `useUserApproval.ts` - Hook to check approval status
  - `PendingApprovalModal.tsx` - Shows message to pending users

#### Modules Loading

**Note:** This project does NOT use dynamic module loading like Next.js. It's a Vite SPA with React Router. All components are statically imported.

However, the project uses:

- **Code Splitting:** Vite automatically code-splits route-based chunks
- **Lazy Loading:** Could be added with `React.lazy()` if needed
- **Dynamic Imports:** Not currently used, but Vite supports them

## 4. Environment Variables

### Frontend Environment Variables (`/env.example`)

All frontend env vars must be prefixed with `VITE_` for Vite to expose them.

#### Required Variables

```bash
# Supabase Client Configuration (Public - safe to expose)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"
```

**Location:**

- Local: `.env` file in project root (gitignored)
- Production: Vercel Environment Variables dashboard

**What it does:**

- `VITE_SUPABASE_URL` - Supabase project URL for client connections
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public anon key for client-side Supabase client

**How to get:**

1. Go to Supabase Dashboard → Project Settings → API
2. Copy "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon public" key → `VITE_SUPABASE_PUBLISHABLE_KEY`

**Security:** These are PUBLIC keys designed to be exposed in client-side code. They are protected by Row Level Security (RLS) policies in the database.

### Backend Environment Variables (Supabase Edge Functions)

These are stored as **Secrets** in Supabase Dashboard, NOT in `.env` files.

**Location:** Supabase Dashboard → Project Settings → Edge Functions → Secrets

#### Required Secrets

```bash
# Supabase Admin Access
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# OpenAI Configuration
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"  # Optional, defaults to "gpt-4o"

# OCR.space Configuration
OCR_SPACE_API_KEY="your-ocr-space-api-key"

# Optional: Daily Limit Configuration
DAILY_LIMIT_MAX_IMAGES="15"  # Optional, defaults to 15
```

**What each variable does:**

1. **`SUPABASE_URL`**

   - Supabase project URL
   - Used by Edge Functions to connect to Supabase
   - Same as frontend `VITE_SUPABASE_URL` but without `VITE_` prefix

2. **`SUPABASE_SERVICE_ROLE_KEY`**

   - Admin-level service role key
   - **SECRET** - Never expose in client code
   - Bypasses RLS policies
   - Used by Edge Functions for admin operations
   - Located: Supabase Dashboard → Project Settings → API → "service_role secret"

3. **`OPENAI_API_KEY`**

   - OpenAI API key for GPT-4o access
   - Get from: https://platform.openai.com/api-keys
   - Used in: `supabase/functions/_shared/openai.ts`

4. **`OPENAI_MODEL`**

   - OpenAI model to use (default: "gpt-4o")
   - Optional - defaults to "gpt-4o" if not set
   - Used in: `supabase/functions/_shared/openai.ts`

5. **`OCR_SPACE_API_KEY`**

   - OCR.space API key for text extraction
   - Get from: https://ocr.space/ocrapi/freekey
   - Used in: `supabase/functions/extract-ocr/index.ts`

6. **`DAILY_LIMIT_MAX_IMAGES`**

   - Maximum images per day for non-admin users (default: 15)
   - Optional - defaults to 15 if not set
   - Used in: `supabase/functions/_shared/daily-limit.ts`

### How to Set Secrets in Supabase

1. Go to Supabase Dashboard
2. Navigate to: Project Settings → Edge Functions → Secrets
3. Add each secret as key-value pairs
4. Secrets are automatically available to all Edge Functions via `Deno.env.get()`

### Key Rotation

#### Frontend Keys (VITE_*)

- Rotate in Vercel: Project Settings → Environment Variables
- Update and redeploy
- No downtime if keys are rotated properly

#### Supabase Service Role Key

1. Generate new key in Supabase Dashboard → Project Settings → API
2. Update `SUPABASE_SERVICE_ROLE_KEY` secret in Edge Functions
3. Update any other services using this key
4. **Warning:** Old key is immediately invalidated

#### OpenAI API Key

1. Generate new key in OpenAI Dashboard
2. Update `OPENAI_API_KEY` secret in Supabase
3. Revoke old key after confirming new one works

#### OCR.space API Key

1. Generate new key in OCR.space dashboard
2. Update `OCR_SPACE_API_KEY` secret in Supabase
3. Old key remains valid until manually revoked

### Environment Variable Summary

| Variable | Location | Type | Required | Purpose |

|----------|----------|------|----------|---------|

| `VITE_SUPABASE_URL` | `.env` (local), Vercel (prod) | Public | Yes | Supabase project URL |

| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (local), Vercel (prod) | Public | Yes | Supabase anon key |

| `SUPABASE_URL` | Supabase Secrets | Secret | Yes | Supabase URL for Edge Functions |

| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets | Secret | Yes | Admin access for Edge Functions |

| `OPENAI_API_KEY` | Supabase Secrets | Secret | Yes | OpenAI API access |

| `OPENAI_MODEL` | Supabase Secrets | Secret | No | OpenAI model (default: gpt-4o) |

| `OCR_SPACE_API_KEY` | Supabase Secrets | Secret | Yes | OCR.space API access |

| `DAILY_LIMIT_MAX_IMAGES` | Supabase Secrets | Secret | No | Daily limit (default: 15) |

## Additional Notes

### Deployment

- **Frontend:** Deployed to Vercel (see `vercel.json` for SPA routing config)
- **Edge Functions:** Deployed via `npm run deploy:functions:all` or individually with `supabase functions deploy <name>`
- **Database:** Managed by Supabase (migrations run automatically or manually)

### Authentication Flow

1. User signs up → Account created with `is_approved = false`
2. Admin approves user in database (manually set `is_approved = true` in `profiles` table)
3. User signs in → Checked for approval → Session created if approved
4. All protected routes check `isApproved` status

### Cache System

- Cache keys are based on: category_id, advice_id, OCR text hash, image hash, model
- Cache is shared across all users
- 7-day expiration
- Cache hits still create request records but skip OpenAI API call
- See `docs/cache-system-explanation.md` for details

### Daily Limits

- Non-admin users: Limited by `DAILY_LIMIT_MAX_IMAGES` (default: 15)
- Admin users: Unlimited (bypassed in `process-screenshot` function)
- Limits checked per request, even on cache hits (defense in depth)

---

**Document Version:** 1.0

**Last Updated:** 2025-01-XX

**Maintained by:** [Your Team]

### To-dos

- [ ] Analyze project structure, dependencies, and architecture
- [ ] Create Project Overview section with architecture and user flows
- [ ] Document Tech Stack & Dependencies with all npm packages
- [ ] Document Codebase Structure explaining key folders and file locations
- [ ] Document all Environment Variables with locations and usage
- [ ] Create the markdown document in docs/ folder