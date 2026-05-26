-- Ciclo 0526: skins em destaque na home (max 10 via app)

alter table public.skins
  add column if not exists is_featured boolean not null default false;

create index if not exists skins_is_featured_idx
  on public.skins (is_featured)
  where is_featured = true;

create or replace view public.public_featured_skins as
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
where is_featured = true
  and status = 'em_estoque'
  and coalesce(trim(name), '') <> ''
  and list_price > 0
  and coalesce(trim(image_url), '') <> '';

grant select on public.public_featured_skins to anon, authenticated;
