'use client'

import { useState } from 'react'
import { LogOut, Brain } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

interface DashboardNavProps {
  displayName: string
}

export function DashboardNav({ displayName }: DashboardNavProps) {
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    setLoggingOut(true)
    await logoutAction()
  }

  return (
    <header className="sticky top-6 z-30 mx-auto max-w-[700px] px-4">
      <div className="glass-panel h-16 rounded-full flex items-center justify-between px-5">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--primary)] text-white shadow-md">
            <Brain className="h-5 w-5" />
          </div>
          <span className="font-bold text-[var(--foreground)] text-sm sm:text-base tracking-tight">
            Soma Therapy
          </span>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-full bg-white border border-white/60 shadow-sm text-[var(--foreground)] flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="max-w-[120px] truncate text-sm font-semibold opacity-80">
              {displayName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={loggingOut}
            className="w-10 h-10 p-0 rounded-full bg-white/50 text-[var(--foreground)] hover:bg-black/10 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
