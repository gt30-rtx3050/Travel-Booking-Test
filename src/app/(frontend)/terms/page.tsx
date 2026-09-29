import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terms & Conditions of Expedition Participation',
  description:
    'Booking terms, Swiss Travel Guarantee bonding, cancellation policy, and alpine field participation standards for Celeste Expeditions AG.',
}

export default async function TermsPage() {
  const siteSettings = await getSiteSettings()
  const legal = siteSettings?.legalPages
  const sections = legal?.termsSections || []

  return (
    <div className="bg-white text-navy">
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
            <FileText className="h-3.5 w-3.5 text-cyan" />
            <span>Expedition Participation Agreement</span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Terms & Conditions of Booking
          </h1>
          <p className="text-sm text-ocean">
            Effective Date: {legal?.termsLastUpdated || 'September 1, 2026'}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-sky/80 bg-white p-6 sm:p-8 shadow-soft space-y-3"
            >
              <h2 className="font-heading text-xl font-bold text-navy">{sec.heading}</h2>
              <p className="text-sm leading-relaxed text-navy">{sec.body}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-sky bg-ice/40 p-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-navy">
              Need clarification on private vessel charter contracts or mountain rescue coverage?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-ocean px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy"
            >
              Speak With Our Legal & Concierge Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
