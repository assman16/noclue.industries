import Link from 'next/link'

import { PHOTOS } from '@/content/photography'
import type { HomeContent, SiteSettings } from '@/lib/data'

import { Arrow } from '../Arrow'
import { Prov } from '../Prov'
import { RenderImage } from '../RenderImage'
import s from './Invitation.module.css'

/** ACT V: the invitation. One question, one action. The form lives on /contact. */
export function Invitation({ home, settings }: { home: HomeContent; settings: SiteSettings }) {
  return (
    <section id="contact" className={s.invite} aria-labelledby="invite-title">
      <figure className={s.photo}>
        <RenderImage asset={PHOTOS.ring} sizes="(max-width: 900px) 100vw, 45vw" className={s.fill} />
        <figcaption>
          <Prov kind="illustrative" photo={PHOTOS.ring} />
        </figcaption>
      </figure>
      <div className={`wrap ${s.inner}`}>
        <p className="label">
          <span className="label--signal">§ 05</span> — Start a project
        </p>
        <h2 id="invite-title" className={`display ${s.title}`} data-reveal="mask">
          <span>{home.contactTitle}</span>
        </h2>
        <p className={s.intro} data-reveal>
          {home.contactIntro}
        </p>
        <div className={s.actions} data-reveal>
          <Link href="/contact" className="btn btn--signal">
            Describe your project <Arrow />
          </Link>
          <a className={s.mail} href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
        </div>
      </div>
    </section>
  )
}
