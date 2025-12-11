<!-- 5b46d518-76f1-4f0c-a118-110ea7813c1a 8eb6d12d-8b82-4669-b8d2-657fc7000732 -->
## Pinky Labs LLC — LegionIQ — Final Deliverable Requirements
## Technical & Operational Handoff Document (English)

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

# Database Schema & Functional Flows Documentation

## 5. Database Schema & Tables

The application uses PostgreSQL database managed by Supabase. All tables are in the `public` schema unless otherwise specified.

### Core Tables

#### `auth.users` (Supabase Auth Table)

This is Supabase's built-in authentication table. We don't directly interact with it, but it's referenced by other tables.

- Managed by Supabase Auth
- Contains: `id` (UUID), `email`, `encrypted_password`, `created_at`, `raw_user_meta_data`, etc.
- When a user signs up, a trigger automatically creates a profile in `profiles` table

#### `profiles`

Stores user profile information and approval status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE | User ID (same as auth.users.id) |
| `name` | TEXT | NOT NULL | User's display name |
| `is_approved` | BOOLEAN | NOT NULL, DEFAULT false | Whether user is approved to use the platform (invite-only) |
| `role` | TEXT | NOT NULL, DEFAULT 'user', CHECK (role IN ('admin', 'user')) | User role: 'admin' or 'user' |
| `has_completed_onboarding` | BOOLEAN | NOT NULL, DEFAULT false | Whether user completed onboarding preferences |
| `avatar_url` | TEXT | NULLABLE | URL to user's avatar image in Supabase Storage |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- One-to-one with `auth.users`
- One-to-many with `requests` (via `user_id`)
- One-to-many with `user_preferences` (via `user_id`)

**RLS Policies:**
- Users can view, update, and insert their own profile only

**Triggers:**
- `on_auth_user_created`: Automatically creates profile when user signs up
- `update_profiles_updated_at`: Updates `updated_at` on profile changes

#### `categories`

Stores analysis categories (Gameplay, Technical, Strategy).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Category ID |
| `label` | TEXT | NOT NULL | Display name (e.g., "Gameplay") |
| `description` | TEXT | NOT NULL | Category description |
| `icon_name` | TEXT | NOT NULL | Icon identifier for UI (e.g., "Trophy") |
| `color` | TEXT | NOT NULL, DEFAULT 'gray' | Color identifier for UI (e.g., "blue") |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order for UI display |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- One-to-many with `category_advices`
- One-to-many with `prompts` (via `category_id`)
- One-to-many with `requests` (via `category_id`)

**RLS Policies:**
- All authenticated users can view categories

**Default Data:**
- Gameplay (Trophy icon, blue)
- Technical (Wrench icon, green)
- Strategy (Brain icon, purple)

#### `category_advices`

Stores advice types for each category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Advice ID |
| `category_id` | UUID | NOT NULL, REFERENCES `categories(id)` ON DELETE CASCADE | Parent category |
| `name` | TEXT | NOT NULL | Advice name (e.g., "Combat Efficiency") |
| `description` | TEXT | NOT NULL | Advice description |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order within category |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- Many-to-one with `categories`
- One-to-many with `requests` (via `advice_id`)

**RLS Policies:**
- All authenticated users can view category advices

**Default Data:**
- Gameplay: Combat Efficiency, Resource Management, Movement & Positioning
- Technical: Performance Boost, Bug Diagnosis, Optimal Settings
- Strategy: Attack, Defense, Reinforcement/Support

#### `prompts`

Stores system prompts (system messages) for each category. These are editable by admins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Prompt ID |
| `category_id` | UUID | NOT NULL, UNIQUE, REFERENCES `categories(id)` ON DELETE RESTRICT | One prompt per category |
| `prompt_text` | TEXT | NOT NULL | The system prompt text sent to OpenAI |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `created_by` | UUID | NULLABLE, REFERENCES `auth.users(id)` ON DELETE SET NULL | User who created the prompt |

**Relationships:**
- One-to-one with `categories`
- One-to-many with `prompts_logs` (via `prompt_id`)

**RLS Policies:**
- All authenticated users can view prompts

**Note:** User prompts (user messages) are built dynamically in code (`buildUserPrompt()` function) and cannot be edited via database. See section 8 for details.

#### `prompts_logs`

Audit log for prompt changes. Created when admins update prompts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Log entry ID |
| `prompt_id` | UUID | NOT NULL, REFERENCES `prompts(id)` ON DELETE CASCADE | Related prompt |
| `edited_by` | UUID | NOT NULL, REFERENCES `auth.users(id)` ON DELETE CASCADE | Admin who made the change |
| `category_id` | UUID | NOT NULL, REFERENCES `categories(id)` ON DELETE RESTRICT | Category ID at time of edit |
| `prompt_text` | TEXT | NOT NULL | Prompt text after the edit |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Edit timestamp |

**Relationships:**
- Many-to-one with `prompts`
- Many-to-one with `auth.users` (via `edited_by`)
- Many-to-one with `categories`

**RLS Policies:**
- All authenticated users can view logs
- Admins can insert logs (enforced at application level)

#### `requests`

Stores all screenshot analysis requests and their AI responses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Request ID |
| `user_id` | UUID | NOT NULL, REFERENCES `auth.users(id)` ON DELETE CASCADE | User who made the request |
| `category_id` | UUID | NOT NULL, REFERENCES `categories(id)` ON DELETE RESTRICT | Selected category |
| `advice_id` | UUID | NOT NULL, REFERENCES `category_advices(id)` ON DELETE RESTRICT | Selected advice type |
| `ocr_text` | TEXT | NULLABLE | Text extracted from screenshots via OCR |
| `model_response` | TEXT | NULLABLE | AI response from OpenAI GPT-4o |
| `image_url` | TEXT[] | NULLABLE | Array of screenshot URLs in Supabase Storage (max 5) |
| `system_prompt` | TEXT | NULLABLE | System prompt used for this request (saved for audit) |
| `user_prompt` | TEXT | NULLABLE | User prompt used for this request (saved for audit) |
| `rating` | INTEGER | NULLABLE, CHECK (rating >= 1 AND rating <= 5) | User rating (1-5 stars) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Request timestamp |

**Relationships:**
- Many-to-one with `auth.users`
- Many-to-one with `categories`
- Many-to-one with `category_advices`
- One-to-many with `requests_cache` (optional, via `request_id`)

