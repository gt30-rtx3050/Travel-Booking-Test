import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Compass, Phone, Mail } from 'lucide-react'
import { getSiteSettings, getPublishedTrips } from '@/lib/payload'
import { TripCard } from '@/components/TripCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dossier Received — Thank You',
  description: 'Your expedition inquiry has been recorded by our Zürich concierge desk.',
}

interface ThankYouPageProps {
  searchParams: Promise<{
    type?: string
    ref?: string
    name?: string
    trip?: string
    date?: string
    subject?: string
  }>
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams
  const [siteSettings, featuredTrips] = await Promise.all([
    getSiteSettings(),
    getPublishedTrips({ featured: true, limit: 3 }),
  ])

  const isBooking = params.type === 'booking'
  const referenceCode = params.ref || 'CEL-2026'
  const guestName = params.name || 'Valued Guest'
  const tripTitle = params.trip || 'Selected Expedition'
  const preferredDate = params.date || 'Upcoming Season'
  const subject = params.subject || 'Private Expedition Consultation'
  const contact = siteSettings?.contactInfo

  return (
    <div className="bg-white text-navy">
      <section className="border-b border-sky/60 bg-ice/35 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-sky bg-white p-8 shadow-card sm:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ice text-ocean">
                <CheckCircle2 className="h-6 w-6 text-ocean" />
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-widest text-ocean">
                  Dossier Reference #{referenceCode}
                </span>
                <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
                  {isBooking
                    ? 'Your Expedition Reservation Inquiry Has Been Logged'
                    : 'Your Concierge Message Has Been Received'}
                </h1>
              </div>
            </div>

            <p className="text-base leading-relaxed text-navy">
              Thank you, <strong className="font-semibold">{guestName}</strong>. Your submission has been saved directly to the Celeste Expeditions CMS and routed to our senior planning desk in Zürich. A confirmation summary has also been dispatched to your email address.
            </p>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-sky/80 bg-ice/40 p-6 sm:grid-cols-3">
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  {isBooking ? 'Expedition Route' : 'Subject'}
                </span>
                <span className="mt-1 block font-heading text-base font-bold text-navy">
                  {isBooking ? tripTitle : subject}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  {isBooking ? 'Preferred Departure' : 'Assigned Desk'}
                </span>
                <span className="mt-1 block font-heading text-base font-bold text-navy">
                  {isBooking ? preferredDate : 'Zürich Private Concierge'}
                </span>
              </div>

              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ocean">
                  Response Window
                </span>
                <span className="mt-1 block font-heading text-base font-bold text-navy">
                  Within 24 Hours
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sky/60 pt-6">
              <div className="flex flex-wrap items-center gap-6 text-xs text-ocean">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-cyan" />
                  <span>{contact?.phone || '+41 44 580 29 40'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-cyan" />
                  <span>{contact?.email || 'concierge@celeste-expeditions.com'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-navy"
                >
                  <span>Browse More Expeditions</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-sky bg-ice/60 px-5 py-3 text-xs font-semibold text-navy transition-colors hover:bg-sky/50"
                >
                  <Compass className="h-4 w-4 text-ocean" />
                  <span>Return Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredTrips.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 space-y-8">
            <h2 className="font-heading text-2xl font-bold text-navy">
              While You Wait: Explore Our Signature Routes
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featuredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
