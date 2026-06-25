// Illustrative cost estimate. We do NOT have real prices — only the coarse
// priceRange ($/$$/$$$). So we map each tier to an illustrative annual cost band
// per seat (BRL) and let the user override the seat count. Always shown as an
// estimate to be validated with the vendor, never as a real quote.
const PRICE_BAND_BRL: Record<string, [number, number]> = {
  $: [60, 180],
  $$: [180, 480],
  $$$: [480, 1200],
};

export interface CostEstimate {
  low: number;
  high: number;
}

export function estimateAnnualCost(priceRange: string, seats: number): CostEstimate | null {
  const band = PRICE_BAND_BRL[priceRange];
  if (!band || seats <= 0) return null;
  return { low: band[0] * seats, high: band[1] * seats };
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function formatCostRange(estimate: CostEstimate | null): string {
  if (!estimate) return '—';
  return `${currency.format(estimate.low)} – ${currency.format(estimate.high)}`;
}
