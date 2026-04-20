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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm sm:text-base">
            Therapeutic Games
          </span>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <span className="max-w-[160px] truncate">{displayName}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={loggingOut}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
