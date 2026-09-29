import React from 'react'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { getNavigation, getSiteSettings } from '@/lib/payload'

const griftFont = localFont({
  src: [
    {
      path: '../../assets/fonts/Grift-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/Grift-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/Grift-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-grift',
  display: 'swap',
})

const archivoFont = localFont({
  src: [
    {
      path: '../../assets/fonts/Archivo-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/Archivo-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/Archivo-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-archivo',
  display: 'swap',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Celeste Expeditions — Architectural Alpine & Polar Voyages',
    template: '%s | Celeste Expeditions',
  },
  description:
    'Bespoke and small-group mountain, fjord, and polar expeditions crafted in Zürich by IFMGA guides and polar naturalists.',
  openGraph: {
    type: 'website',
    siteName: 'Celeste Expeditions',
    title: 'Celeste Expeditions — Architectural Alpine & Polar Voyages',
    description:
      'Bespoke and small-group mountain, fjord, and polar expeditions crafted in Zürich by IFMGA guides and polar naturalists.',
  },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navigation, siteSettings] = await Promise.all([
    getNavigation(),
    getSiteSettings(),
  ])

  return (
    <html
      lang="en"
      className={`${griftFont.variable} ${archivoFont.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-white font-body font-normal text-navy antialiased">
        <Navbar navigation={navigation} siteSettings={siteSettings} />
        <main className="flex-1 bg-white">{children}</main>
        <Footer navigation={navigation} siteSettings={siteSettings} />
      </body>
    </html>
  )
}
