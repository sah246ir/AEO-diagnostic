import type { ReactNode } from 'react'
import { MODELS } from '../../config'
import type { DiagnosticPayload } from '../../types'
import { clip, pickTop, splitTextIntoSentences } from '../../utils/clean'

function GridCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{title}</h3>
      <div className="mt-5 min-h-0 flex-1">{children}</div>
    </div>
  )
}

type Props = {
  diagnostic: DiagnosticPayload
}

export function InsightGrid({ diagnostic }: Props) {
  const gap = diagnostic.positioning_gap
  const nModels = MODELS.length
  const top = diagnostic.competitor_dominance[0]

  const problems = pickTop(diagnostic.insights.problems, 3)
  const fixes = pickTop(diagnostic.insights.recommendations, 3)
  const reasons = top ? pickTop(splitTextIntoSentences(top.reason, 5), 3) : []
  const chips = pickTop(diagnostic.key_drivers, 3)
  const tries = pickTop(diagnostic.improved_bullets, 3)

  const freqX = top ? Math.min(top.frequency, nModels) : 0

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 ">
      <GridCard title="What you're missing">
        <div className="space-y-5 text-sm leading-relaxed text-zinc-300">
          <p>
            <strong className="font-semibold text-zinc-200">Top answers focus on:</strong>{' '}
            <span>{clip(gap.market_focus)}</span>
          </p>
          <p>
            <strong className="font-semibold text-zinc-200">Your product comes across as:</strong>{' '}
            <span>{clip(gap.product_focus)}</span>
          </p>
          <p>
            <strong className="font-semibold text-zinc-200">What you're missing:</strong>{' '}
            <span className="text-zinc-100">{clip(gap.gap)}</span>
          </p>
        </div>
        <p className="mt-5 border-t border-zinc-800/60 pt-5 text-xs leading-relaxed text-zinc-500">
          <span className="mr-1.5" aria-hidden>
            👉
          </span>
          Because this is a key buying factor, your product ranks lower across models.
        </p>
      </GridCard>

      <GridCard title={diagnostic.score >= 70 ? 'Where you can improve further' : "Why you're losing"}>
        {problems.length ? (
          <ul className="list-disc space-y-3 pl-4 text-sm leading-relaxed text-zinc-300">
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
          <ul className="list-disc space-y-3 pl-4 text-sm leading-relaxed text-zinc-300">
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
          <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              <strong className="font-semibold text-zinc-200">Top competitor:</strong>{' '}
              <span className="text-base font-semibold text-zinc-50">{top.name}</span>
            </p>
            <p className="text-zinc-400">
              Appears in{' '}
              <strong className="font-semibold text-zinc-200">
                {freqX}/{nModels}
              </strong>{' '}
              models
            </p>
            {reasons.length ? (
              <div>
                <p className="mb-3 font-semibold text-zinc-200">Why it wins:</p>
                <ul className="space-y-3 pl-0.5 text-zinc-300">
                  {reasons.map((r, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="shrink-0 pt-0.5 text-zinc-500" aria-hidden>
                        •
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No clear leader for this search.</p>
        )}
      </GridCard>

      <GridCard title="What top answers mention">
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

      <GridCard title="Improve your listing">
        <p className="mb-4 text-xs leading-relaxed text-zinc-500">
          <span className="mr-1.5" aria-hidden>
            👉
          </span>
          Rewrite your product like this to match what AI recommends:
        </p>
        {tries.length ? (
          <ul className="space-y-3 text-sm leading-relaxed text-zinc-300">
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
