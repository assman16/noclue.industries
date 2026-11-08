import Link from 'next/link'

import { RENDERS } from '@/content/renders'
import type { Project } from '@/payload-types'

import { Arrow } from '../Arrow'
import { Prov } from '../Prov'
import { RenderImage } from '../RenderImage'
import s from './Feature.module.css'

const CLOSEUPS = [
  { asset: RENDERS.sa100Soic, caption: 'SOIC rows, input side' },
  { asset: RENDERS.sa100Terminals, caption: 'Two-pole spring terminals' },
  { asset: RENDERS.sa100Top, caption: 'Plan view, all legends' },
]

/**
 * ACT IV: actual engineering. One real board, presented like a product
 * campaign. Every image here is rendered from the SA-100's own design data.
 */
export function Feature({ projects }: { projects: Project[] }) {
  const project = projects.find((p) => p.slug === 'sa-100') ?? projects.find((p) => p.featured) ?? projects[0]
  if (!project) return null
  const facts = (project.facts ?? []).slice(0, 4)

  return (
    <section id="work" className={s.feature} aria-labelledby="feature-title">
      <div className={`wrap ${s.head}`}>
        <p className="label">
          <span className="label--signal">§ 04</span> — Actual engineering · {project.reference}
        </p>
        <Prov kind="real" />
      </div>

      <div className={s.stage}>
        <RenderImage asset={RENDERS.sa100Corner} sizes="100vw" className={s.stageImg} />
        <h2 id="feature-title" className={`display ${s.name}`} data-reveal="mask">
          <span>{project.title}</span>
        </h2>
      </div>

      <div className={`wrap ${s.body}`}>
        <div className={s.copy}>
          <p className={s.subtitle} data-reveal>
            {project.subtitle}
          </p>
          <Link href={`/archive/${project.slug}`} className="btn btn--signal" data-reveal>
            Full project record <Arrow />
          </Link>
        </div>
        <dl className={s.facts} data-reveal>
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="label">{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={`wrap ${s.strip}`}>
        {CLOSEUPS.map((c, i) => (
          <figure key={c.asset.name} className={s.closeup} data-reveal style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}>
            <div className={s.frame}>
              <RenderImage asset={c.asset} sizes="(max-width: 900px) 100vw, 33vw" />
            </div>
            <figcaption className="label">
              <span className="label--signal">{String(i + 1).padStart(2, '0')}</span> {c.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
