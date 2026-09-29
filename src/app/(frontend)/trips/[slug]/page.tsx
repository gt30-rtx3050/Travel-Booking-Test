import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Clock,
  Mountain,
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Compass,
  Home,
  Activity,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react'
import {
  getPublishedTrips,
  getTripBySlug,
  resolveMediaUrl,
  formatCurrency,
} from '@/lib/payload'
import type { Trip } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { DynamicIcon } from '@/components/DynamicIcon'
import { TripCard } from '@/components/TripCard'
import {
  BookingAvailabilitySection,
  CollapsibleEssentialInfo,
  FaqAccordion,
  ExpeditionMapSection,
  StickyBookNowBar,
} from '@/components/SingleTripInteractive'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

interface SingleTripPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const trips = await getPublishedTrips()
    return trips.map((trip) => ({ slug: trip.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: SingleTripPageProps): Promise<Metadata> {
  const { slug } = await params
  const trip = await getTripBySlug(slug)

  if (!trip) {
    return {
      title: 'Expedition Not Found',
    }
  }

  const ogMedia = resolveMediaUrl(trip.seo?.ogImage || trip.heroImage)
  const title = trip.seo?.metaTitle || `${trip.title} — ${trip.destination}`
  const description = trip.seo?.metaDescription || trip.shortDescription

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: ogMedia.url, alt: ogMedia.alt }],
    },
  }
}

