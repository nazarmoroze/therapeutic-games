'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

const STORAGE_KEY = 'tg-disclaimer-dismissed'

export function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="relative bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed flex-1">
          <span className="font-semibold">Research Demo Only.</span> This platform is not a medical
          device. Results are not a clinical diagnosis and should not be used to guide medical
          decisions without review by a qualified healthcare professional.
        </p>
        <button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, '1')
            setVisible(false)
          }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-amber-100 text-amber-600 hover:text-amber-800 transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
