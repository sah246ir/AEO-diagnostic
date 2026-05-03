type Props = {
  score: number
  /** When true, hide the numeric score and show a waiting label (e.g. until analyzer SSE). */
  calculating?: boolean
}

function scoreHue(score: number): string {
  if (score < 40) return 'text-red-400'
  if (score < 70) return 'text-amber-400'
  return 'text-emerald-400'
}

export function VerdictRing({ score, calculating = false }: Props) {
  const r = 44
  const c = 2 * Math.PI * r
  const displayScore = calculating ? 0 : score
  const dash = c * (1 - Math.min(100, Math.max(0, displayScore)) / 100)
  const stroke = calculating
    ? 'text-zinc-600'
    : score < 40
      ? 'text-red-400'
      : score < 70
        ? 'text-amber-400'
        : 'text-emerald-400'
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 100 100" aria-hidden>
        <circle className="text-zinc-800" cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" />
        <circle
          className={`${stroke} ${calculating ? 'opacity-90' : ''}`}
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
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-1">
        {calculating ? (
          <span
            className="text-center text-[9px] font-semibold leading-tight text-zinc-400"
            aria-live="polite"
          >
            Crunching
            <br />
            score
          </span>
        ) : (
          <>
            <span className={`text-[2rem] font-bold tabular-nums leading-none ${scoreHue(score)}`}>{score}</span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Score</span>
          </>
        )}
      </div>
    </div>
  )
}
