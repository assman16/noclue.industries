import Link from 'next/link'

import { PHOTOS } from '@/content/photography'
import { RENDERS } from '@/content/renders'
import type { HomeContent, ServiceView } from '@/lib/data'

import { Arrow } from '../Arrow'
import { Prov } from '../Prov'
import { RenderImage } from '../RenderImage'
import s from './Engineering.module.css'

type Props = { home: HomeContent; services: ServiceView[] }

const svcBy = (services: ServiceView[], slug: string) => services.find((x) => x.slug === slug)

function Kicker({ n, svc }: { n: number; svc: ServiceView }) {
  return (
    <p className={`label ${s.kicker}`}>
      <span className="label--signal">
        {String(n).padStart(2, '0')} / {svc.code}
      </span>
      <span>{svc.title}</span>
    </p>
  )
}

/**
 * ACT II: the engineering. Four disciplines, four different compositions.
 * Licensed photographs set the scene (labelled "Illustrative photography");
 * our own renders follow them and carry the "NoClue hardware" label.
 */
export function Engineering({ home, services }: Props) {
  const el = svcBy(services, 'electronics')
  const fw = svcBy(services, 'firmware')
  const me = svcBy(services, 'mechanical')
  const pr = svcBy(services, 'prototyping')
  const inHouse = pr?.capabilities.filter((c) => c.delivery !== 'partner').slice(0, 6) ?? []
  const partners = services.flatMap((x) => x.capabilities.filter((c) => c.delivery === 'partner'))

  return (
    <div className={s.act} id="engineering">
      {/* ------------------------------------------------------------ intro */}
      <header className={`wrap ${s.intro}`}>
        <p className="label">
          <span className="label--signal">§ 02</span> — The engineering
        </p>
        <h2 className={`display ${s.introTitle}`} data-reveal="mask">
          <span>{home.disciplinesTitle}</span>
        </h2>
        <p className={s.introLine} data-reveal>
          {home.disciplinesIntro}
        </p>
      </header>

      {/* ------------------------------------------------------------ 01 electronics */}
      {el && (
        <section id={el.slug} className={s.el} aria-labelledby="el-title">
          <div className={s.elPhoto}>
            <RenderImage asset={PHOTOS.pcbPads} sizes="100vw" className={s.fill} />
          </div>
          <div className={`wrap ${s.elHead}`}>
            <Kicker n={1} svc={el} />
            <h3 id="el-title" className={s.elHeadline} data-reveal>
              {el.headline}
            </h3>
            <Link href={`/capabilities#${el.slug}`} className={s.more}>
              Electronics in detail <Arrow />
            </Link>
          </div>
          <p className={`display ${s.giant}`} aria-hidden="true">
            Circuits
          </p>
          <Prov kind="illustrative" photo={PHOTOS.pcbPads} className={s.provCorner} />
        </section>
      )}

      {/* the cut: from someone's board to ours */}
      <section className={`wrap ${s.ours}`} aria-labelledby="ours-title">
        <figure className={s.oursImg} data-reveal>
          <RenderImage asset={RENDERS.sa100Mark} sizes="(max-width: 900px) 100vw, 64vw" />
        </figure>
        <div className={s.oursText}>
          <p className="label label--signal">And this one is ours</p>
          <h3 id="ours-title" className={s.oursTitle}>
            SA-100
            <br />
            <span>rev 3.0</span>
          </h3>
          <p className={s.oursBody}>Black mask, white silkscreen, ESP32-S3 and cellular, laid out in KiCad and rendered from its design data.</p>
          <Prov kind="real" />
        </div>
      </section>

      {/* ------------------------------------------------------------ 02 firmware */}
      {fw && (
        <section id={fw.slug} className={s.fw} aria-labelledby="fw-title">
          <div className={`wrap ${s.fwGrid}`}>
            <div className={s.fwText}>
              <Kicker n={2} svc={fw} />
              <h3 id="fw-title" className={`display ${s.fwTitle}`} data-reveal>
                Code that knows the pinout.
              </h3>
              <p className={s.fwSub}>{fw.headline}</p>
              <ul className={s.chips}>
                {fw.capabilities.slice(0, 5).map((c) => (
                  <li key={c.label}>{c.label}</li>
                ))}
              </ul>
            </div>
            <figure className={s.fwPhoto} data-reveal>
              <RenderImage asset={PHOTOS.pcbCrystal} sizes="(max-width: 900px) 100vw, 50vw" className={s.fill} />
              <figcaption>
                <Prov kind="illustrative" photo={PHOTOS.pcbCrystal} />
              </figcaption>
            </figure>
            <figure className={s.fwInset} data-reveal style={{ '--reveal-delay': '0.15s' } as React.CSSProperties}>
              <RenderImage asset={RENDERS.sa100Corner} sizes="(max-width: 900px) 80vw, 30vw" />
              <figcaption>
                <span className="label label--fg">ESP32-S3 on the SA-100: the chip our firmware is written for</span>
                <Prov kind="real" />
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ 03 mechanical */}
      {me && (
        <section id={me.slug} className={s.me} aria-labelledby="me-title">
          <div className={s.meBand}>
            <RenderImage asset={PHOTOS.gearbox} sizes="100vw" className={s.fill} />
            <div className={`wrap ${s.meHead}`}>
              <Kicker n={3} svc={me} />
              <h3 id="me-title" className={s.meHeadline} data-reveal>
                {me.headline}
              </h3>
            </div>
            <p className={`display ${s.meGiant}`} aria-hidden="true">
              Metal
            </p>
            <Prov kind="illustrative" photo={PHOTOS.gearbox} className={s.provCorner} />
          </div>
          <div className={`wrap ${s.diptych}`}>
            <figure className={s.dWide} data-reveal>
              <RenderImage asset={PHOTOS.endmill} sizes="(max-width: 900px) 100vw, 60vw" className={s.fill} />
              <figcaption>
                <Prov kind="illustrative" photo={PHOTOS.endmill} />
              </figcaption>
            </figure>
            <div className={s.dText}>
              <p className={s.dStatement} data-reveal>
                Designed for the process that will make it, and for the board it has to hold.
              </p>
              <Link href={`/capabilities#${me.slug}`} className={s.more}>
                Mechanical in detail <Arrow />
              </Link>
            </div>
            <figure className={s.dTall} data-reveal style={{ '--reveal-delay': '0.12s' } as React.CSSProperties}>
              <RenderImage asset={PHOTOS.facemill} sizes="(max-width: 900px) 60vw, 28vw" className={s.fill} />
              <figcaption>
                <Prov kind="illustrative" photo={PHOTOS.facemill} />
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ 04 prototyping: the orange field */}
      {pr && (
        <section id={pr.slug} className={`on-signal ${s.pr}`} aria-labelledby="pr-title">
          <div className={`wrap ${s.prGrid}`}>
            <div className={s.prText}>
              <Kicker n={4} svc={pr} />
              <h3 id="pr-title" className={`display ${s.prTitle}`} data-reveal="mask">
                <span>
                  From file
                  <br />
                  to part.
                </span>
              </h3>
              <div className={s.split}>
                <div>
                  <p className="label">We deliver</p>
                  <ul>
                    {inHouse.map((c) => (
                      <li key={c.label}>{c.label}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label">Made by manufacturing partners</p>
                  <ul>
                    {partners.map((c) => (
                      <li key={c.label}>{c.label}</li>
                    ))}
                  </ul>
                  <p className={s.splitNote}>We prepare the data, choose suitable partners with you and coordinate the work.</p>
                </div>
              </div>
            </div>
            <figure className={s.prImg} data-reveal>
              <RenderImage asset={PHOTOS.sparks} sizes="(max-width: 900px) 100vw, 50vw" className={s.fill} />
              <figcaption>
                <Prov kind="illustrative" photo={PHOTOS.sparks} />
              </figcaption>
            </figure>
          </div>
        </section>
      )}
    </div>
  )
}
