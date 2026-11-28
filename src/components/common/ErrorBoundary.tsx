import { Component, type ErrorInfo, type ReactNode } from 'react'
import { markSignedOut } from '../../utils/sessionFlag'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Last-resort recovery screen so a render error cannot white-screen a delivery. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] Render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-5 text-ink">
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-float">
          <p className="text-[10px] font-bold tracking-[0.16em] text-brand">RECOVERY</p>
          <h1 className="mt-2 text-[22px] font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            The partner app hit an unexpected error. Your Firebase session is safe; reload to try again.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white"
            >
              Reload app
            </button>
            <button
              type="button"
              onClick={() => {
                markSignedOut()
                window.location.assign('/login')
              }}
              className="min-h-11 rounded-xl border border-line bg-surface px-4 text-[13px] font-semibold text-ink"
            >
              Return to login
            </button>
          </div>
        </section>
      </main>
    )
  }
}
