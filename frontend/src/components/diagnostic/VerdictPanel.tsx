import type { DerivedSummary, DiagnosticPayload } from '../../types'
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
    return <strong className="font-semibold text-zinc-100">{trimmed}</strong>
  }
  return (
    <span className="leading-snug">
      {segments.map((seg, i) => (
        <span key={i}>
          {i > 0 ? <span className="mx-1 font-normal text-zinc-500">+</span> : null}
          <strong className="font-semibold text-zinc-100">{seg}</strong>
        </span>
      ))}
    </span>
  )
}

type Props = {
  diagnostic: DiagnosticPayload | null
  busy: boolean
  liveSummary: DerivedSummary
}

export function VerdictPanel({ diagnostic, busy, liveSummary }: Props) {
  const score = diagnostic?.score ?? liveSummary.score
  const hue = scoreHue(score)

  return (
    <section className="w-full rounded-2xl border border-zinc-800/90 bg-zinc-900/50 px-5 py-6 md:px-8 md:py-8">
      {diagnostic ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <VerdictRing score={diagnostic.score} />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className={`text-5xl font-bold tabular-nums leading-none md:text-6xl ${hue}`}>
                {diagnostic.score}
              </span>
              <span className="pb-1 text-zinc-500" aria-hidden>
                →
              </span>
              <p className="max-w-2xl pb-1 text-lg font-medium leading-snug text-zinc-100 md:text-xl">
                {verdictHeadline(diagnostic.verdict)}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 md:text-base">
              <span className="font-medium text-zinc-300">What buyers care about: </span>
              <BuyerCareEmphasis text={diagnostic.primary_purchase_driver.driver} />
              <span className="text-zinc-500">
                {' '}
                ({confidencePercent(diagnostic.primary_purchase_driver.confidence)}%)
              </span>
            </p>
          </div>
        </div>
      ) : busy ? (
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <VerdictRing score={liveSummary.score} />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className={`text-5xl font-bold tabular-nums leading-none md:text-6xl ${hue}`}>
                {liveSummary.score}
              </span>
              <span className="pb-1 text-zinc-500" aria-hidden>
                →
              </span>
              <p className="max-w-xl pb-1 text-base font-medium leading-snug text-zinc-300">
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
