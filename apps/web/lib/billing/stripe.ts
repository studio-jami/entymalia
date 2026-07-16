import Stripe from "stripe";

const required = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

export const stripe = () => new Stripe(required("STRIPE_SECRET_KEY"));

export type PlanKey = "personal" | "entrepreneur" | "business";
export type BillingInterval = "monthly" | "yearly";

export interface BillingPlan {
  key: PlanKey;
  interval: BillingInterval;
  label: string;
  priceId: string;
  credits: number;
}

const planEnvironment: Array<[PlanKey, BillingInterval, string, string, string]> = [
  ["personal", "monthly", "Personal", "STRIPE_PRICE_ID_PERSONAL_MONTHLY", "ETYMALIA_CREDITS_PERSONAL_MONTHLY"],
  ["personal", "yearly", "Personal", "STRIPE_PRICE_ID_PERSONAL_YEARLY", "ETYMALIA_CREDITS_PERSONAL_YEARLY"],
  ["entrepreneur", "monthly", "Entrepreneur", "STRIPE_PRICE_ID_ENTREPRENEUR_MONTHLY", "ETYMALIA_CREDITS_ENTREPRENEUR_MONTHLY"],
  ["entrepreneur", "yearly", "Entrepreneur", "STRIPE_PRICE_ID_ENTREPRENEUR_YEARLY", "ETYMALIA_CREDITS_ENTREPRENEUR_YEARLY"],
  ["business", "monthly", "Business", "STRIPE_PRICE_ID_BUSINESS_MONTHLY", "ETYMALIA_CREDITS_BUSINESS_MONTHLY"],
  ["business", "yearly", "Business", "STRIPE_PRICE_ID_BUSINESS_YEARLY", "ETYMALIA_CREDITS_BUSINESS_YEARLY"],
];

export function billingPlans(): BillingPlan[] {
  return planEnvironment.flatMap(([key, interval, label, priceVariable, creditsVariable]) => {
    const priceId = process.env[priceVariable]?.trim();
    if (!priceId) return [];
    const credits = Number.parseInt(process.env[creditsVariable] ?? "", 10);
    if (!Number.isSafeInteger(credits) || credits < 1) {
      throw new Error(`${creditsVariable} must be a positive integer.`);
    }
    return [{ key, interval, label, priceId, credits }];
  });
}

export function planForPrice(priceId: string | null | undefined): BillingPlan | undefined {
  return billingPlans().find((plan) => plan.priceId === priceId);
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://etymalia.jami.studio").replace(/\/$/, "");
}
