"use client";

import { useState } from "react";

type Plan = { key: string; interval: "monthly" | "yearly"; label: string; credits: number };

async function redirectTo(endpoint: string, body?: unknown) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok || !data.url) throw new Error(data.error ?? "Billing request failed.");
  window.location.assign(data.url);
}

export function BillingControls({ plans, hasBillingAccount }: { plans: Plan[]; hasBillingAccount: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const startCheckout = async (plan: string) => {
    setError(null); setLoading(plan);
    try { await redirectTo("/api/stripe/checkout", { plan }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Billing request failed."); setLoading(null); }
  };
  const openPortal = async () => {
    setError(null); setLoading("portal");
    try { await redirectTo("/api/stripe/portal"); } catch (cause) { setError(cause instanceof Error ? cause.message : "Billing request failed."); setLoading(null); }
  };
  return <section className="workspace-card" aria-labelledby="billing-title">
    <div className="workspace-card__heading"><div><p className="eyebrow">Billing</p><h2 id="billing-title">Generation credits</h2></div></div>
    <p className="workspace-card__empty">Full-kit generation uses one credit. Promotion codes are accepted at checkout.</p>
    <div className="form-actions">
      {plans.map((plan) => { const identifier = `${plan.key}_${plan.interval}`; return <button className="button button--secondary" key={identifier} type="button" disabled={loading !== null} onClick={() => startCheckout(identifier)}>{loading === identifier ? "Opening checkout…" : `${plan.label} · ${plan.interval} · ${plan.credits} credits`}</button>; })}
      {hasBillingAccount ? <button className="button button--secondary" type="button" disabled={loading !== null} onClick={openPortal}>{loading === "portal" ? "Opening portal…" : "Manage billing"}</button> : null}
    </div>
    {error ? <p className="status status--warning">{error}</p> : null}
  </section>;
}
