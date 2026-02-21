

# Replace DashScope with Replicate API

## What Changes

The current `enhance-beauty` edge function uses Alibaba Cloud DashScope (which has an invalid API key). We'll replace it with **Replicate**, a reliable API for running open-source AI models including image-to-image beauty enhancement.

## Replicate Model

We'll use a suitable image-to-image model on Replicate (e.g. `tencentarc/photomaker-style` or `stability-ai/sdxl` with img2img) that can transform selfies into beauty portraits while preserving face identity. Replicate has a simple REST API with async polling, similar to DashScope.

## What You'll Need To Do

1. **Create a Replicate account** at [replicate.com](https://replicate.com)
2. Go to **Account Settings > API Tokens** and copy your API token
3. You'll be prompted to enter this token securely in the app

## Steps

### Step 1 -- Store the Replicate API Token
- Add a new secret `REPLICATE_API_TOKEN` to the project
- The existing `DASHSCOPE_API_KEY` can be removed afterward

### Step 2 -- Rewrite the `enhance-beauty` Edge Function
- Remove all DashScope/Alibaba Cloud code
- Call the Replicate API to create a prediction:
  - `POST https://api.replicate.com/v1/predictions`
  - Use an img2img model that preserves face identity (e.g. `bytedance/sdxl-lightning-4step` for speed, or a face-swap/beauty model)
- Send the user's base64 selfie as a data URI + the beauty transformation prompt
- Keep the same style descriptions and makeup config prompt logic

### Step 3 -- Handle Async Polling
- Replicate predictions are async: submit, then poll `GET /v1/predictions/{id}` until status is `succeeded`
- Polling every 2 seconds, max ~60 seconds timeout
- Return the output image URL, fetch it, and convert to base64 data URL

### Step 4 -- Error Handling
- Handle rate limits, auth errors, and failed predictions
- Keep the same response format (`{ enhancedImage: "data:image/..." }`) so the frontend needs no changes

## Technical Details

```text
POST https://api.replicate.com/v1/predictions
Headers:
  Authorization: Bearer REPLICATE_API_TOKEN
  Content-Type: application/json

Body:
  version: "<model_version_hash>"
  input: {
    image: "data:image/jpeg;base64,...",
    prompt: "ultra-realistic beauty portrait..."
  }
```

Poll:
```text
GET https://api.replicate.com/v1/predictions/{prediction_id}
Headers:
  Authorization: Bearer REPLICATE_API_TOKEN
```

## What Stays the Same

- The frontend code remains completely unchanged
- Same prompt structure (style descriptions, makeup config)
- Same response format (`{ enhancedImage: "data:image/..." }`)
- No visual or UX changes

## Files Modified

- `supabase/functions/enhance-beauty/index.ts` -- rewritten to use Replicate API

