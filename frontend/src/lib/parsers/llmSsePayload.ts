import type { LLMRecommendations } from '../../types'

export type LlmResultPayload = {
  llm: string
  data: LLMRecommendations
}

/** Pure: validate `llm_result` SSE JSON body. */
export function parseLlmResultPayload(json: unknown): LlmResultPayload | null {
  if (!json || typeof json !== 'object') return null
  const o = json as Record<string, unknown>
  const llm = o.llm
  const data = o.data
  if (typeof llm !== 'string' || data == null || typeof data !== 'object') return null
  const results = (data as { results?: unknown }).results
  if (!Array.isArray(results)) return null
  return { llm, data: data as LLMRecommendations }
}

export function parseLlmResultEventData(data: string): LlmResultPayload | null {
  try {
    return parseLlmResultPayload(JSON.parse(data) as unknown)
  } catch {
    return null
  }
}
