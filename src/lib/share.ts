// Serializes the wizard answers to/from URL query params so a recommendation is
// shareable by link.
import type { Answers, Budget, CompanySize } from './types';

const SIZES: CompanySize[] = ['micro', 'small', 'medium', 'large', 'enterprise'];
const BUDGETS: Budget[] = ['low', 'medium', 'high'];

export function answersToQuery(answers: Answers): string {
  const params = new URLSearchParams();
  params.set('cat', answers.category);
  params.set('size', answers.size);
  params.set('budget', answers.budget);
  if (answers.ecosystem.length) params.set('eco', answers.ecosystem.join(','));
  if (answers.compliance.length) params.set('comp', answers.compliance.join(','));
  return params.toString();
}

export function answersFromQuery(search: string): Answers | null {
  const params = new URLSearchParams(search);
  const category = params.get('cat');
  const size = params.get('size');
  const budget = params.get('budget');
  if (!category || !SIZES.includes(size as CompanySize) || !BUDGETS.includes(budget as Budget)) {
    return null;
  }
  const list = (key: string): string[] => {
    const raw = params.get(key);
    return raw ? raw.split(',').filter(Boolean) : [];
  };
  return {
    category,
    size: size as CompanySize,
    budget: budget as Budget,
    ecosystem: list('eco'),
    compliance: list('comp'),
  };
}

export function shareUrl(answers: Answers): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?${answersToQuery(answers)}`;
}
