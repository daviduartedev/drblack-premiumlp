-- =============================================================================
-- Seed de desenvolvimento completo — ciclo 0528
-- Simula todos os fluxos: estoque, rifa, vendida, arquivada, financeiro
--
-- COMO USAR:
--   1. Cole tudo no Supabase SQL Editor (Dashboard > SQL Editor > New query)
--   2. Execute
--
-- Este seed NÃO depende de UUIDs de usuários reais.
-- Skins, rifas e financeiro são criados com UUIDs gerados pelo banco.
-- =============================================================================

-- Limpar dados de teste anteriores (seguro para dev)
delete from public.financial_entries;
delete from public.tickets;
delete from public.purchases;
delete from public.raffles;
delete from public.skins;

-- =============================================================================
-- BLOCO 1 — Skins em estoque (aparecem na /loja)
-- Fluxo: admin cadastrou, preço e imagem OK, elegíveis para vitrine.
-- Valida: list_price, suggested_price (promo), wear_label, is_stat_trak, stickers
-- =============================================================================

insert into public.skins (
  name, weapon, pattern, float, rarity, wear_label, is_stat_trak,
  image_url, list_price, suggested_price, stickers,
  paid_value, estimated_market_value, desired_profit_value, desired_profit_percent,
  ticket_count, ticket_price, status, internal_notes
) values

-- 1a. AWP Redline FT — preco sugerido correto (promo = list * 1.10)
(
  'AWP | Redline',
  'Rifle', 'Redline', 0.2847, 'Classificada', 'FT', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoG3afSxgt2lwIMkjL_TqN-t2Vbk_RY5NT37IIWdIlI7MVvT5w/360fx360f',
  420.00, 462.00, '[]'::jsonb,
  280.00, 420.00, 84.00, 30,
  100, 10, 'em_estoque', 'Seed dev — imagem Steam CDN.'
),

-- 1b. AK-47 Slate MW StatTrak — sem suggested_price (modo lucro fixo no cadastro)
(
  'AK-47 | Slate',
  'Rifle', 'Slate', 0.1523, 'Restrita', 'MW', true,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC3afSxgt2lwIMkjL_TqN-t3Vbk_RY5NT37IIWdIlI7MVvT5w/360fx360f',
  185.00, null, '[]'::jsonb,
  120.00, 185.00, 37.00, 30,
  130, 8, 'em_estoque', 'StatTrak. Margem fixo -> sem sugerido.'
),

-- 1c. M4A4 Howl FN — cara, destaque, suggested_price alto
(
  'M4A4 | Howl',
  'Rifle', 'Howl', 0.0341, 'Contrabandeada', 'FN', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  4800.00, 5280.00, '[]'::jsonb,
  3200.00, 5000.00, 960.00, 30,
  500, 24, 'em_estoque', 'Howl contrabandeada — validar autenticidade antes de rifa.'
),

-- 1d. Karambit Fade FN — faca, preco alto, stickers preenchidos
(
  'Karambit | Fade',
  'Faca', 'Fade', 0.0612, 'Rara Especial', 'FN', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  2200.00, 2420.00,
  '[{"name":"Titan (Foil) | Katowice 2014","img":"https://steamcdn-a.akamaihd.net/apps/730/icons/econ/stickers/kat2014/titan_holo.png"}]'::jsonb,
  1500.00, 2300.00, 450.00, 30,
  300, 18, 'em_estoque', 'Karambit com sticker raro — preço firme.'
),

-- 1e. Glock-18 Water Elemental BS — desgaste máximo, barato
(
  'Glock-18 | Water Elemental',
  'Pistola', 'Water Elemental', 0.7823, 'Mil-Spec Grade', 'BS', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  28.00, 30.80, '[]'::jsonb,
  18.00, 28.00, 5.40, 30,
  50, 1, 'em_estoque', 'BS — entrada no portfólio.'
),

-- 1f. Desert Eagle Blaze FN — clássica
(
  'Desert Eagle | Blaze',
  'Pistola', 'Blaze', 0.0099, 'Restrita', 'FN', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  560.00, 616.00, '[]'::jsonb,
  370.00, 560.00, 111.00, 30,
  150, 12, 'em_estoque', 'Blaze quase 0.01 — float impressiona clientes.'
);

