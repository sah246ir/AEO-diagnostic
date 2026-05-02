import type { ReactNode } from 'react'
import { MODELS } from '../../config'
import type { DiagnosticPayload } from '../../types'

function GridCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </div>
  )
}

function reasonBullets(reason: string, max = 3): string[] {
  const parts = reason
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
  if (parts.length >= 2) return parts.slice(0, max)
  const semi = reason.split(/;\s+/).map((s) => s.trim()).filter((s) => s.length > 8)
  if (semi.length >= 2) return semi.slice(0, max)
  return reason.trim() ? [reason.trim()] : []
}

type Props = {
  diagnostic: DiagnosticPayload
}

export function InsightGrid({ diagnostic }: Props) {
  const gap = diagnostic.positioning_gap
  const problems = diagnostic.insights.problems.slice(0, 3)
  const fixes = diagnostic.insights.recommendations.slice(0, 3)
  const top = diagnostic.competitor_dominance[0]
  const nModels = MODELS.length
  const freqLabel = top ? `${Math.min(top.frequency, nModels)}/${nModels} models` : ''
  const reasons = top ? reasonBullets(top.reason, 3) : []
  const chips = diagnostic.key_drivers.slice(0, 5)
  const tries = diagnostic.improved_bullets.slice(0, 3)

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <GridCard title="What you're missing">
        <p className="line-clamp-2 text-sm leading-snug text-zinc-300">
          <span className="font-medium text-zinc-400">Top answers stress: </span>
          {gap.market_focus}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-snug text-zinc-300">
          <span className="font-medium text-zinc-400">Your product reads as: </span>
          {gap.product_focus}
        </p>
        <p className="mt-3 text-sm font-medium leading-snug text-zinc-100">
          <strong className="font-semibold text-zinc-50">{gap.gap}</strong>
        </p>
      </GridCard>

      <GridCard title="Why you're losing">
        {problems.length ? (
          <ul className="list-disc space-y-2 pl-4 text-sm leading-snug text-zinc-300">
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">Nothing major here.</p>
        )}
      </GridCard>

      <GridCard title="What to fix">
        {fixes.length ? (
          <ul className="list-disc space-y-2 pl-4 text-sm leading-snug text-zinc-300">
            {fixes.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No fixes listed.</p>
        )}
      </GridCard>

      <GridCard title="Top competitor">
        {top ? (
          <>
            <p className="text-lg font-semibold text-zinc-100">{top.name}</p>
            <p className="mt-1 text-xs text-zinc-500">{freqLabel}</p>
            {reasons.length ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm leading-snug text-zinc-400">
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-zinc-500">No clear leader for this search.</p>
        )}
      </GridCard>

      <GridCard title="Key signals">
        {chips.length ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((k, i) => (
              <span
                key={i}
                className="rounded-full border border-zinc-700/80 bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-200"
              >
                {k}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No phrases listed.</p>
        )}
      </GridCard>

      <GridCard title="Try this instead">
        {tries.length ? (
          <ul className="space-y-2 text-sm leading-snug text-zinc-300">
            {tries.map((b, i) => (
              <li key={i} className="border-l-2 border-emerald-600/50 pl-3">
                {b}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No suggestions listed.</p>
        )}
      </GridCard>
    </div>
  )
}
