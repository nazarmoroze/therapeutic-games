import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold tracking-wide text-[var(--foreground)] ml-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'h-12 w-full rounded-[1.5rem] border bg-white/40 backdrop-blur-xl px-5 text-base font-bold tracking-tight text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] placeholder:font-medium shadow-inner transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:border-white focus:bg-white/60',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-white/60',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