export default async function SingleTripPage({ params }: SingleTripPageProps) {
  const { slug } = await params
  const trip = await getTripBySlug(slug)

  if (!trip) {
    notFound()
  }

  const heroMedia = resolveMediaUrl(trip.heroImage)
  const fromPrice = trip.pricing?.fromPrice ?? 0
  const currency = trip.pricing?.currency ?? 'USD'
  const nextDeparture =
    trip.availability?.find((a) => a.spotsLeft > 0) || trip.availability?.[0]

  // Populate related trips (or fallback to other published trips if empty)
  let relatedTrips: Trip[] = (trip.relatedTrips || [])
    .map((r) => (typeof r === 'object' && r !== null ? (r as Trip) : null))
    .filter((r): r is Trip => Boolean(r && r.status === 'published'))

  if (relatedTrips.length === 0) {
    const allPublished = await getPublishedTrips({ limit: 4 })
    relatedTrips = allPublished.filter((t) => t.id !== trip.id).slice(0, 3)
  }

  const essentialInfoItems = (trip.essentialInfo || []).map((sec, idx) => ({
    id: sec.id || `essential-${idx}`,
    title: sec.title,
    renderedContent: <RichText content={sec.content} compact />,
  }))

  const faqItems = (trip.faqs || []).map((faq, idx) => ({
    id: faq.id || `faq-${idx}`,
    question: faq.question,
    renderedAnswer: <RichText content={faq.answer} compact />,
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trip.title,
    description: trip.shortDescription,
    touristType: ['Adventure Tourism', 'Luxury Alpine & Polar Expedition'],
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: trip.itinerary?.length || 0,
      itemListElement: (trip.itinerary || []).map((day) => ({
        '@type': 'ListItem',
        position: day.dayNumber,
        item: {
          '@type': 'TouristAttraction',
          name: `Day ${day.dayNumber}: ${day.title}`,
          description: `${day.activity} · ${day.trekDuration} · Max Altitude ${day.altitude}`,
        },
      })),
    },
    offers: {
      '@type': 'Offer',
      price: fromPrice,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/trips/${trip.slug}`,
    },
  }

  return (
    <div className="bg-white text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION (large image/video, title, key facts: duration, difficulty, price from, next departure, max group size) */}
      <section className="border-b border-sky/60 bg-ice/35 py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ocean transition-colors hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Expeditions</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold text-ocean">
              <MapPin className="h-3.5 w-3.5 text-cyan" />
              <span>{trip.destination}</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              {trip.title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-navy sm:text-lg">
              {trip.shortDescription}
            </p>
          </div>

          {/* Large Hero Image or Video */}
          <div className="overflow-hidden rounded-2xl border border-sky bg-white p-2.5 shadow-card">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-ice lg:aspect-[21/9]">
              {trip.heroVideo ? (
                <video
                  src={trip.heroVideo}
                  poster={heroMedia.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={heroMedia.url}
                  alt={heroMedia.alt}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Key Facts Strip: Duration, Difficulty, Price From, Next Departure, Max Group Size */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-sky bg-white p-6 shadow-soft sm:grid-cols-3 lg:grid-cols-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-ocean">
                <Clock className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Duration
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {trip.duration} Days
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-ocean">
                <Mountain className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Difficulty
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {trip.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-ocean">
                <Compass className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Price From
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {formatCurrency(fromPrice, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-ocean">
                <Calendar className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Next Departure
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {nextDeparture ? nextDeparture.date : 'Custom Dates'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 col-span-2 sm:col-span-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ice text-ocean">
                <Users className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Max Group Size
                </span>
                <span className="font-heading text-lg font-bold text-navy">
                  {trip.maxGroupSize} Guests
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW SECTION (rich text) */}
      <section className="border-b border-sky/60 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn className="space-y-6">
            <span className="inline-block rounded-full border border-sky bg-ice px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
              01 · Expedition Dossier & Overview
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              The Architecture of the Journey
            </h2>
            <RichText content={trip.overview} />
          </FadeIn>
        </div>
      </section>

      {/* 3. HIGHLIGHTS SECTION (array of icon + title + short description) */}
      <section className="border-b border-sky/60 bg-ice/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              02 · Signature Moments
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Expedition Highlights
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(trip.highlights || []).map((hl, idx) => (
              <FadeIn
                key={hl.id || idx}
                delay={idx * 0.06}
                className="rounded-2xl border border-sky/80 bg-white p-6 shadow-soft space-y-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky bg-ice text-ocean">
                  <DynamicIcon name={hl.icon} className="h-5 w-5 text-ocean" />
                </div>
                <h3 className="font-heading text-lg font-bold text-navy">{hl.title}</h3>
                <p className="text-sm leading-relaxed text-navy">{hl.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BOOKING CALENDAR / AVAILABILITY SECTION */}
      <section className="border-b border-sky/60 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-8">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              03 · Scheduled Departures & Reservations
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Booking Calendar & Live Availability
            </h2>
            <p className="text-sm leading-relaxed text-navy sm:text-base">
              Select any available departure window below to populate your reservation inquiry with live spots remaining and tariff details.
            </p>
          </FadeIn>

          <BookingAvailabilitySection
            tripId={String(trip.id)}
            tripTitle={trip.title}
            basePrice={fromPrice}
            currency={currency}
            maxGroupSize={trip.maxGroupSize}
            availability={trip.availability || []}
          />
        </div>
      </section>

      {/* 5. ITINERARY SECTION (day-by-day with exact required fields) */}
      <section className="border-b border-sky/60 bg-ice/25 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              04 · Stage-by-Stage Progression
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Day-by-Day Expedition Itinerary
            </h2>
            <p className="text-sm leading-relaxed text-navy sm:text-base">
              Complete daily telemetry including trekking duration, nocturnal refuge, maximum elevation, primary field activity, and stage narrative.
            </p>
          </FadeIn>

          <div className="space-y-8">
            {(trip.itinerary || []).map((day, idx) => {
              const dayImage = resolveMediaUrl(day.image)
              return (
                <FadeIn
                  key={day.id || idx}
                  delay={idx * 0.04}
                  className="overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Day Photograph */}
                    <div className="relative min-h-[260px] bg-ice lg:col-span-5">
                      <Image
                        src={dayImage.url}
                        alt={dayImage.alt || `Day ${day.dayNumber}: ${day.title}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center rounded-full border border-sky bg-white/95 px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-navy shadow-soft">
                          Day {String(day.dayNumber).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Day Content & Telemetry */}
                    <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7 space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-heading text-2xl font-bold text-navy">
                          Day {day.dayNumber}: {day.title}
                        </h3>

                        {/* 4 Required Telemetry Fields: trekDuration, accommodation, altitude, activity */}
                        <div className="grid grid-cols-2 gap-3 rounded-xl border border-sky/70 bg-ice/40 p-4 sm:grid-cols-4">
                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ocean">
                              <Clock className="h-3 w-3 text-cyan" />
                              <span>Trek Duration</span>
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-navy">
                              {day.trekDuration}
                            </span>
                          </div>

                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ocean">
                              <Home className="h-3 w-3 text-cyan" />
                              <span>Accommodation</span>
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-navy">
                              {day.accommodation}
                            </span>
                          </div>

                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ocean">
                              <TrendingUp className="h-3 w-3 text-cyan" />
                              <span>Altitude</span>
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-navy">
                              {day.altitude}
                            </span>
                          </div>

                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ocean">
                              <Activity className="h-3 w-3 text-cyan" />
                              <span>Activity</span>
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-navy">
                              {day.activity}
                            </span>
                          </div>
                        </div>

                        {/* Rich Text Description */}
                        <RichText content={day.description} compact />
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. INCLUDES / EXCLUDES SECTION (two columns) */}
      <section className="border-b border-sky/60 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              05 · Tariff Transparency
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              What Is Included & Excluded
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Includes Column */}
            <FadeIn className="rounded-2xl border border-sky bg-ice/35 p-6 sm:p-8 shadow-soft space-y-5">
              <div className="flex items-center gap-3 border-b border-sky/70 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ocean">
                  <CheckCircle2 className="h-5 w-5 text-ocean" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy">
                  Included in Your Expedition Tariff
                </h3>
              </div>

              <ul className="space-y-3">
                {(trip.includes || []).map((inc, idx) => (
                  <li key={inc.id || idx} className="flex items-start gap-3 text-sm text-navy">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                    <span>{inc.item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            {/* Excludes Column */}
            <FadeIn
              delay={0.08}
              className="rounded-2xl border border-sky/80 bg-white p-6 sm:p-8 shadow-soft space-y-5"
            >
              <div className="flex items-center gap-3 border-b border-sky/70 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ice text-ocean">
                  <XCircle className="h-5 w-5 text-ocean" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy">
                  Not Included in Tariff
                </h3>
              </div>

              <ul className="space-y-3">
                {(trip.excludes || []).map((exc, idx) => (
                  <li key={exc.id || idx} className="flex items-start gap-3 text-sm text-navy">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span>{exc.item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 7. ESSENTIAL INFO SECTION (collapsible sections) */}
      <section className="border-b border-sky/60 bg-ice/25 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          <FadeIn className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              06 · Preparation & Field Logistics
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Essential Expedition Information
            </h2>
            <p className="text-sm text-navy">
              Review our mandatory equipment protocols, physical conditioning benchmarks, and arrival logistics.
            </p>
          </FadeIn>

          <CollapsibleEssentialInfo items={essentialInfoItems} />
        </div>
      </section>

      {/* 8. FAQS SECTION (accordion) */}
      <section className="border-b border-sky/60 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          <FadeIn className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              07 · Common Questions
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </FadeIn>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* 9. MAP SECTION (coordinates + markers + route description) */}
      <section className="border-b border-sky/60 bg-ice/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-8">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              08 · Cartography & Waypoints
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Expedition Route Map & Telemetry
            </h2>
          </FadeIn>

          <ExpeditionMapSection
            tripTitle={trip.title}
            destination={trip.destination}
            latitude={trip.map?.latitude ?? 46.5405}
            longitude={trip.map?.longitude ?? 12.1357}
            zoom={trip.map?.zoom ?? 9}
            routeDescription={
              trip.map?.routeDescription ||
              'High-altitude traverse linking remote mountain passes and private refuges.'
            }
            markers={trip.map?.markers || []}
          />
        </div>
      </section>

      {/* 10. RELATED TRIPS SECTION */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-10">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
                09 · Further Horizons
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Related Expeditions
              </h2>
            </div>

            <Link
              href="/trips"
              className="text-xs font-semibold uppercase tracking-wider text-ocean hover:text-navy"
            >
              View Full Portfolio →
            </Link>
          </FadeIn>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {relatedTrips.slice(0, 3).map((relTrip, idx) => (
              <FadeIn key={relTrip.id} delay={idx * 0.06}>
                <TripCard trip={relTrip} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 11. STICKY "BOOK NOW" CTA */}
      <StickyBookNowBar
        tripTitle={trip.title}
        duration={trip.duration}
        difficulty={trip.difficulty}
        fromPrice={fromPrice}
        currency={currency}
        nextDepartureDate={nextDeparture?.date}
      />
    </div>
  )
}
