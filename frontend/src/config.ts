/** IDs must match backend `llm` keys in SSE `llm_result` payloads. */
export const MODELS = [
  { id: 'llama-3.3', label: 'Llama 3.3' },
  { id: 'mixtral-8x7b', label: 'Mixtral 8×7B' },
  { id: 'gemma-2', label: 'Gemma 2' },
] as const
