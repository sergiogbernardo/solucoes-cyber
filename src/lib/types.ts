// Shapes for the market-solutions catalog (src/data/solucoes.json) and for the
// inputs/outputs of the recommendation engine.

export interface Capability {
  name: string;
  /** 0 = not supported, 1 = supported, 2 = partial. */
  supported: number;
}

export interface Solution {
  id: string;
  vendor: string;
  product: string;
  category: string;
  group: string;
  tier: string;
  priceRange: string;
  marketRating: number | null;
  marketRatingSource: string | null;
  description: string;
  useCases: string | null;
  website: string | null;
  components: string[];
  capabilities: Capability[];
}

export interface CategoryInfo {
  id: string;
  group: string;
  count: number;
}

export interface GroupInfo {
  id: string;
  label: string;
}

export interface Catalog {
  generatedAt: string;
  source: string;
  groups: GroupInfo[];
  categories: CategoryInfo[];
  solutions: Solution[];
}

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type Budget = 'low' | 'medium' | 'high';

/** What the user answers in the wizard. `category` is the only hard filter. */
export interface Answers {
  category: string;
  size: CompanySize;
  budget: Budget;
  /** Vendor names the user already runs, e.g. ['Microsoft']. Optional. */
  ecosystem: string[];
  /** Compliance keywords to look for, e.g. ['LGPD', 'PCI']. Optional. */
  compliance: string[];
}

export interface ScoredSolution {
  solution: Solution;
  /** 0..100 overall fit. */
  score: number;
  reasons: string[];
  caveats: string[];
}
