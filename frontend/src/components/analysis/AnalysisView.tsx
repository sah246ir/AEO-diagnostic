import type { ActivityLogEntry, DerivedSummary, DiagnosticPayload, ModelResult } from '../../types'
import { PageHero } from '../layout/PageHero'
import { AnalysisContextBar } from './AnalysisContextBar'
import { DiagnosticView } from './DiagnosticView'
import { InputForm } from '../form/InputForm'

type SessionContext = { query: string; userProduct: string } | null

type Props = {
  disabled: boolean
  onSubmit: (query: string, userProduct: string) => void
  streamError: string | null
  diagnostic: DiagnosticPayload | null
  models: ModelResult[]
  summary: DerivedSummary
  busy: boolean
  activityLog: ActivityLogEntry[]
  session: SessionContext
}

export function AnalysisView({
  disabled,
  onSubmit,
  streamError,
  diagnostic,
  models,
  summary,
  busy,
  activityLog,
  session,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <PageHero variant="inline" />
      {session ? <AnalysisContextBar query={session.query} userProduct={session.userProduct} /> : null}
      <div className="mt-6">
        <InputForm disabled={disabled} onSubmit={onSubmit} />
      </div>
      {streamError ? (
        <div
          className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300/90"
          role="alert"
        >
          {streamError}
        </div>
      ) : null}
      <DiagnosticView
        diagnostic={diagnostic}
        models={models}
        summary={summary}
        busy={busy}
        activityLog={activityLog}
      />
    </div>
  )
}
