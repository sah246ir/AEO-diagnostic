export type ModelResult = {
  llm: string
  status: 'idle' | 'loading' | 'done'
  data: null | {
    results: {
      rank: number
      name: string
      reason: string
      product_vibe: string
      keywords: string[]
    }[]
  }
}

export type AnalyzerResult = {
  status: 'idle' | 'loading' | 'done'
  data: null | {
    visibility: { llm: string; found: boolean; rank: number | null; reason: string }[]
    visibility_score: number
    competitor_insights: { name: string; edge: string }[]
    recommendation: string
  }
}
