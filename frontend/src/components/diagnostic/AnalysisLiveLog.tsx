import { useEffect, useRef, useState } from 'react'
import type { ActivityLogEntry } from '../../types'

const COLLAPSED_COUNT = 2

type Props = {
  entries: ActivityLogEntry[]
  streaming: boolean
}

function toneClass(tone: ActivityLogEntry['tone']): string {
  if (tone === 'ok') return 'text-emerald-400/90'
  if (tone === 'warn') return 'text-amber-400/90'
  return 'text-zinc-300'
}

export function AnalysisLiveLog({ entries, streaming }: Props) {
  const [expanded, setExpanded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const canExpand = entries.length > COLLAPSED_COUNT
  const visibleEntries = expanded || !canExpand ? entries : entries.slice(-COLLAPSED_COUNT)

  useEffect(() => {
    if (entries.length === 0) setExpanded(false)
  }, [entries.length])

  useEffect(() => {
    if (expanded || entries.length === 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [entries, expanded])

  return (
    <section
      className="rounded-2xl border border-zinc-800/90 bg-zinc-950/60 p-4 shadow-inner shadow-black/20 md:p-5"
      aria-label="Run progress"
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Run progress</h2>
        {streaming ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Paused</span>
        )}
      </div>
      <div
        className={
          expanded
            ? 'mt-3 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed md:max-h-56 md:text-xs'
            : 'mt-3 font-mono text-[11px] leading-relaxed md:text-xs'
        }
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {entries.length === 0 ? (
          <p className="text-zinc-600">
            {streaming ? 'Waiting for the next step…' : 'Progress from your last run will show here.'}
          </p>
        ) : (
          <ol className="space-y-1.5">
            {visibleEntries.map((e) => (
              <li key={e.id} className="flex gap-2 pl-0.5">
                <time
                  className="shrink-0 tabular-nums text-zinc-600"
                  dateTime={new Date(e.at).toISOString()}
                >
                  {new Date(e.at).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}
                </time>
                <span className={`min-w-0 wrap-break-word ${toneClass(e.tone)}`}>{e.message}</span>
              </li>
            ))}
          </ol>
        )}
        <div ref={bottomRef} aria-hidden />
      </div>
      {canExpand ? (
        <div className="mt-2 flex justify-end border-t border-zinc-800/60 pt-2">
          <button
            type="button"
            className="text-[11px] font-medium text-emerald-500/90 underline-offset-2 hover:text-emerald-400 hover:underline"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? 'Show less' : `Expand all (${entries.length})`}
          </button>
        </div>
      ) : null}
    </section>
  )
}
