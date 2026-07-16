-- Stripe is the payment authority. These tables are the product-side, auditable
-- projection used to decide whether an authenticated user may start paid work.

create table public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_subscriptions (
  stripe_subscription_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_price_id text,
  plan_key text not null default 'unknown',
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  raw_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index billing_subscriptions_user_status_idx
  on public.billing_subscriptions(user_id, status);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null check (reason in ('subscription_allocation', 'generation_debit', 'generation_refund', 'admin_adjustment')),
  stripe_event_id text unique,
  generation_job_id uuid references public.generation_jobs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index credit_ledger_user_created_idx on public.credit_ledger(user_id, created_at desc);
alter table public.credit_ledger
  add constraint credit_ledger_generation_reason_key unique (generation_job_id, reason);

create table public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

create trigger billing_customers_set_updated_at before update on public.billing_customers
  for each row execute function public.set_updated_at();
create trigger billing_subscriptions_set_updated_at before update on public.billing_subscriptions
  for each row execute function public.set_updated_at();

-- A normal client can only read its own commercial state. All writes are made
-- by the trusted webhook route using the service role.
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.billing_customers force row level security;
alter table public.billing_subscriptions force row level security;
alter table public.credit_ledger force row level security;
alter table public.stripe_webhook_events force row level security;

create policy "users can view their billing customer" on public.billing_customers for select to authenticated using (user_id = (select auth.uid()));
create policy "users can view their subscriptions" on public.billing_subscriptions for select to authenticated using (user_id = (select auth.uid()));
create policy "users can view their credit ledger" on public.credit_ledger for select to authenticated using (user_id = (select auth.uid()));
grant select on public.billing_customers, public.billing_subscriptions, public.credit_ledger to authenticated;

-- Atomically reserve a credit. A failed enqueue is explicitly refunded by the
-- server action; a duplicate submit cannot spend two credits for one job.
create function public.consume_generation_credit(target_job_id uuid)
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

  if exists (select 1 from public.credit_ledger where generation_job_id = target_job_id and reason = 'generation_debit') then
    return true;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

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
