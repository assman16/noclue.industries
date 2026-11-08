import Link from 'next/link'

import { RENDERS } from '@/content/renders'
import type { HomeContent, ServiceView } from '@/lib/data'

import { Arrow } from '../Arrow'
import { Prov } from '../Prov'
import { RenderImage } from '../RenderImage'
import s from './Hero.module.css'

/**
 * ACT I: the corporation. The real SA-100 board, full-bleed under a low raking
 * light; one enormous statement; one sentence of what we do; one action.
 */
export function Hero({ home, services }: { home: HomeContent; services: ServiceView[] }) {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={s.visual}>
        <RenderImage asset={RENDERS.sa100Plan} sizes="(max-width: 700px) 190vw, 100vw" priority className={s.img} />
        <div className={s.shade} aria-hidden="true" />
      </div>

      <div className={`wrap ${s.plate}`} aria-hidden="true">
        <span className={s.plateId}>NCI</span>
        <span>
          SA-100
          <br />
          REV 3.0
        </span>
      </div>

      <div className={`wrap ${s.inner}`}>
        <p className={`label label--fg ${s.eyebrow}`} data-reveal>
          {home.heroEyebrow}
        </p>
        <h1 id="hero-title" className={`display ${s.title}`}>
          {home.heroLines.map((line, i) => (
            <span key={i} className={s.line} data-reveal="mask" style={{ '--reveal-delay': `${0.1 + i * 0.14}s` } as React.CSSProperties}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <div className={s.foot}>
          <p className={s.lede} data-reveal style={{ '--reveal-delay': '0.5s' } as React.CSSProperties}>
            {home.heroLede}
          </p>
          <div className={s.ctas} data-reveal style={{ '--reveal-delay': '0.62s' } as React.CSSProperties}>
            <Link href="/contact" className="btn btn--signal">
              Start a project <Arrow />
            </Link>
            <Link href="/archive/sa-100" className="btn">
              The SA-100
            </Link>
          </div>
          <Prov kind="real" className={s.prov} />
        </div>
      </div>

      <nav className={s.index} aria-label="Disciplines">
        <ol className="wrap">
          {services.map((svc, i) => (
            <li key={svc.slug}>
              <a href={`#${svc.slug}`}>
                <span className={s.idxNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.idxName}>{svc.title.replace(' & manufacturing support', '')}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  )
}
