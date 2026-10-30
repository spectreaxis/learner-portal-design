import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Terrain } from '@/components/terrain'
import { Programmes } from '@/components/programmes'
import { Method } from '@/components/method'
import { Audiences } from '@/components/audiences'
import { Faq } from '@/components/faq'
import { ClosingCta } from '@/components/closing-cta'
import { SiteFooter } from '@/components/site-footer'
import { faqs } from '@/lib/faqs'
import { site } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#org`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      email: site.email,
      logo: `${site.url}/icon.svg`,
      description: site.description,
      knowsAbout: ['AI literacy', 'Workforce upskilling', 'AI adoption', 'AI strategy', 'AI governance'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'AI competency programmes',
        itemListElement: [
          'AI literacy programmes',
          'Workforce upskilling',
          'Structured AI adoption courses',
          'Strategic AI consulting',
        ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, provider: { '@id': `${site.url}/#org` } } })),
      },
    },
    { '@type': 'WebSite', '@id': `${site.url}/#site`, url: site.url, name: site.name, publisher: { '@id': `${site.url}/#org` } },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Terrain />
        <Programmes />
        <Method />
        <Audiences />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  )
}
