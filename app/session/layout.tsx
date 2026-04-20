import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <DisclaimerBanner />
      {children}
    </div>
  )
}
