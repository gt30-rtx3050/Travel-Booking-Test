import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Users, Mountain, ArrowUpRight, Calendar } from 'lucide-react'
import type { Trip } from '@/payload-types'
import { resolveMediaUrl, formatCurrency } from '@/lib/payload'

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const hero = resolveMediaUrl(trip.heroImage)
  const price = trip.pricing?.fromPrice ?? 0
  const currency = trip.pricing?.currency ?? 'USD'
  const nextDeparture = trip.availability?.find((a) => a.spotsLeft > 0) || trip.availability?.[0]

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      {/* Image Header */}
      <Link href={`/trips/${trip.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-ice">
        <Image
          src={hero.url}
          alt={hero.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky bg-white/95 px-3 py-1 text-xs font-medium text-navy backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-cyan" />
            <span>{trip.destination}</span>
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full border border-sky bg-ice/95 px-3 py-1 text-xs font-semibold text-ocean backdrop-blur-sm">
            {trip.difficulty}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-3">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-ocean">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan" />
              <span>{trip.duration} Days</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan" />
              <span>Max {trip.maxGroupSize} Guests</span>
            </span>
            {nextDeparture && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan" />
                <span>Next: {nextDeparture.date}</span>
              </span>
            )}
          </div>

          <h3 className="font-heading text-xl font-bold tracking-tight text-navy transition-colors group-hover:text-ocean">
            <Link href={`/trips/${trip.slug}`}>{trip.title}</Link>
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-navy">
            {trip.shortDescription}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-sky/60 pt-4">
          <div>
            <span className="block text-[11px] tracking-wider uppercase text-ocean">
              Expedition Tariff From
            </span>
            <span className="font-heading text-xl font-bold text-navy">
              {formatCurrency(price, currency)}
            </span>
            <span className="ml-1 text-xs text-ocean">/ guest</span>
          </div>

          <Link
            href={`/trips/${trip.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-sky bg-ice/70 px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-ocean hover:text-white"
          >
            <span>Explore Route</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
