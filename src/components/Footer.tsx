import React from 'react'
import Link from 'next/link'
import { Compass, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react'
import type { Navigation, SiteSetting } from '@/payload-types'

interface FooterProps {
  navigation: Navigation
  siteSettings: SiteSetting
}

export function Footer({ navigation, siteSettings }: FooterProps) {
  const siteName = siteSettings?.siteName || 'Celeste Expeditions'
  const tagline = siteSettings?.tagline || 'Architectural Alpine & Polar Voyages'
  const description =
    siteSettings?.footer?.description ||
    'Bespoke and small-group mountain, fjord, and polar expeditions crafted in Zürich by IFMGA guides and polar naturalists.'
  const copyrightText =
    siteSettings?.footer?.copyrightText ||
    '© 2026 Celeste Expeditions AG. All rights reserved. Swiss Travel Guarantee Certified.'
  const certifications = siteSettings?.footer?.certifications || [
    { label: 'IFMGA Certified Guiding Collective' },
    { label: 'AECO Arctic Expedition Operator' },
    { label: 'Swiss Travel Security Bonded' },
  ]
  const contact = siteSettings?.contactInfo
  const socials = siteSettings?.socials || []
  const columns = navigation?.footerColumns || []

  return (
    <footer className="border-t border-sky bg-ice/50 text-navy">
      {/* Upper accreditation strip */}
      <div className="border-b border-sky/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-ocean">
            <ShieldCheck className="h-4 w-4 text-cyan" />
            <span>Field Accreditation & Financial Protection</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {certifications.map((cert, i) => (
              <span
                key={i}
                className="rounded-full border border-sky bg-ice/50 px-3.5 py-1 text-xs text-navy"
              >
                {cert.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky bg-white text-ocean">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="block font-heading text-xl font-bold tracking-tight text-navy">
                  {siteName}
                </span>
                <span className="block text-[11px] tracking-widest uppercase text-ocean">
                  {tagline}
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-navy">{description}</p>

            <div className="space-y-2.5 pt-2 text-sm text-navy">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                <span>{contact?.address || 'Bahnhofstrasse 42, 8001 Zürich, Switzerland'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-cyan" />
                <a
                  href={`tel:${(contact?.phone || '+41445802940').replace(/\s+/g, '')}`}
                  className="transition-colors hover:text-ocean"
                >
                  {contact?.phone || '+41 44 580 29 40'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-cyan" />
                <a
                  href={`mailto:${contact?.email || 'concierge@celeste-expeditions.com'}`}
                  className="transition-colors hover:text-ocean"
                >
                  {contact?.email || 'concierge@celeste-expeditions.com'}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns from Payload */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="font-heading text-sm font-bold tracking-wider uppercase text-navy">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {(col.links || []).map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-navy transition-colors hover:text-ocean"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-sky pt-8 text-xs text-navy sm:flex-row sm:items-center">
          <p>{copyrightText}</p>

          <div className="flex flex-wrap items-center gap-6">
            {socials.map((soc, idx) => (
              <a
                key={idx}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-ocean transition-colors hover:text-navy"
              >
                <span>{soc.platform}</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
            <Link href="/privacy" className="transition-colors hover:text-ocean">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ocean">
              Terms & Conditions
            </Link>
            <Link href="/admin" className="transition-colors hover:text-ocean">
              CMS Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
