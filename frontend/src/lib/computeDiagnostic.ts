import { MODELS } from '../config'
import type {
  AnalyzerResponse,
  DerivedSummary,
  DiagnosticPayload,
  DiagnosticSummaryRow,
  ListingResult,
  LLMRecommendations,
  ModelResult,
  ModelStrength,
} from '../types'

const MODEL_IDS = MODELS.map((m) => m.id)

export { normalizeAnalyzerPayload } from './parsers/analyzer'

function normalize(s: string): string {
  return s.toLowerCase().trim()
}

/** Product match in listing name, reason, or keyword overlap (ranked by listing order). */
export function findUserRankInListings(results: ListingResult[], userProduct: string): number | null {
  const p = normalize(userProduct)
  if (!p || !results?.length) return null
  const tokens = p.split(/\s+/).filter((w) => w.length > 1)
  const significant = tokens.filter((w) => w.length > 2)

  for (const r of results) {
    const name = normalize(r.name)
    const reason = normalize(r.reason)
    const blob = `${name} ${reason}`
    if (name.includes(p)) return r.rank
    if (significant.length && significant.every((t) => blob.includes(t))) return r.rank
    if (tokens.length >= 2 && tokens.every((t) => blob.includes(t))) return r.rank
    const kw = r.keywords.map((k: string) => normalize(k))
    if (significant.some((t) => kw.some((k: string) => k.includes(t) || t.includes(k)))) return r.rank
  }
  return null
}

export function strengthFromRank(rank: number | null): ModelStrength {
  if (rank === null) return 'none'
  if (rank <= 2) return 'strong'
  if (rank <= 4) return 'weak'
  return 'weak'
}

/** Listing-only score (used before analyzer SSE arrives). */
export function scoreFromListingRanks(summary: Record<string, DiagnosticSummaryRow>): number {
  const n = MODEL_IDS.length
  let score = 0
  for (const id of MODEL_IDS) {
    const rank = summary[id]?.rank ?? null
    if (rank === null) continue
    score += 100 / n
    if (rank === 1) score += 10
    if (rank === 2) score += 5
  }
  return Math.round(Math.min(100, Math.max(0, score)))
}

export function gatherDoneRecommendations(
  models: ModelResult[],
): { llm: string; data: LLMRecommendations }[] {
  return models
    .filter((m) => m.status === 'done' && m.data != null)
    .map((m) => ({ llm: m.llm, data: m.data! }))
}

export function buildSummaryRecord(
  recommendations: { llm: string; data: LLMRecommendations }[],
  analyzer: AnalyzerResponse | null,
  userProduct: string,
): Record<string, DiagnosticSummaryRow> {
  const summary: Record<string, DiagnosticSummaryRow> = {}
  for (const id of MODEL_IDS) {
    const row = recommendations.find((r) => r.llm === id)
    const rankFromListings = row ? findUserRankInListings(row.data.results, userProduct) : null
    const vis = analyzer?.visibility.find((v) => v.llm === id || normalize(v.llm) === normalize(id))
    const rankFromAnalyzer =
      vis != null && vis.rank != null && Number.isFinite(vis.rank) ? (vis.rank as number) : null
    const rank = rankFromListings ?? rankFromAnalyzer
    summary[id] = { rank, strength: strengthFromRank(rank) }
  }
  return summary
}

function verdictFromScore(score: number, foundInModels: number): string {
  if (score >= 70) return 'You usually show up near the top for this search.'
  if (score >= 40) return 'You show up sometimes, but not in a steady way.'
  if (foundInModels > 0) return 'You get mentioned, but often not near the top.'
  return 'You are not in these answer lists yet.'
}

