/**
 * Generates 4 named makeup palettes from outfit + style + skin context.
 * Each palette = lip / eyeshadow / blush HSL triplet + a friendly name + descriptor.
 *
 * Variants:
 *   1. Harmonious   – echoes the outfit's dominant hue
 *   2. Complementary – contrasts the outfit (180° hue shift)
 *   3. Neutral Nude – desaturated warm nude / soft bronze
 *   4. Statement    – deepened, saturated bold version
 */

export interface MakeupPalette {
  id: string;
  name: string;
  description: string;
  lipColor: string;       // hsl(...)
  eyeshadowColor: string; // hsl(...)
  blushColor: string;     // hsl(...)
}

interface GenerateInput {
  outfitColors: string[];
  vibe: string;        // luxury | classy | elegant | soft_glam | natural | party | clean_girl | bold
  skinTone: string;    // hsl(...)
}

type HSL = [number, number, number];

const parseHSL = (hsl: string): HSL => {
  const m = hsl.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [0, 0, 50];
};

const toHSL = ([h, s, l]: HSL) =>
  `hsl(${Math.round((h + 360) % 360)}, ${Math.round(Math.max(0, Math.min(100, s)))}%, ${Math.round(Math.max(0, Math.min(100, l)))}%)`;

const clampSat = (s: number) => Math.max(8, Math.min(85, s));
const clampLit = (l: number) => Math.max(20, Math.min(80, l));

// ─── Vibe base palettes (mirrors StylingFlowPage logic) ────────────────────
const basePalettes: Record<string, { lip: HSL; eye: HSL; blush: HSL }> = {
  luxury:     { lip: [350, 60, 40], eye: [38, 50, 65], blush: [12, 50, 65] },
  classy:     { lip: [5, 45, 55],   eye: [25, 30, 60], blush: [15, 45, 70] },
  elegant:    { lip: [345, 50, 45], eye: [280, 20, 55], blush: [350, 35, 72] },
  soft_glam:  { lip: [10, 45, 62],  eye: [38, 45, 70], blush: [18, 55, 72] },
  natural:    { lip: [15, 30, 65],  eye: [30, 20, 72], blush: [20, 30, 75] },
  party:      { lip: [340, 70, 45], eye: [270, 45, 50], blush: [345, 55, 65] },
  clean_girl: { lip: [15, 25, 68],  eye: [30, 15, 72], blush: [18, 30, 75] },
  bold:       { lip: [0, 75, 42],   eye: [220, 50, 40], blush: [345, 50, 60] },
};

// ─── Friendly shade naming ────────────────────────────────────────────────
function shadeName([h, s, l]: HSL): string {
  if (s < 18) {
    if (l > 72) return "soft beige";
    if (l > 55) return "warm taupe";
    if (l > 35) return "smoky cocoa";
    return "deep espresso";
  }
  // Warm vs cool families
  const family =
    h < 12 || h >= 345 ? "rose" :
    h < 25 ? "coral" :
    h < 45 ? "honey gold" :
    h < 70 ? "champagne" :
    h < 100 ? "olive" :
    h < 160 ? "emerald" :
    h < 200 ? "teal" :
    h < 250 ? "sapphire" :
    h < 290 ? "violet" :
    h < 330 ? "plum" :
    "berry";

  const depth = l > 65 ? "soft" : l > 50 ? "warm" : l > 35 ? "rich" : "deep";
  return `${depth} ${family}`;
}

// ─── Palette name generator ───────────────────────────────────────────────
function paletteName(lip: HSL, eye: HSL, variant: string): string {
  const lipWord = shadeName(lip).split(" ").pop()!;
  const eyeWord = shadeName(eye).split(" ").pop()!;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (variant === "neutral") return "Soft Nude";
  if (variant === "statement") return `${cap(lipWord)} Noir`;
  return `${cap(eyeWord)} ${cap(lipWord)}`;
}

