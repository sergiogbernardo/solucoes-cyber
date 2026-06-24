// Loads the static catalog (bundled at build time) and exposes small helpers
// the UI needs: category list grouped by area, and the most common vendors for
// the optional "ecosystem" question.
import data from '../data/solucoes.json';
import type { Catalog, CategoryInfo, GroupInfo } from './types';

export const catalog = data as Catalog;

export const groupLabel = (id: string): string =>
  catalog.groups.find((g: GroupInfo) => g.id === id)?.label ?? 'Outros';

export interface CategoryGroup {
  group: GroupInfo;
  categories: CategoryInfo[];
}

/** Categories grouped by area, both sorted alphabetically for stable display. */
export function categoriesByGroup(): CategoryGroup[] {
  return [...catalog.groups]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((group) => ({
      group,
      categories: catalog.categories
        .filter((c) => c.group === group.id)
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .filter((entry) => entry.categories.length > 0);
}

/** Vendors with the most products in the catalog — used as ecosystem chips. */
export function topVendors(limit = 10): string[] {
  const counts = new Map<string, number>();
  for (const s of catalog.solutions) {
    counts.set(s.vendor, (counts.get(s.vendor) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([vendor]) => vendor);
}

export const COMPLIANCE_OPTIONS = [
  'LGPD',
  'ISO 27001',
  'PCI DSS',
  'SOC 2',
  'NIST',
  'HIPAA',
] as const;
