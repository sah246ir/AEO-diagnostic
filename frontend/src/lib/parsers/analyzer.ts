import type { AnalyzerResponse } from '../../types'

/** Trust server JSON schema: JSON.parse + non-null object → typed value. */
export function normalizeAnalyzerPayload(raw: unknown): AnalyzerResponse | null {
  if (raw === null || typeof raw !== 'object') return null
  return raw as AnalyzerResponse
}
