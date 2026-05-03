import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MODELS } from '../config'
import type {
  ActivityLogEntry,
  AnalyzerResult,
  DiagnosticPayload,
  ModelResult,
  RawResponsesMap,
} from '../types'
import { initialModels, modelsLoadingState } from '../lib/sessionState'
import { computeDiagnostic, deriveSummary, gatherDoneRecommendations } from '../lib/computeDiagnostic'
import { parseAnalyzerPayload } from '../lib/parsers/analyzer'
import { parseLlmResultPayload } from '../lib/parsers/llmSsePayload'
import { parseAnalyzeErrorMessage, parseLlmErrorPayload } from '../lib/parsers/sseErrors'
import { useSSE } from './useSSE'

const API = import.meta.env.VITE_API_BASE ?? ''

function modelLabel(llm: string): string {
  return MODELS.find((m) => m.id === llm)?.label ?? llm
}

function buildRawResponsesMap(models: ModelResult[]): RawResponsesMap {
  const out: RawResponsesMap = {}
  for (const m of models) {
    if (m.raw !== null && m.raw !== undefined) out[m.llm] = m.raw
  }
  return out
}

type SessionContext = { query: string; userProduct: string }

export function useAnalyzeStream() {
  const { connect, close } = useSSE()

  const [models, setModels] = useState<ModelResult[]>(initialModels)
  const [analyzer, setAnalyzer] = useState<AnalyzerResult | null>(null)
  const [report, setReport] = useState<DiagnosticPayload | null>(null)
  const [session, setSession] = useState<SessionContext | null>(null)
  const [busy, setBusy] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const allModelsLineLoggedRef = useRef(false)
  const modelsRef = useRef(models)
  modelsRef.current = models

  const userProductForSummary = session?.userProduct ?? ''

  const summary = useMemo(
    () => deriveSummary(models, analyzer, userProductForSummary),
    [models, analyzer, userProductForSummary],
  )

  const rawResponses = useMemo(() => buildRawResponsesMap(models), [models])

  const pushActivity = useCallback((message: string, tone?: ActivityLogEntry['tone']) => {
    setActivityLog((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        at: Date.now(),
        message,
        tone,
      },
    ])
  }, [])

  const handleError = useCallback(
    (message: string) => {
      setStreamError(message)
      close()
      setModels(initialModels())
      setAnalyzer(null)
      setReport(null)
      setSession(null)
      setBusy(false)
    },
    [close],
  )

  const closeStream = useCallback(() => {
    close()
  }, [close])

  useEffect(() => {
    if (!busy || report !== null) return
    const allDone = models.length > 0 && models.every((m) => m.status !== 'loading')
    if (allDone && !allModelsLineLoggedRef.current) {
      allModelsLineLoggedRef.current = true
      pushActivity(`All ${MODELS.length} model answers are in. Finishing your summary…`)
    }
  }, [busy, report, models, pushActivity])

  const submit = useCallback(
    async (query: string, userProduct: string) => {
      close()
      setStreamError(null)
      setAnalyzer(null)
      setReport(null)
      allModelsLineLoggedRef.current = false
      setSession({ query, userProduct })
      const startedAt = Date.now()
      setActivityLog([
        {
          id: `${startedAt}-start`,
          at: startedAt,
          message: 'Starting check…',
        },
      ])
      setBusy(true)
      setModels(modelsLoadingState())

      const res = await fetch(`${API}/analyze`, {
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
        pushActivity(`Request failed: ${msg}`, 'warn')
        setModels(initialModels())
        setSession(null)
        setBusy(false)
        return
      }

      pushActivity('Connected. Pulling answers from each engine…')

      function handleLlmResult(ev: MessageEvent) {
        let rawJson: unknown
        try {
          rawJson = JSON.parse(ev.data as string) as unknown
        } catch {
          setStreamError('Invalid llm_result payload')
          pushActivity('That answer came back unreadable.', 'warn')
          return
        }
        const llmPayload = parseLlmResultPayload(rawJson)
        if (!llmPayload) return
        setModels((prev) =>
          prev.map((m) =>
            m.llm === llmPayload.llm
              ? { ...m, status: 'done' as const, data: llmPayload.data, raw: rawJson }
              : m,
          ),
        )
        pushActivity(`Got an answer from ${modelLabel(llmPayload.llm)}.`, 'ok')
      }

      function handleAnalyzerResult(ev: MessageEvent) {
        try {
          const rawAnalyzer = JSON.parse(ev.data as string) as unknown
          const parsedAnalyzer = parseAnalyzerPayload(rawAnalyzer)
          if (!parsedAnalyzer) {
            setStreamError('Invalid analyzer_result payload')
            pushActivity('Analyzer returned an invalid payload.', 'warn')
            return
          }

          const recommendations = gatherDoneRecommendations(modelsRef.current)
          if (recommendations.length === 0) {
            setStreamError('Missing model results; cannot build diagnostic.')
            pushActivity('Missing model results — cannot build diagnostic.', 'warn')
            return
          }

          pushActivity('Building your summary…')
          const next = computeDiagnostic({
            userProduct,
            recommendations,
            analyzer: parsedAnalyzer,
          })
          setAnalyzer(parsedAnalyzer)
          setReport(next)
          pushActivity('Done—your summary is ready.', 'ok')
        } catch {
          setStreamError('Invalid analyzer_result payload')
          pushActivity('Failed to parse analyzer response.', 'warn')
        } finally {
          close()
          setBusy(false)
        }
      }

      function handleAnalyzeError(ev: MessageEvent) {
        const msg = parseAnalyzeErrorMessage(ev.data as string)
        pushActivity(`Analyze error: ${msg}`, 'warn')
        handleError(msg)
      }

      function handleLlmError(ev: MessageEvent) {
        const { llm, message } = parseLlmErrorPayload(ev.data as string)
        setStreamError(message)
        if (llm) {
          pushActivity(`${modelLabel(llm)}: ${message}`, 'warn')
          setModels((prev) =>
            prev.map((row) =>
              row.llm === llm ? { ...row, status: 'done' as const, data: null, raw: null } : row,
            ),
          )
        } else {
          pushActivity(`LLM error: ${message}`, 'warn')
        }
        close()
        setBusy(false)
      }

      function handleTransportError() {
        setStreamError('SSE connection lost')
        pushActivity('Live stream disconnected unexpectedly.', 'warn')
        close()
        setBusy(false)
      }

      connect(`${API}/sse`, {
        llm_result: handleLlmResult,
        analyzer_result: handleAnalyzerResult,
        analyze_error: handleAnalyzeError,
        llm_error: handleLlmError,
      }, handleTransportError)
    },
    [close, connect, handleError, pushActivity],
  )

  return {
    models,
    analyzer,
    summary,
    rawResponses,
    busy,
    streamError,
    submit,
    closeStream,
    session,
    diagnostic: report,
    activityLog,
  }
}
