// Renders a component's reference capability checklist and, optionally, a
// per-solution support matrix for the solutions that have been mapped.
import type { CapabilityLevel, ComponentSpec, Solution } from '../lib/types';

const LEVEL_ICON: Record<CapabilityLevel, string> = {
  yes: '●',
  partial: '◐',
  no: '○',
};

const LEVEL_STYLE: Record<CapabilityLevel, string> = {
  yes: 'text-emerald-400',
  partial: 'text-amber-300',
  no: 'text-slate-600',
};

const LEVEL_LABEL: Record<CapabilityLevel, string> = {
  yes: 'tem',
  partial: 'parcial',
  no: 'não tem',
};

function Cell({ level }: { level: CapabilityLevel | undefined }) {
  if (!level) {
    return (
      <span className="text-xs text-slate-600" title="não mapeado">
        —
      </span>
    );
  }
  return (
    <span
      className={`${LEVEL_STYLE[level]} text-base`}
      title={LEVEL_LABEL[level]}
      aria-label={LEVEL_LABEL[level]}
    >
      {LEVEL_ICON[level]}
    </span>
  );
}

/** The reference checklist: what this component is expected to do. */
export function CapabilityChecklist({ spec }: { spec: ComponentSpec }) {
  return (
    <ul className="space-y-2">
      {spec.capabilities.map((cap) => (
        <li key={cap.id} className="flex gap-2 text-sm">
          <span aria-hidden className="mt-0.5 text-emerald-400">
            ▹
          </span>
          <span>
            <span className="font-medium text-slate-200">{cap.name}</span>
            <span className="text-slate-400"> — {cap.desc}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Capability × solution grid for solutions in the same component. */
export function CapabilityMatrix({
  spec,
  solutions,
}: {
  spec: ComponentSpec;
  solutions: Solution[];
}) {
  const anyMapped = solutions.some((s) => s.capabilitySupport);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-black/40 p-2 text-left font-medium text-slate-400">
                Capacidade
              </th>
              {solutions.map((s) => (
                <th key={s.id} className="p-2 text-center font-medium text-slate-200">
                  {s.product}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.capabilities.map((cap) => (
              <tr key={cap.id} className="border-t border-white/5">
                <td className="sticky left-0 bg-black/40 p-2 text-slate-300" title={cap.desc}>
                  {cap.name}
                </td>
                {solutions.map((s) => (
                  <td key={s.id} className="p-2 text-center">
                    <Cell level={s.capabilitySupport?.[cap.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          <span className="text-emerald-400">●</span> tem
        </span>
        <span>
          <span className="text-amber-300">◐</span> parcial
        </span>
        <span>
          <span className="text-slate-600">○</span> não tem
        </span>
        <span>— não mapeado</span>
      </p>
      {!anyMapped && (
        <p className="mt-2 text-xs text-slate-500">
          Nenhuma dessas soluções teve as capacidades mapeadas ainda — mostramos só o checklist de
          referência do componente.
        </p>
      )}
    </div>
  );
}