-- =============================================================================
-- BLOCO 2 — Skins em rifa ativa (aparecem em /rifas, NÃO em /loja)
-- Fluxo: admin cadastrou rifa, skin moveu para em_rifa.
-- =============================================================================

insert into public.skins (
  name, weapon, pattern, float, rarity, wear_label, is_stat_trak,
  image_url, list_price, suggested_price, stickers,
  paid_value, estimated_market_value, desired_profit_value, desired_profit_percent,
  ticket_count, ticket_price, status, internal_notes
) values
(
  'AWP | Dragon Lore',
  'Rifle', 'Dragon Lore', 0.0823, 'Contrabandeada', 'FN', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  0, null, '[]'::jsonb,
  8500.00, 12000.00, 2550.00, 30,
  500, 28, 'em_rifa', 'Dragon Lore em rifa — maior rifa do catálogo.'
),
(
  'AK-47 | Fire Serpent',
  'Rifle', 'Fire Serpent', 0.2234, 'Contrabandeada', 'FT', false,
  'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I4oY11Y3nMFAZlobdQJaVKiZSwd2T1B5SXGBAfD5Up_Ok1c3tRkhXWAJuYbqzLjRfW1GCnaBQuxRo7OqymoC0u-L6jBzGdklMn0rDr2gX93RMlYNT37IIWdIlI7MVvT5w/360fx360f',
  0, null, '[]'::jsonb,
  2100.00, 3200.00, 630.00, 30,
  200, 15, 'em_rifa', 'Fire Serpent FT em rifa menor.'
);

-- =============================================================================
-- BLOCO 3 — Skins vendidas (histórico financeiro)
-- Fluxo: skin vendida, entradas de custo + receita + lucro_realizado.
-- =============================================================================

insert into public.skins (
  name, weapon, pattern, float, rarity, wear_label, is_stat_trak,
  image_url, list_price, suggested_price, stickers,
  paid_value, estimated_market_value, desired_profit_value, desired_profit_percent,
  ticket_count, ticket_price, status, internal_notes
) values
(
  'USP-S | Printstream',
  'Pistola', 'Printstream', 0.1122, 'Classificada', 'MW', true,
  '',
  350.00, null, '[]'::jsonb,
  220.00, 350.00, 66.00, 30,
  100, 10, 'vendida', 'Vendida diretamente. Lucro realizado registrado.'
),
(
  'AWP | Asiimov',
  'Rifle', 'Asiimov', 0.3981, 'Classificada', 'FT', false,
  '',
  380.00, null, '[]'::jsonb,
  250.00, 385.00, 75.00, 30,
  100, 10, 'entregue', 'Entregue ao cliente. Ciclo completo.'
);

-- =============================================================================
-- BLOCO 4 — Skin arquivada (nunca aparece em lugar público)
-- Fluxo: admin arquivou — inativa operacionalmente.
-- =============================================================================

insert into public.skins (
  name, weapon, pattern, float, rarity, wear_label, is_stat_trak,
  image_url, list_price, suggested_price, stickers,
  paid_value, estimated_market_value, desired_profit_value, desired_profit_percent,
  ticket_count, ticket_price, status, internal_notes
) values
(
  'P90 | Asiimov',
  'SMG', 'Asiimov', 0.5012, 'Classificada', 'WW', false,
  '',
  60.00, null, '[]'::jsonb,
  42.00, 60.00, 12.60, 30,
  80, 2, 'arquivada', 'Arquivada — desgaste além do esperado. Não rifar.'
);

-- =============================================================================
-- BLOCO 5 — Rifas
-- Criadas para as skins em_rifa do BLOCO 2.
-- Inclui: ativa, parcialmente vendida (sold_tickets), aguardando sorteio.
-- =============================================================================

