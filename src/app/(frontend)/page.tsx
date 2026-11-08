import { ContactBlock } from '@/components/contact/ContactBlock'
import { Assembly } from '@/components/home/Assembly'
import { Disciplines } from '@/components/home/Disciplines'
import { Hero } from '@/components/home/Hero'
import { Process } from '@/components/home/Process'
import { Why } from '@/components/home/Why'
import { Work } from '@/components/home/Work'
import { SITE } from '@/content/defaults'
import { getHome, getProjects, getServices, getSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({ path: '/' })
}

export default async function HomePage() {
  const [home, services, projects, settings] = await Promise.all([getHome(), getServices(), getProjects(), getSettings()])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NoClue Industries',
    url: SITE.url,
    logo: `${SITE.url}/brand/logo-640.png`,
    email: settings.contactEmail,
    telephone: settings.phone || undefined,
    parentOrganization: { '@type': 'Organization', name: settings.operatorName },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.operatorAddress.split('\n')[0],
      addressLocality: 'Veľký Biel',
      postalCode: '900 24',
      addressCountry: 'SK',
    },
    sameAs: settings.links.map((l) => l.url),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Hero home={home} />
      <Disciplines home={home} services={services} />
      <Process home={home} />
      <Assembly title={home.assemblyTitle} body={home.assemblyBody} disclaimer={home.assemblyDisclaimer} />
      <Work projects={projects} />
      <Why home={home} />
      <section id="contact" className="section" aria-label="Start a project">
        <div className="wrap">
          <ContactBlock title={home.contactTitle} intro={home.contactIntro} settings={settings} />
        </div>
      </section>
    </>
  )
}
