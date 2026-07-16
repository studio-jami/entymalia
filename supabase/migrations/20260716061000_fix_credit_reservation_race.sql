-- Re-check the idempotency record after acquiring the per-user transaction
-- lock. This makes concurrent duplicate submits return the original debit
-- instead of colliding with the credit-ledger uniqueness constraint.

create or replace function public.consume_generation_credit(target_job_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_balance integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  if exists (select 1 from public.credit_ledger where generation_job_id = target_job_id and reason = 'generation_debit') then
    return true;
  end if;

  select coalesce(sum(amount), 0) into current_balance
  from public.credit_ledger
  where user_id = auth.uid();

  if current_balance < 1 then
    return false;
  end if;

  insert into public.credit_ledger (user_id, amount, reason, generation_job_id)
  values (auth.uid(), -1, 'generation_debit', target_job_id);
  return true;
end;
$$;

revoke all on function public.consume_generation_credit(uuid) from public, anon;
grant execute on function public.consume_generation_credit(uuid) to authenticated;
