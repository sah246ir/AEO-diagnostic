import type { AnalyzerResult } from '../aeoTypes'

type Props = {
  analyzer: AnalyzerResult
}

function scoreRingClass(score: number): string {
  if (score < 40) return 'text-red-400'
  if (score < 70) return 'text-amber-400'
  return 'text-emerald-400'
}

export function AnalysisPanel({ analyzer }: Props) {
  const { status, data } = analyzer

  if (status === 'idle') return null

  const r = 52
  const c = 2 * Math.PI * r
  const score = data?.visibility_score ?? 0
  const dash = c * (1 - Math.min(100, Math.max(0, score)) / 100)
  const foundCount = data?.visibility.filter((v) => v.found).length ?? 0

  return (
    <section className="mt-10 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl shadow-black/20">
      <header className="mb-6 flex flex-col gap-1 border-b border-zinc-800 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Visibility analysis</h2>
          <p className="text-sm text-zinc-500">Cross-model presence vs. your product</p>
        </div>
      </header>

      {status === 'loading' && (
        <div className="animate-pulse space-y-4">
          <div className="h-36 w-36 rounded-full bg-zinc-800" />
          <div className="h-24 rounded-lg bg-zinc-800" />
          <div className="h-40 rounded-lg bg-zinc-800" />
        </div>
      )}

      {status === 'done' && data && (
        <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-36 w-36">
              <svg className="-rotate-90" width="144" height="144" viewBox="0 0 120 120" aria-hidden>
                <circle
                  className="text-zinc-800"
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className={scoreRingClass(score)}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={dash}
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums text-zinc-50">{Math.round(score)}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">score</span>
              </div>
            </div>
            <p className="text-center text-sm text-zinc-400">
              Found in{' '}
              <span className="font-semibold text-zinc-200">{foundCount}</span> of{' '}
              <span className="font-semibold text-zinc-200">3</span> models
            </p>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-lg border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/60">
                    <th className="px-4 py-2.5 font-medium text-zinc-400">Competitor</th>
                    <th className="px-4 py-2.5 font-medium text-zinc-400">Edge</th>
                  </tr>
                </thead>
                <tbody>
                  {data.competitor_insights.map((row, idx) => (
                    <tr key={`${idx}-${row.name}`} className="border-b border-zinc-800/80 last:border-0">
                      <td className="px-4 py-3 font-medium text-zinc-200">{row.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{row.edge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/25 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500/90">
                Recommendation
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{data.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
