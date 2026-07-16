import type { SupabaseClient } from "@supabase/supabase-js";

export async function consumeGenerationCredit(supabase: SupabaseClient, jobId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_generation_credit", { target_job_id: jobId });
  if (error) throw new Error(`Unable to check generation entitlement: ${error.message}`);
  return data === true;
}

export async function refundGenerationCredit(supabase: SupabaseClient, userId: string, jobId: string): Promise<void> {
  const { error } = await supabase.from("credit_ledger").upsert({
    user_id: userId,
    amount: 1,
    reason: "generation_refund",
    generation_job_id: jobId,
  }, { onConflict: "generation_job_id,reason", ignoreDuplicates: true });
  if (error) throw new Error(`Unable to refund generation credit: ${error.message}`);
}
