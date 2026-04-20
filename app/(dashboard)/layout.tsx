import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || profile?.email || user.email || 'User'

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      <DisclaimerBanner />
      <DashboardNav displayName={displayName} />
      <main className="max-w-[700px] mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</main>
    </div>
  )
}
