/** Pure: parse `analyze_error` SSE body. */
export function parseAnalyzeErrorMessage(data: string): string {
  try {
    const payload = JSON.parse(data) as { message?: string }
    return payload.message ?? 'Analyze error'
  } catch {
    return 'Analyze error'
  }
}

/** Pure: parse `llm_error` SSE body. */
export function parseLlmErrorPayload(data: string): { llm?: string; message: string } {
  try {
    const payload = JSON.parse(data) as { llm?: string; message?: string }
    return { llm: payload.llm, message: payload.message ?? 'LLM error' }
  } catch {
    return { message: 'LLM error' }
  }
}
