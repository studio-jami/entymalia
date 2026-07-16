import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, billingPlans, stripe } from "@/lib/billing/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { plan: requestedPlan } = await request.json().catch(() => ({}));
  const plan = billingPlans().find((candidate) => `${candidate.key}_${candidate.interval}` === requestedPlan);
  if (!plan) return NextResponse.json({ error: "Unknown billing plan." }, { status: 400 });
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    subscription_data: { metadata: { supabase_user_id: user.id, plan_key: plan.key, billing_interval: plan.interval } },
    metadata: { supabase_user_id: user.id, plan_key: plan.key, billing_interval: plan.interval },
    success_url: `${appUrl()}/workspace?billing=success`,
    cancel_url: `${appUrl()}/workspace?billing=cancelled`,
  });
  return NextResponse.json({ url: session.url });
}