**RLS Policies:**
- Users can view, create, and update their own requests only

**Indexes:**
- `idx_requests_user_id` - Fast lookup by user
- `idx_requests_category_id` - Fast lookup by category
- `idx_requests_advice_id` - Fast lookup by advice
- `idx_requests_created_at` - Sorted listing (DESC)

#### `requests_cache`

Shared cache for OpenAI responses to reduce API costs. Cache entries expire after 7 days.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `cache_key` | TEXT | PRIMARY KEY | SHA-256 hash of: category_id:advice_id:text_hash:images_key:model |
| `request_id` | UUID | NULLABLE, REFERENCES `requests(id)` ON DELETE SET NULL | First request that created this cache entry |
| `category_id` | UUID | NOT NULL, REFERENCES `categories(id)` ON DELETE CASCADE | Category used |
| `advice_id` | UUID | NOT NULL, REFERENCES `category_advices(id)` ON DELETE CASCADE | Advice used |
| `text_hash` | TEXT | NOT NULL | SHA-256 hash of OCR text |
| `images_key` | TEXT | NOT NULL | SHA-256 hash of all image hashes combined |
| `result` | JSONB | NOT NULL | Cached response: `{"model_response": "...", "ocr_text": "..."}` |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Cache entry creation |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Expiration timestamp (7 days from creation) |

**Relationships:**
- Many-to-one with `requests` (optional)
- Many-to-one with `categories`
- Many-to-one with `category_advices`

**RLS Policies:**
- Only service role (Edge Functions) can access cache

**Indexes:**
- `idx_requests_cache_expires_at` - Cleanup of expired entries
- `idx_requests_cache_category_id` - Category lookup
- `idx_requests_cache_advice_id` - Advice lookup
- `idx_requests_cache_category_text_images` - Composite lookup

**Functions:**
- `cleanup_expired_cache()` - Removes expired cache entries

#### `sessions_log`

Tracks user login sessions for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Log entry ID |
| `user_id` | UUID | NOT NULL, REFERENCES `auth.users(id)` ON DELETE CASCADE | User who logged in |
| `date` | TIMESTAMPTZ | DEFAULT now() | Login timestamp |

**Relationships:**
- Many-to-one with `auth.users`

**RLS Policies:**
- Users can view and create their own session logs only

#### `preference_questions`

Defines onboarding questions for user preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Question ID |
| `question_key` | TEXT | NOT NULL, UNIQUE | Unique identifier (e.g., "preferred_game_genres") |
| `question_text` | TEXT | NOT NULL | Question text shown to user |
| `question_type` | question_type ENUM | NOT NULL | Type: 'single_choice', 'multiple_choice', 'text', 'number', 'range' |
| `options` | JSONB | NULLABLE | For choice questions: `{"options": [{"value": "...", "label": "..."}]}` |
| `is_required` | BOOLEAN | NOT NULL, DEFAULT true | Whether question is mandatory |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order in onboarding |
| `help_text` | TEXT | NULLABLE | Help text for the question |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- One-to-many with `user_preferences` (via `question_key`)

**RLS Policies:**
- All authenticated users can view questions

**Default Questions:**
- `preferred_game_genres` (multiple_choice)
- `primary_platforms` (multiple_choice)
- `primary_goal` (single_choice)
- `gaming_style` (single_choice)

#### `user_preferences`

Stores user answers to preference questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Preference ID |
| `user_id` | UUID | NOT NULL, REFERENCES `auth.users(id)` ON DELETE CASCADE | User |
| `question_key` | TEXT | NOT NULL | References `preference_questions.question_key` |
| `answer_value` | TEXT | NULLABLE | For single_choice and text questions |
| `answer_values` | TEXT[] | NULLABLE | For multiple_choice questions |
| `answer_number` | NUMERIC | NULLABLE | For number and range questions |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Constraints:**
- UNIQUE (`user_id`, `question_key`) - One answer per user per question

**Relationships:**
- Many-to-one with `auth.users`
- Many-to-one with `preference_questions` (via `question_key`)

**RLS Policies:**
- Users can view, insert, update, and delete their own preferences only

**Indexes:**
- `idx_user_preferences_user_id` - Fast lookup by user
- `idx_user_preferences_question_key` - Fast lookup by question

#### `categories_screenshots`

Stores recommended screenshot types for each category (shown in UI as hints).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Screenshot type ID |
| `category_id` | UUID | NOT NULL, REFERENCES `categories(id)` ON DELETE CASCADE | Parent category |
| `name` | TEXT | NOT NULL | Screenshot type name (e.g., "Action Moment") |
| `description` | TEXT | NOT NULL | Description/hint for users |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Sort order |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Relationships:**
- Many-to-one with `categories`

**RLS Policies:**
- All authenticated users can view category screenshots

### Storage Buckets

#### `screenshots`
- Stores uploaded screenshot images
- Path format: `{user_id}/{request_id}/{image_index}.png`
- Access: Private (requires signed URLs)

#### `avatars`
- Stores user avatar images
- Path format: `{user_id}/avatar.png`
- Access: Private (requires signed URLs)

### Database Functions

#### `handle_new_user()`
- **Trigger:** Fired when new user is created in `auth.users`
- **Action:** Automatically creates profile in `profiles` table with `is_approved = false`

#### `get_daily_usage_status(user_id UUID)`
- Returns daily usage statistics for a user
- Used to check if user has exceeded daily limit

#### `delete_user_account(user_id UUID)`
- Deletes user account and all related data (cascade deletes)
- Used by delete account functionality

#### `cleanup_expired_cache()`
- Removes expired entries from `requests_cache`
- Returns count of deleted entries

#### `update_updated_at_column()`
- Generic trigger function to update `updated_at` timestamp
- Used by multiple tables

## 6. Functional Flow Documentation

### 1. Invite-Only Signup Flow

**Step-by-step:**

1. **User submits signup form** (`SignUpForm.tsx`)
   - Provides: email, password, name
   - Frontend calls `auth-sign-up` Edge Function

2. **Edge Function processes signup** (`supabase/functions/auth-sign-up/index.ts`)
   - Creates user account in `auth.users` via Supabase Auth
   - Supabase trigger `on_auth_user_created` automatically creates profile in `profiles` table
   - Profile created with:
     - `is_approved = false` (default)
     - `role = 'user'` (default)
     - `has_completed_onboarding = false`

