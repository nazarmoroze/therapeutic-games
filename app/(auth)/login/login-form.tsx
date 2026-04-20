'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction, type AuthState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} size="lg" className="w-full mt-2">
      Sign in
    </Button>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [state, formAction] = useFormState<AuthState, FormData>(loginAction, {})

  return (
    <>
      <h2 className="text-3xl font-extrabold tracking-tighter text-[var(--foreground)] mb-1 text-center">
        Sign In
      </h2>
      <p className="text-xs font-bold tracking-widest uppercase text-[var(--muted-foreground)] mb-10 text-center">
        Continue your sessions
      </p>

      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-5">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="bg-white/50 backdrop-blur-md"
          />

          <div className="flex flex-col gap-2">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="bg-white/50 backdrop-blur-md"
            />
            <div className="text-right px-2 mt-1">
              <span className="text-[10px] font-bold text-[var(--muted-foreground)] opacity-70 tracking-widest uppercase hover:opacity-100 cursor-pointer transition-opacity">
                Forgot password?
              </span>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-5 py-4 backdrop-blur-xl">
            <p className="text-sm font-bold text-red-600 tracking-wide text-center">
              {state.error}
            </p>
          </div>
        )}

        <div className="mt-2">
          <SubmitButton />
        </div>
      </form>

      <p className="mt-8 text-center text-xs font-bold tracking-wider text-[var(--muted-foreground)]">
        NEW USER?{' '}
        <Link
          href="/register"
          className="text-[var(--foreground)] tracking-[0.15em] ml-1 uppercase hover:opacity-70 transition-opacity"
        >
          Create Account
        </Link>
      </p>
    </>
  )
}
