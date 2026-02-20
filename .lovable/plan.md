
# Replace Gemini with Alibaba Cloud Qwen Image Edit API

## What Changes

The current photo enhancement uses Google Gemini via the Lovable AI Gateway. We'll replace it with **Alibaba Cloud's Qwen Image Edit** (DashScope API), a low-cost Chinese AI image editing model that can transform selfies into beauty portraits based on text prompts.

## Why Qwen Image Edit

- **Cost**: ~$0.025-0.035 per image (significantly cheaper)
- **Quality**: 20B parameter model, strong at style transfer and face preservation
- **API**: Simple REST API with base64 image input/output
- **Availability**: International endpoint available (Singapore region)

## What You'll Need To Do

1. **Create a free Alibaba Cloud account** at [alibabacloud.com](https://www.alibabacloud.com)
2. Go to **Model Studio** and get a **DashScope API Key**
3. You'll be prompted to enter this API key securely in the app

## Steps

### Step 1 — Store the DashScope API Key
- Securely store your Alibaba Cloud DashScope API key as a secret (`DASHSCOPE_API_KEY`)

### Step 2 — Update the `enhance-beauty` Edge Function
- Remove all Google Gemini / Lovable AI Gateway code
- Call the DashScope international endpoint: `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`
- Use the `qwen-image-edit` model
- Send the user's base64 selfie + the beauty transformation prompt
- The API is **asynchronous** — it returns a task ID first, then we poll for the result
- Parse the output image URL from the response and return it

### Step 3 — Handle Async Polling
- DashScope image generation is async: submit a task, then poll a status endpoint until the image is ready
- The edge function will handle this internally with a polling loop (max ~60 seconds timeout)
- Return the final image as a base64 data URL or direct URL to the frontend

### Step 4 — Error Handling
- Handle rate limits, authentication errors, and task failures gracefully
- Keep the same error response format so the frontend doesn't need changes

## Technical Details

The DashScope API call structure:

```text
POST https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
Headers:
  Authorization: Bearer DASHSCOPE_API_KEY
  Content-Type: application/json
  X-DashScope-Async: enable (for async mode)

Body:
  model: "qwen-image-edit"
  input.messages: [{ role: "user", content: [{ image: base64 }, { text: prompt }] }]
  parameters: { n: 1, size: "1024*1024" }
```

Then poll:
```text
GET https://dashscope-intl.aliyuncs.com/api/v1/tasks/{task_id}
Headers:
  Authorization: Bearer DASHSCOPE_API_KEY
```

## What Stays the Same

- The frontend code (MakeupResultStep, StylingFlowPage) remains unchanged
- The same prompt structure (style descriptions, makeup config) is preserved
- The response format (`{ enhancedImage: "data:image/..." }`) stays identical
- No visual or UX changes for your users

## Files Modified

- `supabase/functions/enhance-beauty/index.ts` — rewritten to use DashScope API
