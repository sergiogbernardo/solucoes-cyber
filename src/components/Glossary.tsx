// Glossary of components: what each one is and the capabilities expected from
// it. Lives here once, instead of repeating the checklist on every catalog card.
import { useMemo, useState } from 'react';
import { catalog, groupLabel } from '../lib/catalog';
import type { ComponentSpec } from '../lib/types';
import { CapabilityChecklist } from './CapabilityMatrix';
import { Pill } from './ui';

interface Entry {
  category: string;
  group: string;
  count: number;
  spec: ComponentSpec;
}

export function Glossary() {
  const [query, setQuery] = useState('');

  const entries = useMemo<Entry[]>(() => {
    return Object.entries(catalog.componentCapabilities)
      .map(([category, spec]) => {
        const info = catalog.categories.find((c) => c.id === category);
        return {
          category,
          group: info?.group ?? 'outros',
          count: info?.count ?? 0,
          spec,
        };
      })
      .sort((a, b) => a.category.localeCompare(b.category));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      if (e.category.toLowerCase().includes(q)) return true;
      if (e.spec.summary.toLowerCase().includes(q)) return true;
      return e.spec.capabilities.some(
        (cap) => cap.name.toLowerCase().includes(q) || cap.desc.toLowerCase().includes(q),
      );
    });
  }, [entries, query]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar componente ou capacidade (ex.: EDR, isolamento, UEBA…)"
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-emerald-400/60"
        />
        <p className="mt-3 font-mono text-xs text-slate-500">
          {filtered.length} de {entries.length} componentes mapeados
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="panel text-center text-slate-400">Nenhum componente encontrado.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((entry) => (
            <article key={entry.category} className="panel">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg text-white">{entry.category}</h3>
                <Pill>{groupLabel(entry.group)}</Pill>
                <span className="font-mono text-xs text-slate-500">{entry.count} no catálogo</span>
              </div>
              <p className="mb-4 mt-2 text-sm text-slate-400">{entry.spec.summary}</p>
              <CapabilityChecklist spec={entry.spec} />
            </article>
          ))}
        </div>
      )}

      <p className="px-1 text-xs text-slate-500">
        Checklist de referência do que cada componente costuma entregar. O suporte por solução (quem
        tem o quê) aparece ao comparar soluções do mesmo componente, no Catálogo.
      </p>
    </div>
  );
}
