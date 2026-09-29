import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, ArrowUpRight } from 'lucide-react'
import { getPublishedTrips } from '@/lib/payload'
import { TripCard } from '@/components/TripCard'
import { TripsFilterBar } from '@/components/TripsFilterBar'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Expeditions & High-Latitude Routes',
  description:
    'Explore small-group and private alpine, fjord, and polar expeditions across the Dolomites, Patagonia, Svalbard, Norway, Switzerland, and Iceland.',
}

interface TripsPageProps {
  searchParams: Promise<{
    destination?: string
    difficulty?: string
    duration?: string
    maxPrice?: string
  }>
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const resolvedParams = await searchParams
  const destination = resolvedParams.destination || 'all'
  const difficulty = resolvedParams.difficulty || 'all'
  const duration = resolvedParams.duration || 'all'
  const maxPriceStr = resolvedParams.maxPrice || 'all'
  const maxPrice =
    maxPriceStr !== 'all' && !Number.isNaN(Number(maxPriceStr))
      ? Number(maxPriceStr)
      : undefined

  const [allPublishedTrips, filteredTrips] = await Promise.all([
    getPublishedTrips(),
    getPublishedTrips({
      destination,
      difficulty,
      duration,
      maxPrice,
    }),
  ])

  const uniqueDestinations = Array.from(
    new Set(allPublishedTrips.map((t) => t.destination).filter(Boolean)),
  ).sort()

  return (
    <div className="bg-white text-navy">
      {/* Page Hero Header */}
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold tracking-widest uppercase text-ocean">
              <Compass className="h-3.5 w-3.5 text-cyan" />
              <span>2026 / 2027 Expedition Portfolio</span>
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Curated Mountain, Fjord & Polar Expeditions
            </h1>
            <p className="text-base leading-relaxed text-navy sm:text-lg">
              Each journey is limited to 8–12 guests and led by IFMGA-certified alpine guides or polar naturalists, staying in architectural mountain refuges and boutique coastal lodges.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filter Bar + Listing */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <Suspense fallback={<div className="h-36 rounded-2xl border border-sky/60 bg-ice/20" />}>
            <TripsFilterBar
              destinations={uniqueDestinations}
              currentDestination={destination}
              currentDifficulty={difficulty}
              currentDuration={duration}
              currentMaxPrice={maxPriceStr}
              totalResults={filteredTrips.length}
            />
          </Suspense>

          {filteredTrips.length === 0 ? (
            <div className="rounded-2xl border border-sky bg-ice/30 p-12 text-center space-y-4">
              <h2 className="font-heading text-2xl font-bold text-navy">
                No Expeditions Match Your Current Filter Selection
              </h2>
              <p className="mx-auto max-w-lg text-sm text-navy">
                Try broadening your destination, duration, or tariff criteria, or reach out to our Zürich concierge desk to commission a private charter itinerary.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-navy"
                >
                  <span>View All Expeditions</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-6 py-3 text-xs font-semibold text-navy transition-colors hover:bg-ice"
                >
                  <span>Request Private Charter</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip, idx) => (
                <FadeIn key={trip.id} delay={idx * 0.05}>
                  <TripCard trip={trip} />
                </FadeIn>
              ))}
            </div>
          )}

          {/* Bespoke Charter Banner */}
          <div className="rounded-2xl border border-sky bg-ice/45 p-8 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
                  Private & Custom Dates
                </span>
                <h3 className="font-heading text-2xl font-bold text-navy">
                  Commission a Private Departure for Your Group
                </h3>
                <p className="text-sm leading-relaxed text-navy">
                  Every published route can be reserved exclusively for private families, alpine clubs, or executive retreats with custom dates and helicopter/vessel transfers.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ocean px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy"
              >
                <span>Speak With a Route Planner</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
