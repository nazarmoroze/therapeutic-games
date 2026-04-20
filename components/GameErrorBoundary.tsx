'use client'

import React from 'react'
import { AlertTriangle, SkipForward } from 'lucide-react'

interface Props {
  children: React.ReactNode
  gameName: string
  onSkip: () => void
}

interface State {
  hasError: boolean
  errorMessage: string
}

export class GameErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[GameErrorBoundary] ${this.props.gameName}:`, error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[420px] gap-6 py-12 px-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-200">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <div className="text-center max-w-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Game encountered an error</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-1">
              <span className="font-medium text-slate-700">{this.props.gameName}</span> failed to
              run.
            </p>
            <p className="text-slate-400 text-xs mb-6">
              Skip this game to continue the session, or refresh to try again.
            </p>
          </div>
          <button
            onClick={this.props.onSkip}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <SkipForward className="h-4 w-4" />
            Skip and continue
          </button>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-red-400 font-mono max-w-sm text-center break-all">
              {this.state.errorMessage}
            </p>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