function countTopCompetitors(
  recommendations: { llm: string; data: LLMRecommendations }[],
  userProduct: string,
): Map<string, number> {
  const counts = new Map<string, number>()
  const exclude = normalize(userProduct)
  for (const { data } of recommendations) {
    for (const r of data.results) {
      if (r.rank > 3) continue
      const key = r.name.trim()
      if (!key) continue
      if (exclude && normalize(key).includes(exclude)) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return counts
}

function topCompetitorName(counts: Map<string, number>): string {
  let best = ''
  let bestN = 0
  for (const [name, n] of counts) {
    if (n > bestN) {
      best = name
      bestN = n
    }
  }
  return best
}

/** Progressive summary: listing-only until analyzer; then prefers analyzer score + competitor hints. */
export function deriveSummary(
  models: ModelResult[],
  analyzer: AnalyzerResponse | null,
  userProduct: string,
): DerivedSummary {
  const recommendations = gatherDoneRecommendations(models)
  const summaryRecord = buildSummaryRecord(recommendations, analyzer, userProduct)
  const score = analyzer
    ? Math.round(Math.min(100, Math.max(0, analyzer.visibility_score)))
    : scoreFromListingRanks(summaryRecord)
  const counts = countTopCompetitors(recommendations, userProduct)
  const topFromListings = topCompetitorName(counts)
  const topFromAnalyzer = analyzer?.competitor_dominance?.[0]?.name?.trim() ?? ''
  const topCompetitor = topFromAnalyzer || (topFromListings.trim() ? topFromListings : null)
  const summary: DerivedSummary['summary'] = {}
  for (const id of MODEL_IDS) {
    const row = summaryRecord[id]
    summary[id] = {
      rank: row?.rank ?? null,
      status: row?.strength ?? 'none',
    }
  }
  return {
    score,
    summary,
    topCompetitor,
  }
}

function buildCompetitiveStory(analyzer: AnalyzerResponse): string {
  const parts: string[] = []
  const gap = analyzer.positioning_gap
  if (gap.gap.trim()) parts.push(gap.gap)
  const top = analyzer.competitor_dominance[0]
  if (top) {
    parts.push(
      `${top.name} keeps turning up in top spots (${top.frequency} lists). ${top.reason}`.trim(),
    )
  }
  if (parts.length === 0) {
    return 'No one name ran away with this search—results vary by answer.'
  }
  return parts.join(' ')
}

function buildVerdict(analyzer: AnalyzerResponse): string {
  const score = Math.round(Math.min(100, Math.max(0, analyzer.visibility_score)))
  const foundInModels = analyzer.visibility.filter((v) => v.rank != null).length
  const base = verdictFromScore(score, foundInModels)
  const driver = analyzer.primary_purchase_driver.driver.trim()
  if (!driver) return base
  return `${base} Buyers keep coming back to: ${driver}.`
}

export type ComputeDiagnosticInput = {
  userProduct: string
  recommendations: { llm: string; data: LLMRecommendations }[]
  analyzer: AnalyzerResponse
}

/**
 * Maps analyzer + listing payloads into UI state. Prefers analyzer strings and visibility_score;
 * per-model summary still merges listing ranks when analyzer omits a slot.
 */
export function computeDiagnostic(input: ComputeDiagnosticInput): DiagnosticPayload {
  const { userProduct, recommendations, analyzer } = input

  const summary = buildSummaryRecord(recommendations, analyzer, userProduct)
  const score = Math.round(Math.min(100, Math.max(0, analyzer.visibility_score)))
  const verdict = buildVerdict(analyzer)
  const top_competitor = analyzer.competitor_dominance[0]?.name?.trim() ?? ''
  const competitive_story = buildCompetitiveStory(analyzer)

  const problems = analyzer.problems.slice(0, 8)
  const recs = analyzer.recommendations.slice(0, 8)
  const fallbackRec =
    recs.length < 2
      ? [
          ...recs,
          'Say clearly—in the first line—what problem you fix and who it’s for, in the same words people use in this search.',
        ]
      : recs

  const raw: DiagnosticPayload['raw'] = {}
  for (const { llm, data } of recommendations) {
    raw[llm] = { recommendations: data }
  }

  return {
    score,
    verdict,
    summary,
    top_competitor,
    competitive_story,
    insights: {
      problems: problems.slice(0, 6),
      recommendations: fallbackRec.slice(0, 6),
    },
    raw,
    primary_purchase_driver: analyzer.primary_purchase_driver,
    key_drivers: analyzer.key_drivers,
    positioning_gap: analyzer.positioning_gap,
    competitor_dominance: analyzer.competitor_dominance,
    improved_bullets: analyzer.improved_bullets,
  }
}
