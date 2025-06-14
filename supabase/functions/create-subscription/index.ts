import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { playerId } = await req.json();
    if (!playerId) throw new Error("Player ID is required");
    logStep("Request validated", { playerId });

    // Get subscription pricing from system settings
    const { data: priceSetting } = await supabaseClient
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "monthly_subscription_price_pence")
      .single();

    const { data: currencySetting } = await supabaseClient
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "subscription_currency")
      .single();

    const monthlyPrice = parseInt(priceSetting?.setting_value || "2500");
    const currency = currencySetting?.setting_value || "gbp";
    logStep("Retrieved pricing", { monthlyPrice, currency });

    // Verify user owns this player
    const { data: guardian } = await supabaseClient
      .from("guardians")
      .select("player_id")
      .eq("id", user.id)
      .eq("player_id", playerId)
      .single();

    if (!guardian) throw new Error("Player not found or not authorized");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Get player name for description
    const { data: player } = await supabaseClient
      .from("players")
      .select("first_name, last_name")
      .eq("id", playerId)
      .single();

    const playerName = player ? `${player.first_name} ${player.last_name}` : "Player";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { 
              name: `Monthly Subscription - ${playerName}`,
              description: `Monthly netball club subscription for ${playerName}`
            },
            unit_amount: monthlyPrice,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/children`,
      metadata: {
        player_id: playerId,
        guardian_id: user.id,
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});