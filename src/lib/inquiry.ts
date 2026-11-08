import 'server-only'

import { createHash, createHmac, timingSafeEqual } from 'crypto'

import {
  INQUIRY_BUDGET,
  INQUIRY_SCOPE,
  INQUIRY_STAGE,
  INQUIRY_TIMELINE,
  type InquiryFields,
  type InquiryState,
  labelOf,
} from '@/content/inquiry-options'

import { getSettings, payload } from './data'

/* --------------------------------------------------------------------------
 * Form token: signed issue timestamp. Rejects submissions that arrive too fast
 * (bots) or from a stale page, without cookies or third-party services.
 * ------------------------------------------------------------------------ */

const MIN_FILL_MS = 2500
const MAX_AGE_MS = 1000 * 60 * 60 * 24

const secret = () => process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret-change-me'

const sign = (v: string) => createHmac('sha256', secret()).update(`inquiry:${v}`).digest('base64url')

export function issueFormToken(now = Date.now()): string {
  const ts = String(now)
  return `${ts}.${sign(ts)}`
}

function checkFormToken(token: string | null, now = Date.now()): 'ok' | 'invalid' | 'fast' | 'stale' {
  if (!token) return 'invalid'
  const [ts, mac] = token.split('.')
  if (!ts || !mac) return 'invalid'
  const expected = Buffer.from(sign(ts))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'
  const age = now - Number(ts)
  if (!Number.isFinite(age) || age < 0) return 'invalid'
  if (age < MIN_FILL_MS) return 'fast'
  if (age > MAX_AGE_MS) return 'stale'
  return 'ok'
}

/* --------------------------------------------------------------------------
 * Rate limiting (in-memory, per instance). Sufficient for a single container;
 * put a shared store (e.g. Redis) behind this if the app is ever scaled out.
 * ------------------------------------------------------------------------ */

const WINDOW_MS = 60 * 60 * 1000
const PER_IP = 5
const GLOBAL = 60
const hits = new Map<string, number[]>()

function rateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS)
  const all = (hits.get('*') || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= PER_IP || all.length >= GLOBAL) return true
  recent.push(now)
  all.push(now)
  hits.set(key, recent)
  hits.set('*', all)
  if (hits.size > 5000) hits.clear() // bound memory
  return false
}

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.INQUIRY_IP_SALT || secret()}:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

/* --------------------------------------------------------------------------
 * Optional Cloudflare Turnstile (enabled when both keys are set).
 * ------------------------------------------------------------------------ */

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  if (!turnstileEnabled()) return true
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return Boolean(data.success)
  } catch {
    return false
  }
}

/* --------------------------------------------------------------------------
 * Validation
 * ------------------------------------------------------------------------ */

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const clean = (v: FormDataEntryValue | null, max: number) =>
  typeof v === 'string'
    ? v
        .replace(/\r\n/g, '\n')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
        .slice(0, max)
    : ''
const oneOf = (list: readonly { value: string }[], v: string) => (list.some((o) => o.value === v) ? v : '')

type Parsed = {
  name: string
  email: string
  company: string
  scope: string[]
  stage: string
  timeline: string
  budget: string
  message: string
  privacy: boolean
}

function parse(form: FormData): { data: Parsed; errors: Partial<Record<InquiryFields, string>> } {
  const data: Parsed = {
    name: clean(form.get('name'), 120),
    email: clean(form.get('email'), 200).toLowerCase(),
    company: clean(form.get('company'), 160),
    scope: form
      .getAll('scope')
      .map((v) => (typeof v === 'string' ? oneOf(INQUIRY_SCOPE, v) : ''))
      .filter(Boolean),
    stage: oneOf(INQUIRY_STAGE, clean(form.get('stage'), 40)),
    timeline: oneOf(INQUIRY_TIMELINE, clean(form.get('timeline'), 40)),
    budget: oneOf(INQUIRY_BUDGET, clean(form.get('budget'), 40)),
    message: clean(form.get('message'), 6000),
    privacy: form.get('privacy') === 'on',
  }
  const errors: Partial<Record<InquiryFields, string>> = {}
  if (data.name.length < 2) errors.name = 'Please tell us your name.'
  if (!EMAIL.test(data.email)) errors.email = 'Please enter a valid email address so we can reply.'
  if (data.message.length < 20) errors.message = 'A couple of sentences about the project, please (at least 20 characters).'
  if (!data.privacy) errors.privacy = 'Please confirm you have read how we handle your data.'
  return { data, errors }
}

/* --------------------------------------------------------------------------
 * Submission
 * ------------------------------------------------------------------------ */

export type SubmitContext = { ip: string; userAgent: string; path: string }

