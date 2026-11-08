import { issueFormToken } from '@/lib/inquiry'
import type { SiteSettings } from '@/lib/data'

import s from './ContactBlock.module.css'
import { InquiryForm } from './InquiryForm'

type Props = {
  title: string
  intro: string
  settings: SiteSettings
  index?: string
  headingLevel?: 'h1' | 'h2'
}

const NEXT_STEPS = [
  'We read the brief and work out which disciplines it touches.',
  'We reply with questions — or a short call, if that is faster.',
  'You receive a proposed approach and a sensible first step.',
]

export function ContactBlock({ title, intro, settings, index = '06', headingLevel = 'h2' }: Props) {
  const H = headingLevel
  const tel = settings.phone?.replace(/[^+\d]/g, '')
  return (
    <div className={s.block}>
      <aside className={s.side}>
        <p className="label" data-reveal>
          <span className="label--signal">§ {index}</span> — Start a project
        </p>
        <H className={`h2 ${s.title}`} data-reveal>
          {title}
        </H>
        <p className={`body ${s.intro}`} data-reveal>
          {intro}
        </p>

        <ol className={s.next} data-reveal>
          {NEXT_STEPS.map((step, i) => (
            <li key={step}>
              <span className="label label--signal">{String(i + 1).padStart(2, '0')}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <dl className={s.direct} data-reveal>
          <div>
            <dt className="label">Email</dt>
            <dd>
              <a className="link" href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>
            </dd>
          </div>
          {settings.phone && (
            <div>
              <dt className="label">Phone</dt>
              <dd>
                <a className="link" href={`tel:${tel}`}>
                  {settings.phone}
                </a>
              </dd>
            </div>
          )}
          {settings.responseTime && (
            <div>
              <dt className="label">Response</dt>
              <dd>{settings.responseTime}</dd>
            </div>
          )}
        </dl>
      </aside>

      <div className={s.formCol}>
        <InquiryForm
          token={issueFormToken()}
          contactEmail={settings.contactEmail}
          turnstileSiteKey={process.env.TURNSTILE_SECRET_KEY ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined}
        />
      </div>
    </div>
  )
}