3. **User is signed out if not approved**
   - Edge Function checks `profiles.is_approved`
   - If `false`, user is immediately signed out
   - Returns `isApproved: false` to frontend

4. **Frontend shows pending approval message**
   - `PendingApprovalModal.tsx` displays message
   - User cannot access platform until approved

5. **Admin approves user** (manual process)
   - Admin goes to Supabase Dashboard → Table Editor → `profiles`
   - Finds user by email
   - Sets `is_approved = true`
   - Optionally sets `role = 'admin'` if needed

6. **User signs in**
   - `auth-sign-in` Edge Function checks `is_approved`
   - If `true`, session is created
   - If `false`, user is signed out again

**Note:** There is no automated approval process or `invited_users` table. Approval is manual via database update.

### 2. Dynamic Module Loading

**Important:** The application does NOT have a dynamic module loading system. This feature was not part of the initial requirements.

**How it actually works:**

- The application is a React SPA with static routes
- All categories and features are hardcoded in the React application
- Categories are loaded from the `categories` database table, but the UI components and routes are statically defined
- To add a new "module" (category/feature), you must:
  1. Add the category to the database (`categories` table)
  2. Create React components and routes manually
  3. Update navigation/routing in `App.tsx`
  4. Add any necessary business logic

**See section 7 for detailed instructions on adding new features.**

### 3. Screenshot Upload Workflow

**Step-by-step:**

1. **User selects image(s)** (`Home.tsx`)
   - User clicks upload area or drags & drops
   - `useScreenshotUpload` hook handles file selection
   - Images converted to base64 strings
   - Maximum 5 images per request

2. **User selects category and advice**
   - Category dropdown (Gameplay, Technical, Strategy)
   - Advice dropdown (filtered by category)
   - Both required before sending

3. **User clicks "Send"** (`useScreenshotSend`)
   - Validates category and advice selected
   - Validates at least one image uploaded
   - Checks daily limit (via `useDailyLimitValidation`)
   - If all valid, proceeds to analysis

4. **OCR Processing** (for each image)
   - `useOCR` hook called with base64 image
   - Calls `extract-ocr` Edge Function
   - Edge Function sends image to OCR.space API
   - Extracted text returned and combined

5. **Screenshot Analysis**
   - `useScreenshotAnalysis` orchestrates the flow
   - Calls `process-screenshot` Edge Function with:
     - Combined OCR text
     - Base64 images
     - Category ID
     - Advice ID

6. **Edge Function processes** (`process-screenshot/index.ts`)
   - Authenticates user
   - Checks approval status
   - Validates daily limit (admins bypassed)
   - Generates cache key
   - Checks cache for existing response
   - If cache miss:
     - Uploads images to Supabase Storage
     - Builds prompts
     - Calls OpenAI API
     - Saves response to cache
   - If cache hit:
     - Uploads images (each user needs own URLs)
     - Reuses cached response
   - Saves request to database
   - Returns response to frontend

7. **Frontend displays response**
   - AI response shown in conversation view
   - Images displayed with signed URLs
   - User can rate the response

### 4. OCR Processing

**Step-by-step:**

1. **Frontend calls OCR** (`useOCR.ts`)
   - Converts image to base64 (if not already)
   - Sends to `extract-ocr` Edge Function

2. **Edge Function validates** (`extract-ocr/index.ts`)
   - Checks authentication
   - Validates base64 image format
   - Validates file size (max 1MB for OCR.space API)
   - Strips data URL prefix if present

3. **Calls OCR.space API**
   - Creates FormData with base64 image
   - Sets language: 'eng'
   - Sets filetype (detected from base64)
   - Sends POST to `https://api.ocr.space/parse/image`
   - Includes `OCR_SPACE_API_KEY` in headers

4. **Processes response**
   - Checks for errors in API response
   - Extracts text from first `ParsedResults` entry
   - Returns empty string if no text found
   - Handles timeout (30s limit)

5. **Frontend receives text**
   - Combined with other images' text (if multiple)
   - Sent to `process-screenshot` for AI analysis

### 5. Prompt Generation for GPT-4o

**There are TWO types of prompts:**

#### System Prompt (Editable in Database)

- Stored in `prompts` table
- One per category
- Fetched by `getPromptFromDatabase()` in `prompts.ts`
- Defines the AI's role and behavior
- Example: "You are a helpful gaming assistant. Analyze the screenshot and provide gameplay advice..."

#### User Prompt (Built Dynamically in Code)

- Built by `buildUserPrompt()` in `prompts.ts`
- Cannot be edited via database
- Must edit code to change structure
- Includes:
  1. Category name and description
  2. Advice type name and description
  3. User gaming preferences (formatted)
  4. OCR text (if available)
  5. Image count context

**Step-by-step prompt assembly:**

1. **Fetch system prompt** (`getPromptFromDatabase()`)
   - Query `prompts` table by `category_id`
   - Returns `prompt_text` for that category

2. **Build user prompt** (`buildUserPrompt()`)
   - Fetches category details from `categories` table
   - Fetches advice details from `category_advices` table
   - Fetches user preferences from `user_preferences` table
   - Formats preferences using `formatUserPreferences()`
   - Constructs prompt string with:
     ```
     "I need an analysis on the [Category]. [Category description]
     
     Specifically, I'm looking for advice on [Advice name]. [Advice description]
     
     [If preferences exist:]
     Considering my gaming profile:
     [formatted preferences]
     
     [If OCR text exists:]
     Below is the text extracted from [X] game screenshot(s):
     [OCR text]
     
     Please analyze all this data and provide helpful recommendations..."
     ```

3. **Send to OpenAI**
   - `callOpenAI()` in `openai.ts`
   - Sends as array:
     - `{ role: "system", content: systemPrompt }`
     - `{ role: "user", content: userPrompt }`
   - Model: GPT-4o (configurable via `OPENAI_MODEL` env var)
   - Temperature: 0.7
   - Max tokens: 1000

4. **Save prompts to request**
   - Both `system_prompt` and `user_prompt` saved to `requests` table
   - Allows audit trail of what was sent to AI

### 6. Response Display

**Step-by-step:**

1. **Frontend receives response**
   - `process-screenshot` returns:
     - `requestId`
     - `ocrText`
     - `aiResponse`
     - `cached` (boolean, if from cache)

2. **Updates conversation view**
   - Adds screenshot entry to conversation
   - Displays uploaded images with signed URLs
   - Shows category and advice badges

