import { useMemo, useState } from 'react';
import { Results } from './components/Results';
import { Wizard } from './components/Wizard';
import { catalog } from './lib/catalog';
import { recommend } from './lib/match';
import type { Answers } from './lib/types';

export default function App() {
  const [answers, setAnswers] = useState<Answers | null>(null);

  const results = useMemo(() => (answers ? recommend(catalog.solutions, answers) : []), [answers]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:py-16">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-9 w-9" />
          <div>
            <h1 className="font-display text-2xl text-white">Soluções Cyber</h1>
            <p className="text-sm text-slate-400">
              Responda algumas perguntas e veja quais soluções de mercado se encaixam.
            </p>
          </div>
        </div>
      </header>

      <main>
        {answers ? (
          <Results results={results} answers={answers} onRestart={() => setAnswers(null)} />
        ) : (
          <Wizard onSubmit={setAnswers} />
        )}
      </main>

      <footer className="mt-12 border-t border-white/10 pt-5 text-xs text-slate-500">
        <p>
          {catalog.solutions.length} soluções · {catalog.categories.length} categorias · catálogo
          atualizado em {catalog.generatedAt}. Tudo roda no seu navegador — nenhum dado é enviado a
          servidores.
        </p>
      </footer>
    </div>
  );
}
