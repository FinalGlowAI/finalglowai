## Goal

Make the makeup logic transparent and user-controllable: instead of silently deriving lip/eye/blush colors from outfit + style, surface a row of **named makeup palettes** that are auto-generated from the user's outfit colors. The user picks one, sees a **live swatch preview** (lip, eyeshadow, blush, on a face mockup), and only then triggers the AI face-scan generation.

## What changes vs. the current version

Today (current behavior):
- Outfit colors → `makeupConfig` is computed silently in `StylingFlowPage` (`useMemo`, lines 291–412).
- One palette is auto-derived. The user never sees the lip/eye/blush colors before scanning.
- Style step picks a "vibe" (Luxury, Classy, Party…) which only nudges the silent palette.
- Face Scan → straight to AI (`enhance-beauty`) with whatever the algorithm chose.

After this change:
- The "Style" step still picks a vibe.
- A **new "Palette" step** (between Brand and Scan) shows 3–4 named palettes generated from the chosen outfit + vibe (e.g. *Rose Champagne*, *Bronze Bordeaux*, *Soft Nude*, *Berry Noir*).
- Each palette is shown as a card with 3 swatches (lip / eye / blush), a name, and a one-line description.
- Selecting a card updates a **mini face preview** (CSS-rendered oval with tinted lip/eye/cheek zones) so the user sees the look before committing.
- The chosen palette becomes `makeupConfig` and is sent to `enhance-beauty` as-is. The AI prompt uses the explicit color names from the selected palette (more controllable, more accurate result).
- The previous silent algorithm becomes the **palette generator** instead of the final answer — so nothing the user already loved is lost; they just get to pick.

## User flow

```text
Outfit → Style → Skin → Brand → [NEW] Palette Preview → Face Scan → Result
                                       │
                                       ├─ Card: Rose Champagne   [lip][eye][blush]
                                       ├─ Card: Bronze Bordeaux  [lip][eye][blush]
                                       ├─ Card: Soft Nude        [lip][eye][blush]
                                       └─ Card: Berry Noir       [lip][eye][blush]
                                       
                                       Mini face preview updates live
                                       [ Continue to Face Scan ]
```

## Implementation

### 1. New palette generator (`src/lib/makeupPalettes.ts`)
Pure function: `generatePalettes({ outfitColors, vibe, skinTone }) → Palette[]`
- Reuses the existing dominant-hue / warm-cool / family detection from `StylingFlowPage` lines 297–375.
- Returns 4 named variants per outfit+vibe combo:
  1. **Harmonious** — lip echoes outfit's dominant hue (current default behavior).
  2. **Complementary** — lip in the complementary hue family (180° shift, clamped).
  3. **Neutral Nude** — desaturated warm nude lip, soft bronze eye.
  4. **Statement** — deepened/bolder version (saturation +20, lightness −10).
- Each palette: `{ id, name, description, lipColor, eyeshadowColor, blushColor }`.

### 2. New `PaletteStep` component (`src/components/PaletteStep.tsx`)
- Grid of 4 palette cards (swatch trio + name + 1-liner).
- `MiniFacePreview` subcomponent: simple SVG/CSS oval with tinted lip arc, eyelid arcs, cheek circles (no MediaPipe needed at this step). Uses the selected palette's colors with the same alpha values from `getStyleParams` in `src/lib/makeupRenderer.ts` so the preview feels consistent with the live AR makeup.
- Selecting a card = sets `selectedPaletteId` in parent.
- Bottom CTA: "Continue to Face Scan" — disabled until a palette is selected.

### 3. Wire into `StylingFlowPage.tsx`
- Add `"palette"` to `FlowStep` and `stepLabels` (between `brand` and `scan`).
- Add state: `palettes`, `selectedPaletteId`.
- Compute `palettes` via `useMemo` from outfit + vibe + skin (replaces inline `makeupConfig` algorithm).
- Derive `makeupConfig` from `selectedPaletteId` (fallback to palette[0]).
- Update `canProceed` for the new step.
- Render `<PaletteStep />` in the `AnimatePresence` block.

### 4. Edge function prompt boost (`supabase/functions/enhance-beauty/index.ts`)
- Currently the prompt receives `lipColor` etc. as raw HSL strings (line 71–75). Replicate's flux-kontext-pro responds better to **named colors**.
- Add an HSL→named-shade mapper in the function (e.g. `hsl(345,55%,45%) → "deep berry"`). Use that name in the prompt instead of the HSL string.
- Append a short line: `Use these exact shades and no others: lips=<name>, eyeshadow=<name>, blush=<name>.` This makes the AI result match the previewed swatches more faithfully — directly addressing the recurring "results don't match" complaint.

### 5. Memory update
Save `mem://features/makeup-palettes` documenting the new step + the 4 variant rule (Harmonious / Complementary / Neutral Nude / Statement), and reference it from `mem://index.md`.

## Files

- **New:** `src/lib/makeupPalettes.ts`
- **New:** `src/components/PaletteStep.tsx`
- **Edit:** `src/pages/StylingFlowPage.tsx` (add step, state, render)
- **Edit:** `supabase/functions/enhance-beauty/index.ts` (HSL→name mapper + stricter prompt line)
- **New:** `mem://features/makeup-palettes` + index update

## What you'll notice immediately
- One extra step before the face scan, showing 4 named palettes + a tiny preview face.
- The AI result will more reliably match the swatches you picked (because the prompt now uses named shades, not raw HSL).
- Nothing you already configured (outfit, style, brand, intensity, identity-preservation prompt) is removed — this layer sits on top.
