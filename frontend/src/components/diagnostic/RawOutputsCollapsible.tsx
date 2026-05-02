import { useState } from 'react'
import { MODELS } from '../../config'
import type { LLMRecommendations, ModelResult } from '../../types'

type Props = {
  models: ModelResult[]
  /** Parsed recommendations keyed by model id (matches `DiagnosticPayload.raw` after completion). */
  parsedByModel: Record<string, { recommendations: LLMRecommendations }>
}

export function RawOutputsCollapsible({ models, parsedByModel }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const keys = MODELS.map((m) => m.id)
  const activeKey = keys[tab] ?? keys[0]
  const model = models.find((m) => m.llm === activeKey)
  const rawBody = model?.raw ?? null
  const parsed = parsedByModel[activeKey]

  return (
    <section className="border-t border-zinc-800/80 pt-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-left text-sm font-medium text-zinc-200 transition hover:border-zinc-600"
      >
        View raw model outputs
        <span className="text-zinc-500">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="flex flex-wrap gap-1 border-b border-zinc-800 pb-3">
            {MODELS.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTab(i)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  tab === i
                    ? 'bg-emerald-600/20 text-emerald-300'
                    : 'text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Raw message</p>
          <pre className="mt-1 max-h-[min(240px,40vh)] overflow-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-zinc-400">
            {rawBody !== null && rawBody !== undefined ? JSON.stringify(rawBody, null, 2) : '—'}
          </pre>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Parsed list</p>
          <pre className="mt-1 max-h-[min(240px,40vh)] overflow-auto rounded-lg bg-black/40 p-4 text-xs leading-relaxed text-zinc-400">
            {JSON.stringify(parsed?.recommendations ?? {}, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
