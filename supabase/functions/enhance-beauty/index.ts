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

  const intensityDesc: Record<string, string> = {
    light: "very subtle, barely-there makeup with a natural no-makeup look, sheer coverage",
    medium: "balanced, polished makeup with visible but refined application",
    full: "full-coverage, dramatic high-impact makeup with bold pigmentation and statement look",
  };

  const styleDesc: Record<string, string> = {
    luxury: "ultra-luxurious Dior haute couture campaign, opulent golden lighting, rich jewel tones, flawless porcelain finish",
    classy: "timeless Vogue editorial, sophisticated neutral palette, elegant studio lighting, refined beauty",
    elegant: "Harper's Bazaar cover shoot, graceful and polished, soft diffused lighting, understated glamour",
    soft_glam: "Glossier campaign aesthetic, dewy radiant skin, effortless beauty, soft warm glow",
    natural: "barely-there fresh-faced beauty, dewy minimal makeup, clean luminous skin, natural light",
    party: "Met Gala red carpet glam, bold dramatic makeup, sparkling highlights, dazzling evening look",
    clean_girl: "Hailey Bieber clean girl aesthetic, glass skin, slicked back hair, minimal dewy perfection",
    bold: "high-fashion editorial with statement-making intensity, dramatic contour, bold color payoff",
  };

  const selectedStyle = styleDesc[style] || styleDesc.luxury;

  const lipColor = makeupConfig?.lipColor || "rose";
  const eyeshadowColor = makeupConfig?.eyeshadowColor || "gold";
  const blushColor = makeupConfig?.blushColor || "peach";
  const outfitColor = makeupConfig?.outfitColor || "";
  const background = makeupConfig?.background || "soft bokeh studio";

  let prompt = `Professional ultra-realistic beauty portrait photo. ${selectedStyle}. `;
  prompt += `Makeup intensity: ${intensityDesc[intensityLevel]}. `;
  prompt += `Flawless airbrushed skin with realistic pore texture preserved. `;
  prompt += `Makeup: ${lipColor} lips, ${eyeshadowColor} eyeshadow, ${blushColor} blush. `;
  prompt += `Soft professional studio lighting with gentle highlights on cheekbones and nose bridge. `;
  prompt += `Professional color grading with warm luxurious tones. `;
  prompt += `Cinematic depth of field with ${background} background. `;

  if (outfitColor) {
    prompt += `Wearing ${outfitColor} outfit. `;
  }

  prompt += `Preserve exact face identity, features, bone structure, and expression. `;
  prompt += `Result should look like a Sephora or Dior campaign photo. `;
  prompt += `Photorealistic quality, NOT cartoon, NOT painting, NOT AI-looking.`;

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
