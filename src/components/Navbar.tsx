'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Menu, X, ArrowUpRight, Phone } from 'lucide-react'
import type { Navigation, SiteSetting } from '@/payload-types'

interface NavbarProps {
  navigation: Navigation
  siteSettings: SiteSetting
}

export function Navbar({ navigation, siteSettings }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const headerItems = navigation?.headerItems?.length
    ? navigation.headerItems
    : [
        { label: 'Expeditions', href: '/trips' },
        { label: 'Journal', href: '/blog' },
        { label: 'Our Ethos', href: '/about' },
        { label: 'Concierge', href: '/contact' },
      ]

  const ctaLabel = navigation?.ctaButton?.label || 'Explore Expeditions'
  const ctaHref = navigation?.ctaButton?.href || '/trips'
  const siteName = siteSettings?.siteName || 'Celeste Expeditions'
  const tagline = siteSettings?.tagline || 'Architectural Alpine & Polar Voyages'
  const phone = siteSettings?.contactInfo?.phone || '+41 44 580 29 40'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky/70 bg-white/95 backdrop-blur-md">
      {/* Top micro utility bar */}
      <div className="hidden border-b border-sky/40 bg-ice/40 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs text-navy">
          <div className="flex items-center gap-6">
            <span className="font-medium tracking-widest uppercase text-ocean">{tagline}</span>
            <span className="text-sky">|</span>
            <span>Zürich · Chamonix · Tromsø · Puerto Natales</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-navy transition-colors hover:text-ocean"
            >
              <Phone className="h-3.5 w-3.5 text-cyan" />
              <span>{phone}</span>
            </a>
            <span className="text-sky">|</span>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-ocean transition-colors hover:text-navy"
            >
              <span>Editorial CMS</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:py-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky bg-ice text-navy transition-colors group-hover:bg-sky/50">
            <Compass className="h-5 w-5 text-ocean" />
          </div>
          <div>
            <span className="block font-heading text-xl font-bold tracking-tight text-navy">
              {siteName}
            </span>
            <span className="block text-[11px] tracking-widest uppercase text-ocean">
              High-Latitude & Alpine
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-8 md:flex">
          {headerItems.map((item, idx) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={idx}
                href={item.href}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive ? 'text-ocean' : 'text-navy hover:text-cyan'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute right-0 -bottom-1 left-0 h-[1px] bg-ocean"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-navy"
          >
            <span>{ctaLabel}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky bg-ice/60 text-navy transition-colors hover:bg-sky/40 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-sky/60 bg-white md:hidden"
          >
            <div className="space-y-2 px-6 py-6">
              {headerItems.map((item, idx) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive ? 'bg-ice text-ocean' : 'text-navy hover:bg-ice/60'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs font-normal text-ocean">
                        {item.description}
                      </span>
                    )}
                  </Link>
                )
              })}

              <div className="pt-4">
                <Link
                  href={ctaHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ocean px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy"
                >
                  <span>{ctaLabel}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
