import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const styleDesc = {
      luxury: "Dior haute couture campaign with opulent, refined elegance",
      classy: "Vogue editorial with timeless sophistication",
      elegant: "Harper's Bazaar cover with graceful polish",
      soft_glam: "Glossier campaign with effortless radiance",
      natural: "barely-there dewy beauty, fresh and minimal",
      party: "Met Gala glam with bold, dazzling drama",
      clean_girl: "Hailey Bieber clean girl aesthetic, dewy minimal",
      bold: "high-fashion editorial with statement-making intensity",
    }[style] || "luxury beauty campaign";

    const prompt = `Transform this selfie into an ultra-realistic, high-end beauty portrait. Style: ${styleDesc}.

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

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to enhance image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const enhancedImage =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

    if (!enhancedImage) {
      return new Response(
        JSON.stringify({ error: "AI did not return an enhanced image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
