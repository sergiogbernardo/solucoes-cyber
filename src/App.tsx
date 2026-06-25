import { useEffect, useMemo, useState } from 'react';
import MatrixRain from './components/MatrixRain';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import { Catalog } from './components/Catalog';
import { Comparator } from './components/Comparator';
import { Glossary } from './components/Glossary';
import { Results } from './components/Results';
import { Wizard } from './components/Wizard';
import { Button } from './components/ui';
import { catalog } from './lib/catalog';
import { recommend } from './lib/match';
import { answersFromQuery } from './lib/share';
import type { Answers } from './lib/types';

const TABS = [
  { id: 'catalog', label: 'Catálogo' },
  { id: 'finder', label: 'Encontrar solução' },
  { id: 'glossary', label: 'Glossário' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const MAX_COMPARE = 4;

export default function App() {
  const [tab, setTab] = useState<TabId>('catalog');
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

  // Restore a shared recommendation from the URL, if present.
  useEffect(() => {
    const shared = answersFromQuery(window.location.search);
    if (shared) {
      setAnswers(shared);
      setTab('finder');
    }
  }, []);

  const results = useMemo(() => (answers ? recommend(catalog.solutions, answers) : []), [answers]);

  const selectedSolutions = useMemo(
    () => catalog.solutions.filter((s) => selectedIds.includes(s.id)),
    [selectedIds],
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );
  }

  const showTray = tab === 'catalog' && !comparing && selectedIds.length > 0;

  return (
    <div className="relative min-h-screen bg-grid-glow">
      <div className="print:hidden">
        <MatrixRain />
      </div>
      <div className="relative z-10">
        <div className="print:hidden">
          <TopBar />
        </div>

        <main className="mx-auto w-full max-w-[1800px] px-4 py-10 lg:px-6">
          <div className="print:hidden">
            <Hero />

            <nav className="mb-6 flex flex-wrap justify-center gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setComparing(false);
                  }}
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
          </div>

          {tab === 'catalog' &&
            (comparing ? (
              <Comparator solutions={selectedSolutions} onClose={() => setComparing(false)} />
            ) : (
              <Catalog selectedIds={selectedIds} onToggleSelect={toggleSelect} />
            ))}

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

          {tab === 'glossary' && <Glossary />}
        </main>

        <footer className="border-t border-emerald-500/10 py-6 text-center font-mono text-xs text-slate-600 print:hidden">
          {catalog.solutions.length} soluções · catálogo atualizado em {catalog.generatedAt} · ©
          2026 Sergio Bernardo
        </footer>
      </div>

      {showTray && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-500/20 bg-black/85 backdrop-blur-md print:hidden">
          <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <p className="text-sm text-slate-300">
              {selectedIds.length} selecionada{selectedIds.length > 1 ? 's' : ''} para comparar
              <span className="text-slate-500"> (máx. {MAX_COMPARE})</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setSelectedIds([])}>
                Limpar
              </Button>
              <Button onClick={() => setComparing(true)} disabled={selectedIds.length < 2}>
                Comparar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
