import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleReset)
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleReset)
  }

  handleReset = () => {
    if (this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-mc text-xl text-[var(--accent)]">Something went wrong.</p>
          <p className="max-w-sm text-[13px] text-[#a6adc8]">Reload the page to try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mc-btn rounded-none px-3 py-1.5 text-[12px] text-[#a6adc8] hover:text-[var(--accent)]"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
