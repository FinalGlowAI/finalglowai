## Goal
Restore the February beauty-portrait quality (image 1) while keeping reasonable identity preservation.

## Root cause
Two regressions stacked on top of each other in `supabase/functions/enhance-beauty/index.ts`:
1. The Replicate model was switched from `flux-kontext-pro` (Feb) to `flux-kontext-max` (now). `max` produces more literal/raw edits.
2. The prompt was stripped of all editorial styling references when trying to fix identity drift, so the model now just paints flat makeup on the original selfie with no relighting, no skin retouching, no studio aesthetic.

## Fix

### 1. Revert the Replicate model
In `supabase/functions/enhance-beauty/index.ts`, change the endpoint back from:
```
.../models/black-forest-labs/flux-kontext-max/predictions
```
to:
```
.../models/black-forest-labs/flux-kontext-pro/predictions
```

### 2. Remove the over-tuned input parameters
Remove `guidance: 3.5`, `steps: 28`, `prompt_upsampling: true` from the Replicate request body. The Feb version only sent: `prompt`, `input_image`, `aspect_ratio: "match_input_image"`, `output_format: "jpg"`, `safety_tolerance: 2`. These extras were not in the working version.

### 3. Restore the February prompt, with one identity-preservation line added
Replace `buildPrompt()` with the February version that includes:
- Style descriptors per style key (`luxury`, `classy`, `elegant`, `soft_glam`, `natural`, `party`, `clean_girl`, `bold`) with editorial references
- Intensity descriptors (light / medium / full)
- "Flawless airbrushed skin with realistic pore texture preserved"
- "Soft professional studio lighting with gentle highlights on cheekbones and nose bridge"
- "Professional color grading with warm luxurious tones"
- "Cinematic depth of field with [background] background"
- "Result should look like a Sephora or Dior campaign photo"
- "Photorealistic quality, NOT cartoon, NOT painting, NOT AI-looking"

Then append a single, balanced identity line at the end (lighter than the current aggressive version):
> "Preserve the exact same face, identity, skin tone, facial features, bone structure, eye shape, nose, lip shape, jawline, eyebrows, hair, and age."

This gives us back the campaign aesthetic without the heavy "do NOT do anything" wording that was killing the look.

### 4. Keep the good additions from the current version
- Keep the auth check (`supabase.auth.getUser()`)
- Keep the rate limiting (10 enhancements/hour via `usage_logs`)
- Keep the image size guard (5 MB)
- Keep the polling fallback

### 5. Test
After deploy, re-scan the same user's face and confirm we get a result close to image 1 (warm studio lighting, glowy skin, polished makeup) instead of image 2 (raw selfie with flat makeup).

## Files to change
- `supabase/functions/enhance-beauty/index.ts` (only file)

## Expected outcome
Results return to the February quality level — warm campaign lighting, dewy/airbrushed skin finish, polished makeup application — while still keeping the user's facial identity recognisable.