with dragon as (
  select id from public.skins where name = 'AWP | Dragon Lore' limit 1
),
fireserpent as (
  select id from public.skins where name = 'AK-47 | Fire Serpent' limit 1
)
insert into public.raffles (skin_id, title, status, ticket_count, ticket_price, sold_tickets, draw_date)
values
(
  (select id from dragon),
  'Dragon Lore FN — Rifa Especial DR Black',
  'ativa',
  500, 28.00, 147,
  (current_date + interval '20 days')::date
),
(
  (select id from fireserpent),
  'AK-47 Fire Serpent FT — Sorteio Semanal',
  'aguardando_sorteio',
  200, 15.00, 200,
  (current_date + interval '3 days')::date
);

-- =============================================================================
-- BLOCO 6 — Entradas financeiras
-- Cobre: custo de aquisição, receita de venda, taxa, lucro_realizado.
-- Associadas a skins com IDs reais (sem FK de usuário).
-- =============================================================================

-- Auxiliar: skins com IDs para referenciar
with
  redline    as (select id from public.skins where name = 'AWP | Redline'        limit 1),
  howl       as (select id from public.skins where name = 'M4A4 | Howl'           limit 1),
  printstream as (select id from public.skins where name = 'USP-S | Printstream'  limit 1),
  asiimov    as (select id from public.skins where name = 'AWP | Asiimov'         limit 1),
  dragon     as (select id from public.skins where name = 'AWP | Dragon Lore'     limit 1),
  karambit   as (select id from public.skins where name = 'Karambit | Fade'       limit 1),
  deagle     as (select id from public.skins where name = 'Desert Eagle | Blaze'  limit 1)
insert into public.financial_entries (skin_id, raffle_id, kind, label, amount, date)
values
-- Custos de aquisição (estoque ativo)
((select id from redline),     null, 'custo',           'Custo — AWP Redline',          280.00,  current_date - 15),
((select id from howl),        null, 'custo',           'Custo — M4A4 Howl',           3200.00,  current_date - 30),
((select id from karambit),    null, 'custo',           'Custo — Karambit Fade',        1500.00,  current_date - 20),
((select id from deagle),      null, 'custo',           'Custo — Desert Eagle Blaze',    370.00,  current_date - 10),
((select id from dragon),      null, 'custo',           'Custo — AWP Dragon Lore',      8500.00,  current_date - 45),

-- Ciclo completo: USP-S Printstream vendida (custo + receita + taxa + lucro)
((select id from printstream), null, 'custo',           'Custo — USP-S Printstream',     220.00, current_date - 40),
((select id from printstream), null, 'receita',         'Venda — USP-S Printstream',     350.00, current_date - 12),
((select id from printstream), null, 'taxa',            'Taxa MP — USP-S Printstream',    10.50, current_date - 12),
((select id from printstream), null, 'lucro_realizado', 'Lucro — USP-S Printstream',     119.50, current_date - 12),

-- Ciclo completo: AWP Asiimov entregue
((select id from asiimov),     null, 'custo',           'Custo — AWP Asiimov',           250.00, current_date - 60),
((select id from asiimov),     null, 'receita',         'Venda — AWP Asiimov',           380.00, current_date - 8),
((select id from asiimov),     null, 'taxa',            'Taxa MP — AWP Asiimov',          11.40, current_date - 8),
((select id from asiimov),     null, 'lucro_realizado', 'Lucro — AWP Asiimov',           118.60, current_date - 8);

-- =============================================================================
-- VERIFICAÇÃO FINAL — contagens esperadas
-- =============================================================================

select
  'skins'             as tabela,
  count(*)            as total,
  count(*) filter (where status = 'em_estoque')         as em_estoque,
  count(*) filter (where status = 'em_rifa')            as em_rifa,
  count(*) filter (where status in ('vendida','entregue')) as vendidas,
  count(*) filter (where status = 'arquivada')          as arquivadas
from public.skins

union all

select
  'raffles', count(*),
  count(*) filter (where status = 'ativa'),
  count(*) filter (where status = 'aguardando_sorteio'),
  count(*) filter (where status = 'encerrada'),
  0
from public.raffles

union all

select
  'financial_entries', count(*),
  count(*) filter (where kind = 'custo'),
  count(*) filter (where kind = 'receita'),
  count(*) filter (where kind = 'lucro_realizado'),
  count(*) filter (where kind = 'taxa')
from public.financial_entries;
