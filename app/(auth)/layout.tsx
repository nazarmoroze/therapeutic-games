import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Therapeutic Games',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand mark */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path
                d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                fill="currentColor"
              />
              <path
                d="M12 3v2M12 19v2M3 12H5M19 12h2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Therapeutic Games</h1>
          <p className="text-sm text-slate-500 mt-1">Mind wellness through play</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
