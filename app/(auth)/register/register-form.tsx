'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { registerAction, type AuthState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending} size="lg" className="w-full mt-2">
      Create account
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useFormState<AuthState, FormData>(registerAction, {})

  if (state.message) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Check your email</h2>
        <p className="text-sm text-slate-500">{state.message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-indigo-600 font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Create your account</h2>
      <p className="text-sm text-slate-500 mb-6">Start your therapeutic journey today</p>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Full name"
          name="full_name"
          type="text"
          placeholder="Alex Smith"
          autoComplete="name"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          hint="At least 8 characters"
          required
          minLength={8}
        />

        {state.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
