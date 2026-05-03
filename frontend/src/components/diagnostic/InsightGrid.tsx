import type { ReactNode } from 'react'
import { MODELS } from '../../config'
import type { DiagnosticPayload } from '../../types'

function GridCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{title}</h3>
      <div className="mt-5 min-h-0 flex-1">{children}</div>
    </div>
  )
}

function normKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function isNearDuplicate(a: string, b: string): boolean {
  const na = normKey(a)
  const nb = normKey(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const short = na.length <= nb.length ? na : nb
  const long = na.length > nb.length ? na : nb
  if (short.length < 14) return false
  if (long.includes(short) && short.length / long.length > 0.45) return true
  return false
}

function fingerprintSet(strings: string[]): Set<string> {
  const set = new Set<string>()
  for (const s of strings) {
    const n = normKey(s)
    if (n.length > 6) set.add(n)
  }
  return set
}

/** Drop items that duplicate another item in the same list (order preserved). */
function dedupeWithinList(items: string[]): string[] {
  const out: string[] = []
  const seenNorm = new Set<string>()
  for (const raw of items) {
    const t = raw.trim()
    if (!t) continue
    let dup = false
    for (const ex of seenNorm) {
      if (isNearDuplicate(t, ex)) {
        dup = true
        break
      }
    }
    if (dup) continue
    seenNorm.add(normKey(t))
    out.push(t)
  }
  return out
}

/** Prefer first-seen strings; skip items that duplicate `seed` or each other. */
function takeUniqueUpTo(items: string[], seed: Set<string>, max: number): string[] {
  const out: string[] = []
  const local = new Set<string>(seed)
  for (const raw of items) {
    const t = raw.trim()
    if (!t) continue
    const n = normKey(t)
    let dup = false
    for (const ex of local) {
      if (isNearDuplicate(t, ex)) {
        dup = true
        break
      }
    }
    if (dup) continue
    local.add(n)
    out.push(t)
    if (out.length >= max) break
  }
  return out
}

const DISPLAY_MAX_LEN = 280

function clip(s: string): string {
  const t = s.trim()
  if (t.length <= DISPLAY_MAX_LEN) return t
  return `${t.slice(0, DISPLAY_MAX_LEN - 1).trim()}…`
}

/** Split `reason` into up to `max` segments without rewriting words. */
function reasonSegments(reason: string, max: number): string[] {
  const t = reason.trim()
  if (!t) return []
  const byNl = t
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4)
  if (byNl.length >= 2) return byNl.slice(0, max)
  const bySentence = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
  if (bySentence.length >= 2) return bySentence.slice(0, max)
  const semi = t.split(/;\s+/).map((s) => s.trim()).filter((s) => s.length > 8)
  if (semi.length >= 2) return semi.slice(0, max)
  return t ? [t] : []
}

type Props = {
  diagnostic: DiagnosticPayload
}

export function InsightGrid({ diagnostic }: Props) {
  const gap = diagnostic.positioning_gap
  const nModels = MODELS.length
  const top = diagnostic.competitor_dominance[0]

  const gapFingerprints = fingerprintSet([gap.market_focus, gap.product_focus, gap.gap])
  const problems = takeUniqueUpTo(diagnostic.insights.problems, gapFingerprints, 3).map(clip)
  const seenAfterProblems = new Set(gapFingerprints)
  for (const p of problems) seenAfterProblems.add(normKey(p))

  const fixes = takeUniqueUpTo(diagnostic.insights.recommendations, seenAfterProblems, 3).map(clip)
  const seenAfterFixes = new Set(seenAfterProblems)
  for (const f of fixes) seenAfterFixes.add(normKey(f))

  const rawReasonParts = top ? dedupeWithinList(reasonSegments(top.reason, 5)) : []
  const reasons = takeUniqueUpTo(rawReasonParts, seenAfterFixes, 3).map(clip)
  const seenAfterCompetitor = new Set(seenAfterFixes)
  for (const r of reasons) seenAfterCompetitor.add(normKey(r))

  const keyDriversRaw = diagnostic.key_drivers.slice(0, 8)
  const chips = takeUniqueUpTo(keyDriversRaw, seenAfterCompetitor, 3).map(clip)
  const seenAfterChips = new Set(seenAfterCompetitor)
  for (const c of chips) seenAfterChips.add(normKey(c))

  const tries = takeUniqueUpTo(diagnostic.improved_bullets, seenAfterChips, 3).map(clip)

  const freqX = top ? Math.min(top.frequency, nModels) : 0

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-7">
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

      <GridCard title="Why you're losing">
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
