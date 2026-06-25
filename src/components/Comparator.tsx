// Side-by-side comparison of the selected solutions: attributes, an illustrative
// cost estimate per seat, and the component capability matrix (when they share
// the same component).
import { useState } from 'react';
import { componentSpec } from '../lib/catalog';
import { estimateAnnualCost, formatCostRange } from '../lib/cost';
import type { Solution } from '../lib/types';
import { Button, Pill, RatingDots } from './ui';
import { CapabilityMatrix } from './CapabilityMatrix';

function AttrRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-white/5 align-top">
      <td className="p-2 text-slate-400">{label}</td>
      {children}
    </tr>
  );
}

export function Comparator({ solutions, onClose }: { solutions: Solution[]; onClose: () => void }) {
  const [seats, setSeats] = useState(100);

  const categories = new Set(solutions.map((s) => s.category));
  const sharedCategory = categories.size === 1 ? [...categories][0] : null;
  const spec = sharedCategory ? componentSpec(sharedCategory) : undefined;

  return (
    <div className="space-y-5">
      <div className="panel flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-white">
          Comparando <span className="text-emerald-400">{solutions.length}</span> soluções
        </h2>
        <Button variant="ghost" onClick={onClose}>
          Voltar ao catálogo
        </Button>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400">Atributo</th>
              {solutions.map((s) => (
                <th key={s.id} className="p-2 text-left font-display text-base text-white">
                  {s.product}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AttrRow label="Fornecedor">
              {solutions.map((s) => (
                <td key={s.id} className="p-2 text-slate-200">
                  {s.vendor}
                </td>
              ))}
            </AttrRow>
            <AttrRow label="Categoria">
              {solutions.map((s) => (
                <td key={s.id} className="p-2">
                  <Pill>{s.category}</Pill>
                </td>
              ))}
            </AttrRow>
            <AttrRow label="Tier">
              {solutions.map((s) => (
                <td key={s.id} className="p-2 text-slate-200">
                  {s.tier}
                </td>
              ))}
            </AttrRow>
            <AttrRow label="Faixa de preço">
              {solutions.map((s) => (
                <td key={s.id} className="p-2 text-slate-200">
                  {s.priceRange}
                </td>
              ))}
            </AttrRow>
            <AttrRow label="Nota de mercado">
              {solutions.map((s) => (
                <td key={s.id} className="p-2">
                  <RatingDots value={s.marketRating} />
                </td>
              ))}
            </AttrRow>
            <AttrRow label="Componentes">
              {solutions.map((s) => (
                <td key={s.id} className="p-2 text-slate-300">
                  {s.components.join(', ') || '—'}
                </td>
              ))}
            </AttrRow>
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="panel-title">Custo anual estimado</h3>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Pessoas / seats
            <input
              type="number"
              min={1}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 0))}
              className="w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-right text-slate-200 outline-none focus:border-emerald-400/60"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-slate-300">{s.product}</p>
              <p className="font-display text-lg text-emerald-300">
                {formatCostRange(estimateAnnualCost(s.priceRange, seats))}
              </p>
              <p className="text-xs text-slate-500">por ano · {s.priceRange}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Estimativa ilustrativa por faixa de preço — não é cotação. Faixas: $ R$60–180, $$
          R$180–480, $$$ R$480–1200 por seat/ano. Valide sempre com o fornecedor.
        </p>
      </div>

      {spec ? (
        <div className="panel">
          <h3 className="panel-title mb-1">Capacidades de {sharedCategory}</h3>
          <p className="mb-4 text-sm text-slate-400">{spec.summary}</p>
          <CapabilityMatrix spec={spec} solutions={solutions} />
        </div>
      ) : (
        <div className="panel text-sm text-slate-400">
          {sharedCategory
            ? `Ainda não há checklist de capacidades mapeado para ${sharedCategory}.`
            : 'Selecione soluções do mesmo componente para comparar capacidades lado a lado.'}
        </div>
      )}
    </div>
  );
}
