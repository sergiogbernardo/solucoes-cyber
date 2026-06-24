// Small shared presentational pieces, kept here so the screens stay readable.
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
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
          ? 'border-accent/70 bg-accent/10 text-white shadow-[0_0_0_1px] shadow-accent/40'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10',
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
          ? 'border-accent/70 bg-accent/15 text-white'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10',
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
      ? 'bg-accent text-ink-900 hover:bg-accent-soft disabled:opacity-40 disabled:hover:bg-accent'
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
