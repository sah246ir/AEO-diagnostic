import { useMemo } from 'react'
import { MODELS } from '../../config'
import type { ActivityLogEntry, DerivedSummary, DiagnosticPayload, ModelResult } from '../../types'
import { strengthFromRank } from '../../lib/computeDiagnostic'
import { AnalysisLiveLog } from '../diagnostic/AnalysisLiveLog'
import { InsightGrid } from '../diagnostic/InsightGrid'
import { RawOutputsCollapsible } from '../diagnostic/RawOutputsCollapsible'
import { VerdictPanel } from '../diagnostic/VerdictPanel'
import type { BreakdownRow } from '../diagnostic/WhereYouShowUp'
import { WhereYouShowUp } from '../diagnostic/WhereYouShowUp'

type Props = {
  diagnostic: DiagnosticPayload | null
  models: ModelResult[]
  summary: DerivedSummary
  busy: boolean
  activityLog: ActivityLogEntry[]
}

export function DiagnosticView({ diagnostic, models, summary, busy, activityLog }: Props) {
  const breakdownRows: BreakdownRow[] = useMemo(() => {
    return MODELS.map((m, i) => {
      const slot = models[i]!
      const derived = summary.summary[m.id]
      const finalRow = diagnostic?.summary[m.id]
      const rank = finalRow?.rank ?? derived?.rank ?? null
      const strength = finalRow?.strength ?? derived?.status ?? strengthFromRank(rank)
      return {
        id: m.id,
        label: m.label,
        loading: slot.status === 'loading',
        rank,
        strength,
      }
    })
  }, [diagnostic, models, summary])

  return (
    <div className="mt-10 flex w-full flex-col gap-10 md:gap-12">
      <AnalysisLiveLog entries={activityLog} streaming={busy} />

      <VerdictPanel diagnostic={diagnostic} busy={busy} liveSummary={summary} />

      <WhereYouShowUp rows={breakdownRows} />

      {diagnostic ? (
        <>
          <InsightGrid diagnostic={diagnostic} />
          <RawOutputsCollapsible models={models} parsedByModel={diagnostic.raw} />
        </>
      ) : null}
    </div>
  )
}
