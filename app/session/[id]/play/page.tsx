import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GameHost } from './game-host'
import type { DbSession } from '@/lib/games/types'

interface Props {
  params: { id: string }
}

export const metadata = {
  title: 'Playing — Therapeutic Games',
}

export default async function PlayPage({ params }: Props) {
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

  const session = data as DbSession

  // Completed sessions go straight to results
  if (session.status === 'completed') {
    redirect(`/session/${session.id}/results`)
  }

  return <GameHost session={session} />
}
