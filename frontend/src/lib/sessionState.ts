import { MODELS } from '../config'
import type { ModelResult } from '../types'

export function initialModels(): ModelResult[] {
  return MODELS.map((m) => ({
    llm: m.id,
    label: m.label,
    status: 'idle' as const,
    data: null,
    raw: null,
  }))
}

export function modelsLoadingState(): ModelResult[] {
  return MODELS.map((m) => ({
    llm: m.id,
    label: m.label,
    status: 'loading' as const,
    data: null,
    raw: null,
  }))
}
