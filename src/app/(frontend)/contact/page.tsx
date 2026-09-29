import React from 'react'
import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, ShieldAlert, Compass } from 'lucide-react'
import { getSiteSettings, getPublishedTrips } from '@/lib/payload'
import { ContactForm } from '@/components/ContactForm'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Concierge & Private Expedition Planning',
  description:
    'Contact our Zürich headquarters to plan a small-group or private alpine, fjord, or polar expedition.',
}

export default async function ContactPage() {
  const [siteSettings, trips] = await Promise.all([
    getSiteSettings(),
    getPublishedTrips(),
  ])

  const contact = siteSettings?.contactInfo
  const uniqueDestinations = Array.from(
    new Set(trips.map((t) => t.destination).filter(Boolean)),
  ).sort()

  return (
    <div className="bg-white text-navy">
      {/* Header */}
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
              <Compass className="h-3.5 w-3.5 text-cyan" />
              <span>Zürich Concierge Desk</span>
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Begin Planning Your Next Expedition
            </h1>
            <p className="text-base leading-relaxed text-navy sm:text-lg">
              Whether you are inquiring about an upcoming scheduled departure or commissioning a private family or corporate traverse, our route specialists are at your disposal.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Concierge Info Cards */}
            <div className="space-y-6 lg:col-span-4">
              <FadeIn className="rounded-2xl border border-sky bg-ice/35 p-6 shadow-soft space-y-5">
                <h2 className="font-heading text-xl font-bold text-navy">
                  Headquarters & Direct Lines
                </h2>

                <div className="space-y-4 text-sm text-navy">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean">
                      <MapPin className="h-4 w-4 text-cyan" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-ocean">
                        Zürich Atelier
                      </span>
                      <span className="mt-0.5 block">
                        {contact?.address || 'Bahnhofstrasse 42, 8001 Zürich, Switzerland'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean">
                      <Phone className="h-4 w-4 text-cyan" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-ocean">
                        Direct Telephone
                      </span>
                      <a
                        href={`tel:${(contact?.phone || '+41445802940').replace(/\s+/g, '')}`}
                        className="mt-0.5 block font-medium hover:text-ocean"
                      >
                        {contact?.phone || '+41 44 580 29 40'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean">
                      <Mail className="h-4 w-4 text-cyan" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-ocean">
                        Electronic Dossier Desk
                      </span>
                      <a
                        href={`mailto:${contact?.email || 'concierge@celeste-expeditions.com'}`}
                        className="mt-0.5 block font-medium hover:text-ocean"
                      >
                        {contact?.email || 'concierge@celeste-expeditions.com'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ocean">
                      <Clock className="h-4 w-4 text-cyan" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-ocean">
                        Consultation Hours
                      </span>
                      <span className="mt-0.5 block">
                        {contact?.officeHours || 'Mon – Sat · 08:00 – 20:00 CET'}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn
                delay={0.08}
                className="rounded-2xl border border-sky/80 bg-white p-6 shadow-soft space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ocean">
                  <ShieldAlert className="h-4 w-4 text-cyan" />
                  <span>24/7 Field Operations Desk</span>
                </div>
                <p className="text-sm leading-relaxed text-navy">
                  For guests currently in the field or family members requiring satellite relay assistance:
                </p>
                <p className="font-heading text-lg font-bold text-navy">
                  {contact?.emergencyPhone || '+41 44 580 29 99'}
                </p>
              </FadeIn>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-8">
              <FadeIn delay={0.05}>
                <ContactForm destinations={uniqueDestinations} />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
