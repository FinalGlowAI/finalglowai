/**
 * Ultra-realistic makeup renderer using MediaPipe Face Mesh landmarks.
 * All processing is on-device. No image storage.
 */

interface MakeupConfig {
  lipColor: string;
  eyeshadowColor: string;
  blushColor: string;
  skinTone: string;
  style: string;
}

type Landmark = { x: number; y: number; z: number };

// ─── Landmark indices ───────────────────────────────────────────────
// Lips – precise MediaPipe contours
const LIPS_OUTER_TOP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const LIPS_OUTER_BOTTOM = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
const LIPS_INNER_TOP = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
const LIPS_INNER_BOTTOM = [308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78];

// Upper lip line for cupid's bow highlight
const UPPER_LIP_LINE = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];

// Eyeshadow – upper eyelid crease regions
const LEFT_EYELID = [157, 158, 159, 160, 161, 246, 33, 7, 163, 144, 145, 153];
const RIGHT_EYELID = [384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380];

// Extended eyeshadow for smokey/party looks
const LEFT_EYE_CREASE = [156, 157, 158, 159, 160, 161, 246, 33, 130, 247, 30, 29, 27, 28, 56, 190];
const RIGHT_EYE_CREASE = [383, 384, 385, 386, 387, 388, 466, 263, 359, 467, 260, 259, 257, 258, 286, 414];

// Blush – apple of cheeks
const LEFT_CHEEK_INNER = [123, 187, 205, 36, 142, 126];
const LEFT_CHEEK_OUTER = [50, 101, 100, 119, 118, 117, 111, 116];
const RIGHT_CHEEK_INNER = [352, 411, 425, 266, 371, 355];
const RIGHT_CHEEK_OUTER = [280, 330, 329, 348, 347, 346, 340, 345];

// Highlighter – cheekbone ridge & nose bridge
const LEFT_CHEEKBONE = [116, 111, 117, 118, 119, 100, 36, 205];
const RIGHT_CHEEKBONE = [345, 340, 346, 347, 348, 329, 266, 425];
const NOSE_BRIDGE = [6, 197, 195, 5, 4];
const NOSE_TIP = [1, 2, 98, 327];

// Skin smoothing sample regions
const FOREHEAD_CENTER = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

// ─── Color utilities ────────────────────────────────────────────────
function parseHSL(hsl: string): [number, number, number] {
  const match = hsl.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
  if (match) return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  return [0, 50, 50];
}

