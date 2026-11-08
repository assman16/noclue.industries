import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Arrow } from '@/components/Arrow'
import { MediaImage } from '@/components/MediaImage'
import { DISCIPLINE_LABEL, SITE, STATUS_LABEL } from '@/content/defaults'
import { getProject, getProjects } from '@/lib/data'
import { buildMetadata, mediaUrl } from '@/lib/seo'
import type { Media } from '@/payload-types'

import s from './project.module.css'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const p = await getProject(slug)
  if (!p) return buildMetadata({ title: 'Not found', path: `/archive/${slug}`, noindex: true })
  return buildMetadata({
    title: p.seo?.title || `${p.title}${p.subtitle ? ` — ${p.subtitle}` : ''}`,
    description: p.seo?.description || p.summary,
    path: `/archive/${p.slug}`,
    image: (p.seo?.image as Media) || (p.heroImage as Media),
    noindex: p.seo?.noindex,
    type: 'article',
  })
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const [project, all] = await Promise.all([getProject(slug), getProjects()])
  if (!project) notFound()

  const idx = all.findIndex((p) => p.id === project.id)
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null
  const gallery = (project.gallery || []).filter((g) => g.image && typeof g.image === 'object')
  const layout = gallery.length <= 1 ? 'one' : gallery.length === 2 ? 'two' : gallery.length % 3 === 0 ? 'three' : 'mosaic'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: `${SITE.url}/archive/${project.slug}`,
    image: mediaUrl(project.heroImage as Media, 'wide') ? `${SITE.url}${mediaUrl(project.heroImage as Media, 'wide')}` : undefined,
    creator: { '@type': 'Organization', name: 'NoClue Industries', url: SITE.url },
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <header className={`wrap ${s.head}`}>
        <nav aria-label="Breadcrumb" className="label">
          <Link href="/archive" className="link">
            Archive
          </Link>{' '}
          / <span className="label--signal">{project.reference}</span>
        </nav>
        <h1 className={`display ${s.title}`} data-reveal="mask">
          <span>{project.title}</span>
        </h1>
        {project.subtitle && (
          <p className={s.subtitle} data-reveal>
            {project.subtitle}
          </p>
        )}
        <div className={s.tags} data-reveal>
          <span className="tag tag--status">
            {STATUS_LABEL[project.status] ?? project.status}
            {project.statusNote ? ` · ${project.statusNote}` : ''}
          </span>
          {project.disciplines?.map((d) => (
            <span key={d} className="tag">
              {DISCIPLINE_LABEL[d] ?? d}
            </span>
          ))}
          {project.year && <span className="tag">{project.year}</span>}
          {project.client && <span className="tag">Client: {project.client}</span>}
        </div>
      </header>

      {project.heroImage && (
        <div className={`wrap ${s.hero}`}>
          <MediaImage media={project.heroImage} sizes="100vw" priority className={s.heroImg} />
          <div className="regmarks" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      )}

      <div className={`wrap ${s.body}`}>
        <div className={s.main}>
          <p className={s.summary}>{project.summary}</p>

          {project.challenge && (
            <section aria-labelledby="challenge">
              <h2 id="challenge" className="label label--signal">
                The brief
              </h2>
              <RichText data={project.challenge} className="rich" />
            </section>
          )}

          {project.work && project.work.length > 0 && (
            <section aria-labelledby="work">
              <h2 id="work" className="label label--signal">
                Work performed
              </h2>
              <ol className={s.work}>
                {project.work.map((w, i) => (
                  <li key={w.id ?? i}>
                    <span className="deco">{String(i + 1).padStart(2, '0')}</span>
                    <span>{w.item}</span>
                    {w.discipline && <span className="tag">{DISCIPLINE_LABEL[w.discipline] ?? w.discipline}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {project.notes && (
            <section aria-labelledby="notes">
              <h2 id="notes" className="label label--signal">
                Notes
              </h2>
              <RichText data={project.notes} className="rich" />
            </section>
          )}
        </div>

        <aside className={s.side} aria-label="Technical data">
          {project.facts && project.facts.length > 0 && (
            <section className={s.sheet}>
              <h2 className="label">Technical data</h2>
              <dl>
                {project.facts.map((f, i) => (
                  <div key={f.id ?? i}>
                    <dt className="label">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {project.components && project.components.length > 0 && (
            <section className={s.sheet}>
              <h2 className="label">Key components</h2>
              <dl>
                {project.components.map((c, i) => (
                  <div key={c.id ?? i}>
                    <dt className="mono">{c.part}</dt>
                    {c.role && <dd>{c.role}</dd>}
                  </div>
                ))}
              </dl>
            </section>
          )}
          <p className="deco">Ref. {project.reference} — site archive number, not a part number.</p>
        </aside>
      </div>

      {gallery.length > 0 && (
        <section className={`wrap ${s.gallery}`} data-layout={layout} aria-label="Images">
          {gallery.map((g, i) => (
            <figure key={g.id ?? i} className={s.fig} data-reveal>
              <MediaImage media={g.image as Media} sizes={layout === 'one' ? '100vw' : '(max-width: 900px) 100vw, 50vw'} className={s.figImg} />
              {(g.caption || (g.image as Media).caption) && (
                <figcaption className="label label--fg">
                  <span className="label--signal">Fig. {String(i + 1).padStart(2, '0')}</span> — {g.caption || (g.image as Media).caption}
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      <footer className={`wrap ${s.foot}`}>
        <Link href="/contact" className="btn btn--signal">
          Discuss a similar project <Arrow />
        </Link>
        {next && next.id !== project.id ? (
          <Link href={`/archive/${next.slug}`} className={s.next}>
            <span className="label">Next entry — {next.reference}</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link href="/archive" className="btn">
            Back to the archive
          </Link>
        )}
      </footer>
    </article>
  )
}
