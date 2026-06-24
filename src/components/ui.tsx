// Small shared presentational pieces, kept here so the screens stay readable.
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-xs font-medium text-emerald-200/90">
      {children}
    </span>
  );
}

type ChoiceProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
};

export function Choice({ selected, onClick, title, subtitle }: ChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'w-full rounded-xl border px-4 py-3 text-left transition',
        selected
          ? 'border-emerald-400/70 bg-emerald-400/10 text-white'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-emerald-400/30 hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <span className="block font-medium">{title}</span>
      {subtitle ? <span className="mt-0.5 block text-sm text-slate-400">{subtitle}</span> : null}
    </button>
  );
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
        selected
          ? 'border-emerald-400/70 bg-emerald-400/15 text-white'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-emerald-400/30 hover:bg-white/[0.06]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const styles =
    variant === 'primary'
      ? 'bg-emerald-400 text-black hover:bg-emerald-300 disabled:opacity-40 disabled:hover:bg-emerald-400'
      : 'border border-white/15 text-slate-200 hover:bg-white/10 disabled:opacity-40';
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function RatingDots({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-xs text-slate-500">sem nota</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-amber-300">
      <span aria-hidden>★</span>
      <span className="font-mono">{value.toFixed(1)}</span>
      <span className="text-xs text-slate-500">/5</span>
    </span>
  );
}
