import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface MakeupConfig {
  lipColor?: string;
  eyeshadowColor?: string;
  blushColor?: string;
  outfitColor?: string;
  background?: string;
}

// ─── Polling Replicate ────────────────────────────────────────────────────────
async function pollPrediction(predictionUrl: string, apiToken: string): Promise<string> {
  const maxAttempts = 60;
  const pollInterval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const res = await fetch(predictionUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Poll failed (${res.status}): ${errText}`);
    }

    const data = await res.json();

    if (data.status === "succeeded") {
      const output = data.output;
      const imageUrl = Array.isArray(output) ? output[0] : output;
      if (!imageUrl) throw new Error("No image URL in completed prediction");
      return imageUrl;
    }

    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${data.status}: ${data.error || "Unknown error"}`);
    }
  }

  throw new Error("Prediction timed out after 120 seconds");
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(makeupConfig: MakeupConfig | null, style: string, intensity: number = 50): string {
  const intensityLevel = intensity <= 30 ? "light" : intensity <= 65 ? "medium" : "full";

  // Makeup-only descriptors — NO face/skin/style transformation language
  const intensityDesc: Record<string, string> = {
    light: "very sheer, barely-there makeup application",
    medium: "soft, polished makeup application",
    full: "fully applied makeup with richer pigment payoff",
  };

  // Lighting/mood ONLY — removed editorial/campaign references that cause face drift
  const styleDesc: Record<string, string> = {
    luxury: "warm soft golden lighting with subtle highlights",
    classy: "soft neutral studio lighting",
    elegant: "soft diffused lighting",
    soft_glam: "soft warm glowing lighting with subtle dewy finish on the makeup only",
    natural: "soft natural daylight",
    party: "evening lighting with subtle sparkle on the makeup only",
    clean_girl: "soft fresh daylight with a subtle dewy finish on the makeup only",
    bold: "soft directional lighting with slightly richer color on the makeup",
  };

  const selectedLighting = styleDesc[style] || styleDesc.luxury;

  const lipColor = makeupConfig?.lipColor || "rose";
  const eyeshadowColor = makeupConfig?.eyeshadowColor || "gold";
  const blushColor = makeupConfig?.blushColor || "peach";
  const outfitColor = makeupConfig?.outfitColor || "";
  const background = makeupConfig?.background || "soft neutral background";

  // IDENTITY-FIRST PROMPT — face preservation is stated up front, repeated, and reinforced.
  let prompt = `Add ONLY makeup to this exact same person. `;
  prompt += `CRITICAL: keep the EXACT same face, EXACT same identity, EXACT same facial features, `;
  prompt += `EXACT same face shape, EXACT same bone structure, EXACT same eyes (shape, size, color, spacing), `;
  prompt += `EXACT same nose (shape, width, length), EXACT same mouth shape, EXACT same jawline, `;
  prompt += `EXACT same eyebrows shape and thickness, EXACT same skin tone, EXACT same age, `;
  prompt += `EXACT same ethnicity, EXACT same hair, EXACT same expression, EXACT same head pose and angle. `;
  prompt += `Do NOT beautify the face. Do NOT slim, reshape, smooth, or alter any facial feature. `;
  prompt += `Do NOT change skin texture — keep natural pores, freckles, moles, and marks. `;
  prompt += `Do NOT airbrush. Do NOT make the person look younger or thinner. `;
  prompt += `The ONLY change allowed: apply makeup on top of the existing face. `;
  prompt += `Makeup to apply: ${intensityDesc[intensityLevel]} — ${lipColor} lipstick on the lips, `;
  prompt += `${eyeshadowColor} eyeshadow on the eyelids, ${blushColor} blush on the cheeks. `;
  prompt += `Lighting: ${selectedLighting}. Background: ${background}. `;

  if (outfitColor) {
    prompt += `Outfit color: ${outfitColor} (only if clothing is visible, do not add new clothing). `;
  }

  prompt += `Output must be a photorealistic photo of the SAME person, recognizable as the same individual, `;
  prompt += `simply wearing makeup. Identity preservation is the highest priority.`;

  return prompt;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── 1. Authentification JWT Supabase ────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: missing Authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: invalid or expired session" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── 2. Rate Limiting — max 10 appels par heure par utilisateur ──────────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("function_name", "enhance-beauty")
    .gte("created_at", oneHourAgo);

  if (countError) {
    console.error("Rate limit check error:", countError);
    // On continue même si la vérification échoue pour ne pas bloquer l'utilisateur
  } else if ((count ?? 0) >= 10) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. Maximum 10 enhancements per hour." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Logger l'appel avant de traiter
  await supabase.from("usage_logs").insert({
    user_id: user.id,
    function_name: "enhance-beauty",
  });

  try {
    const body = await req.json();
    const { imageBase64, makeupConfig, style, intensity } = body;

    console.log("enhance-beauty invoked", {
      user: user.id,
      style,
      intensity,
      imageLen: imageBase64?.length ?? 0,
    });

    // ── 3. Validation de l'image ───────────────────────────────────────────────
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limite taille ~5MB max en base64 ≈ 7M caractères
    if (imageBase64.length > 7_000_000) {
      console.warn("Image too large:", imageBase64.length);
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum size is 5MB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Clé Replicate ───────────────────────────────────────────────────────
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const prompt = buildPrompt(makeupConfig as MakeupConfig | null, style, intensity);

    // S'assurer que l'image est un data URI valide
    const imageUri = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // ── 5. Appel Replicate ─────────────────────────────────────────────────────
    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt,
            input_image: imageUri,
            aspect_ratio: "match_input_image",
            output_format: "jpg",
            safety_tolerance: 2,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401 || response.status === 403) {
        const errText = await response.text();
        console.error("Replicate auth error:", response.status, errText);
        return new Response(
          JSON.stringify({ error: "Invalid API token. Please check your Replicate API token." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("Replicate submit error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to enhance image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();

    // Avec Prefer: wait, la prédiction peut déjà être terminée
    if (prediction.status === "succeeded" && prediction.output) {
      const imageUrl =
        typeof prediction.output === "string"
          ? prediction.output
          : prediction.output[0];
      return new Response(
        JSON.stringify({ enhancedImage: imageUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: prediction.error || "Image enhancement failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sinon on poll
    const predictionUrl = prediction.urls?.get;
    if (!predictionUrl) {
      console.error("No prediction URL in response:", JSON.stringify(prediction));
      return new Response(
        JSON.stringify({ error: "Failed to start image enhancement" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrl = await pollPrediction(predictionUrl, REPLICATE_API_TOKEN);
    return new Response(
      JSON.stringify({ enhancedImage: imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("enhance-beauty error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
