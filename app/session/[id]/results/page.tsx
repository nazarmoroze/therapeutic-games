import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbSession } from '@/lib/games/types'
import { ResultsContent } from './results-content'

export const metadata = { title: 'Session Results — Therapeutic Games' }

interface Props {
  params: { id: string }
}

export default async function ResultsPage({ params }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) notFound()

  return <ResultsContent session={data as DbSession} />
}
