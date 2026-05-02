import { PageHero } from '../layout/PageHero'
import { InputForm } from '../form/InputForm'

type Props = {
  disabled: boolean
  onSubmit: (query: string, userProduct: string) => void
  streamError: string | null
}

export function LandingView({ disabled, onSubmit, streamError }: Props) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-12 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-10">
        <PageHero variant="hero" />
        <div className="w-full">
          <InputForm disabled={disabled} onSubmit={onSubmit} />
        </div>
        {streamError ? (
          <div
            className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300/90"
            role="alert"
          >
            {streamError}
          </div>
        ) : null}
      </div>
    </div>
  )
}
