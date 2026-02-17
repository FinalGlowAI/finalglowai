import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log("[CLEANUP] Deleting posts older than:", cutoff);

    // Get expired posts
    const { data: expiredPosts, error: fetchError } = await supabase
      .from("glow_posts")
      .select("id, storage_path")
      .lt("created_at", cutoff);

    if (fetchError) throw fetchError;

    if (!expiredPosts || expiredPosts.length === 0) {
      console.log("[CLEANUP] No expired posts found");
      return new Response(JSON.stringify({ deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[CLEANUP] Found ${expiredPosts.length} expired posts`);

    // Delete storage files
    const storagePaths = expiredPosts.map((p) => p.storage_path);
    const { error: storageError } = await supabase.storage
      .from("glow-posts")
      .remove(storagePaths);

    if (storageError) console.error("[CLEANUP] Storage delete error:", storageError);

    // Delete DB rows (cascades to likes)
    const ids = expiredPosts.map((p) => p.id);
    const { error: deleteError } = await supabase
      .from("glow_posts")
      .delete()
      .in("id", ids);

    if (deleteError) throw deleteError;

    console.log(`[CLEANUP] Deleted ${expiredPosts.length} posts`);
    return new Response(JSON.stringify({ deleted: expiredPosts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
