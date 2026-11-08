'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useActionState, useEffect, useRef } from 'react'

import { sendInquiry } from '@/app/(frontend)/contact/actions'
import {
  INQUIRY_BUDGET,
  INQUIRY_SCOPE,
  INQUIRY_STAGE,
  INQUIRY_TIMELINE,
  type InquiryFields,
  type InquiryState,
} from '@/content/inquiry-options'

import { Arrow } from '../Arrow'
import s from './InquiryForm.module.css'

type Props = { token: string; contactEmail: string; turnstileSiteKey?: string }

export function InquiryForm({ token, contactEmail, turnstileSiteKey }: Props) {
  // The permalink lets React restore the result when the form is posted without JavaScript.
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, { status: 'idle' }, '/contact')
  const statusRef = useRef<HTMLDivElement>(null)
  const errs = state.status === 'error' ? (state.fieldErrors ?? {}) : {}
  const vals = state.status === 'error' ? (state.values ?? {}) : {}

  useEffect(() => {
    if (state.status !== 'idle') statusRef.current?.focus()
  }, [state])

  if (state.status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} className={s.success} role="status">
        <p className="label label--signal">Inquiry logged — {state.reference}</p>
        <h3 className={s.successTitle}>Thank you. Your brief is with us.</h3>
        <p className="body">
          We have stored your message under reference <strong>{state.reference}</strong> and will reply to the address you gave us. If anything
          is urgent, write to{' '}
          <a className="link" href={`mailto:${contactEmail}?subject=${encodeURIComponent(state.reference)}`}>
            {contactEmail}
          </a>{' '}
          and quote the reference.
        </p>
      </div>
    )
  }

  const describe = (f: InquiryFields, hint?: string) => [errs[f] ? `${f}-error` : null, hint].filter(Boolean).join(' ') || undefined
  const val = (f: InquiryFields) => (typeof vals[f] === 'string' ? (vals[f] as string) : undefined)
  const scopeVals = Array.isArray(vals.scope) ? vals.scope : []

  return (
    <form action={action} className={s.form} noValidate>
      <div ref={statusRef} tabIndex={-1} className={s.status} aria-live="polite">
        {state.status === 'error' && (
          <p className={s.formError} role="alert">
            {state.message}
          </p>
        )}
      </div>

      <input type="hidden" name="t" value={token} />
      <div className={s.hp} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset className={s.group}>
        <legend className={s.legend}>
          <span className="label label--signal">01</span> What do you need?
        </legend>
        <div className={s.chips}>
          {INQUIRY_SCOPE.map((o) => (
            <label key={o.value} className={s.chip}>
              <input type="checkbox" name="scope" value={o.value} defaultChecked={scopeVals.includes(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.legend}>
          <span className="label label--signal">02</span> The problem
        </legend>
        <div className={s.field}>
          <label htmlFor="message">Describe what you want to build or fix *</label>
          <textarea
            id="message"
            name="message"
            rows={7}
            required
            minLength={20}
            maxLength={6000}
            defaultValue={val('message')}
            aria-invalid={Boolean(errs.message) || undefined}
            aria-describedby={describe('message', 'message-hint')}
            placeholder="What the device should do, where it will be used, what exists already (sketches, a prototype, a board that needs redesigning)…"
          />
          <p id="message-hint" className={s.hint}>
            Rough is fine. You can send drawings, files and photos once we reply.
          </p>
          {errs.message && (
            <p id="message-error" className={s.error}>
              {errs.message}
            </p>
          )}
        </div>
        <div className={s.row3}>
          <Select name="stage" label="Where are you now?" options={INQUIRY_STAGE} value={val('stage')} />
          <Select name="timeline" label="Timeline" options={INQUIRY_TIMELINE} value={val('timeline')} />
          <Select name="budget" label="Budget (optional)" options={INQUIRY_BUDGET} value={val('budget')} />
        </div>
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.legend}>
          <span className="label label--signal">03</span> You
        </legend>
        <div className={s.row2}>
          <div className={s.field}>
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={120}
              defaultValue={val('name')}
              aria-invalid={Boolean(errs.name) || undefined}
              aria-describedby={describe('name')}
            />
            {errs.name && (
              <p id="name-error" className={s.error}>
                {errs.name}
              </p>
            )}
          </div>
          <div className={s.field}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={val('email')}
              aria-invalid={Boolean(errs.email) || undefined}
              aria-describedby={describe('email')}
            />
            {errs.email && (
              <p id="email-error" className={s.error}>
                {errs.email}
              </p>
            )}
          </div>
        </div>
        <div className={s.field}>
          <label htmlFor="company">Company (optional)</label>
          <input id="company" name="company" autoComplete="organization" maxLength={160} defaultValue={val('company')} />
        </div>
      </fieldset>

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="dark" />
        </>
      )}

      <div className={s.submitRow}>
        <label className={s.consent}>
          <input type="checkbox" name="privacy" required aria-invalid={Boolean(errs.privacy) || undefined} aria-describedby={describe('privacy')} />
          <span>
            I have read how my details are processed in the{' '}
            <Link href="/privacy" className="link">
              privacy notice
            </Link>
            . *
          </span>
        </label>
        {errs.privacy && (
          <p id="privacy-error" className={s.error}>
            {errs.privacy}
          </p>
        )}
        <button type="submit" className="btn btn--signal" disabled={pending} aria-busy={pending || undefined}>
          {pending ? 'Sending…' : 'Send project inquiry'} <Arrow />
        </button>
      </div>
    </form>
  )
}

function Select({
  name,
  label,
  options,
  value,
}: {
  name: string
  label: string
  options: readonly { label: string; value: string }[]
  value?: string
}) {
  return (
    <div className={s.field}>
      <label htmlFor={name}>{label}</label>
      <div className={s.select}>
        <select id={name} name={name} defaultValue={value ?? ''}>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
