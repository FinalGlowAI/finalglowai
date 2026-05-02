import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  console.log(`[create-checkout] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("function start");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("missing auth header");
      throw new Error("Please sign in again to upgrade your plan.");
    }
    const token = authHeader.replace("Bearer ", "");
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      log("auth error", { message: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = data.user;
    if (!user?.email) {
      log("no user email");
      throw new Error("Please sign in again to upgrade your plan.");
    }
    log("user authenticated", { email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("missing stripe key");
      throw new Error("Payment system is not configured. Please contact support.");
    }

    let body: any = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch (e) {
      log("body parse warn", { msg: (e as Error).message });
    }
    const couponCode: string | undefined = body?.couponCode;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    log("stripe initialized");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;
    log("customer lookup", { found: !!customerId });

    const origin = req.headers.get("origin") || "https://finalglowai.com";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: "price_1T490O21KLfTwdbbeMiRkcuZ", quantity: 1 }],
      mode: "subscription",
      subscription_data: { trial_period_days: 3 },
      success_url: `${origin}/home?subscribed=true`,
      cancel_url: `${origin}/profile`,
    };

    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    log("checkout session created", { id: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
