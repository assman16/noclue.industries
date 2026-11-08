import Link from 'next/link'

import { ProjectPlate } from '@/components/archive/ProjectPlate'
import { PageHead } from '@/components/PageHead'
import { DISCIPLINE_LABEL, STATUS_LABEL } from '@/content/defaults'
import { getProjects } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

import s from './archive.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Engineering archive',
    description: 'Selected electronics, firmware and mechanical engineering work by NoClue Industries — presented from real design data.',
    path: '/archive',
  })
}

export default async function ArchivePage() {
  const projects = await getProjects()
  const [lead, ...rest] = projects
  return (
    <>
      <PageHead
        label="Engineering archive"
        title="The archive."
        intro="A register of engineering work we can show. Each entry carries a site reference, its real development status and only the technical details we can verify from the design files."
      />

      <div className="wrap">
        <div className={s.register} role="table" aria-label="Archive register">
          <div className={s.rowHead} role="row">
            <span role="columnheader" className="label">
              Ref.
            </span>
            <span role="columnheader" className="label">
              Entry
            </span>
            <span role="columnheader" className="label">
              Disciplines
            </span>
            <span role="columnheader" className="label">
              Status
            </span>
            <span role="columnheader" className="label">
              Year
            </span>
          </div>
          {projects.map((p) => (
            <Link key={p.id} href={`/archive/${p.slug}`} className={s.row} role="row">
              <span role="cell" className="label label--signal">
                {p.reference}
              </span>
              <span role="cell" className={s.entry}>
                <strong>{p.title}</strong>
                {p.subtitle && <span>{p.subtitle}</span>}
              </span>
              <span role="cell" className={s.small}>
                {(p.disciplines || []).map((d) => DISCIPLINE_LABEL[d] ?? d).join(' · ') || '—'}
              </span>
              <span role="cell" className={s.small}>
                {STATUS_LABEL[p.status] ?? p.status}
                {p.statusNote ? ` · ${p.statusNote}` : ''}
              </span>
              <span role="cell" className={s.small}>
                {p.year ?? '—'}
              </span>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className={s.empty}>
              No published entries yet. <Link href="/contact" className="link">Ask us about our work</Link>.
            </p>
          )}
        </div>

        {lead && (
          <div className={s.plates}>
            <ProjectPlate project={lead} index={0} headingLevel="h2" />
            {rest.map((p, i) => (
              <ProjectPlate key={p.id} project={p} index={i + 1} headingLevel="h2" />
            ))}
          </div>
        )}

        <p className={`label ${s.note}`}>
          Archive references (NCI-A-…) are catalogue numbers for this website, not product part numbers.
        </p>
      </div>
    </>
  )
}
