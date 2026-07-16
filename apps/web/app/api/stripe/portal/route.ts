import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, stripe } from "@/lib/billing/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: customer } = await supabase.from("billing_customers").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: "No billing account yet." }, { status: 404 });
  const session = await stripe().billingPortal.sessions.create({ customer: customer.stripe_customer_id, return_url: `${appUrl()}/workspace` });
  return NextResponse.json({ url: session.url });
}
