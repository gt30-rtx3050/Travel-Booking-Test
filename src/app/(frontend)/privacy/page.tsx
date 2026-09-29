import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { getSiteSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Protection Charter',
  description: 'How Celeste Expeditions AG protects guest data under Swiss FADP and EU GDPR.',
}

export default async function PrivacyPage() {
  const siteSettings = await getSiteSettings()
  const legal = siteSettings?.legalPages
  const sections = legal?.privacySections || []

  return (
    <div className="bg-white text-navy">
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan" />
            <span>Swiss FADP & EU GDPR Compliance</span>
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Privacy Policy & Guest Data Charter
          </h1>
          <p className="text-sm text-ocean">
            Last Updated: {legal?.privacyLastUpdated || 'September 1, 2026'}
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
              Questions regarding your personal dossier or medical declaration records?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-ocean px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy"
            >
              Contact Data Protection Officer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
