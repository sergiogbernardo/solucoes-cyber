// Guided questionnaire. Each step maps to one dimension of the matching engine.
// Category is required; size and budget are required; ecosystem and compliance
// are optional refinements.
import { useMemo, useState } from 'react';
import { COMPLIANCE_OPTIONS, categoriesByGroup, groupLabel, topVendors } from '../lib/catalog';
import { SIZE_LABELS } from '../lib/match';
import type { Answers, Budget, CompanySize } from '../lib/types';
import { Button, Chip, Choice } from './ui';

const SIZE_ORDER: CompanySize[] = ['micro', 'small', 'medium', 'large', 'enterprise'];

const BUDGET_OPTIONS: { value: Budget; title: string; subtitle: string }[] = [
  { value: 'low', title: 'Enxuto', subtitle: 'Prioriza menor custo ($)' },
  { value: 'medium', title: 'Equilibrado', subtitle: 'Custo-benefício ($$)' },
  { value: 'high', title: 'Sem restrição forte', subtitle: 'Aceita topo de linha ($$$)' },
];

const STEP_TITLES = [
  'Qual solução você precisa?',
  'Qual o porte da empresa?',
  'Qual a faixa de orçamento?',
  'Já usa algum ecossistema?',
  'Algum compliance a atender?',
];

export function Wizard({ onSubmit }: { onSubmit: (answers: Answers) => void }) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [size, setSize] = useState<CompanySize | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [ecosystem, setEcosystem] = useState<string[]>([]);
  const [compliance, setCompliance] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => categoriesByGroup(), []);
  const vendors = useMemo(() => topVendors(10), []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped
      .map((entry) => ({
        ...entry,
        categories: entry.categories.filter(
          (c) => c.id.toLowerCase().includes(q) || entry.group.label.toLowerCase().includes(q),
        ),
      }))
      .filter((entry) => entry.categories.length > 0);
  }, [grouped, query]);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const canAdvance =
    (step === 0 && category !== null) ||
    (step === 1 && size !== null) ||
    (step === 2 && budget !== null) ||
    step === 3 ||
    step === 4;

  const isLast = step === STEP_TITLES.length - 1;

  function next() {
    if (isLast) {
      if (category && size && budget) {
        onSubmit({ category, size, budget, ecosystem, compliance });
      }
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="card animate-fade-up p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        {STEP_TITLES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i <= step ? 'bg-accent' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        Passo {step + 1} de {STEP_TITLES.length}
      </p>
      <h2 className="mt-1 font-display text-2xl text-white">{STEP_TITLES[step]}</h2>

      <div className="mt-6">
        {step === 0 && (
          <div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar (ex.: EDR, CMDB, SIEM, WAF…)"
              className="mb-4 w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-accent/60"
            />
            <div className="max-h-[22rem] space-y-5 overflow-y-auto pr-1">
              {filteredGroups.map((entry) => (
                <div key={entry.group.id}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {entry.group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {entry.categories.map((c) => (
                      <Chip
                        key={c.id}
                        selected={category === c.id}
                        onClick={() => setCategory(c.id)}
                      >
                        {c.id}
                        <span className="ml-1.5 text-xs text-slate-500">{c.count}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <p className="text-sm text-slate-500">Nenhuma categoria encontrada.</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SIZE_ORDER.map((value) => (
              <Choice
                key={value}
                selected={size === value}
                onClick={() => setSize(value)}
                title={SIZE_LABELS[value]}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            {BUDGET_OPTIONS.map((opt) => (
              <Choice
                key={opt.value}
                selected={budget === opt.value}
                onClick={() => setBudget(opt.value)}
                title={opt.title}
                subtitle={opt.subtitle}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 text-sm text-slate-400">
              Opcional — favorece soluções que integram com o que você já tem.
            </p>
            <div className="flex flex-wrap gap-2">
              {vendors.map((v) => (
                <Chip
                  key={v}
                  selected={ecosystem.includes(v)}
                  onClick={() => setEcosystem((list) => toggle(list, v))}
                >
                  {v}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-4 text-sm text-slate-400">
              Opcional — dá peso a soluções que mencionam esses requisitos.
            </p>
            <div className="flex flex-wrap gap-2">
              {COMPLIANCE_OPTIONS.map((c) => (
                <Chip
                  key={c}
                  selected={compliance.includes(c)}
                  onClick={() => setCompliance((list) => toggle(list, c))}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          {category && (
            <span className="hidden text-sm text-slate-400 sm:inline">
              {groupLabel(
                grouped.find((g) => g.categories.some((c) => c.id === category))?.group.id ?? '',
              )}{' '}
              · <span className="text-slate-200">{category}</span>
            </span>
          )}
          <Button onClick={next} disabled={!canAdvance}>
            {isLast ? 'Ver recomendações' : 'Avançar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