// ─── Adapt a base palette to outfit dominant hue ──────────────────────────
function adaptToOutfit(base: { lip: HSL; eye: HSL; blush: HSL }, outfitColors: string[]) {
  let dominantHue = -1, dominantSat = 0;
  outfitColors.forEach((c) => {
    const [h, s] = parseHSL(c);
    if (s > dominantSat && s > 12) { dominantHue = h; dominantSat = s; }
  });

  let lip: HSL = [...base.lip];
  let eye: HSL = [...base.eye];
  let blush: HSL = [...base.blush];

  if (dominantHue < 0) return { lip, eye, blush, dominantHue };

  const isRed   = dominantHue <= 15 || dominantHue >= 340;
  const isPink  = dominantHue >= 320 && dominantHue < 340;
  const isBlue  = dominantHue >= 200 && dominantHue <= 260;
  const isGreen = dominantHue >= 80 && dominantHue <= 170;
  const isWarm  = dominantHue <= 50 || dominantHue >= 330;

  if (isRed)        { lip = [dominantHue, clampSat(lip[1] + 8), lip[2]]; eye = [38, 45, 68]; blush = [12, 45, 70]; }
  else if (isPink)  { lip = [350, 45, 58]; eye = [330, 25, 68]; blush = [345, 40, 72]; }
  else if (isBlue)  { lip = [8, 40, 60]; eye = [Math.max(dominantHue - 20, 200), 30, 58]; blush = [350, 35, 72]; }
  else if (isGreen) { lip = [12, 40, 58]; eye = [35, 40, 62]; blush = [15, 45, 70]; }
  else if (isWarm)  { lip = [Math.max(dominantHue - 15, 0), 50, 52]; eye = [35, 40, 65]; blush = [15, 50, 68]; }

  return { lip, eye, blush, dominantHue };
}

// ─── Skin tone adjustment ────────────────────────────────────────────────
function adjustForSkin(p: HSL, skinL: number): HSL {
  if (skinL > 65) return [p[0], p[1], clampLit(p[2] + 4)];
  if (skinL < 35) return [p[0], clampSat(p[1] + 8), clampLit(p[2] - 6)];
  return p;
}

// ─── Main generator ──────────────────────────────────────────────────────
export function generatePalettes({ outfitColors, vibe, skinTone }: GenerateInput): MakeupPalette[] {
  const base = basePalettes[vibe] || basePalettes.elegant;
  const adapted = adaptToOutfit(base, outfitColors);
  const [, , skinL] = parseHSL(skinTone);

  // 1. Harmonious — adapted directly
  const h1: HSL = adjustForSkin(adapted.lip, skinL);
  const h1e: HSL = adjustForSkin(adapted.eye, skinL);
  const h1b: HSL = adjustForSkin(adapted.blush, skinL);

  // 2. Complementary — shift lip 180°
  const compHue = (adapted.lip[0] + 180) % 360;
  const c1: HSL = adjustForSkin([compHue, clampSat(adapted.lip[1] - 5), adapted.lip[2]], skinL);
  const c1e: HSL = adjustForSkin([(adapted.eye[0] + 30) % 360, adapted.eye[1], adapted.eye[2]], skinL);
  const c1b: HSL = adjustForSkin([compHue, 35, 70], skinL);

  // 3. Neutral Nude — desaturated warm nude + soft bronze
  const n1: HSL = adjustForSkin([18, 32, 60], skinL);
  const n1e: HSL = adjustForSkin([32, 28, 62], skinL);
  const n1b: HSL = adjustForSkin([16, 30, 72], skinL);

  // 4. Statement — deepen + saturate
  const s1: HSL = adjustForSkin([adapted.lip[0], clampSat(adapted.lip[1] + 20), clampLit(adapted.lip[2] - 10)], skinL);
  const s1e: HSL = adjustForSkin([adapted.eye[0], clampSat(adapted.eye[1] + 15), clampLit(adapted.eye[2] - 8)], skinL);
  const s1b: HSL = adjustForSkin([adapted.blush[0], clampSat(adapted.blush[1] + 10), adapted.blush[2]], skinL);

  return [
    {
      id: "harmonious",
      name: paletteName(h1, h1e, "harmonious"),
      description: "Echoes your outfit — effortless harmony",
      lipColor: toHSL(h1), eyeshadowColor: toHSL(h1e), blushColor: toHSL(h1b),
    },
    {
      id: "complementary",
      name: paletteName(c1, c1e, "complementary"),
      description: "A contrasting accent that lifts the look",
      lipColor: toHSL(c1), eyeshadowColor: toHSL(c1e), blushColor: toHSL(c1b),
    },
    {
      id: "neutral",
      name: paletteName(n1, n1e, "neutral"),
      description: "Quiet luxury — wearable any day",
      lipColor: toHSL(n1), eyeshadowColor: toHSL(n1e), blushColor: toHSL(n1b),
    },
    {
      id: "statement",
      name: paletteName(s1, s1e, "statement"),
      description: "Deeper and bolder — for impact",
      lipColor: toHSL(s1), eyeshadowColor: toHSL(s1e), blushColor: toHSL(s1b),
    },
  ];
}

export { shadeName };
