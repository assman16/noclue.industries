import type { HomeContent } from '@/lib/data'

import { SectionHead } from '../SectionHead'
import s from './Why.module.css'

export function Why({ home }: { home: HomeContent }) {
  return (
    <section className={`section sheet ${s.why}`} aria-labelledby="why-title">
      <div className="wrap">
        <SectionHead index="05" label="Why one team" title={home.whyTitle} id="why-title" />
        <ol className={s.points}>
          {home.whyPoints.map((p, i) => (
            <li key={p.title} data-reveal style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}>
              <span className={s.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={s.title}>{p.title}</h3>
              <p className={s.body}>{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
