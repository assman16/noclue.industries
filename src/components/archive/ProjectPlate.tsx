import Link from 'next/link'

import { DISCIPLINE_LABEL, STATUS_LABEL } from '@/content/defaults'
import type { Project } from '@/payload-types'

import { Arrow } from '../Arrow'
import { MediaImage } from '../MediaImage'
import s from './ProjectPlate.module.css'

/**
 * The archive's identification plate: reference, title, status, disciplines,
 * a hero visual and the verified technical details. Works with one image or none.
 */
export function ProjectPlate({ project, index, headingLevel = 'h3' }: { project: Project; index?: number; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const facts = (project.facts || []).slice(0, 6)
  return (
    <article className={s.plate}>
      <div className={s.visual}>
        {project.heroImage ? (
          <MediaImage media={project.heroImage} sizes="(max-width: 900px) 100vw, 62vw" className={s.img} />
        ) : (
          <div className={s.placeholder} aria-hidden="true">
            <span className="deco">No image on file</span>
          </div>
        )}
        <div className="regmarks" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className={s.data}>
        <div className={s.idRow}>
          <span className="label label--signal">{project.reference}</span>
          {typeof index === 'number' && <span className="deco">Entry {String(index + 1).padStart(2, '0')}</span>}
        </div>

        <H className={s.title}>{project.title}</H>
        {project.subtitle && <p className={s.subtitle}>{project.subtitle}</p>}

        <div className={s.tags}>
          <span className="tag tag--status">
            {STATUS_LABEL[project.status] ?? project.status}
            {project.statusNote ? ` · ${project.statusNote}` : ''}
          </span>
          {project.disciplines?.map((d) => (
            <span key={d} className="tag">
              {DISCIPLINE_LABEL[d] ?? d}
            </span>
          ))}
        </div>

        <p className={s.summary}>{project.summary}</p>

        {facts.length > 0 && (
          <dl className={s.facts}>
            {facts.map((f) => (
              <div key={f.id ?? f.label}>
                <dt className="label">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Link href={`/archive/${project.slug}`} className="btn">
          Open archive entry <Arrow />
        </Link>
      </div>
    </article>
  )
}