function hslToRgba(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function hslFromString(hsl: string, alpha: number): string {
  const [h, s, l] = parseHSL(hsl);
  return hslToRgba(h, s, l, alpha);
}

// ─── Drawing helpers ────────────────────────────────────────────────
function getLandmarkPath(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  indices: number[],
  w: number,
  h: number,
  yOffset = 0
) {
  ctx.beginPath();
  indices.forEach((idx, i) => {
    const pt = landmarks[idx];
    const x = pt.x * w;
    const y = pt.y * h + yOffset;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function getRegionCenter(landmarks: Landmark[], indices: number[], w: number, h: number): [number, number] {
  let cx = 0, cy = 0;
  indices.forEach((idx) => {
    cx += landmarks[idx].x * w;
    cy += landmarks[idx].y * h;
  });
  return [cx / indices.length, cy / indices.length];
}

function getRegionRadius(landmarks: Landmark[], indices: number[], w: number, h: number, center: [number, number]): number {
  let maxDist = 0;
  indices.forEach((idx) => {
    const dx = landmarks[idx].x * w - center[0];
    const dy = landmarks[idx].y * h - center[1];
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy));
  });
  return maxDist;
}

// ─── Offscreen blur helper for soft makeup edges ────────────────────
function drawBlurredLayer(
  mainCtx: CanvasRenderingContext2D,
  w: number,
  h: number,
  blurPx: number,
  compositeOp: GlobalCompositeOperation,
  drawFn: (ctx: CanvasRenderingContext2D) => void
) {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext("2d")!;
  offCtx.filter = `blur(${blurPx}px)`;
  drawFn(offCtx);
  mainCtx.globalCompositeOperation = compositeOp;
  mainCtx.drawImage(offscreen, 0, 0);
  mainCtx.globalCompositeOperation = "source-over";
}

// ─── Style multipliers ─────────────────────────────────────────────
function getStyleParams(style: string) {
  switch (style) {
    case "bold":
      return { lipAlpha: 0.45, eyeAlpha: 0.3, blushAlpha: 0.16, highlightAlpha: 0.12, smoothing: 2, eyeExtended: false };
    case "party":
      return { lipAlpha: 0.5, eyeAlpha: 0.38, blushAlpha: 0.18, highlightAlpha: 0.15, smoothing: 2.5, eyeExtended: true };
    case "soft_glam":
      return { lipAlpha: 0.35, eyeAlpha: 0.22, blushAlpha: 0.18, highlightAlpha: 0.14, smoothing: 3, eyeExtended: false };
    case "clean_girl":
      return { lipAlpha: 0.2, eyeAlpha: 0.1, blushAlpha: 0.1, highlightAlpha: 0.08, smoothing: 4, eyeExtended: false };
    case "natural":
      return { lipAlpha: 0.18, eyeAlpha: 0.08, blushAlpha: 0.08, highlightAlpha: 0.06, smoothing: 4, eyeExtended: false };
    default:
      return { lipAlpha: 0.32, eyeAlpha: 0.2, blushAlpha: 0.13, highlightAlpha: 0.1, smoothing: 3, eyeExtended: false };
  }
}

// ─── Main render function ───────────────────────────────────────────
export function renderMakeup(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  w: number,
  h: number,
  config: MakeupConfig
) {
  const params = getStyleParams(config.style);
  const [lipH, lipS, lipL] = parseHSL(config.lipColor);
  const [eyeH, eyeS, eyeL] = parseHSL(config.eyeshadowColor);
  const [blushH, blushS, blushL] = parseHSL(config.blushColor);

  // Face oval for masking
  const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

  // Lips removed – keeping user's natural lips

  // ── 3. Eyeshadow – gradient from lash line upward ────────────────
  const leftEyeIndices = params.eyeExtended ? LEFT_EYE_CREASE : LEFT_EYELID;
  const rightEyeIndices = params.eyeExtended ? RIGHT_EYE_CREASE : RIGHT_EYELID;

  drawBlurredLayer(ctx, w, h, 4, "source-over", (offCtx) => {
    [leftEyeIndices, rightEyeIndices].forEach((eyeIndices) => {
      const center = getRegionCenter(landmarks, eyeIndices, w, h);
      const radius = getRegionRadius(landmarks, eyeIndices, w, h, center) * 1.1;

      // Gradient from intense at lash line to transparent at crease
      const grad = offCtx.createRadialGradient(center[0], center[1] + radius * 0.3, 0, center[0], center[1], radius);
      grad.addColorStop(0, hslToRgba(eyeH, eyeS, eyeL, params.eyeAlpha));
      grad.addColorStop(0.5, hslToRgba(eyeH, eyeS, eyeL, params.eyeAlpha * 0.6));
      grad.addColorStop(1, hslToRgba(eyeH, eyeS, eyeL, 0));

      offCtx.fillStyle = grad;
      getLandmarkPath(offCtx, landmarks, eyeIndices, w, h);
      offCtx.fill();
    });
  });

  // Eyeliner shimmer – very thin line at lash line
  drawBlurredLayer(ctx, w, h, 0.5, "source-over", (offCtx) => {
    offCtx.strokeStyle = hslToRgba(eyeH, eyeS, Math.max(eyeL - 20, 10), params.eyeAlpha * 0.6);
    offCtx.lineWidth = 1.2;

    [[159, 145, 144, 163, 7, 33], [386, 374, 373, 390, 249, 263]].forEach((lashLine) => {
      offCtx.beginPath();
      lashLine.forEach((idx, i) => {
        const pt = landmarks[idx];
        if (i === 0) offCtx.moveTo(pt.x * w, pt.y * h);
        else offCtx.lineTo(pt.x * w, pt.y * h);
      });
      offCtx.stroke();
    });
  });

  // ── 4. Blush – soft radial gradient on cheek apples ──────────────
  drawBlurredLayer(ctx, w, h, 8, "source-over", (offCtx) => {
    [
      [...LEFT_CHEEK_INNER, ...LEFT_CHEEK_OUTER],
      [...RIGHT_CHEEK_INNER, ...RIGHT_CHEEK_OUTER],
    ].forEach((cheekIndices) => {
      const center = getRegionCenter(landmarks, cheekIndices, w, h);
      const radius = getRegionRadius(landmarks, cheekIndices, w, h, center) * 0.9;

      // Organic elliptical gradient
      offCtx.save();
      offCtx.translate(center[0], center[1]);
      offCtx.scale(1.3, 1); // Wider than tall for natural cheek shape
      const grad = offCtx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, hslToRgba(blushH, blushS, blushL, params.blushAlpha));
      grad.addColorStop(0.5, hslToRgba(blushH, blushS, blushL, params.blushAlpha * 0.5));
      grad.addColorStop(1, hslToRgba(blushH, blushS, blushL, 0));
      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(0, 0, radius, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.restore();
    });
  });

  // ── 5. Highlighter – cheekbones, nose bridge, cupid's bow ────────
  drawBlurredLayer(ctx, w, h, 6, "source-over", (offCtx) => {
    const hlAlpha = params.highlightAlpha;

    // Cheekbone highlights
    [LEFT_CHEEKBONE, RIGHT_CHEEKBONE].forEach((boneIndices) => {
      const center = getRegionCenter(landmarks, boneIndices, w, h);
      // Shift highlight slightly up from cheek center
      center[1] -= 8;
      const radius = getRegionRadius(landmarks, boneIndices, w, h, center) * 0.7;

      offCtx.save();
      offCtx.translate(center[0], center[1]);
      offCtx.scale(1.8, 0.6); // Elongated highlight stripe
      const grad = offCtx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `hsla(45, 60%, 90%, ${hlAlpha})`);
      grad.addColorStop(0.4, `hsla(45, 50%, 85%, ${hlAlpha * 0.5})`);
      grad.addColorStop(1, `hsla(45, 40%, 80%, 0)`);
      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(0, 0, radius, 0, Math.PI * 2);
      offCtx.fill();
      offCtx.restore();
    });

    // Nose bridge highlight
    const noseCenter = getRegionCenter(landmarks, NOSE_BRIDGE, w, h);
    const noseGrad = offCtx.createRadialGradient(noseCenter[0], noseCenter[1], 0, noseCenter[0], noseCenter[1], 18);
    noseGrad.addColorStop(0, `hsla(45, 50%, 92%, ${hlAlpha * 0.6})`);
    noseGrad.addColorStop(1, `hsla(45, 50%, 92%, 0)`);
    offCtx.fillStyle = noseGrad;
    offCtx.save();
    offCtx.translate(noseCenter[0], noseCenter[1]);
    offCtx.scale(0.4, 1.5); // Tall narrow highlight
    offCtx.beginPath();
    offCtx.arc(0, 0, 18, 0, Math.PI * 2);
    offCtx.fill();
    offCtx.restore();

    // Nose tip subtle glow
    const noseTipCenter = getRegionCenter(landmarks, NOSE_TIP, w, h);
    const tipGrad = offCtx.createRadialGradient(noseTipCenter[0], noseTipCenter[1], 0, noseTipCenter[0], noseTipCenter[1], 8);
    tipGrad.addColorStop(0, `hsla(45, 50%, 92%, ${hlAlpha * 0.5})`);
    tipGrad.addColorStop(1, `hsla(45, 50%, 92%, 0)`);
    offCtx.fillStyle = tipGrad;
    offCtx.beginPath();
    offCtx.arc(noseTipCenter[0], noseTipCenter[1], 8, 0, Math.PI * 2);
    offCtx.fill();

  });

}
