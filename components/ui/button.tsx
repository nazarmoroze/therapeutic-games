'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:bg-[#000] focus-visible:ring-[var(--foreground)] shadow-lg shadow-black/10',
  secondary:
    'bg-white/60 backdrop-blur-xl text-[var(--foreground)] border border-white/60 hover:bg-white/80 active:bg-white focus-visible:ring-[var(--foreground)] shadow-sm shadow-black/5',
  ghost:
    'text-[var(--foreground)] hover:bg-black/5 active:bg-black/10 focus-visible:ring-[var(--foreground)]',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500 shadow-md',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-4 text-xs tracking-wide rounded-full font-semibold',
  md: 'h-12 px-6 text-sm tracking-wide rounded-full font-semibold',
  lg: 'h-14 px-8 text-base tracking-wide rounded-full font-semibold',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
