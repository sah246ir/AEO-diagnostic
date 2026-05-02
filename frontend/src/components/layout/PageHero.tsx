type Variant = 'hero' | 'inline'

type Props = {
  variant?: Variant
}

export function PageHero({ variant = 'hero' }: Props) {
  if (variant === 'inline') {
    return (
      <header className="mb-8 border-b border-zinc-800/80 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/80">
          Answer engine optimization
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">How you show up</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          See if AI answers mention you—and what to tweak if they don&apos;t.
        </p>
      </header>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/80">
        Answer engine optimization
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">How you show up</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-500">
        See if AI answers mention you—and what to tweak if they don&apos;t.
      </p>
    </div>
  )
}
