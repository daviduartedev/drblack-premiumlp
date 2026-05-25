-- DR Black Skins — schema inicial (ciclo 0524)
-- Aplicar em projeto Supabase vazio via SQL Editor ou CLI.

-- ---------------------------------------------------------------------------
-- profiles (espelha auth.users + role)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_admin_select_all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- skins
-- ---------------------------------------------------------------------------
create table if not exists public.skins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  weapon text not null default '',
  pattern text not null default '',
  float numeric,
  rarity text not null default '',
  wear_label text not null default '',
  is_stat_trak boolean not null default false,
  image_url text not null default '',
  list_price numeric not null default 0,
  suggested_price numeric,
  stickers jsonb not null default '[]'::jsonb,
  paid_value numeric not null default 0,
  estimated_market_value numeric not null default 0,
  desired_profit_value numeric not null default 0,
  desired_profit_percent numeric not null default 30,
  ticket_count integer not null default 100,
  ticket_price numeric not null default 10,
  status text not null check (
    status in ('em_estoque', 'em_rifa', 'vendida', 'entregue', 'arquivada')
  ),
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skins_status_idx on public.skins (status);

alter table public.skins enable row level security;

create policy "skins_admin_all"
  on public.skins for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "skins_public_read_em_estoque"
  on public.skins for select
  using (status = 'em_estoque');

-- View somente colunas publicas (loja)
create or replace view public.public_store_skins as
select
  id,
  name,
  weapon,
  pattern,
  float,
  rarity,
  wear_label,
  is_stat_trak,
  image_url,
  list_price,
  suggested_price,
  stickers,
  status
from public.skins
where status = 'em_estoque';

grant select on public.public_store_skins to anon, authenticated;

-- ---------------------------------------------------------------------------
-- raffles
-- ---------------------------------------------------------------------------
create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  skin_id uuid not null references public.skins (id) on delete restrict,
  title text not null,
  status text not null check (
    status in ('ativa', 'encerrada', 'ganha', 'perdida', 'aguardando_sorteio')
  ),
  ticket_count integer not null default 100,
  ticket_price numeric not null default 10,
  sold_tickets integer not null default 0,
  draw_date date not null,
  created_at timestamptz not null default now()
);

alter table public.raffles enable row level security;

create policy "raffles_admin_all"
  on public.raffles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "raffles_public_read"
  on public.raffles for select
  using (status = 'ativa');

-- ---------------------------------------------------------------------------
-- tickets
-- ---------------------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  number text not null,
  status text not null check (
    status in ('ativa', 'encerrada', 'ganha', 'perdida', 'aguardando_sorteio')
  ),
  created_at timestamptz not null default now()
);

alter table public.tickets enable row level security;

create policy "tickets_admin_all"
  on public.tickets for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "tickets_customer_own"
  on public.tickets for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  raffle_id uuid not null references public.raffles (id) on delete restrict,
  date date not null default current_date,
  tickets integer not null default 1,
  total numeric not null default 0,
  status text not null check (status in ('pago', 'pendente', 'cancelado')),
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "purchases_admin_all"
  on public.purchases for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "purchases_customer_own"
  on public.purchases for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- financial_entries
-- ---------------------------------------------------------------------------
create table if not exists public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  skin_id uuid references public.skins (id) on delete set null,
  raffle_id uuid references public.raffles (id) on delete set null,
  kind text not null check (
    kind in ('custo', 'receita', 'taxa', 'lucro_realizado')
  ),
  label text not null,
  amount numeric not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.financial_entries enable row level security;

create policy "financial_admin_only"
  on public.financial_entries for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Trigger: novo usuario → profile (role customer por padrao)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
