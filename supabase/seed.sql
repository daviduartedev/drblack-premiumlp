-- Seed de desenvolvimento — aplicar APOS criar usuarios no Supabase Auth.
-- Substitua os UUIDs pelos auth.users.id reais do dashboard.
--
-- Exemplo (criar no Auth > Users):
--   admin@drblackskins.dev / senha forte
--   cliente@drblackskins.dev / senha forte
--
-- Depois atualize os profiles:
--   update profiles set role = 'admin', name = 'Admin DR' where email = 'admin@drblackskins.dev';

insert into public.skins (
  name, weapon, pattern, float, rarity, wear_label, is_stat_trak,
  image_url, list_price, suggested_price, stickers,
  paid_value, estimated_market_value, desired_profit_value, desired_profit_percent,
  ticket_count, ticket_price, status, internal_notes
) values
(
  'AWP | Redline',
  'Rifle',
  'Redline',
  0.2847,
  'Classificada',
  'FT',
  false,
  '/gallery/knife.png',
  420.00,
  480.00,
  '[]'::jsonb,
  280.00,
  420.00,
  84.00,
  30,
  100,
  10,
  'em_estoque',
  'Seed dev — substituir imagem por Blob em producao.'
),
(
  'AK-47 | Slate',
  'Rifle',
  'Slate',
  0.1523,
  'Restrita',
  'MW',
  true,
  '/gallery/card1.jpg',
  185.00,
  null,
  '[]'::jsonb,
  120.00,
  185.00,
  37.00,
  30,
  130,
  8,
  'em_estoque',
  'Seed dev.'
);
