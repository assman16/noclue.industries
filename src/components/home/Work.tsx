import Link from 'next/link'

import { RENDERS } from '@/content/renders'
import type { Project } from '@/payload-types'

import { Arrow } from '../Arrow'
import { ProjectPlate } from '../archive/ProjectPlate'
import { RenderImage } from '../RenderImage'
import { SectionHead } from '../SectionHead'
import s from './Work.module.css'

const MACROS = [
  { asset: RENDERS.sa100Detail, caption: 'ESP32-S3-WROOM-1 module, castellated pads' },
  { asset: RENDERS.sa100Soic, caption: 'SOIC rows on the input side' },
  { asset: RENDERS.sa100Terminals, caption: 'Two-pole spring terminals for field wiring' },
]

export function Work({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured)
  const shown = (featured.length ? featured : projects).slice(0, 2)
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead
          index="04"
          label="Engineering archive"
          title="Selected work."
          intro="Real boards and real design data, presented as they are. Renders are made from the actual ECAD and CAD files — not from mock-ups."
          id="work-title"
        />

        <div className={s.plates}>
          {shown.map((p, i) => (
            <div key={p.id} data-reveal>
              <ProjectPlate project={p} index={i} />
            </div>
          ))}
          {shown.length === 0 && (
            <p className="body" data-reveal>
              The archive is being prepared. In the meantime, <Link href="/contact" className="link">ask us about our work</Link>.
            </p>
          )}
        </div>

        <div className={s.macros}>
          {MACROS.map((m, i) => (
            <figure key={m.asset.name} className={s.macro} data-reveal style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}>
              <div className={s.frame}>
                <RenderImage asset={m.asset} sizes="(max-width: 900px) 100vw, 33vw" />
              </div>
              <figcaption>
                <span className="label label--signal">Fig. 0{i + 2}</span>
                <span className="label label--fg">{m.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.foot}>
          <p className="label">Renders: Blender / Cycles, from the SA-100 KiCad 3D export. Geometry unaltered.</p>
          <Link href="/archive" className="btn">
            Full archive <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}