3. **Displays AI response**
   - `AIResponse.tsx` component renders markdown
   - Uses `react-markdown` for formatting
   - Supports code blocks, lists, etc.
   - Typing effect animation (optional)

4. **User interaction**
   - User can view full details (navigates to `/platform/history/:id`)
   - User can rate response (1-5 stars)
   - User can upload new screenshots

### 7. Rating System

**Step-by-step:**

1. **User clicks star rating** (`ChatRating.tsx`)
   - Component shows 5 stars
   - User hovers/clicks to select rating (1-5)
   - Only shown if request doesn't already have rating

2. **Frontend submits rating** (`useSubmitRating` hook)
   - Calls `submit-rating` Edge Function
   - Sends: `requestId`, `rating` (1-5)

3. **Edge Function validates** (`submit-rating/index.ts`)
   - Checks authentication
   - Checks user approval
   - Validates rating is 1-5
   - Checks request exists and belongs to user
   - **Prevents re-rating:** If request already has rating, returns error

4. **Updates database**
   - Updates `requests.rating` column
   - Returns updated request data

5. **Frontend updates UI**
   - Shows "Thank you for your feedback!" message
   - Hides rating component
   - Invalidates query cache to refresh data

**Note:** Ratings are one-time only. Users cannot change their rating after submission.

### 8. Logging in Supabase

**Session Logging:**

1. **User signs in** (`auth-sign-in/index.ts`)
   - After successful authentication
   - If user is approved
   - Creates entry in `sessions_log` table:
     - `user_id`
     - `date` (current timestamp)

2. **Analytics use**
   - Can query `sessions_log` to track:
     - Daily active users
     - User login frequency
     - Most active users

**Prompt Edit Logging:**

1. **Admin updates prompt** (`update-prompt/index.ts`)
   - After successful prompt update
   - Creates entry in `prompts_logs` table:
     - `prompt_id`
     - `edited_by` (admin user ID)
     - `category_id`
     - `prompt_text` (new prompt text)
     - `created_at`

2. **Audit trail**
   - All prompt changes are logged
   - Can view history in `prompts_logs` table
   - Tracks who made changes and when

**Edge Function Logging:**

- Edge Functions log to Supabase Dashboard
- View logs: Supabase Dashboard → Edge Functions → [Function Name] → Logs
- Includes console.log statements from functions
- Useful for debugging API calls, errors, etc.

**Database Logging:**

- Supabase automatically logs database queries (for Pro plans)
- View in Supabase Dashboard → Database → Logs
- Useful for performance monitoring

## 7. Adding New Modules

**Important Note:** The application does NOT have a dynamic module/feature system. Adding new modules (categories/features) requires manual code changes in the React application.

### Why No Dynamic Modules?

The initial project requirements did not include a dynamic module loading system. Each new feature/category must be implemented manually in the codebase.

### How to Add a New Category/Feature

**Step 1: Add Category to Database**

1. Go to Supabase Dashboard → Table Editor → `categories`
2. Click "Insert" → "Insert row"
3. Fill in:
   - `label` - Display name (e.g., "Performance")
   - `description` - Category description
   - `icon_name` - Icon identifier for UI (e.g., "Zap")
   - `color` - Color identifier (e.g., "yellow")
   - `display_order` - Sort order number

**Step 2: Add Advice Types**

1. Go to Table Editor → `category_advices`
2. For each advice type, insert row:
   - `category_id` - The UUID from step 1
   - `name` - Advice name (e.g., "FPS Optimization")
   - `description` - Advice description
   - `display_order` - Sort order

**Step 3: Create System Prompt**

1. Go to Table Editor → `prompts`
2. Insert row:
   - `category_id` - The UUID from step 1
   - `prompt_text` - System prompt for this category
   - `created_by` - Your user ID (optional)

**Step 4: Update React Application**

You must manually update the React codebase:

1. **Update category hooks** (`src/hooks/other/useCategories.ts`)
   - Ensure it fetches all categories (should work automatically)

2. **Update UI components** (if needed)
   - Category selector may need updates if filtering is needed
   - Advice selector may need updates

3. **Add category screenshots** (optional)
   - Table Editor → `categories_screenshots`
   - Add recommended screenshot types for this category

**Step 5: Test**

1. Clear browser cache
2. Test category appears in dropdown
3. Test advice types appear for category
4. Test screenshot analysis works with new category
5. Verify AI responses are appropriate

### Limitations

- No automatic UI generation
- Navigation/routes must be updated manually if adding new pages
- Business logic must be coded manually
- Cannot add modules via admin panel

**Future Enhancement Suggestion:** If dynamic modules are needed, consider implementing:
- Admin UI to create categories/prompts
- Dynamic route generation
- Module configuration system

## 8. Editing Prompts

Prompts are critical to the application's functionality as they control what instructions are sent to the AI. There are **two types of prompts** with different editing methods.

### System Prompts (Editable in Supabase)

**What are System Prompts?**
- Define the AI's role and behavior
- One per category
- Stored in `prompts` table
- Sent as `role: "system"` to OpenAI

**How to Edit System Prompts:**

#### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: Table Editor → `prompts`

2. **Find the prompt to edit**
   - Filter by `category_id` or browse all
   - Each category has one prompt

3. **Edit the prompt**
   - Click on the row
   - Click "Edit row"
   - Modify `prompt_text` field
   - Click "Save"

4. **Verify changes**
   - Prompt changes take effect immediately
   - Next request using that category will use new prompt
   - Old requests keep their original prompts (stored in `requests.system_prompt`)

#### Method 2: Via Admin Panel (If Available)

1. **Login as admin**
   - Navigate to `/admin/prompts`

2. **Select category**
   - Click on category to edit

3. **Edit prompt**
   - Modify text in editor
   - Click "Save"

4. **Changes logged**
   - Entry created in `prompts_logs` table
   - Audit trail maintained

#### Method 3: Via SQL (Advanced)

```sql
UPDATE public.prompts
SET prompt_text = 'Your new system prompt text here'
WHERE category_id = 'your-category-uuid-here';
```

**Important Notes:**
- Changes take effect immediately (no deployment needed)
- Old requests keep their prompts (stored in `requests` table)
- Prompt edits are logged in `prompts_logs` table (via admin panel)
- Ensure prompt structure is preserved (role definition, tone, etc.)

### User Prompts (Editable in Code Only)

