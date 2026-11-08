import Link from 'next/link'

import { Arrow } from '@/components/Arrow'
import { PageHead } from '@/components/PageHead'
import { RenderImage } from '@/components/RenderImage'
import { RENDERS } from '@/content/renders'
import { getHome, getServices } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

import s from './capabilities.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Capabilities',
    description:
      'PCB design and layout, firmware, mechanical CAD and enclosures, prototyping and manufacturing preparation — what NoClue Industries does and what you receive.',
    path: '/capabilities',
  })
}

const VISUALS = [RENDERS.sa100Top, RENDERS.sa100Detail, RENDERS.da01Exploded, RENDERS.da01DetailGasket]

export default async function CapabilitiesPage() {
  const [services, home] = await Promise.all([getServices(), getHome()])
  return (
    <>
      <PageHead
        label="Capabilities"
        title="What we engineer."
        intro="Electronics, firmware, mechanics and prototyping — offered separately, and at their best together. Below is what each discipline covers and what you get at the end."
      />

      <nav className={`wrap ${s.toc}`} aria-label="Disciplines on this page">
        {services.map((svc, i) => (
          <a key={svc.slug} href={`#${svc.slug}`} className={s.tocLink}>
            <span className="label">{String(i + 1).padStart(2, '0')}</span>
            {svc.title}
          </a>
        ))}
      </nav>

      <div className="wrap">
        {services.map((svc, i) => (
          <section key={svc.slug} id={svc.slug} className={s.discipline} aria-labelledby={`${svc.slug}-title`}>
            <div className={s.head}>
              <p className="label">
                <span className="label--signal">
                  {String(i + 1).padStart(2, '0')} / {svc.code}
                </span>
              </p>
              <h2 id={`${svc.slug}-title`} className={s.name} data-reveal>
                {svc.title}
              </h2>
              <p className={s.headline}>{svc.headline}</p>
              <p className="body">{svc.summary}</p>
              <figure className={s.visual} data-reveal>
                <RenderImage asset={VISUALS[i % VISUALS.length]} sizes="(max-width: 960px) 100vw, 40vw" />
                <figcaption className="deco">{VISUALS[i % VISUALS.length].source}</figcaption>
              </figure>
            </div>
            <div className={s.lists}>
              <div>
                <h3 className="label">Capabilities</h3>
                <ul className={s.caps}>
                  {svc.capabilities.map((c, j) => (
                    <li key={c.label} data-reveal style={{ '--reveal-delay': `${j * 0.04}s` } as React.CSSProperties}>
                      <span className="deco">{String(j + 1).padStart(2, '0')}</span>
                      <span>{c.label}</span>
                      {c.delivery === 'partner' && <span className="tag">via manufacturing partners</span>}
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
              </div>
            </div>
          </section>
        ))}

        <section className={s.together} aria-labelledby="together-title">
          <p className="label label--signal">Combined</p>
          <h2 id="together-title" className="h2">
            Complete hardware development.
          </h2>
          <ol className={s.chain}>
            {home.processSteps.map((step, i) => (
              <li key={step.title}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <span>{step.output}</span>
              </li>
            ))}
          </ol>
          <p className="body">
            PCB fabrication and assembly are carried out by specialist manufacturers; we prepare the data, choose suitable partners with you and
            coordinate the work. Everything else on this page is engineering we do ourselves.
          </p>
          <div className={s.ctas}>
            <Link href="/contact" className="btn btn--signal">
              Start a project <Arrow />
            </Link>
            <Link href="/#process" className="btn">
              How the process works
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
