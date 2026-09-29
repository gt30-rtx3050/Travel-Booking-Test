import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Star, Compass, CheckCircle2, MapPin } from 'lucide-react'
import {
  getHomepage,
  getPublishedTrips,
  getPublishedPosts,
  getTestimonials,
  getSiteSettings,
  resolveMediaUrl,
} from '@/lib/payload'
import { TripCard } from '@/components/TripCard'
import { BlogCard } from '@/components/BlogCard'
import { NewsletterForm } from '@/components/NewsletterForm'
import { DynamicIcon } from '@/components/DynamicIcon'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [homepage, featuredTrips, allTrips, latestPosts, testimonials, siteSettings] =
    await Promise.all([
      getHomepage(),
      getPublishedTrips({ featured: true, limit: 6 }),
      getPublishedTrips({ limit: 6 }),
      getPublishedPosts({ limit: 3 }),
      getTestimonials(3),
      getSiteSettings(),
    ])

  const tripsToDisplay = featuredTrips.length > 0 ? featuredTrips : allTrips
  const hero = homepage?.hero
  const heroMedia = resolveMediaUrl(hero?.heroImage, '/media/dolomites-hero.svg')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: siteSettings?.siteName || 'Celeste Expeditions',
    description:
      hero?.subtitle ||
      'Architectural small-group and private expeditions across the Dolomites, Patagonia, Svalbard, Norway, Switzerland, and Iceland.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    telephone: siteSettings?.contactInfo?.phone || '+41 44 580 29 40',
    email: siteSettings?.contactInfo?.email || 'concierge@celeste-expeditions.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteSettings?.contactInfo?.address || 'Bahnhofstrasse 42, 8001 Zürich',
      addressCountry: 'CH',
    },
  }

  return (
    <div className="bg-white text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION */}
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <FadeIn className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-ocean shadow-soft">
                <Compass className="h-3.5 w-3.5 text-cyan" />
                <span>
                  {hero?.badge || '2026 / 2027 PRIVATE & SMALL-GROUP EXPEDITIONS'}
                </span>
              </div>

              <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl">
                {hero?.title ||
                  'Architectural Journeys Across High Alpine & Polar Horizons'}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-navy sm:text-lg">
                {hero?.subtitle ||
                  'We pair IFMGA-certified mountain guides and polar naturalists with private architectural refuges, expedition sailing vessels, and unhurried itineraries limited to 8–12 guests.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={hero?.primaryCtaHref || '/trips'}
                  className="inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy"
                >
                  <span>{hero?.primaryCtaLabel || 'Explore All Expeditions'}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  href={hero?.secondaryCtaHref || '/contact'}
                  className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-7 py-4 text-sm font-semibold text-navy shadow-soft transition-colors hover:bg-ice"
                >
                  <span>{hero?.secondaryCtaLabel || 'Speak With a Specialist'}</span>
                </Link>
              </div>

              {/* Trust Metrics */}
              {hero?.highlights && hero.highlights.length > 0 && (
                <div className="grid grid-cols-3 gap-6 border-t border-sky/70 pt-8">
                  {hero.highlights.map((item, idx) => (
                    <div key={idx}>
                      <p className="font-heading text-2xl font-bold text-navy sm:text-3xl">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs text-ocean">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>

            {/* Right Editorial Hero Frame */}
            <FadeIn delay={0.12} className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-sky bg-white p-3 shadow-card">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-ice">
                  <Image
                    src={heroMedia.url}
                    alt={heroMedia.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-sky bg-white/95 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs text-ocean">
                      <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 text-cyan" />
                        <span>Seasonal Dispatch</span>
                      </span>
                      <span>IFMGA & AECO Certified</span>
                    </div>
                    <p className="mt-1 font-heading text-sm font-bold text-navy">
                      {heroMedia.caption ||
                        'High-altitude limestone towers & private mountain refuges across the Dolomites and Arctic.'}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 2. FEATURED TRIPS SECTION */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="flex flex-col items-start justify-between gap-6 border-b border-sky/60 pb-8 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-ocean">
                {homepage?.featuredTripsSection?.eyebrow || 'CURATED DEPARTURES'}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                {homepage?.featuredTripsSection?.heading ||
                  'Signature Expeditions for the Coming Season'}
              </h2>
              <p className="text-base leading-relaxed text-navy">
                {homepage?.featuredTripsSection?.subheading ||
                  'Every route is scouted firsthand by our Zürich guiding team, combining high-pass trail craft with refined mountain and coastal hospitality.'}
              </p>
            </div>

            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-full border border-sky bg-ice/60 px-5 py-2.5 text-xs font-semibold text-navy transition-colors hover:bg-ocean hover:text-white"
            >
              <span>View All {allTrips.length} Expeditions</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tripsToDisplay.map((trip, idx) => (
              <FadeIn key={trip.id} delay={idx * 0.06}>
                <TripCard trip={trip} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY US SECTION */}
      <section className="border-y border-sky/60 bg-ice/40 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mx-auto max-w-3xl text-center space-y-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-ocean">
              {homepage?.whyUsSection?.eyebrow || 'THE CELESTE STANDARD'}
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {homepage?.whyUsSection?.heading ||
                'Engineered for Depth, Calm, and Uncompromising Field Craft'}
            </h2>
            <p className="text-base leading-relaxed text-navy">
              {homepage?.whyUsSection?.subheading ||
                'We reject rushed sightseeing in favor of architectural shelters, low guest-to-guide ratios, and genuine access to remote alpine and polar ecosystems.'}
            </p>
          </FadeIn>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(homepage?.whyUsSection?.pillars || []).map((pillar, idx) => (
              <FadeIn
                key={idx}
                delay={idx * 0.07}
                className="flex flex-col justify-between rounded-2xl border border-sky/80 bg-white p-6 shadow-soft"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky bg-ice text-ocean">
                      <DynamicIcon name={pillar.icon} className="h-5 w-5 text-ocean" />
                    </div>
                    {pillar.metric && (
                      <span className="rounded-full border border-sky bg-ice/70 px-3 py-1 text-xs font-semibold text-ocean">
                        {pillar.metric}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-navy">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-navy">{pillar.description}</p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 border-t border-sky/50 pt-4 text-xs font-medium text-ocean">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan" />
                  <span>Verified Field Protocol</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="mx-auto max-w-3xl text-center space-y-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-ocean">
              {homepage?.testimonialsSection?.eyebrow || 'FIELD PERSPECTIVES'}
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {homepage?.testimonialsSection?.heading || 'Reflections from Our Guests'}
            </h2>
            <p className="text-base leading-relaxed text-navy">
              {homepage?.testimonialsSection?.subheading ||
                'Firsthand accounts from travelers who have crossed high passes, fjords, and glaciers with our guiding collective.'}
            </p>
          </FadeIn>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((item, idx) => {
              const tripObj =
                typeof item.trip === 'object' && item.trip !== null ? item.trip : null
              return (
                <FadeIn
                  key={item.id}
                  delay={idx * 0.08}
                  className="flex flex-col justify-between rounded-2xl border border-sky/80 bg-ice/25 p-7 shadow-soft"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-ocean">
                      {Array.from({ length: item.rating || 5 }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className="h-4 w-4 fill-cyan text-cyan"
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-navy">
                      “{item.quote}”
                    </blockquote>
                  </div>

                  <div className="mt-6 border-t border-sky/60 pt-4">
                    <p className="font-heading text-base font-bold text-navy">
                      {item.guestName}
                    </p>
                    <p className="text-xs text-ocean">{item.guestLocation}</p>
                    {tripObj && (
                      <Link
                        href={`/trips/${tripObj.slug}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:text-navy"
                      >
                        <span>Expedition: {tripObj.title}</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. LATEST BLOGS SECTION */}
      <section className="border-t border-sky/60 bg-ice/25 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="flex flex-col items-start justify-between gap-6 border-b border-sky/60 pb-8 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-ocean">
                {homepage?.latestBlogsSection?.eyebrow || 'THE EXPEDITION JOURNAL'}
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                {homepage?.latestBlogsSection?.heading ||
                  'Field Dispatches, Route Notes & Equipment Essays'}
              </h2>
              <p className="text-base leading-relaxed text-navy">
                {homepage?.latestBlogsSection?.subheading ||
                  'Long-form essays and technical preparation guides authored by our mountain guides, glaciologists, and expedition photographers.'}
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-5 py-2.5 text-xs font-semibold text-navy transition-colors hover:bg-ocean hover:text-white"
            >
              <span>Read All Journal Dispatches</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {latestPosts.map((post, idx) => (
              <FadeIn key={post.id} delay={idx * 0.07}>
                <BlogCard post={post} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER DISPATCH SECTION */}
      <section className="border-t border-sky/60 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn className="rounded-2xl border border-sky bg-ice/50 p-8 shadow-soft sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <span className="text-xs font-semibold tracking-widest uppercase text-ocean">
                  {homepage?.newsletterSection?.eyebrow || 'PRIVATE DISPATCHES'}
                </span>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                  {homepage?.newsletterSection?.heading ||
                    'Receive Seasonal Route Releases & Polar Ice Briefings'}
                </h2>
                <p className="text-sm leading-relaxed text-navy sm:text-base">
                  {homepage?.newsletterSection?.subheading ||
                    'Subscribers receive priority 48-hour access to newly released 10-guest departures in the Dolomites, Svalbard, and Patagonia before public listing.'}
                </p>
              </div>

              <div className="lg:col-span-5">
                <NewsletterForm
                  buttonLabel={
                    homepage?.newsletterSection?.buttonLabel || 'Subscribe to Dispatches'
                  }
                  disclaimer={
                    homepage?.newsletterSection?.disclaimer ||
                    'Issued quarterly from Zürich. Zero promotional clutter; unsubscribe in one click.'
                  }
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
