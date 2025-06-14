import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscriptions").upsert({
        guardian_id: user.id,
        player_id: playerId,
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'guardian_id,player_id' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    const activeSubscriptions = subscriptions.data.filter(sub => 
      sub.metadata.player_id === playerId
    );

    const hasActiveSub = activeSubscriptions.length > 0;
    let subscriptionEndDate = null;

    if (hasActiveSub) {
      const subscription = activeSubscriptions[0];
      subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEndDate });

      // Update subscription in database
      await supabaseClient.from("subscriptions").upsert({
        guardian_id: user.id,
        player_id: playerId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: 'active',
        start_date: new Date(subscription.start_date * 1000).toISOString().split('T')[0],
        end_date: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString().split('T')[0] : null,
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
        amount_pence: subscription.items.data[0].price.unit_amount || 0,
        auto_renew: !subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'guardian_id,player_id' });
    } else {
      logStep("No active subscription found");
      await supabaseClient.from("subscriptions").upsert({
        guardian_id: user.id,
        player_id: playerId,
        stripe_customer_id: customerId,
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'guardian_id,player_id' });
    }

    logStep("Updated database with subscription info", { subscribed: hasActiveSub });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_end: subscriptionEndDate
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});