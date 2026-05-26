-- Corrige: infinite recursion detected in policy for relation "profiles"
-- Causa: policies admin faziam subquery em public.profiles dentro de RLS em profiles.
-- Solucao: funcao security definer is_admin() (bypass RLS na checagem de role).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to anon;

-- profiles: uma policy de leitura sem subquery recursiva
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_admin_select_all" on public.profiles;

create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Demais tabelas: trocar subquery em profiles por is_admin()
drop policy if exists "skins_admin_all" on public.skins;
create policy "skins_admin_all"
  on public.skins for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "raffles_admin_all" on public.raffles;
create policy "raffles_admin_all"
  on public.raffles for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "tickets_admin_all" on public.tickets;
create policy "tickets_admin_all"
  on public.tickets for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "purchases_admin_all" on public.purchases;
create policy "purchases_admin_all"
  on public.purchases for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "financial_admin_only" on public.financial_entries;
create policy "financial_admin_only"
  on public.financial_entries for all
  using (public.is_admin())
  with check (public.is_admin());
