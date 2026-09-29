import React from 'react'
import Link from 'next/link'
import { Compass, ArrowLeft, ArrowUpRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="bg-white py-24 lg:py-32 text-navy">
      <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-sky bg-ice text-ocean">
          <Compass className="h-7 w-7 text-ocean" />
        </div>

        <span className="inline-block rounded-full border border-sky bg-ice/60 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
          Error 404 · Uncharted Coordinates
        </span>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          This Waypoint Could Not Be Located
        </h1>

        <p className="text-base leading-relaxed text-navy">
          The expedition dossier or journal dispatch you requested may have moved or is not currently published. Return to base camp or browse our active routes below.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/trips"
            className="inline-flex items-center gap-2 rounded-full border border-sky bg-ice/60 px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-sky/50"
          >
            <span>Explore All Expeditions</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
