# Cache System

The cache system stores OpenAI API responses in the database to reduce API costs and improve response times. Cache entries are shared across all users and expire after 7 days.

## Cache Key Generation

The cache key is a SHA-256 hash of 5 components:

```typescript
cache_key = SHA-256(category_id + ":" + advice_id + ":" + text_hash + ":" + images_key + ":" + model)
```

### Components

| Component | Description |
|-----------|-------------|
| `category_id` | UUID of the selected category |
| `advice_id` | UUID of the selected advice type |
| `text_hash` | SHA-256 hash of the OCR text |
| `images_key` | SHA-256 hash of all image hashes (sorted) |
| `model` | OpenAI model (e.g., "gpt-4o") |

### Images Key Calculation

1. Calculate SHA-256 hash of each image's binary data
2. Sort hashes alphabetically
3. Join with `:` separator
4. Calculate final hash of combined string

```
Image hashes: [hash_c, hash_a, hash_b]
Sorted: hash_a:hash_b:hash_c
images_key = SHA-256("hash_a:hash_b:hash_c")
```

Image order does not affect the cache key.

## Cache Behavior

### Cache HIT

When a matching cache entry exists:

1. Retrieves cached `model_response` and `ocr_text`
2. Still uploads images (each user needs their own URLs)
3. Creates new request record with cached data
4. Returns response with `cached: true`
5. Does NOT call OpenAI API

### Cache MISS

When no cache entry exists:

1. Checks daily limit
2. Uploads images to storage
3. Calls OpenAI API
4. Saves request to database
5. Saves result to cache (7-day expiration)
6. Returns response

## What Affects Cache

Different cache key generated when any of these change:

- Category ID
- Advice ID
- OCR text content
- Any pixel in any image
- OpenAI model

## What Does NOT Affect Cache

Same cache key generated regardless of:

- Image upload order
- User making the request (cache is shared)
- Request timestamp

## Database Schema

```sql
CREATE TABLE requests_cache (
    cache_key TEXT PRIMARY KEY,
    request_id UUID REFERENCES requests(id),
    category_id UUID NOT NULL,
    advice_id UUID NOT NULL,
    text_hash TEXT NOT NULL,
    images_key TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
```

### Result JSONB Structure

```json
{
  "model_response": "AI response text",
  "ocr_text": "extracted text from images"
}
```

## Implementation Files

- `supabase/functions/_shared/hash.ts` - Hash calculation functions
- `supabase/functions/_shared/cache.ts` - Cache check and save functions
- `supabase/functions/process-screenshot/index.ts` - Main processing flow

## Notes

- Cache save failures are non-fatal (request still succeeds)
- Daily limit is checked even on cache hits (defense in depth)
- Expired entries can be cleaned with `SELECT cleanup_expired_cache();`