**What are User Prompts?**
- Built dynamically for each request
- Include: category info, advice info, user preferences, OCR text
- Stored in `requests.user_prompt` after generation
- Sent as `role: "user"` to OpenAI

**Why Not Editable in Database?**
- Structure is complex (includes multiple data sources)
- Logic for building prompt is in code
- Would require significant refactoring to make dynamic

**How to Edit User Prompts:**

1. **Open the file**
   - `supabase/functions/_shared/prompts.ts`

2. **Find the function**
   - `buildUserPrompt()` function (around line 176)

3. **Edit the prompt structure**
   - Modify the string concatenation
   - Change wording, structure, or add/remove sections
   - Example structure:
     ```typescript
     let prompt = `I need an analysis on the ${category.label} category. ${category.description}\n\nSpecifically, I'm looking for advice on ${advice.name.toLowerCase()}. ${advice.description}`;
     
     if (preferencesText && preferencesText.trim().length > 0) {
       prompt += `\n\nConsidering my gaming profile:\n${preferencesText}`;
     }
     
     if (ocrText && ocrText.trim().length > 0) {
       prompt += `\n\nBelow is the text extracted from ${imageCount} game screenshot(s):\n\n${ocrText}\n\nPlease analyze...`;
     }
     ```

4. **Deploy Edge Function**
   ```bash
   supabase functions deploy process-screenshot
   ```
   Or deploy all:
   ```bash
   npm run deploy:functions:all
   ```

5. **Test changes**
   - Make a test request
   - Check `requests.user_prompt` in database to verify new structure

**Important Notes:**
- Changes require Edge Function deployment
- Test thoroughly before deploying to production
- Consider version control for prompt changes
- Preserve dynamic data insertion (category, advice, preferences, OCR)

### Prompt Structure Best Practices

**System Prompt:**
- Define clear role for AI
- Set tone and style expectations
- Specify output format if needed
- Keep focused on category-specific behavior

**User Prompt:**
- Include all relevant context
- Structure information clearly
- Use clear instructions
- Include user preferences for personalization

### Viewing Prompt History

**For System Prompts:**
- Check `prompts_logs` table
- Filter by `category_id` or `prompt_id`
- View `edited_by` and `created_at` for audit trail

**For User Prompts:**
- Check `requests.user_prompt` column
- Each request stores the exact prompt used
- Compare across requests to see differences

### Testing Prompt Changes

1. **Create test request** with new prompt
2. **Check `requests` table** to verify prompts saved correctly
3. **Review AI response** quality
4. **Iterate** if needed

# Operations, Deployment & Security Documentation

## 9. Managing Invited & Approved Users

**Important Note:** There is no `invited_users` table in the database. The invite-only system works through the `is_approved` flag in the `profiles` table.

### User Approval Flow

#### How Users Get Invited/Approved

1. **User self-registers** via the signup form
   - User provides email, password, and name
   - Account is created in `auth.users` (Supabase Auth)
   - Profile is automatically created in `profiles` table via trigger
   - Profile is created with `is_approved = false` by default

2. **User cannot access platform**
   - Frontend checks `is_approved` status
   - If `false`, user sees pending approval message
   - User cannot sign in or access protected routes

3. **Admin approves user manually**
   - Admin must go to Supabase Dashboard
   - Navigate to: Table Editor → `profiles`
   - Find user by email or user ID
   - Edit the row and set `is_approved = true`
   - Save the changes

4. **User can now access platform**
   - User can sign in successfully
   - User can access all protected routes
   - User can use all platform features

### Approving a User

**Step-by-step:**

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to: Table Editor → `profiles`

2. **Find the user**
   - Use the search/filter to find by email
   - Or browse the list and find the user

3. **Edit the profile**
   - Click on the user's row
   - Click "Edit row" button
   - Change `is_approved` from `false` to `true`
   - Optionally change `role` to `'admin'` if needed
   - Click "Save"

4. **Verify approval**
   - User should now be able to sign in
   - User can access the platform

**Alternative: Using SQL**

```sql
-- Approve a user by email
UPDATE public.profiles
SET is_approved = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);

-- Approve and make admin
UPDATE public.profiles
SET is_approved = true, role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Disabling a User

To disable a user (prevent them from accessing the platform):

1. **Go to Supabase Dashboard**
   - Navigate to: Table Editor → `profiles`

2. **Find the user**
   - Search by email or user ID

3. **Edit the profile**
   - Set `is_approved = false`
   - Save

4. **User is immediately disabled**
   - User's session will be invalid on next check
   - User cannot sign in until re-approved

### Deleting a User

**Important:** Deleting a user requires two steps because of the authentication system.

#### Step 1: Delete from Supabase Auth

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication → Users

2. **Find the user**
   - Search by email

3. **Delete the user**
   - Click on the user
   - Click "Delete user" button
   - Confirm deletion

**Note:** Due to CASCADE delete constraints, deleting from `auth.users` should automatically delete the profile in `profiles` table. However, verify this.

#### Step 2: Verify Profile Deletion

1. **Check profiles table**
   - Go to: Table Editor → `profiles`
   - Verify the user's profile is deleted
   - If not deleted (should not happen), manually delete it

**Alternative: Using Database Function**

The application has a `delete_user_account()` function that can be used:

```sql
-- Delete user account and all related data
SELECT public.delete_user_account('user-uuid-here');
```

This function will:
- Delete user from `auth.users`
- Delete profile from `profiles`
- Delete all user requests (cascade)
- Delete user preferences (cascade)
- Delete session logs (cascade)
- Clean up storage files (screenshots, avatars)

### Bulk User Management

**Approve multiple users:**

```sql
-- Approve all pending users
UPDATE public.profiles
SET is_approved = true
WHERE is_approved = false;

-- Approve users by email list
UPDATE public.profiles
SET is_approved = true
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user1@example.com', 'user2@example.com')
);
```

### Exporting User Data / Logs

#### Export User List

1. **Via Supabase Dashboard**
   - Go to: Table Editor → `profiles`
   - Click "Export" button (if available)
   - Choose CSV or JSON format

2. **Via SQL**

```sql
-- Export all users with their approval status
SELECT 
  u.email,
  p.name,
  p.is_approved,
  p.role,
  p.created_at,
  p.has_completed_onboarding
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
ORDER BY p.created_at DESC;
```

#### Export Session Logs

