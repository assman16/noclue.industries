import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import { PageHead } from '@/components/PageHead'
import { getPage } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

/** CMS text pages: /privacy, /legal and any future long-form page. */
export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return buildMetadata({ title: 'Not found', path: `/${slug}`, noindex: true })
  return buildMetadata({
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.intro,
    path: `/${page.slug}`,
    image: page.seo?.image as Media,
    noindex: page.seo?.noindex,
  })
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()
  const effective = page.effectiveDate
    ? new Date(page.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  return (
    <>
      <PageHead
        label={page.eyebrow || 'Information'}
        title={page.title}
        intro={page.intro}
        meta={effective ? <span className="tag">Effective {effective}</span> : undefined}
      />
      <div className="wrap" style={{ paddingBlock: 'clamp(48px, 7vw, 96px) clamp(96px, 12vw, 180px)' }}>
        <RichText data={page.content} className="rich" />
      </div>
    </>
  )
}
