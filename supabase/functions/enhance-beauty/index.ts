import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function pollPrediction(predictionUrl: string, apiToken: string): Promise<string> {
  const maxAttempts = 30;
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
      // Output can be a string URL or an array of URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;
      if (!imageUrl) throw new Error("No image URL in completed prediction");
      return imageUrl;
    }

    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${data.status}: ${data.error || "Unknown error"}`);
    }
    // starting or processing — keep polling
  }

  throw new Error("Prediction timed out after 60 seconds");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, makeupConfig, style } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    const styleDesc: Record<string, string> = {
      luxury: "Dior haute couture campaign with opulent, refined elegance",
      classy: "Vogue editorial with timeless sophistication",
      elegant: "Harper's Bazaar cover with graceful polish",
      soft_glam: "Glossier campaign with effortless radiance",
      natural: "barely-there dewy beauty, fresh and minimal",
      party: "Met Gala glam with bold, dazzling drama",
      clean_girl: "Hailey Bieber clean girl aesthetic, dewy minimal",
      bold: "high-fashion editorial with statement-making intensity",
    };

    const selectedStyle = styleDesc[style] || "luxury beauty campaign";

    const prompt = `Transform this selfie into an ultra-realistic, high-end beauty portrait. Style: ${selectedStyle}.

Requirements:
- Keep the EXACT same face, features, identity, and expression
- Apply flawless, airbrushed skin with realistic pore texture preserved
- Add soft studio lighting with gentle highlights on cheekbones and nose bridge
- Apply the makeup look: lip color ${makeupConfig?.lipColor || "rose"}, eye shadow ${makeupConfig?.eyeshadowColor || "gold"}, blush ${makeupConfig?.blushColor || "peach"}
- Add a subtle warm golden glow and soft bokeh background
- The result should look like a Sephora or Dior campaign photo
- Maintain photorealistic quality — NOT cartoon, NOT painting, NOT AI-looking
- Professional color grading with warm, luxurious tones
- Soft vignette and cinematic depth of field`;

    // Ensure the image is a proper data URI
    const imageUri = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // Create prediction on Replicate using SDXL img2img
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          image: imageUri,
          prompt: prompt,
          negative_prompt: "cartoon, painting, illustration, anime, deformed, ugly, blurry, low quality, watermark, text",
          strength: 0.35,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        },
      }),
    });

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
    const predictionUrl = prediction.urls?.get;

    if (!predictionUrl) {
      console.error("No prediction URL in response:", JSON.stringify(prediction));
      return new Response(
        JSON.stringify({ error: "Failed to start image enhancement" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Poll for result
    const imageUrl = await pollPrediction(predictionUrl, REPLICATE_API_TOKEN);

    // Fetch the image and convert to base64 data URL
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error("Failed to download enhanced image");
    }
    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(imgBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
    );
    const enhancedImage = `data:image/png;base64,${base64}`;

    return new Response(
      JSON.stringify({ enhancedImage }),
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
