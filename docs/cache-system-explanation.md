# Cache System Explanation

## Overview

The cache system stores OpenAI API responses in the Supabase database to reduce API costs and improve response times. Cache entries are shared across all users and expire after 7 days.

## How Cache Works

The cache operates based on a `cache_key` generated from 4 components:

```typescript
cache_key = SHA-256(
  category + ":" + 
  text_hash + ":" + 
  images_key + ":" + 
  model
)
```

### Cache Key Components

1. **category**: One of `'gameplay'`, `'technical'`, or `'strategy'`
2. **text_hash**: SHA-256 hash of `(ocr_text + '|' + user_message)`
3. **images_key**: SHA-256 hash of all image hashes (sorted alphabetically)
4. **model**: OpenAI model used (e.g., `'gpt-4o'`)

---

## Scenarios

### Scenario 1: Sending 5 Images

**How it works:**
1. For each image: calculates individual SHA-256 hash
2. Sorts all hashes alphabetically (for consistency)
3. Joins them with `:` separator → `hash1:hash2:hash3:hash4:hash5`
4. Calculates final hash of the combined string → `images_key`

**Example:**
```
Image 1: hash_abc123
Image 2: hash_def456  
Image 3: hash_ghi789
Image 4: hash_jkl012
Image 5: hash_mno345

After sorting: hash_abc123:hash_def456:hash_ghi789:hash_jkl012:hash_mno345
images_key = SHA-256(combined_string)
```

**Important:**
- Image order doesn't matter
- The same 5 images in any order will generate the same `images_key`
- If any pixel in any image changes, the hash changes completely

---

### Scenario 2: Different Category

**How it works:**
1. The `category` is part of the `cache_key`
2. Same images + same text + different categories = different cache keys

**Example:**
```
✅ Request 1:
- Images: [A, B, C]
- Category: 'gameplay'
- OCR: "Level 10"
- Model: 'gpt-4o'
→ cache_key_1 = SHA-256('gameplay:...')

❌ Request 2 (same images, different category):
- Images: [A, B, C] (same)
- Category: 'technical' ← DIFFERENT
- OCR: "Level 10" (same)
- Model: 'gpt-4o'
→ cache_key_2 = SHA-256('technical:...') ← DIFFERENT!

Result: Cache MISS (different key)
```

---

### Scenario 3: Same Images, Different Order

**How it works:**
1. Image hashes are sorted before combining
2. Different order generates the same `images_key`

**Example:**
```
Request 1: [Img1, Img2, Img3] 
Request 2: [Img3, Img1, Img2]

Both generate the same images_key because:
- Calculates hash of each image
- Sorts alphabetically
- Combines in sorted order

Result: Cache HIT ✅ (same key)
```

---

### Scenario 4: Same Images, Different OCR Text

**How it works:**
1. The `text_hash` is based on `ocr_text + '|' + user_message`
2. Different OCR = different `text_hash` = different `cache_key`

**Example:**
```
Request 1:
- Images: [A, B]
- OCR: "Level 10"
→ text_hash_1 = SHA-256('Level 10|')

Request 2:
- Images: [A, B] (same)
- OCR: "Level 20" ← DIFFERENT
→ text_hash_2 = SHA-256('Level 20|') ← DIFFERENT!

Result: Cache MISS ❌
```

---

### Scenario 5: Same Images + OCR, Different User Message

**How it works:**
1. The `text_hash` includes `user_message`: `ocr_text + '|' + user_message`

**Example:**
```
Request 1:
- OCR: "Level 10"
- user_message: null
→ text_hash = SHA-256('Level 10|')

Request 2:
- OCR: "Level 10" (same)
- user_message: "How to improve?" ← DIFFERENT
→ text_hash = SHA-256('Level 10|How to improve?') ← DIFFERENT!

Result: Cache MISS ❌
```

---

### Scenario 6: Cache HIT - Complete Flow

**Flow when cache is found:**

```typescript
// 1. Generate cache_key (line 202)
const cacheKey = await generateCacheKey(category, textHash, imagesKey, openaiModel);

// 2. Query database (line 297-302)
SELECT result, request_id 
FROM requests_cache 
WHERE cache_key = 'abc123...' 
AND expires_at > now()

// 3. If found (line 304):
if (cachedData && !cacheError) {
  // Extract data from cache
  const cachedModelResponse = cachedResult.model_response;
  const cachedOcrText = cachedResult.ocr_text;
  
  // Still uploads images (each user needs their own request)
  const imageUrls = await uploadAllImagesToStorage(requestId);
  
  // Creates request in database with cached data
  // Returns response WITH cached: true
}
```

**Important:** Even with cache HIT:
- Still uploads images (each request needs its own image URLs)
- Creates a new record in the `requests` table (for user history)
- Uses OpenAI response from cache
- Does NOT call OpenAI API
- Does NOT check daily limit (cache check happens before)

---

### Scenario 7: Cache Expired (7 Days)

**How it works:**
1. When creating cache: `expires_at = now() + 7 days`
2. When checking: `WHERE expires_at > now()`
3. After 7 days, cache is no longer found

**Example:**
```
Day 1: Saves cache with expires_at = 2025-02-07
Day 5: Still finds in cache ✅
Day 8: expires_at < now() → Cache MISS ❌ (needs to call OpenAI again)
```

---

## Visual Summary

```
┌─────────────────────────────────────────────────────┐
│  How cache_key is constructed:                      │
├─────────────────────────────────────────────────────┤
│  1. category: 'gameplay'                            │
│  2. text_hash: SHA-256(ocr_text + '|' + user_msg)  │
│  3. images_key: SHA-256(sorted_hashes_of_images)    │
│  4. model: 'gpt-4o'                                 │
│                                                     │
│  cache_key = SHA-256(category:hash1:hash2:model)   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  What AFFECTS cache (generates different cache_key):│
├─────────────────────────────────────────────────────┤
│  ✓ Different category                               │
│  ✓ Any pixel difference in images                    │
│  ✓ Different OCR text                               │
│  ✓ Different user_message                           │
│  ✓ Different OpenAI model                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  What DOES NOT AFFECT cache (same cache_key):       │
├─────────────────────────────────────────────────────┤
│  ✓ Image order (order doesn't matter)                │
│  ✓ Different user (cache is shared)                  │
│  ✓ Request timestamp                                │
└─────────────────────────────────────────────────────┘
```

## Important Notes

- **Shared Cache**: The cache is shared across all users. If one user sent the same images with the same OCR and category, another user can use the same cached response.

- **Cache Storage**: Cache data is stored in JSONB format:
  ```json
  {
    "model_response": "...",
    "ocr_text": "..."
  }
  ```

- **Non-Fatal**: If saving to cache fails, the request still succeeds (cache save is non-fatal).

- **Daily Limits**: Daily limit checks only happen on cache MISS, not on cache HIT (because no OpenAI API call is needed).

## Database Schema

The cache table structure:

```sql
CREATE TABLE requests_cache (
    cache_key TEXT PRIMARY KEY,
    request_id UUID REFERENCES requests(id),
    category app_category NOT NULL,
    text_hash TEXT NOT NULL,
    images_key TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
```

## Cache Cleanup

Expired cache entries can be cleaned up using the function:

```sql
SELECT cleanup_expired_cache();
```

This function deletes all entries where `expires_at < now()` and returns the count of deleted entries.

