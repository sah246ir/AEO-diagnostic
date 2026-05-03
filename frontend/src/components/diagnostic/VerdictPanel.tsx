import type { DerivedSummary, DiagnosticPayload } from '../../types'
import { MODELS } from '../../config'
import { VerdictRing } from './VerdictRing'

function scoreHue(score: number): string {
  if (score < 40) return 'text-red-400'
  if (score < 70) return 'text-amber-400'
  return 'text-emerald-400'
}

function confidencePercent(c: number): number {
  return Math.round(Math.min(100, Math.max(0, c <= 1 ? c * 100 : c)))
}

/** One readable line from a longer verdict. */
function verdictHeadline(full: string): string {
  const t = full.trim()
  if (!t) return ''
  const cut = t.search(/\.\s/)
  if (cut > 0 && cut < 180) return t.slice(0, cut + 1).trim()
  if (t.length <= 160) return t
  return `${t.slice(0, 157).trim()}…`
}

function BuyerCareEmphasis({ text }: { text: string }) {
  const trimmed = text.trim()
  const segments = trimmed.split(/\s*\+\s*/).map((s) => s.trim()).filter(Boolean)
  if (segments.length <= 1) {
    return <span className="text-zinc-100">{trimmed}</span>
  }
  return (
    <span className="leading-snug text-zinc-100">
      {segments.map((seg, i) => (
        <span key={i}>
          {i > 0 ? <span className="mx-1 text-zinc-500">+</span> : null}
          <span>{seg}</span>
        </span>
      ))}
    </span>
  )
}

const HIGH_TIER_VERDICT_PREFIX = 'You\u2019re visible, but not dominating this search.'

type Props = {
  diagnostic: DiagnosticPayload | null
  busy: boolean
  liveSummary: DerivedSummary
}

export function VerdictPanel({ diagnostic, busy, liveSummary }: Props) {
  const score = diagnostic?.score ?? liveSummary.score
  const hue = scoreHue(score)
  const modelCount = MODELS.length
  const verdictHead = diagnostic ? verdictHeadline(diagnostic.verdict) : ''
  const showVerdictEmoji = verdictHead.startsWith(HIGH_TIER_VERDICT_PREFIX)

  return (
    <section className="w-full rounded-2xl border border-zinc-800/90 bg-zinc-900/50 px-5 py-6 md:px-8 md:py-8">
      {diagnostic ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <VerdictRing score={diagnostic.score} />
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
              <div className="flex shrink-0 flex-col gap-2">
                <span className={`text-7xl font-bold tabular-nums leading-none tracking-tight md:text-8xl ${hue}`}>
                  {diagnostic.score}
                </span>
                <p className="max-w-56 text-xs leading-relaxed text-zinc-500">
                  <span className="mr-1.5" aria-hidden>
                    👉
                  </span>
                  <strong className="font-semibold text-zinc-300">Confidence: Medium</strong>
                  <span>
                    {' '}
                    · Based on {modelCount} models
                  </span>
                </p>
              </div>
              <p className="min-w-0 flex-1 text-lg font-medium leading-snug text-zinc-100 md:pt-1 md:text-xl">
                {showVerdictEmoji ? (
                  <>
                    <span className="mr-1.5" aria-hidden>
                      👉
                    </span>
                    {verdictHead}
                  </>
                ) : (
                  verdictHead
                )}
              </p>
            </div>
            <div className="space-y-3 border-t border-zinc-800/60 pt-5 text-sm leading-relaxed text-zinc-400 md:text-base">
              <p className="leading-relaxed">
                <strong className="font-semibold text-zinc-200">What buyers care about:</strong>{' '}
                <BuyerCareEmphasis text={diagnostic.primary_purchase_driver.driver} />
              </p>
              <p className="leading-relaxed text-zinc-500">
                → Appears in{' '}
                <strong className="font-semibold text-zinc-300">
                  {confidencePercent(diagnostic.primary_purchase_driver.confidence)}%
                </strong>{' '}
                of recommendations
              </p>
            </div>
          </div>
        </div>
      ) : busy ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <VerdictRing score={liveSummary.score} />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-8">
              <div className="flex shrink-0 flex-col gap-2">
                <span className={`text-7xl font-bold tabular-nums leading-none tracking-tight md:text-8xl ${hue}`}>
                  {liveSummary.score}
                </span>
                <p className="max-w-56 text-xs leading-relaxed text-zinc-500">
                  <span className="mr-1.5" aria-hidden>
                    👉
                  </span>
                  <strong className="font-semibold text-zinc-300">Confidence: Medium</strong>
                  <span>
                    {' '}
                    · Based on {modelCount} models
                  </span>
                </p>
              </div>
              <p className="min-w-0 flex-1 text-base font-medium leading-snug text-zinc-300 md:pt-1">
                Partial score—still collecting answers.
              </p>
            </div>
            <p className="text-sm text-zinc-500">Your score and buyer line will lock in when the run finishes.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          <div className="h-28 w-28 shrink-0 animate-pulse rounded-full bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-10 w-24 animate-pulse rounded bg-zinc-800" />
            <div className="h-5 max-w-lg animate-pulse rounded bg-zinc-800/70" />
            <p className="text-xs text-zinc-500">Run a search above to see your score.</p>
          </div>
        </div>
      )}
    </section>
  )
}
