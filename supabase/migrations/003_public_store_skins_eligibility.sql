-- Ciclo 0526: vitrine /loja só com skins publicáveis (preço + imagem + nome)
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
where status = 'em_estoque'
  and coalesce(trim(name), '') <> ''
  and list_price > 0
  and coalesce(trim(image_url), '') <> '';

grant select on public.public_store_skins to anon, authenticated;
