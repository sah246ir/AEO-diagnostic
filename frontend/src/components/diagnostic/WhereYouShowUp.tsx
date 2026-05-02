import type { ModelStrength } from '../../types'

export type BreakdownRow = {
  id: string
  label: string
  loading: boolean
  rank: number | null
  strength: ModelStrength
}

function rankCell(row: BreakdownRow): string {
  if (row.loading) return '…'
  if (row.rank === null) return 'Not mentioned ✕'
  return `#${row.rank}`
}

function strengthCell(row: BreakdownRow): string {
  if (row.loading) return '…'
  if (row.strength === 'strong') return 'Strong'
  if (row.strength === 'weak') return 'Weak'
  return '—'
}

type Props = {
  rows: BreakdownRow[]
}

export function WhereYouShowUp({ rows }: Props) {
  return (
    <section className="w-full">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Where you show up</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/90 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-medium md:px-4">Model</th>
              <th className="px-3 py-2 font-medium md:px-4">Rank</th>
              <th className="px-3 py-2 font-medium md:px-4">Strength</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-zinc-800/60 last:border-0">
                <td className="px-3 py-2.5 font-medium text-zinc-200 md:px-4">{row.label}</td>
                <td className="px-3 py-2.5 tabular-nums text-zinc-300 md:px-4">{rankCell(row)}</td>
                <td className="px-3 py-2.5 text-zinc-400 md:px-4">{strengthCell(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
