import { useState } from 'react'
import { MODEL_LABEL_LINE, MODELS } from '../../config'

type Props = {
  disabled: boolean
  onSubmit: (query: string, userProduct: string) => void
}

export function InputForm({ disabled, onSubmit }: Props) {
  const [query, setQuery] = useState('')
  const [userProduct, setUserProduct] = useState('')

  return (
    <form
      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl shadow-black/20 backdrop-blur-sm"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(query.trim(), userProduct.trim())
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Search query
          </span>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/30 placeholder:text-zinc-600 focus:border-emerald-600/50 focus:ring-2"
            name="query"
            placeholder="e.g. best CRM for mid-market teams"
            value={query}
            disabled={disabled}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
            Your product
          </span>
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/30 placeholder:text-zinc-600 focus:border-emerald-600/50 focus:ring-2"
            name="userProduct"
            placeholder="Brand or product name"
            value={userProduct}
            disabled={disabled}
            onChange={(e) => setUserProduct(e.target.value)}
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? 'Working…' : 'Check my ranking'}
        </button>
        <p className="text-xs text-zinc-500">
          Runs the same check across {MODELS.length} models: {MODEL_LABEL_LINE}.
        </p>
      </div>
    </form>
  )
}
