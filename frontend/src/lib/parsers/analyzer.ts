import type { AnalyzerResponse } from '../../types'

/** After JSON.parse: accept only non-null objects as analyzer payloads. */
export function parseAnalyzerPayload(raw: unknown): AnalyzerResponse | null {
  if (raw === null || typeof raw !== 'object') return null
  return raw as AnalyzerResponse
}
