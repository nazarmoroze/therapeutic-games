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
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
      <p className="text-sm text-slate-500 mb-6">Sign in to continue your sessions</p>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <div className="text-right">
            <span className="text-xs text-slate-400">Forgot password? Contact support.</span>
          </div>
        </div>

        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </>
  )
}
