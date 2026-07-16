import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingPlans, planForPrice, stripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";

function subscriptionPrice(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price.id ?? null;
}

async function processEvent(event: Stripe.Event) {
  const admin = createAdminClient();
  const { error: lockError } = await admin.from("stripe_webhook_events").insert({ stripe_event_id: event.id, event_type: event.type });
  if (lockError) {
    if (lockError.code === "23505") return;
    throw new Error(lockError.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!userId || !customerId) return;
    const { error } = await admin.from("billing_customers").upsert({ user_id: userId, stripe_customer_id: customerId });
    if (error) throw new Error(error.message);
    return;
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    let { data: customer, error } = await admin.from("billing_customers").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    if (error) throw new Error(error.message);
    const metadataUserId = subscription.metadata.supabase_user_id;
    if (!customer && metadataUserId) {
      const { error: customerError } = await admin.from("billing_customers").upsert({ user_id: metadataUserId, stripe_customer_id: customerId });
      if (customerError) throw new Error(customerError.message);
      customer = { user_id: metadataUserId };
    }
    if (!customer) return;
    const priceId = subscriptionPrice(subscription);
    const plan = planForPrice(priceId);
    const { error: updateError } = await admin.from("billing_subscriptions").upsert({
      stripe_subscription_id: subscription.id,
      user_id: customer.user_id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      plan_key: plan?.key ?? "unknown",
      status: subscription.status,
      current_period_end: subscription.items.data[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      raw_json: subscription,
    });
    if (updateError) throw new Error(updateError.message);
    return;
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscription = invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!subscriptionId || !customerId) return;
    let { data: customer, error } = await admin.from("billing_customers").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    if (error) throw new Error(error.message);
    const metadataUserId = invoice.parent?.subscription_details?.metadata?.supabase_user_id;
    if (!customer && metadataUserId) {
      const { error: customerError } = await admin.from("billing_customers").upsert({ user_id: metadataUserId, stripe_customer_id: customerId });
      if (customerError) throw new Error(customerError.message);
      customer = { user_id: metadataUserId };
    }
    if (!customer) return;
    const subscriptionState = await stripe().subscriptions.retrieve(subscriptionId);
    const plan = planForPrice(subscriptionPrice(subscriptionState));
    if (!plan) return;
    const { error: creditError } = await admin.from("credit_ledger").insert({
      user_id: customer.user_id,
      amount: plan.credits,
      reason: "subscription_allocation",
      stripe_event_id: event.id,
      metadata: { plan: plan.key, subscriptionId, invoiceId: invoice.id },
    });
    if (creditError) throw new Error(creditError.message);
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
    await processEvent(event);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook processing failed." }, { status: 400 });
  }
  return NextResponse.json({ received: true });
}
