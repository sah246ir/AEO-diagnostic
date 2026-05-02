import { AnalysisView } from './components/analysis/AnalysisView'
import { LandingView } from './components/landing/LandingView'
import { useAnalyzeStream } from './hooks/useAnalyzeStream'
import type { DiagnosticPayload, ModelResult } from './types'

function analysisSessionActive(
  busy: boolean,
  diagnostic: DiagnosticPayload | null,
  models: ModelResult[],
): boolean {
  if (busy || diagnostic !== null) return true
  return models.some((m) => m.status !== 'idle' || m.data != null)
}

export default function App() {
  const { diagnostic, models, summary, busy, streamError, activityLog, session, submit } = useAnalyzeStream()
  const showAnalysis = analysisSessionActive(busy, diagnostic, models)

  return (
    <div className="min-h-screen bg-zinc-950 bg-linear-to-b from-emerald-950/25 via-zinc-950 to-zinc-950 text-zinc-300">
      {showAnalysis ? (
        <AnalysisView
          disabled={busy}
          onSubmit={submit}
          streamError={streamError}
          diagnostic={diagnostic}
          models={models}
          summary={summary}
          busy={busy}
          activityLog={activityLog}
          session={session}
        />
      ) : (
        <LandingView disabled={busy} onSubmit={submit} streamError={streamError} />
      )}
    </div>
  )
}
