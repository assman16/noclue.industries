import Link from 'next/link'

import type { HomeContent, ServiceView } from '@/lib/data'

import { Arrow } from '../Arrow'
import { SectionHead } from '../SectionHead'
import s from './Disciplines.module.css'

/**
 * Four disciplines as massive typographic rows. Native <details name> gives an
 * exclusive accordion with keyboard + screen-reader support and no JS.
 */
export function Disciplines({ home, services }: { home: HomeContent; services: ServiceView[] }) {
  return (
    <section id="disciplines" className="section" aria-labelledby="disciplines-title">
      <div className="wrap">
        <SectionHead index="01" label="Disciplines" title={home.disciplinesTitle} intro={home.disciplinesIntro} id="disciplines-title" />

        <div className={s.list}>
          {services.map((svc, i) => (
            <details key={svc.slug} name="discipline" className={s.row} open={i === 0} data-reveal>
              <summary className={s.summary}>
                <span className={`label ${s.code}`}>
                  {String(i + 1).padStart(2, '0')} / {svc.code}
                </span>
                <span className={s.name}>{svc.title}</span>
                <span className={s.headline}>{svc.headline}</span>
                <span className={s.toggle} aria-hidden="true">
                  <i />
                  <i />
                </span>
              </summary>
              <div className={s.panel}>
                <p className={s.summaryText}>{svc.summary}</p>
                <div className={s.cols}>
                  <div>
                    <h3 className="label">Capabilities</h3>
                    <ul className={s.caps}>
                      {svc.capabilities.map((c) => (
                        <li key={c.label}>
                          <span>{c.label}</span>
                          {c.delivery === 'partner' && <span className="tag">via partners</span>}
                          {c.delivery === 'in-house' && <span className="tag">in-house</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="label">You receive</h3>
                    <ul className={s.deliv}>
                      {svc.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <Link href={`/capabilities#${svc.slug}`} className={`link ${s.more}`}>
                      {svc.title} in detail
                    </Link>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className={s.integrated} data-reveal>
          <p className={s.integratedText}>
            <span className="label label--signal">Combined</span>
            <strong>Complete hardware development.</strong> Architecture, PCB, firmware, enclosure, prototypes and production data — taken on
            together, as one project with one point of contact.
          </p>
          <Link href="/capabilities" className="btn">
            All capabilities <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}