```sql
-- Export session logs
SELECT 
  sl.date,
  u.email,
  p.name
FROM public.sessions_log sl
JOIN auth.users u ON sl.user_id = u.id
JOIN public.profiles p ON u.id = p.id
ORDER BY sl.date DESC;
```

#### Export Request Activity

```sql
-- Export user activity (requests)
SELECT 
  u.email,
  p.name,
  COUNT(r.id) as total_requests,
  MAX(r.created_at) as last_request
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.requests r ON u.id = r.user_id
GROUP BY u.email, p.name
ORDER BY total_requests DESC;
```

## 10. Deployment & Hosting (Vercel)

The frontend application is hosted on Vercel and automatically deploys from the GitHub repository.

### GitHub → Vercel Setup

**Initial Setup:**

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import repository from GitHub
   - Select the `legion-iq` repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install`

3. **Configure Root Directory**
   - If repo is monorepo, specify root directory
   - Otherwise leave default (root)

4. **Environment Variables**
   - Add required environment variables (see below)
   - These are encrypted and only visible in Vercel Dashboard

### Automatic Deployment

**How it works:**

- Vercel is connected to the GitHub repository
- **Any push to `main` branch triggers automatic deployment**
- Vercel builds the application and deploys to production
- Each deployment gets a unique URL and deployment log

**Deployment Process:**

1. Push code to `main` branch on GitHub
2. Vercel detects the push
3. Vercel runs `npm install`
4. Vercel runs `npm run build`
5. Vercel deploys the `dist` folder
6. New deployment goes live (replaces previous)

**Deployment URLs:**

- Production: `https://your-project.vercel.app` (or custom domain)
- Preview deployments: `https://your-project-{hash}.vercel.app` (for PRs)

### Environment Variables in Vercel

**Required Environment Variables:**

The following environment variables **MUST** be set in Vercel:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API → anon public key |

**How to Set Environment Variables:**

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to: Settings → Environment Variables

2. **Add Variable**
   - Click "Add New"
   - Enter variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter variable value
   - Select environments: Production, Preview, Development
   - Click "Save"

3. **Redeploy**
   - After adding/changing variables, trigger a new deployment
   - Go to: Deployments → Click "Redeploy" on latest deployment
   - Or push a commit to trigger automatic deployment

**Important Notes:**

- Environment variables are encrypted at rest
- Never commit environment variables to Git
- Variables prefixed with `VITE_` are exposed to the client (safe for public keys)
- Changes to env vars require redeployment to take effect

### Checking Deployment Logs

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to: Deployments

2. **View Deployment**
   - Click on any deployment to view details
   - See build logs, runtime logs, and status

3. **Build Logs**
   - Shows `npm install` output
   - Shows `npm run build` output
   - Errors will be displayed here

4. **Runtime Logs**
   - Shows server-side logs (if using Vercel Functions)
   - Shows error logs from production
   - Useful for debugging production issues

### Redeploy Process

**Trigger a Redeploy:**

1. **Manual Redeploy**
   - Go to: Deployments → Latest deployment
   - Click "Redeploy" button
   - Select "Use existing Build Cache" or rebuild from scratch
   - Click "Redeploy"

2. **Via Git Push**
   - Make a small change (e.g., update README)
   - Commit and push to `main` branch
   - Vercel automatically deploys

3. **Via Vercel CLI**
   ```bash
   vercel --prod
   ```

### Rollback Process

**Rollback to Previous Deployment:**

1. **Go to Deployments**
   - Navigate to: Deployments → Find a previous successful deployment

2. **Promote to Production**
   - Click "⋯" (three dots) on the deployment
   - Click "Promote to Production"
   - Confirm the rollback

3. **Verify Rollback**
   - Check the production URL
   - Verify the application works correctly

**Important:**
- Rollback only affects the frontend code
- Database and Edge Functions are not affected
- Make sure the previous deployment is compatible with current database schema

### Preview Deployments

**Pull Request Previews:**

- When a PR is created, Vercel creates a preview deployment
- Preview URL is added as a comment in the PR
- Useful for testing changes before merging
- Uses the same environment variables as production (or separate preview vars)

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to: Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - No additional configuration needed

### Monitoring & Analytics

**Vercel Analytics:**

- Go to: Analytics tab in Vercel Dashboard
- View page views, performance metrics
- Requires Vercel Analytics to be enabled in code (already integrated)

## 11. Testing & QA Procedures

Use this checklist to verify all functionality works correctly before releasing to production.

### Pre-Deployment Checklist

#### OCR Endpoint Testing

- [ ] **Upload single image**
  - Upload a screenshot with visible text
  - Verify OCR text is extracted correctly
  - Check for errors in console

- [ ] **Upload multiple images**
  - Upload 2-3 screenshots
  - Verify all images are processed
  - Verify OCR text is combined correctly

- [ ] **Image with no text**
  - Upload image without text
  - Verify returns empty string (not error)
  - Verify analysis still works

- [ ] **Large image handling**
  - Upload image > 1MB
  - Verify appropriate error message
  - Verify file size validation works

- [ ] **Invalid image format**
  - Upload non-image file (if possible)
  - Verify error handling
  - Verify user-friendly error message

#### GPT-4o Response Testing

- [ ] **Response quality**
  - Submit screenshot analysis
  - Verify AI response is relevant
  - Verify response is well-formatted

- [ ] **Response format**
  - Check markdown rendering works
  - Verify code blocks display correctly
  - Verify lists and formatting work

- [ ] **Response time**
  - Verify response arrives within reasonable time (< 30s)
  - Check for timeout errors
  - Verify loading states work

- [ ] **Error handling**
  - Simulate OpenAI API error (if possible)
  - Verify error message is user-friendly
  - Verify error is logged properly

#### Category & Module Selection

- [ ] **Category selection**
  - Verify all categories appear in dropdown
  - Verify categories are sorted correctly
  - Verify category icons/colors display

- [ ] **Advice selection**
  - Select a category
  - Verify advice types filter correctly
  - Verify advice descriptions display

- [ ] **Validation**
  - Try to submit without selecting category
  - Verify validation error appears
  - Try to submit without selecting advice
  - Verify validation error appears

#### Invite-Only Signup Flow

- [ ] **New user signup**
  - Create new account with unique email
  - Verify account is created
  - Verify `is_approved = false` in database
  - Verify user cannot sign in

- [ ] **Pending approval message**
  - Verify pending approval modal appears
  - Verify user cannot access platform
  - Verify user is signed out automatically

