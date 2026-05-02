import { useCallback, useRef, useState } from 'react'
import { AEO_MODELS } from '../aeoConfig'
import type { AnalyzerResult, ModelResult } from '../aeoTypes'

const API = import.meta.env.VITE_API_BASE ?? ''

type AnalyzerData = NonNullable<AnalyzerResult['data']>

function initialModels(): ModelResult[] {
  return AEO_MODELS.map((m) => ({
    llm: m.id,
    status: 'idle',
    data: null,
  }))
}

function normalizeAnalyzerPayload(raw: unknown): AnalyzerData | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const visibility = o.visibility
  const competitor_insights = o.competitor_insights
  const recommendation = o.recommendation
  const vs = o.visibility_score
  const score = typeof vs === 'number' && !Number.isNaN(vs) ? vs : Number(vs)
  if (!Array.isArray(visibility) || !Array.isArray(competitor_insights) || typeof recommendation !== 'string') {
    return null
  }
  return {
    visibility: visibility as AnalyzerData['visibility'],
    visibility_score: Number.isFinite(score) ? score : 0,
    competitor_insights: competitor_insights as AnalyzerData['competitor_insights'],
    recommendation,
  }
}

export function useAEOStream() {
  const [models, setModels] = useState<ModelResult[]>(initialModels)
  const [analyzer, setAnalyzer] = useState<AnalyzerResult>({ status: 'idle', data: null })
  const [busy, setBusy] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const closeStream = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  const submit = useCallback(
    async (query: string, userProduct: string) => {
      closeStream()
      setStreamError(null)
      setBusy(true)
      setModels(AEO_MODELS.map((m) => ({ llm: m.id, status: 'loading', data: null })))
      setAnalyzer({ status: 'loading', data: null })

      const res = await fetch(`${API}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userProduct }),
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const j = (await res.json()) as { error?: string }
          if (j.error) msg = j.error
        } catch {
          /* ignore */
        }
        setStreamError(msg)
        setModels(initialModels())
        setAnalyzer({ status: 'idle', data: null })
        setBusy(false)
        return
      }

      const es = new EventSource(`${API}/api/sse`)
      esRef.current = es

      const onLlmResult = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data as string) as { llm: string; data: ModelResult['data'] }
          if (!payload?.llm) return
          setModels((prev) =>
            prev.map((row) =>
              row.llm === payload.llm
                ? { llm: row.llm, status: 'done', data: payload.data ?? null }
                : row,
            ),
          )
        } catch {
          setStreamError('Invalid llm_result payload')
        }
      }

      const onAnalyzerResult = (ev: MessageEvent) => {
        try {
          const raw = JSON.parse(ev.data as string) as unknown
          const data = normalizeAnalyzerPayload(raw)
          if (!data) {
            setStreamError('Invalid analyzer_result payload')
            setAnalyzer({ status: 'idle', data: null })
          } else {
            setAnalyzer({ status: 'done', data })
          }
        } catch {
          setStreamError('Invalid analyzer_result payload')
          setAnalyzer({ status: 'idle', data: null })
        }
        closeStream()
        setBusy(false)
      }

      const onAnalyzeError = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data as string) as { message?: string }
          setStreamError(payload.message ?? 'Analyze error')
        } catch {
          setStreamError('Analyze error')
        } finally {
          closeStream()
          setModels(initialModels())
          setAnalyzer({ status: 'idle', data: null })
          setBusy(false)
        }
      }

      const onLlmError = (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data as string) as { llm?: string; message?: string }
          setStreamError(payload.message ?? 'LLM error')
          if (payload.llm) {
            setModels((prev) =>
              prev.map((row) =>
                row.llm === payload.llm ? { ...row, status: 'idle', data: null } : row,
              ),
            )
          }
        } catch {
          setStreamError('LLM error')
        }
        closeStream()
        setBusy(false)
      }

      es.addEventListener('llm_result', onLlmResult as EventListener)
      es.addEventListener('analyzer_result', onAnalyzerResult as EventListener)
      es.addEventListener('analyze_error', onAnalyzeError as EventListener)
      es.addEventListener('llm_error', onLlmError as EventListener)

      es.onerror = () => {
        if (es.readyState === EventSource.CLOSED) return
        setStreamError('SSE connection lost')
        closeStream()
        setBusy(false)
      }
    },
    [closeStream],
  )

  return { models, analyzer, busy, streamError, submit, closeStream }
}
