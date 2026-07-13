-- Grant Data API access to the app tables so PostgREST (the anon/authenticated
-- roles) can reach them. RLS still restricts rows to the owner (auth.uid() = user_id).
-- This captures, for reproducibility, what the dashboard "expose table" toggle does —
-- Supabase's 2026 default does NOT auto-expose newly created tables.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.brand_profiles   to authenticated;
grant select, insert, update, delete on public.generated_assets to authenticated;

-- Signed-out clients can still hit the endpoint; RLS yields empty sets, so the API
-- returns 200 [] instead of erroring.
grant select on public.brand_profiles   to anon;
grant select on public.generated_assets to anon;