- [ ] **Admin approval**
  - Approve user in database (`is_approved = true`)
  - Verify user can now sign in
  - Verify user can access platform

- [ ] **Approved user signin**
  - Sign in with approved account
  - Verify session is created
  - Verify access to protected routes

#### Rating Flow

- [ ] **Submit rating**
  - Complete a screenshot analysis
  - Submit a rating (1-5 stars)
  - Verify rating is saved in database
  - Verify "Thank you" message appears

- [ ] **Rating validation**
  - Try to submit without selecting rating
  - Verify validation works
  - Try to rate same request twice
  - Verify error (already rated)

- [ ] **Rating display**
  - View request in history
  - Verify rating displays correctly
  - Verify rating cannot be changed

#### Storage Uploads

- [ ] **Screenshot upload**
  - Upload screenshots
  - Verify images are uploaded to Supabase Storage
  - Verify images are accessible via signed URLs
  - Verify images display in UI

- [ ] **Multiple images**
  - Upload multiple screenshots (up to 5)
  - Verify all are stored correctly
  - Verify all display in conversation

- [ ] **Avatar upload**
  - Upload avatar image
  - Verify image is stored in `avatars` bucket
  - Verify avatar displays in account page
  - Verify avatar updates correctly

- [ ] **Image deletion**
  - Delete user account (if applicable)
  - Verify images are cleaned up
  - Verify storage quotas are freed

#### Error Handling

- [ ] **Network errors**
  - Simulate network disconnect
  - Verify error messages appear
  - Verify app doesn't crash

- [ ] **API errors**
  - Verify 401 errors (unauthorized)
  - Verify 403 errors (not approved)
  - Verify 429 errors (rate limit)
  - Verify 500 errors (server error)

- [ ] **User-friendly messages**
  - Verify all errors show clear messages
  - Verify technical errors don't leak to users
  - Verify error toasts appear (if applicable)

#### Cache System

- [ ] **Cache hit**
  - Submit same request twice (same images, category, advice)
  - Verify second request uses cache
  - Verify response is faster
  - Verify `cached: true` in response (if logged)

- [ ] **Cache miss**
  - Submit unique request
  - Verify cache is checked
  - Verify OpenAI API is called
  - Verify response is cached for future

#### Daily Limits

- [ ] **Limit enforcement**
  - Submit requests up to daily limit
  - Verify limit is checked correctly
  - Verify limit message appears when exceeded

- [ ] **Admin bypass**
  - Login as admin
  - Verify admin can exceed daily limit
  - Verify unlimited access works

#### User Preferences

- [ ] **Onboarding**
  - Complete onboarding flow
  - Verify preferences are saved
  - Verify preferences are included in prompts

- [ ] **Preference updates**
  - Update preferences in account page
  - Verify changes are saved
  - Verify new requests use updated preferences

### Post-Deployment Checklist

- [ ] **Production URL works**
  - Verify site loads correctly
  - Verify no console errors
  - Verify all assets load

- [ ] **Environment variables**
  - Verify Supabase connection works
  - Verify API calls succeed
  - Verify no missing env var errors

- [ ] **Performance**
  - Check page load times
  - Verify images load efficiently
  - Check bundle size

- [ ] **Mobile responsiveness**
  - Test on mobile device/browser
  - Verify UI is responsive
  - Verify touch interactions work

## 12. Security Guidelines

### Key Protection

#### Never Commit Secrets

**What NOT to commit:**

- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `OPENAI_API_KEY`
- ❌ `OCR_SPACE_API_KEY`
- ❌ Any `.env` files with secrets
- ❌ API keys in code comments
- ❌ Hardcoded credentials

**Safe to commit:**

- ✅ `VITE_SUPABASE_URL` (public URL)
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key - protected by RLS)
- ✅ `env.example` (without actual values)
- ✅ Public configuration files

#### Where to Store Secrets

**Frontend (Vercel):**
- Store in Vercel Dashboard → Settings → Environment Variables
- Only `VITE_*` variables (public keys)

**Backend (Supabase Edge Functions):**
- Store in Supabase Dashboard → Edge Functions → Secrets
- All sensitive keys: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, etc.

**Local Development:**
- Use `.env` file (gitignored)
- Copy from `env.example`
- Never commit `.env`

### Environment Variable Safety

#### Public vs Private Variables

**Public Variables (Safe to expose):**
- `VITE_SUPABASE_URL` - Public project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key (protected by RLS policies)

**Private Variables (Never expose):**
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access, bypasses RLS
- `OPENAI_API_KEY` - Billing access to OpenAI
- `OCR_SPACE_API_KEY` - API access with usage limits

#### Best Practices

1. **Use RLS Policies**
   - Protect data with Row Level Security
   - Don't rely solely on client-side validation
   - Always validate on server (Edge Functions)

2. **Validate Inputs**
   - Validate all user inputs
   - Sanitize data before database insertion
   - Use Zod schemas for type validation

3. **Limit Access**
   - Use least privilege principle
   - Service role key only in Edge Functions
   - Anon key only in frontend

4. **Monitor Usage**
   - Monitor API usage (OpenAI, OCR.space)
   - Set up alerts for unusual activity
   - Review logs regularly

### Key Rotation

#### When to Rotate Keys

- **Security breach suspected**
- **Key accidentally exposed**
- **Employee with access leaves**
- **Regular rotation schedule** (quarterly recommended)

#### Rotating Supabase Keys

**Service Role Key:**

1. Go to Supabase Dashboard → Settings → API
2. Generate new service role key
3. **Important:** Old key is immediately invalidated
4. Update `SUPABASE_SERVICE_ROLE_KEY` in Edge Functions Secrets
5. Test all Edge Functions work
6. Deploy if needed

**Anon/Public Key:**

