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

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Maintained by:** Pinky Labs LLC
