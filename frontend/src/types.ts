export type ModelStrength = 'strong' | 'weak' | 'none'

export type ListingResult = {
  rank: number
  name: string
  reason: string
  product_vibe: string
  keywords: string[]
}

export type LLMRecommendations = {
  results: ListingResult[]
}

export type AnalyzerResponse = {
  visibility: { llm: string; rank: number | null }[]
  visibility_score: number
  primary_purchase_driver: {
    driver: string
    confidence: number
  }
  key_drivers: string[]
  positioning_gap: {
    market_focus: string
    product_focus: string
    gap: string
  }
  competitor_dominance: {
    name: string
    frequency: number
    reason: string
  }[]
  problems: string[]
  recommendations: string[]
  improved_bullets: string[]
}

export type DiagnosticSummaryRow = {
  rank: number | null
  strength: ModelStrength
}

export type DiagnosticPayload = {
  score: number
  verdict: string
  summary: Record<string, DiagnosticSummaryRow>
  top_competitor: string
  competitive_story: string
  insights: {
    problems: string[]
    recommendations: string[]
  }
  raw: Record<string, { recommendations: LLMRecommendations }>
  primary_purchase_driver: AnalyzerResponse['primary_purchase_driver']
  key_drivers: string[]
  positioning_gap: AnalyzerResponse['positioning_gap']
  competitor_dominance: AnalyzerResponse['competitor_dominance']
  improved_bullets: string[]
}

export type ModelResultStatus = 'idle' | 'loading' | 'done'

export type ModelResult = {
  llm: string
  label: string
  status: ModelResultStatus
  data: LLMRecommendations | null
  raw: unknown
}

export type AnalyzerResult = AnalyzerResponse

export type DerivedSummaryRow = {
  rank: number | null
  status: ModelStrength
}

export type DerivedSummary = {
  score: number
  summary: Record<string, DerivedSummaryRow>
  topCompetitor: string | null
}

export type RawResponsesMap = Partial<Record<string, unknown>>

export type ActivityLogTone = 'info' | 'ok' | 'warn'

export type ActivityLogEntry = {
  id: string
  at: number
  message: string
  tone?: ActivityLogTone
}
