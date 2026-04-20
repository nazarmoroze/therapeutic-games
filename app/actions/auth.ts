'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  message?: string
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/dashboard'

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please verify your email address before signing in.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function registerAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !password) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: error.message }
  }

  // Email confirmation disabled → session created immediately
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // Email confirmation required
  return {
    message: 'Account created! Check your email for a confirmation link.',
  }
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
