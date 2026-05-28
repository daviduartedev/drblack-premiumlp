/** One-off validation for cycle 0528 — run: node scripts/validate-0528-cycle.mjs */

const roundCurrency = (value) => Math.round(value * 100) / 100;
const STORE_PROMO_MARGIN_PERCENT = 10;

function calculateStorePricing(input) {
  const paidValue =
    typeof input.paidValue === "number" && input.paidValue > 0
      ? input.paidValue
      : 0;
  const desiredProfit =
    input.profitMode === "percent"
      ? paidValue * ((input.desiredProfitPercent ?? 0) / 100)
      : input.desiredProfitValue ?? 0;
  const listPrice = roundCurrency(paidValue + desiredProfit);
  const suggestedPrice =
    input.profitMode === "percent" && paidValue > 0 && listPrice > 0
      ? roundCurrency(listPrice * (1 + STORE_PROMO_MARGIN_PERCENT / 100))
      : null;
  return { listPrice, suggestedPrice };
}

const WEAR_FLOATS = { FN: 0.04, MW: 0.1, FT: 0.25, WW: 0.42, BS: 0.75 };

let failed = 0;
function assert(label, cond) {
  if (!cond) {
    console.error("FAIL:", label);
    failed++;
  } else {
    console.log("OK:", label);
  }
}

const cases = [
  { paid: 100, pct: 20, list: 120, suggested: 132 },
  { paid: 100, pct: 10, list: 110, suggested: 121 },
  { paid: 50, pct: 30, list: 65, suggested: 71.5 },
];

for (const c of cases) {
  const r = calculateStorePricing({
    paidValue: c.paid,
    profitMode: "percent",
    desiredProfitPercent: c.pct,
  });
  assert(`${c.paid}+${c.pct}% -> list ${c.list}, suggested ${c.suggested}`, r.listPrice === c.list && r.suggestedPrice === c.suggested);
  assert(`suggested > list (${c.paid}+${c.pct}%)`, (r.suggestedPrice ?? 0) > r.listPrice);
}

const margin20 = calculateStorePricing({
  paidValue: 100,
  profitMode: "percent",
  desiredProfitPercent: 20,
});
assert("suggested !== cost+10% (not 110)", margin20.suggestedPrice !== 110);

const fixed = calculateStorePricing({
  paidValue: 100,
  profitMode: "fixed",
  desiredProfitValue: 25,
});
assert("fixed mode: suggested null", fixed.suggestedPrice === null);
assert("fixed mode: list 125", fixed.listPrice === 125);

for (const w of ["FN", "MW", "FT", "WW", "BS"]) {
  assert(`wear ${w} has float preset`, WEAR_FLOATS[w] != null);
}

console.log(failed === 0 ? "\nAll 0528 pricing/wear checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed > 0 ? 1 : 0);
