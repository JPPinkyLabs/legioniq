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
