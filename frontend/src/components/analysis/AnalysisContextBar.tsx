type Props = {
  query: string
  userProduct: string
}

export function AnalysisContextBar({ query, userProduct }: Props) {
  return (
    <div
      className="mt-6 rounded-xl border border-zinc-800/70 bg-zinc-900/35 px-4 py-3 md:px-5"
      aria-label="What you searched"
    >
      <dl className="grid gap-3 sm:grid-cols-2 sm:gap-6">
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Search query</dt>
          <dd className="mt-1 wrap-break-word text-sm leading-snug text-zinc-100">{query || '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Your product</dt>
          <dd className="mt-1 wrap-break-word text-sm leading-snug text-zinc-100">
            {userProduct.trim() ? userProduct : '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
