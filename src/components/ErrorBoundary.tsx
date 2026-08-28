import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🛟</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">冒险暂时停下来了</h1>
          <p className="text-gray-600 mb-6">请重新加载页面，我们会从已保存的进度继续。</p>
          <button className="btn-kid-primary" onClick={() => window.location.reload()}>
            重新加载
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