1. Go to Supabase Dashboard → Settings → API
2. Generate new anon key
3. Update `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel
4. Redeploy frontend
5. Verify application works

#### Rotating OpenAI API Key

1. Go to OpenAI Dashboard → API Keys
2. Create new API key
3. Update `OPENAI_API_KEY` in Supabase Edge Functions Secrets
4. Test screenshot analysis works
5. Revoke old key after confirming new one works

#### Rotating OCR.space API Key

1. Go to OCR.space dashboard
2. Generate new API key
3. Update `OCR_SPACE_API_KEY` in Supabase Edge Functions Secrets
4. Test OCR extraction works
5. Old key remains valid until manually revoked

### Recommended Limits

#### Daily Limits

- **Non-admin users:** 15 images per day (configurable via `DAILY_LIMIT_MAX_IMAGES`)
- **Admin users:** Unlimited
- Limits checked per request (defense in depth)

#### Rate Limiting

- **OpenAI API:** Default rate limits apply (check OpenAI dashboard)
- **OCR.space API:** Free tier has limits (check OCR.space dashboard)
- **Supabase:** Project tier limits apply

#### Storage Limits

- **Screenshots:** Max 5 images per request
- **File size:** Max 1MB per image (OCR.space limit)
- **Storage quota:** Check Supabase Storage usage

#### Best Practices

1. **Monitor usage**
   - Check Supabase usage dashboard
   - Check OpenAI usage dashboard
   - Set up alerts for high usage

2. **Optimize costs**
   - Cache system reduces OpenAI API calls
   - Image compression before upload
   - Clean up expired cache entries

3. **Plan for scaling**
   - Consider upgrading tiers if needed
   - Monitor costs regularly
   - Optimize prompts to reduce token usage

### Additional Security Measures

#### Database Security

- **Row Level Security (RLS)** enabled on all tables
- **Service role key** only in Edge Functions (server-side)
- **Anon key** in frontend (protected by RLS)
- **No direct database access** from frontend for sensitive operations

#### API Security

- **Authentication required** for all Edge Functions (except auth endpoints)
- **User approval checked** before processing requests
- **Input validation** on all endpoints
- **Error messages** don't leak sensitive information

#### Data Protection

- **User data** stored securely in Supabase
- **Images** stored in private buckets (signed URLs only)
- **Passwords** hashed by Supabase Auth
- **No PII** logged in plain text

## 13. IP & Completion Checklist

### Intellectual Property Statement

**All code, assets, and intellectual property in this project belong to Pinky Labs LLC.**

This includes:
- All source code (frontend and backend)
- Database schemas and migrations
- Documentation and specifications
- Design assets and branding
- Configuration files
- Any custom implementations or modifications

**Copyright:** © 2025 PINKY LABS LLC. All rights reserved.

### Repository Cleanliness Confirmation

#### Security Audit Checklist

- [ ] **No exposed API keys in code**
  - Verified: No hardcoded keys in source files
  - Verified: No keys in commit history
  - Verified: `.env` is in `.gitignore`

- [ ] **No exposed secrets in environment files**
  - Verified: `env.example` has no real values
  - Verified: All secrets stored in secure locations (Vercel, Supabase)

- [ ] **No sensitive data in logs**
  - Verified: No API keys in console.log statements
  - Verified: No user passwords or tokens logged

- [ ] **Proper .gitignore configuration**
  - Verified: `.env` files are ignored
  - Verified: `node_modules` is ignored
  - Verified: Build artifacts are ignored

- [ ] **Clean commit history** (if applicable)
  - Verified: No accidental commits with secrets
  - Verified: History is clean or secrets rotated

#### Repository Structure

- [ ] **Documentation complete**
  - Technical handoff document created
  - Database schema documented
  - Functional flows documented
  - Deployment procedures documented

- [ ] **Code quality**
  - TypeScript types defined
  - Error handling implemented
  - Code follows project patterns

- [ ] **Dependencies**
  - `package.json` up to date
  - No security vulnerabilities (run `npm audit`)
  - All dependencies documented

### Delivery Confirmation

#### Core Features Delivered

- [x] **User Authentication**
  - Sign up (invite-only with approval)
  - Sign in with approval check
  - Session management
  - Password change functionality

- [x] **Screenshot Analysis**
  - Image upload (drag & drop, file picker)
  - OCR text extraction
  - AI-powered analysis via GPT-4o
  - Category and advice selection
  - Response display with markdown

- [x] **User Management**
  - Profile management
  - Avatar upload
  - User preferences/onboarding
  - Daily usage tracking

- [x] **History & Requests**
  - Request history view
  - Request details view
  - Rating system
  - Image viewing with signed URLs

- [x] **Admin Features**
  - Admin panel access
  - Prompt editing interface
  - All requests view
  - Request details with prompts

- [x] **Infrastructure**
  - Supabase integration (Auth, DB, Storage)
  - Edge Functions deployment
  - Vercel frontend deployment
  - Cache system implementation

- [x] **Security**
  - Row Level Security (RLS) policies
  - Invite-only approval system
  - Daily usage limits
  - Secure key management

#### Technical Deliverables

- [x] **Database Schema**
  - All tables created and migrated
  - Relationships defined
  - Indexes optimized
  - RLS policies implemented

- [x] **API/Edge Functions**
  - All endpoints implemented
  - Error handling standardized
  - Authentication integrated
  - Logging implemented

- [x] **Frontend Application**
  - React SPA with routing
  - Responsive design
  - Dark/light theme
  - Loading states and skeletons

- [x] **Documentation**
  - Technical handoff document
  - Database schema documentation
  - Functional flow documentation
  - Deployment and operations guide

### Final Handoff Acceptance

#### Handoff Checklist

**Code Delivery:**
- [ ] Source code repository access provided
- [ ] All dependencies documented
- [ ] Build and deployment instructions provided
- [ ] Environment variable setup documented

**Infrastructure Access:**
- [ ] Supabase project access provided
- [ ] Vercel project access provided
- [ ] GitHub repository access provided (if applicable)
- [ ] Admin credentials provided (if applicable)

**Documentation:**
- [ ] Technical documentation reviewed
- [ ] Database schema understood
- [ ] Deployment process understood
- [ ] Security guidelines reviewed

**Testing:**
- [ ] Application tested in production environment
- [ ] All critical flows verified
- [ ] Error handling tested
- [ ] Performance verified

**Knowledge Transfer:**
- [ ] Architecture explained and understood
- [ ] Key design decisions discussed
- [ ] Future enhancements identified
- [ ] Support contact information provided

#### Acceptance Sign-off

**Project:** LegionIQ - AI-Powered Gaming Assistant

**Delivered by:** [Development Team]

**Accepted by:** [Client/Stakeholder]

**Date:** _______________

**Notes:**
- All code and assets remain property of Pinky Labs LLC
- Repository is clean with no exposed secrets
- All features from requirements have been delivered
- Documentation is complete and accurate

---

**Last Updated:** 2025-12-11  