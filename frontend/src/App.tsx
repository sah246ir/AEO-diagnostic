import { AEO_MODELS } from './aeoConfig'
import { AnalysisPanel } from './components/AnalysisPanel'
import { InputForm } from './components/InputForm'
import { ModelCard } from './components/ModelCard'
import { useAEOStream } from './hooks/useAEOStream'

export default function App() {
  const { models, analyzer, busy, streamError, submit } = useAEOStream()
  const allCardsDone = models.every((m) => m.status === 'done')

  return (
    <div className="min-h-screen bg-zinc-950 bg-gradient-to-b from-emerald-950/25 via-zinc-950 to-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-10 border-b border-zinc-800/80 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/80">
            Answer engine optimization
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
            AEO diagnostic
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Measure how your product surfaces across AI shopping assistants. Live results stream as each
            model completes.
          </p>
        </header>

        <InputForm disabled={busy} onSubmit={submit} />

        {streamError ? (
          <div
            className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300/90"
            role="alert"
          >
            {streamError}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {AEO_MODELS.map((m, i) => (
            <ModelCard key={m.id} title={m.label} result={models[i]!} />
          ))}
        </div>

        {allCardsDone ? <AnalysisPanel analyzer={analyzer} /> : null}
      </div>
    </div>
  )
}
