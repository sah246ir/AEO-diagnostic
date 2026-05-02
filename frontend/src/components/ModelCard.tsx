import type { ModelResult } from '../aeoTypes'

type Props = {
  title: string
  result: ModelResult
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-800/80 ${className}`} />
}

export function ModelCard({ title, result }: Props) {
  const { status, data } = result

  return (
    <article className="flex min-h-[320px] flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 shadow-inner shadow-black/20">
      <header className="mb-4 border-b border-zinc-800 pb-3">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
          {status === 'idle' && 'Idle'}
          {status === 'loading' && 'Generating'}
          {status === 'done' && 'Complete'}
        </p>
      </header>

      {status === 'idle' && (
        <p className="text-sm text-zinc-600">Submit a query to populate this model.</p>
      )}

      {status === 'loading' && (
        <div className="flex flex-1 flex-col gap-3">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </div>
      )}

      {status === 'done' && data?.results && (
        <ol className="flex flex-1 flex-col gap-3 overflow-auto">
          {data.results.slice(0, 5).map((item) => (
            <li
              key={item.rank}
              className="rounded-lg border border-zinc-800/60 bg-zinc-950/50 p-3"
            >
              <div className="flex items-start gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-emerald-400">
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-zinc-100">{item.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.reason}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      {item.product_vibe}
                    </span>
                    {item.keywords.map((kw, ki) => (
                      <span
                        key={`${item.rank}-${ki}-${kw}`}
                        className="rounded-md bg-emerald-950/40 px-2 py-0.5 text-[10px] text-emerald-300/90"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {status === 'done' && !data?.results?.length && (
        <p className="text-sm text-zinc-500">No structured results returned.</p>
      )}
    </article>
  )
}
