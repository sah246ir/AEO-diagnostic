type Props = {
  score: number
}

function scoreHue(score: number): string {
  if (score < 40) return 'text-red-400'
  if (score < 70) return 'text-amber-400'
  return 'text-emerald-400'
}

export function VerdictRing({ score }: Props) {
  const r = 44
  const c = 2 * Math.PI * r
  const dash = c * (1 - Math.min(100, Math.max(0, score)) / 100)
  const stroke =
    score < 40 ? 'text-red-400' : score < 70 ? 'text-amber-400' : 'text-emerald-400'
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 100 100" aria-hidden>
        <circle className="text-zinc-800" cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" />
        <circle
          className={stroke}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold tabular-nums ${scoreHue(score)}`}>{score}</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Score</span>
      </div>
    </div>
  )
}
