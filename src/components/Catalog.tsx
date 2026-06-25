// Main view: the full, browsable catalog of market solutions. Search by name,
// vendor or category, filter by area (group), sort, and pick solutions to
// compare. Each card can expand the component's reference capability checklist.
import { useMemo, useState } from 'react';
import { catalog, groupLabel } from '../lib/catalog';
import type { Solution } from '../lib/types';
import { Chip, Pill, RatingDots } from './ui';

type SortKey = 'rating' | 'name';

function SolutionCard({
  solution,
  selected,
  onToggleSelect,
}: {
  solution: Solution;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <article className="panel flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base text-white">{solution.product}</h3>
          <p className="text-sm text-slate-400">{solution.vendor}</p>
        </div>
        <RatingDots value={solution.marketRating} />
      </div>

      <p className="text-sm text-slate-300">{solution.description}</p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Pill>{solution.category}</Pill>
        <Pill>{solution.tier}</Pill>
        <Pill>{solution.priceRange}</Pill>
        <span className="font-mono text-xs text-slate-500">{groupLabel(solution.group)}</span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-1">
        {solution.website ? (
          <a
            href={solution.website}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            Site do fornecedor →
          </a>
        ) : (
          <span />
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(solution.id)}
            className="h-4 w-4 accent-emerald-400"
          />
          Comparar
        </label>
      </div>
    </article>
  );
}

export function Catalog({
  selectedIds,
  onToggleSelect,
}: {
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('rating');

  const groups = useMemo(
    () => [...catalog.groups].sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = catalog.solutions.filter((s) => {
      if (group && s.group !== group) return false;
      if (!q) return true;
      return (
        s.product.toLowerCase().includes(q) ||
        s.vendor.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
    return list.sort((a, b) => {
      if (sort === 'name') return a.product.localeCompare(b.product);
      return (b.marketRating ?? -1) - (a.marketRating ?? -1) || a.product.localeCompare(b.product);
    });
  }, [query, group, sort]);

  return (
    <div className="space-y-5">
      <div className="panel space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por produto, fornecedor ou categoria…"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="field-label mb-0 shrink-0">
              Ordenar
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400/60"
            >
              <option value="rating">Nota de mercado</option>
              <option value="name">Nome (A–Z)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip selected={group === null} onClick={() => setGroup(null)}>
            Todas
          </Chip>
          {groups.map((g) => (
            <Chip key={g.id} selected={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </div>

      <p className="px-1 font-mono text-xs text-slate-500">
        {filtered.length} de {catalog.solutions.length} soluções
      </p>

      {filtered.length === 0 ? (
        <div className="panel text-center text-slate-400">Nenhuma solução encontrada.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((s) => (
            <SolutionCard
              key={s.id}
              solution={s}
              selected={selectedIds.includes(s.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
