import { ContactBlock } from '@/components/contact/ContactBlock'
import { getHome, getSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    title: 'Start a project',
    description: 'Describe the hardware you want to build or fix — electronics, firmware, enclosure or the complete device. We reply with questions and a proposed approach.',
    path: '/contact',
  })
}

export default async function ContactPage() {
  const [home, settings] = await Promise.all([getHome(), getSettings()])
  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + clamp(48px, 8vw, 120px))' }}>
      <div className="wrap">
        <ContactBlock title={home.contactTitle} intro={home.contactIntro} settings={settings} index="00" headingLevel="h1" />
      </div>
    </section>
  )
}
