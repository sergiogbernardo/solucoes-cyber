// Ranked recommendations with the "why it fits" rationale for each solution.
import { useState } from 'react';
import { SIZE_LABELS } from '../lib/match';
import { estimateAnnualCost, formatCostRange } from '../lib/cost';
import { shareUrl } from '../lib/share';
import type { Answers, CompanySize, ScoredSolution } from '../lib/types';
import { Button, Pill, RatingDots } from './ui';

// Representative seat count per company size, for the illustrative cost line.
const SIZE_SEATS: Record<CompanySize, number> = {
  micro: 30,
  small: 120,
  medium: 500,
  large: 2500,
  enterprise: 8000,
};

function ResultCard({ item, rank, seats }: { item: ScoredSolution; rank: number; seats: number }) {
  const { solution, score, reasons, caveats } = item;
  const top = rank === 1;
  return (
    <article className={`panel ${top ? 'ring-1 ring-accent/40' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-500">#{rank}</span>
            {top && <Pill>Melhor encaixe</Pill>}
          </div>
          <h3 className="mt-1 font-display text-lg text-white">{solution.product}</h3>
          <p className="text-sm text-slate-400">{solution.vendor}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-accent">{score}</div>
          <div className="text-xs uppercase tracking-wider text-slate-500">de 100</div>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300">{solution.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill>{solution.category}</Pill>
        <Pill>{solution.tier}</Pill>
        <Pill>{solution.priceRange}</Pill>
        <RatingDots value={solution.marketRating} />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        Custo anual estimado (~{seats} seats):{' '}
        <span className="font-medium text-emerald-300">
          {formatCostRange(estimateAnnualCost(solution.priceRange, seats))}
        </span>
      </p>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-slate-300">
              <span aria-hidden className="text-accent">
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      )}

      {caveats.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {caveats.map((c) => (
            <li key={c} className="flex gap-2 text-sm text-amber-300/90">
              <span aria-hidden>!</span>
              {c}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {solution.marketRatingSource ?? 'Fonte de avaliação não catalogada'}
        </p>
        {solution.website && (
          <a
            href={solution.website}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm font-medium text-accent hover:text-accent-soft"
          >
            Site do fornecedor →
          </a>
        )}
      </div>
    </article>
  );
}

export function Results({
  results,
  answers,
  onRestart,
}: {
  results: ScoredSolution[];
  answers: Answers;
  onRestart: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const seats = SIZE_SEATS[answers.size];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl(answers));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-white">
            Recomendações para <span className="text-accent">{answers.category}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {SIZE_LABELS[answers.size]} · orçamento {answers.budget}
            {answers.ecosystem.length > 0 && ` · ${answers.ecosystem.join(', ')}`}
            {answers.compliance.length > 0 && ` · ${answers.compliance.join(', ')}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button variant="ghost" onClick={copyLink}>
            {copied ? 'Link copiado ✓' : 'Copiar link'}
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
          <Button variant="ghost" onClick={onRestart}>
            Nova consulta
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="panel text-center text-slate-400">
          Não encontramos soluções catalogadas para <strong>{answers.category}</strong>.
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((item, i) => (
            <ResultCard key={item.solution.id} item={item} rank={i + 1} seats={seats} />
          ))}
        </div>
      )}

      <p className="px-1 text-xs text-slate-500">
        As notas de mercado vêm de Gartner Peer Insights / G2 (quando catalogadas) e servem como
        sinal de qualidade, não como posição oficial de Magic Quadrant. Use como apoio à decisão,
        não como recomendação definitiva.
      </p>
    </div>
  );
}
