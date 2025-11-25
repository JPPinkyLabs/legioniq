# Edge Functions Deployment Guide

## Prerequisites

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Authenticate with Supabase**:
   ```bash
   supabase login
   ```

3. **Link project to Supabase** (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   The `project-ref` can be found in your Supabase project Dashboard URL:
   `https://supabase.com/dashboard/project/[project-ref]`

## Configure Secrets in Supabase Dashboard

**IMPORTANT:** Before deploying, configure the required secrets:

1. Go to: `https://supabase.com/dashboard/project/[your-project-id]/settings/functions`
2. Click on "Secrets" or "Environment Variables"
3. Add the following secrets:

### Required Secrets:
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (found in Settings > API > Service Role Key)
- `OPENAI_API_KEY` - OpenAI API key (required for process-screenshot function)
- `OCR_SPACE_API_KEY` - OCR.space API key (required for extract-ocr function)

### Optional Secrets:
- `OPENAI_MODEL` - OpenAI model (e.g., `gpt-4o`, defaults to `gpt-4o` if not set)
- `DAILY_LIMIT_MAX_IMAGES` - Daily image limit (e.g., `15`, defaults to `15` if not set)

## Deployment Options

### 1. Deploy ALL functions at once (Recommended)

```bash
npm run deploy:functions:all
```

This command deploys all edge functions:
- auth-sign-in
- auth-sign-up
- auth-sign-out
- auth-session
- auth-check-approval
- verify-user-approval
- delete-account
- change-password
- submit-rating
- process-screenshot
- upload-avatar
- delete-avatar
- extract-ocr

### 2. Deploy by category

**Authentication functions only:**
```bash
npm run deploy:functions:auth
```

**Account functions only:**
```bash
npm run deploy:functions:account
```

### 3. Individual deployment

```bash
# Authentication
npm run deploy:function:auth-sign-in
npm run deploy:function:auth-sign-up
npm run deploy:function:auth-sign-out
npm run deploy:function:auth-session
npm run deploy:function:auth-check-approval

# Account
npm run deploy:function:verify-user-approval
npm run deploy:function:delete-account
npm run deploy:function:change-password
npm run deploy:function:submit-rating

```

## Verify Deployment

After deployment, you can verify:

1. **In Supabase Dashboard:**
   - Go to: `https://supabase.com/dashboard/project/[your-project-id]/functions`
   - Check if all functions appear as "Active"

2. **Via CLI:**
   ```bash
   supabase functions list
   ```

3. **View function logs:**
   ```bash
   supabase functions logs auth-sign-in
   ```

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets are configured in the Dashboard

### Error: "Project not linked"
- Run: `supabase link --project-ref your-project-ref`

### Error: "Not authenticated"
- Run: `supabase login`

### Check project status:
```bash
supabase status
```

## Recommended Deployment Order

If deploying for the first time, follow this order:

1. **First:** Basic authentication functions
   ```bash
   npm run deploy:function:auth-sign-in
   npm run deploy:function:auth-sign-up
   ```

2. **Second:** Verification functions
   ```bash
   npm run deploy:function:verify-user-approval
   npm run deploy:function:auth-check-approval
   ```

3. **Third:** Remaining functions
   ```bash
   npm run deploy:functions:all
   ```

## Local Development

**IMPORTANT:** When running `npm run dev`, the app uses the **deployed** edge functions from Supabase Dashboard, NOT the local files in `supabase/functions`.

### To test edge functions locally before deploying:

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Serve edge functions locally:**
   ```bash
   supabase functions serve
   ```

3. **Update your `.env` to point to local Supabase:**
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
   ```

4. **Set local secrets:**
   ```bash
   supabase secrets set OCR_SPACE_API_KEY=your-key
   supabase secrets set OPENAI_API_KEY=your-key
   # etc...
   ```

**Note:** For most development, it's easier to just deploy functions directly to your Supabase project and test there.

## Important Notes

- **Secrets are required:** Without configured secrets, functions will not work
- **Incremental deployment:** You can deploy individual functions without affecting others
- **Logs:** Use `supabase functions logs [function-name]` to debug issues
- **Service Role Key:** Never share or commit the Service Role Key - it has full database access
- **Local vs Deployed:** `npm run dev` uses deployed functions, not local files

