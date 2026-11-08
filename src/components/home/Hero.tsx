import Link from 'next/link'

import { RENDERS } from '@/content/renders'
import type { HomeContent } from '@/lib/data'

import { Arrow } from '../Arrow'
import { RenderImage } from '../RenderImage'
import s from './Hero.module.css'

export function Hero({ home }: { home: HomeContent }) {
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={s.visual}>
        <RenderImage asset={RENDERS.sa100Hero} sizes="(max-width: 900px) 160vw, 100vw" priority className={s.img} />
        <div className={s.shade} aria-hidden="true" />
      </div>

      <div className={`wrap ${s.inner}`}>
        <p className={`label ${s.figure}`} data-reveal style={{ '--reveal-delay': '1.1s' } as React.CSSProperties}>
          <span className="label--signal">Fig. 01</span> — SA-100 rev 3.0, rendered from its KiCad 3D data
        </p>

        <div className={s.copy}>
          <p className={`label label--fg ${s.eyebrow}`} data-reveal>
            {home.heroEyebrow}
          </p>
          <h1 id="hero-title" className={`display ${s.title}`}>
            {home.heroLines.map((line, i) => (
              <span key={i} className={s.line} data-reveal="mask" style={{ '--reveal-delay': `${0.12 + i * 0.12}s` } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <div className={s.bottom}>
            <p className={`lede ${s.lede}`} data-reveal style={{ '--reveal-delay': '0.55s' } as React.CSSProperties}>
              {home.heroLede}
            </p>
            <div className={s.ctas} data-reveal style={{ '--reveal-delay': '0.7s' } as React.CSSProperties}>
              <Link href="/contact" className="btn btn--signal">
                Start a project <Arrow />
              </Link>
              <Link href="/archive" className="btn">
                See the work
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`wrap ${s.rail}`}>
        <dl className={s.specs}>
          <div>
            <dt className="label">Disciplines</dt>
            <dd>Electronics · Firmware · Mechanical · Prototyping</dd>
          </div>
          <div>
            <dt className="label">Board shown</dt>
            <dd>SA-100 · 170 × 150 mm · 1.6 mm</dd>
          </div>
          <div>
            <dt className="label">Designed in</dt>
            <dd>Slovakia</dd>
          </div>
        </dl>
        <a href="#disciplines" className={s.scroll} aria-label="Scroll to disciplines">
          <span className="label">Scroll</span>
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
