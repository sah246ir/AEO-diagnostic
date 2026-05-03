/** IDs must match backend `llm` keys in SSE `llm_result` payloads. */
export const MODELS = [
  { id: 'groq', label: 'Groq (GPT-OSS 120B)' },
  { id: 'openai', label: 'OpenAI (GPT-4o mini)' },
] as const

/** Same order as the “Where you show up” table and SSE payloads—use for any UI that must stay in sync. */
export const MODEL_LABEL_LINE = MODELS.map((m) => m.label).join(' · ')
