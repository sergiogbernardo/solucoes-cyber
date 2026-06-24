// Recommendation engine. Pure functions: given the catalog solutions and the
// wizard answers, score and rank the solutions that fit the user's scenario.
//
// Category is a hard filter. The remaining answers contribute a weighted score
// (0..100); the market rating breaks ties. Every factor maps to real catalog
// data — we never score on fields the catalog does not carry.
import type { Answers, Budget, CompanySize, ScoredSolution, Solution } from './types';

const WEIGHTS = {
  rating: 30,
  size: 25,
  budget: 25,
  ecosystem: 12,
  compliance: 8,
} as const;

const TIER_RANK: Record<string, number> = {
  free: 0,
  standard: 1,
  premium: 2,
  enterprise: 3,
};

const PRICE_RANK: Record<string, number> = {
  $: 1,
  $$: 2,
  $$$: 3,
};

/** Tier that best matches each company size (same 0..3 scale as TIER_RANK). */
const SIZE_IDEAL_TIER: Record<CompanySize, number> = {
  micro: 1,
  small: 1,
  medium: 2,
  large: 3,
  enterprise: 3,
};

/** Price level the budget comfortably covers (same 1..3 scale as PRICE_RANK). */
const BUDGET_IDEAL_PRICE: Record<Budget, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export const SIZE_LABELS: Record<CompanySize, string> = {
  micro: 'até 50 pessoas',
  small: '51 a 200 pessoas',
  medium: '201 a 1.000 pessoas',
  large: '1.001 a 5.000 pessoas',
  enterprise: 'mais de 5.000 pessoas',
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function ratingFactor(solution: Solution): { score: number; reason?: string; caveat?: string } {
  if (solution.marketRating === null) {
    // Neutral, but flag it so the user knows the score lacks a quality signal.
    return { score: 0.5, caveat: 'Sem nota de mercado catalogada' };
  }
  const score = clamp01(solution.marketRating / 5);
  let reason: string | undefined;
  if (solution.marketRating >= 4.5)
    reason = `Avaliação de mercado alta (${solution.marketRating}/5)`;
  else if (solution.marketRating >= 4)
    reason = `Boa avaliação de mercado (${solution.marketRating}/5)`;
  return { score, reason };
}

function sizeFactor(
  solution: Solution,
  size: CompanySize,
): { score: number; reason?: string; caveat?: string } {
  const tierRank = TIER_RANK[solution.tier] ?? 1;
  const ideal = SIZE_IDEAL_TIER[size];
  const diff = tierRank - ideal;
  const score = clamp01(1 - Math.abs(diff) / 3);
  if (diff >= 2) return { score, caveat: 'Pode ser robusto demais para o porte informado' };
  if (diff <= -2) return { score, caveat: 'Pode ficar aquém para o porte informado' };
  if (diff === 0) return { score, reason: `Porte adequado (${SIZE_LABELS[size]})` };
  return { score };
}

function budgetFactor(
  solution: Solution,
  budget: Budget,
): { score: number; reason?: string; caveat?: string } {
  const priceRank = PRICE_RANK[solution.priceRange] ?? 2;
  const ideal = BUDGET_IDEAL_PRICE[budget];
  const over = priceRank - ideal;
  if (over <= 0) {
    return { score: 1, reason: `Dentro do orçamento (${solution.priceRange})` };
  }
  const score = clamp01(1 - over * 0.5);
  return { score, caveat: `Custo acima do orçamento informado (${solution.priceRange})` };
}

function ecosystemFactor(
  solution: Solution,
  ecosystem: string[],
): { score: number; reason?: string } {
  if (ecosystem.length === 0) return { score: 0.5 };
  const match = ecosystem.find((v) => v.toLowerCase() === solution.vendor.toLowerCase());
  if (match) return { score: 1, reason: `Integra com seu ecossistema (${match})` };
  return { score: 0.2 };
}

function complianceFactor(
  solution: Solution,
  compliance: string[],
): { score: number; reason?: string } {
  if (compliance.length === 0) return { score: 0.5 };
  const haystack = [
    solution.description,
    solution.useCases ?? '',
    ...solution.capabilities.map((c) => c.name),
  ]
    .join(' ')
    .toLowerCase();
  const matched = compliance.filter((kw) => haystack.includes(kw.toLowerCase()));
  if (matched.length === 0) return { score: 0 };
  const score = clamp01(matched.length / compliance.length);
  return { score, reason: `Aderente a ${matched.join(', ')}` };
}

/**
 * Scores a single solution against the answers. Assumes the solution already
 * passed the category hard filter.
 */
export function scoreSolution(solution: Solution, answers: Answers): ScoredSolution {
  const factors = [
    { weight: WEIGHTS.rating, ...ratingFactor(solution) },
    { weight: WEIGHTS.size, ...sizeFactor(solution, answers.size) },
    { weight: WEIGHTS.budget, ...budgetFactor(solution, answers.budget) },
    { weight: WEIGHTS.ecosystem, ...ecosystemFactor(solution, answers.ecosystem) },
    { weight: WEIGHTS.compliance, ...complianceFactor(solution, answers.compliance) },
  ];

  const total = factors.reduce((sum, f) => sum + f.weight * f.score, 0);
  const reasons = factors.flatMap((f) => ('reason' in f && f.reason ? [f.reason] : []));
  const caveats = factors.flatMap((f) => ('caveat' in f && f.caveat ? [f.caveat] : []));

  return {
    solution,
    score: Math.round(total),
    reasons,
    caveats,
  };
}

/**
 * Filters the catalog by the chosen category and returns the best-fitting
 * solutions, highest score first (market rating breaks ties).
 */
export function recommend(solutions: Solution[], answers: Answers, limit = 5): ScoredSolution[] {
  return solutions
    .filter((s) => s.category === answers.category)
    .map((s) => scoreSolution(s, answers))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.solution.marketRating ?? 0) - (a.solution.marketRating ?? 0);
    })
    .slice(0, limit);
}
