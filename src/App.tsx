import { useMemo, useState } from 'react';
import MatrixRain from './components/MatrixRain';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import { Catalog } from './components/Catalog';
import { Results } from './components/Results';
import { Wizard } from './components/Wizard';
import { catalog } from './lib/catalog';
import { recommend } from './lib/match';
import type { Answers } from './lib/types';

const TABS = [
  { id: 'catalog', label: 'Catálogo' },
  { id: 'finder', label: 'Encontrar solução' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('catalog');
  const [answers, setAnswers] = useState<Answers | null>(null);

  const results = useMemo(() => (answers ? recommend(catalog.solutions, answers) : []), [answers]);

  return (
    <div className="relative min-h-screen bg-grid-glow">
      <MatrixRain />
      <div className="relative z-10">
        <TopBar />

        <main className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-6">
          <Hero />

          <nav className="mb-6 flex flex-wrap justify-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-4 py-1.5 font-display text-sm font-semibold transition ${
                  tab === t.id
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'catalog' && <Catalog />}

          {tab === 'finder' &&
            (answers ? (
              <div className="mx-auto max-w-3xl">
                <Results results={results} answers={answers} onRestart={() => setAnswers(null)} />
              </div>
            ) : (
              <div className="mx-auto max-w-3xl">
                <Wizard onSubmit={setAnswers} />
              </div>
            ))}
        </main>

        <footer className="border-t border-emerald-500/10 py-6 text-center font-mono text-xs text-slate-600">
          {catalog.solutions.length} soluções · catálogo atualizado em {catalog.generatedAt} · ©
          2026 Sergio Bernardo
        </footer>
      </div>
    </div>
  );
}
