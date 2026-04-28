import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MakeupConfig {
  lipColor?: string;
  eyeshadowColor?: string;
  blushColor?: string;
  outfitColor?: string;
  background?: string;
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("function_name", "enhance-beauty")
    .gte("created_at", oneHourAgo);

  if (!countError && (count ?? 0) >= 10) {
    return new Response(
      JSON.stringify({ error: "Rate limit reached. Maximum 10 enhancements per hour." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    function_name: "enhance-beauty",
  });

  try {
    const body = await req.json();
    const { imageBase64, makeupConfig, style, intensity } = body;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageBase64.length > 7_000_000) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum size is 5MB." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const prompt = buildPrompt(makeupConfig as MakeupConfig | null, style, intensity);

    const imageUri = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // ── Appel Replicate flux-kontext-max (meilleur rendu visage) ──────────────
    const response = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions",
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
        return new Response(
          JSON.stringify({ error: "Invalid API token." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to enhance image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded" && prediction.output) {
      const imageUrl = typeof prediction.output === "string"
        ? prediction.output
        : prediction.output[0];
      return new Response(
        JSON.stringify({ enhancedImage: imageUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return new Response(
        JSON.stringify({ error: prediction.error || "Image enhancement failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const predictionUrl = prediction.urls?.get;
    if (!predictionUrl) {
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
});
