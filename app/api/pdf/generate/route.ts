import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { PdfReport } from '@/components/pdf/PdfReport'
import type { DbSession } from '@/lib/games/types'

export const runtime = 'nodejs'
const BUCKET = 'session-reports'

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = (await req.json()) as { sessionId: string }
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

    // Verify caller is authenticated and owns the session
    const userSupabase = await createClient()
    const {
      data: { user },
    } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Fetch session with service role (bypasses RLS)
    const { data, error: fetchErr } = await admin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !data) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    const session = data as DbSession

    // Ensure storage bucket exists
    const { error: bucketErr } = await admin.storage.createBucket(BUCKET, {
      public: false,
      allowedMimeTypes: ['application/pdf'],
    })
    if (
      bucketErr &&
      !bucketErr.message.includes('already exists') &&
      (bucketErr as { statusCode?: string }).statusCode !== '409'
    ) {
      console.error('bucket create:', bucketErr)
    }

    const filePath = `${sessionId}.pdf`

    // If PDF already exists in storage, skip generation
    const { data: existingFile } = await admin.storage.from(BUCKET).list('', {
      search: `${sessionId}.pdf`,
    })
    const alreadyUploaded = existingFile?.some((f) => f.name === `${sessionId}.pdf`)

    if (!alreadyUploaded) {
      // Generate PDF server-side
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = createElement(PdfReport as any, { session })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfBuffer = await renderToBuffer(element as any)

      // Upload to Supabase Storage
      const { error: uploadErr } = await admin.storage
        .from(BUCKET)
        .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) {
        console.error('upload:', uploadErr)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      // Update sessions.pdf_url with storage path
      await admin
        .from('sessions')
        .update({ pdf_url: filePath, status: 'completed' })
        .eq('id', sessionId)
    }

    // Generate signed URL (1 hour)
    const { data: signedData, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 3600)

    if (signErr || !signedData) {
      return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
    }

    return NextResponse.json({ url: signedData.signedUrl })
  } catch (err) {
    console.error('PDF generate error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
