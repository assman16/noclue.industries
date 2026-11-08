import { PageHead } from '@/components/PageHead'
import { RenderImage } from '@/components/RenderImage'
import { PHOTOS, PHOTO_LICENSE } from '@/content/photography'
import { buildMetadata } from '@/lib/seo'

import s from './credits.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Image credits',
    description: 'Credits and licences for the illustrative photography, renders and typefaces used on the NoClue Industries website.',
    path: '/credits',
  })
}

export default function CreditsPage() {
  const photos = Object.values(PHOTOS)
  return (
    <>
      <PageHead
        label="Image credits"
        title="Who made what."
        intro="Every image on this site is labelled with what it is. This page lists the photographers whose work we use and the licence it is used under."
      />
      <div className={`wrap ${s.body}`}>
        <section className={s.kinds} aria-label="Image labels">
          <div>
            <span className="prov prov--real">NoClue hardware</span>
            <p>Renders computer-generated in Blender from the real design data (KiCad / CAD) of our own projects. Geometry unaltered.</p>
          </div>
          <div>
            <span className="prov prov--demo">Demonstration model</span>
            <p>The DA-02 actuator: a concept assembly modelled in-house to show how we design and present mechanical work. Not a product.</p>
          </div>
          <div>
            <span className="prov prov--illustrative">Illustrative photography</span>
            <p>
              Licensed photographs by the photographers below. They show the kind of work a discipline involves, not our premises, machines,
              clients or projects. Colour-graded for this site.
            </p>
          </div>
        </section>

        <section aria-labelledby="photos-title">
          <h2 id="photos-title" className="label">
            Illustrative photography · {PHOTO_LICENSE.name}
          </h2>
          <ul className={s.grid}>
            {photos.map((p) => (
              <li key={p.name}>
                <div className={s.thumb}>
                  <RenderImage asset={p} sizes="(max-width: 700px) 50vw, 20vw" alt="" />
                </div>
                <p className={s.subject}>{p.subject}</p>
                <p className="label label--fg">
                  Photo:{' '}
                  <a className="link" href={p.credit.url} rel="noopener">
                    {p.credit.name}
                  </a>{' '}
                  ·{' '}
                  <a className="link" href={p.source} rel="noopener">
                    Unsplash
                  </a>
                </p>
              </li>
            ))}
          </ul>
          <p className={s.note}>
            Used under the{' '}
            <a className="link" href={PHOTO_LICENSE.url} rel="noopener">
              {PHOTO_LICENSE.name}
            </a>
            , which permits commercial use and modification without attribution. We credit the photographers anyway. Licences last checked{' '}
            {PHOTO_LICENSE.checked}.
          </p>
        </section>

        <section aria-labelledby="type-title" className={s.type}>
          <h2 id="type-title" className="label">
            Typefaces
          </h2>
          <p>
            Saira by Omnibus-Type and JetBrains Mono by JetBrains, both under the SIL Open Font License 1.1 and served from this domain.
          </p>
        </section>
      </div>
    </>
  )
}
