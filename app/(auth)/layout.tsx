import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Therapeutic Games',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--background] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#34d399]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / brand mark */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/60 shadow-lg border border-white mb-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--foreground)]"
            >
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
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tighter">
            Soma Therapy
          </h1>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mt-2">
            Mind wellness through play
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-[3rem] border-white/80">{children}</div>
      </div>
    </div>
  )
}
