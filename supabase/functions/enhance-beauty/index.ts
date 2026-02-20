import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function pollTaskResult(taskId: string, apiKey: string): Promise<string> {
  const maxAttempts = 30;
  const pollInterval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const res = await fetch(
      `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Poll failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const status = data.output?.task_status;

    if (status === "SUCCEEDED") {
      const imageUrl = data.output?.results?.[0]?.url;
      if (!imageUrl) throw new Error("No image URL in completed task");
      return imageUrl;
    }

    if (status === "FAILED") {
      throw new Error(`Task failed: ${data.output?.message || "Unknown error"}`);
    }
    // PENDING or RUNNING — keep polling
  }

  throw new Error("Task timed out after 60 seconds");
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

    const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
    if (!DASHSCOPE_API_KEY) {
      throw new Error("DASHSCOPE_API_KEY is not configured");
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

    // Submit async task to DashScope
    const response = await fetch(
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
          "Content-Type": "application/json",
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
          model: "qwen-image-edit",
          input: {
            messages: [
              {
                role: "user",
                content: [
                  { image: imageBase64 },
                  { text: prompt },
                ],
              },
            ],
          },
          parameters: { n: 1, size: "1024*1024" },
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
      const errText = await response.text();
      console.error("DashScope submit error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to enhance image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitData = await response.json();
    const taskId = submitData.output?.task_id;

    if (!taskId) {
      console.error("No task_id in response:", JSON.stringify(submitData));
      return new Response(
        JSON.stringify({ error: "Failed to start image enhancement" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Poll for result
    const imageUrl = await pollTaskResult(taskId, DASHSCOPE_API_KEY);

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
