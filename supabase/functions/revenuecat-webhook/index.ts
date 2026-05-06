import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const log = (step: string, details?: unknown) => {
  console.log(`[revenuecat-webhook] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Verify shared secret sent by RevenueCat (Authorization header you set in the dashboard)
    const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
    const got = req.headers.get("authorization") ?? "";
    if (!expected || got !== expected) {
      log("auth failed");
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const body = await req.json();
    const event = body?.event ?? {};
    log("event received", { type: event.type, app_user_id: event.app_user_id });

    const appUserId: string | undefined = event.app_user_id;
    if (!appUserId) throw new Error("missing app_user_id");

    const productId: string | undefined = event.product_id;
    const expiresMs: number | undefined = event.expiration_at_ms;
    const expiresAt = expiresMs ? new Date(expiresMs).toISOString() : null;

    // Active when type is INITIAL_PURCHASE / RENEWAL / UNCANCELLATION / PRODUCT_CHANGE / TRIAL_STARTED
    // Inactive when CANCELLATION / EXPIRATION / SUBSCRIPTION_PAUSED / BILLING_ISSUE (after grace)
    const inactiveTypes = new Set([
      "CANCELLATION",
      "EXPIRATION",
      "SUBSCRIPTION_PAUSED",
    ]);
    const active = expiresAt
      ? new Date(expiresAt).getTime() > Date.now() && !inactiveTypes.has(event.type)
      : !inactiveTypes.has(event.type);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // app_user_id is the Supabase auth user.id (set when we configure RC on app start)
    const { error } = await supabase
      .from("play_subscriptions")
      .upsert(
        {
          user_id: appUserId,
          platform: "android",
          product_id: productId ?? null,
          active,
          expires_at: expiresAt,
          revenuecat_app_user_id: appUserId,
          raw_event: event,
        },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
