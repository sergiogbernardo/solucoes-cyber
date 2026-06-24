import { describe, expect, it } from 'vitest';
import { recommend, scoreSolution } from './match';
import type { Answers, Solution } from './types';

function makeSolution(overrides: Partial<Solution> = {}): Solution {
  return {
    id: 'acme-edr',
    vendor: 'Acme',
    product: 'Acme EDR',
    category: 'EDR',
    group: 'endpoint',
    tier: 'standard',
    priceRange: '$$',
    marketRating: 4.2,
    marketRatingSource: 'Test',
    description: 'Endpoint detection and response',
    useCases: 'SMB endpoint protection',
    website: null,
    components: ['EDR'],
    capabilities: [],
    ...overrides,
  };
}

const baseAnswers: Answers = {
  category: 'EDR',
  size: 'small',
  budget: 'medium',
  ecosystem: [],
  compliance: [],
};

describe('scoreSolution', () => {
  it('returns a score between 0 and 100', () => {
    const result = scoreSolution(makeSolution(), baseAnswers);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('flags solutions priced above the budget as a caveat', () => {
    const result = scoreSolution(makeSolution({ priceRange: '$$$' }), {
      ...baseAnswers,
      budget: 'low',
    });
    expect(result.caveats.some((c) => c.includes('acima do orçamento'))).toBe(true);
  });

  it('does not penalize solutions cheaper than the budget', () => {
    const cheap = scoreSolution(makeSolution({ priceRange: '$' }), {
      ...baseAnswers,
      budget: 'high',
    });
    expect(cheap.reasons.some((r) => r.includes('Dentro do orçamento'))).toBe(true);
    expect(cheap.caveats.some((c) => c.includes('orçamento'))).toBe(false);
  });

  it('rewards a vendor in the user ecosystem', () => {
    const inEco = scoreSolution(makeSolution(), { ...baseAnswers, ecosystem: ['Acme'] });
    const outEco = scoreSolution(makeSolution(), { ...baseAnswers, ecosystem: ['Other'] });
    expect(inEco.score).toBeGreaterThan(outEco.score);
    expect(inEco.reasons.some((r) => r.includes('ecossistema'))).toBe(true);
  });

  it('treats a missing market rating as neutral and adds a caveat', () => {
    const result = scoreSolution(makeSolution({ marketRating: null }), baseAnswers);
    expect(result.caveats.some((c) => c.includes('Sem nota de mercado'))).toBe(true);
  });

  it('warns when an enterprise-tier tool is suggested to a micro company', () => {
    const result = scoreSolution(makeSolution({ tier: 'enterprise' }), {
      ...baseAnswers,
      size: 'micro',
    });
    expect(result.caveats.some((c) => c.includes('robusto demais'))).toBe(true);
  });

  it('matches compliance keywords found in the solution text', () => {
    const result = scoreSolution(makeSolution({ description: 'Aderente a LGPD e ISO 27001' }), {
      ...baseAnswers,
      compliance: ['LGPD'],
    });
    expect(result.reasons.some((r) => r.includes('LGPD'))).toBe(true);
  });
});

describe('recommend', () => {
  const catalog: Solution[] = [
    makeSolution({ id: 'a', product: 'A', marketRating: 4.0 }),
    makeSolution({ id: 'b', product: 'B', marketRating: 4.8 }),
    makeSolution({ id: 'c', product: 'C', category: 'SIEM' }),
  ];

  it('keeps only solutions in the chosen category', () => {
    const results = recommend(catalog, baseAnswers);
    expect(results.every((r) => r.solution.category === 'EDR')).toBe(true);
    expect(results).toHaveLength(2);
  });

  it('breaks score ties by market rating', () => {
    const results = recommend(catalog, baseAnswers);
    expect(results[0].solution.id).toBe('b');
  });

  it('respects the limit', () => {
    const results = recommend(catalog, baseAnswers, 1);
    expect(results).toHaveLength(1);
  });

  it('returns an empty list when nothing matches the category', () => {
    const results = recommend(catalog, { ...baseAnswers, category: 'WAF' });
    expect(results).toEqual([]);
  });
});
