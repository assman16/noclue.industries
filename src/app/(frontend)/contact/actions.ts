'use server'

import { headers } from 'next/headers'

import type { InquiryState } from '@/content/inquiry-options'
import { submitInquiry } from '@/lib/inquiry'

/**
 * Server action behind the inquiry form. Works with and without JavaScript.
 * Client IP comes from the reverse proxy (Coolify/Traefik sets X-Forwarded-For);
 * it is only used, hashed, for rate limiting.
 */
export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '').trim()
  const path = (() => {
    try {
      return new URL(h.get('referer') || '').pathname
    } catch {
      return ''
    }
  })()
  return submitInquiry(form, { ip, userAgent: h.get('user-agent') || '', path })
}
