// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(makeupConfig: MakeupConfig | null, style: string, intensity: number = 50): string {
  const intensityLevel = intensity <= 30 ? "light" : intensity <= 65 ? "medium" : "full";

  const intensityDesc: Record<string, string> = {
    light: "sheer natural-finish",
    medium: "soft polished",
    full: "full-coverage pigmented",
  };

  const styleDesc: Record<string, string> = {
    luxury: "warm golden lighting",
    classy: "soft studio lighting",
    elegant: "soft diffused lighting",
    soft_glam: "soft warm glowing lighting",
    natural: "soft natural daylight",
    party: "evening lighting with subtle sparkle",
    clean_girl: "fresh soft daylight",
    bold: "soft directional lighting",
  };

  const selectedLighting = styleDesc[style] || styleDesc.luxury;
  const lipColor = makeupConfig?.lipColor || "rose";
  const eyeshadowColor = makeupConfig?.eyeshadowColor || "gold";
  const blushColor = makeupConfig?.blushColor || "peach";
  const outfitColor = makeupConfig?.outfitColor || "";
  const background = makeupConfig?.background || "soft neutral background";

  let prompt = `Apply ${intensityDesc[intensityLevel]} makeup to this exact person. `;
  prompt += `Apply ${lipColor} lipstick on the lips, `;
  prompt += `${eyeshadowColor} eyeshadow on the eyelids, `;
  prompt += `${blushColor} blush on the cheeks. `;
  prompt += `Preserve exactly: face shape, skin tone, skin texture, pores, freckles, `;
  prompt += `eye color and shape, nose, jawline, eyebrows, hair, age, expression, head angle. `;
  prompt += `Do not retouch or alter the face. Photorealistic. `;
  prompt += `Lighting: ${selectedLighting}. Background: ${background}.`;

  if (outfitColor) {
    prompt += ` Outfit: ${outfitColor} if visible.`;
  }

  return prompt;
}