export async function submitInquiry(form: FormData, ctx: SubmitContext): Promise<InquiryState> {
  const values = {
    name: clean(form.get('name'), 120),
    email: clean(form.get('email'), 200),
    company: clean(form.get('company'), 160),
    message: clean(form.get('message'), 6000),
    stage: clean(form.get('stage'), 40),
    timeline: clean(form.get('timeline'), 40),
    budget: clean(form.get('budget'), 40),
    scope: form.getAll('scope').filter((v): v is string => typeof v === 'string'),
  }

  // Honeypot: real people never see or fill this field. Pretend success to bots.
  if (clean(form.get('website'), 200)) {
    console.warn('[inquiry] honeypot triggered')
    return { status: 'success', reference: 'NCI-Q-0000', emailed: false }
  }

  const token = checkFormToken(clean(form.get('t'), 200))
  if (token === 'fast' || token === 'invalid') {
    return { status: 'error', message: 'That was faster than humanly possible. Please wait a moment and send it again.', values }
  }
  if (token === 'stale') {
    return { status: 'error', message: 'This form has been open for over a day. Please reload the page and send it again.', values }
  }

  const ipHash = hashIp(ctx.ip || 'unknown')
  if (rateLimited(ipHash)) {
    console.warn('[inquiry] rate limit hit', ipHash.slice(0, 8))
    return { status: 'error', message: 'Too many messages in a short time. Please try again later, or email us directly.', values }
  }

  if (!(await verifyTurnstile(clean(form.get('cf-turnstile-response'), 4096), ctx.ip))) {
    return { status: 'error', message: 'The spam check did not pass. Please try again.', values }
  }

  const { data, errors } = parse(form)
  if (Object.keys(errors).length) {
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors: errors, values }
  }

  // 1) Persist first: the inquiry is never lost, even if email fails.
  const p = await payload()
  let id: number | string
  try {
    const doc = await p.create({
      collection: 'inquiries',
      overrideAccess: true,
      data: {
        name: data.name,
        email: data.email,
        company: data.company || undefined,
        scope: data.scope as never,
        stage: (data.stage || undefined) as never,
        timeline: (data.timeline || undefined) as never,
        budget: (data.budget || undefined) as never,
        message: data.message,
        state: 'new',
        notification: 'pending',
        meta: { privacyAcknowledged: true, sourcePath: ctx.path.slice(0, 200), userAgent: ctx.userAgent.slice(0, 300), ipHash },
      },
    })
    id = doc.id
  } catch (e) {
    console.error('[inquiry] could not store inquiry', e)
    return {
      status: 'error',
      message: 'Something went wrong on our side and your message was not saved. Please try again, or email us directly.',
      values,
    }
  }

  const reference = `NCI-Q-${String(id).padStart(4, '0')}`

  // 2) Notify by email when SMTP is configured; record the real outcome.
  const settings = await getSettings()
  const recipients = (settings.notifyEmails || process.env.INQUIRY_NOTIFY_TO || settings.contactEmail)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  let notification: 'sent' | 'failed' | 'not-configured' = 'not-configured'
  let notificationError: string | undefined
  if (process.env.SMTP_HOST && recipients.length) {
    try {
      await p.sendEmail({
        to: recipients,
        replyTo: `${data.name.replace(/[\r\n"<>]/g, '')} <${data.email}>`,
        subject: `[${reference}] New project inquiry — ${data.name.replace(/[\r\n]/g, ' ')}${data.company ? ` (${data.company.replace(/[\r\n]/g, ' ')})` : ''}`,
        text: [
          `Reference: ${reference}`,
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Company: ${data.company || '—'}`,
          `Scope: ${data.scope.map((v) => labelOf(INQUIRY_SCOPE, v)).join(', ') || '—'}`,
          `Stage: ${labelOf(INQUIRY_STAGE, data.stage)}`,
          `Timeline: ${labelOf(INQUIRY_TIMELINE, data.timeline)}`,
          `Budget: ${labelOf(INQUIRY_BUDGET, data.budget)}`,
          '',
          data.message,
          '',
          `Open in admin: ${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/inquiries/${id}`,
        ].join('\n'),
      })
      notification = 'sent'
    } catch (e) {
      notification = 'failed'
      notificationError = e instanceof Error ? e.message.slice(0, 300) : 'unknown error'
      console.error('[inquiry] notification email failed', e)
    }
  }

  try {
    await p.update({ collection: 'inquiries', id, overrideAccess: true, data: { notification, notificationError } })
  } catch (e) {
    console.error('[inquiry] could not record notification status', e)
  }

  return { status: 'success', reference, emailed: notification === 'sent' }
}
