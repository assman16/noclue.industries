import { Assembly } from '@/components/home/Assembly'
import { Engineering } from '@/components/home/Engineering'
import { Feature } from '@/components/home/Feature'
import { Hero } from '@/components/home/Hero'
import { Invitation } from '@/components/home/Invitation'
import { SITE } from '@/content/defaults'
import { getHome, getProjects, getServices, getSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({ path: '/' })
}

/**
 * Homepage in five acts:
 *   I    Hero: the corporation (real SA-100 render)
 *   II   Engineering: four disciplines, four compositions (photography → our hardware)
 *   III  Assembly: DA-02 scroll-scrubbed exploded sequence (demonstration model)
 *   IV   Feature: SA-100 presented as a product (real project)
 *   V    Invitation: one question, one action
 * Long-form explanations live on /capabilities.
 */
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
      <Hero home={home} services={services} />
      <Engineering home={home} services={services} />
      <Assembly title={home.assemblyTitle} body={home.assemblyBody} disclaimer={home.assemblyDisclaimer} />
      <Feature projects={projects} />
      <Invitation home={home} settings={settings} />
    </>
  )
}
