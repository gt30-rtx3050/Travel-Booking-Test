'use client'

import React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

interface TripsFilterBarProps {
  destinations: string[]
  currentDestination: string
  currentDifficulty: string
  currentDuration: string
  currentMaxPrice: string
  totalResults: number
}

export function TripsFilterBar({
  destinations,
  currentDestination,
  currentDifficulty,
  currentDuration,
  currentMaxPrice,
  totalResults,
}: TripsFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const resetAll = () => {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters =
    (currentDestination && currentDestination !== 'all') ||
    (currentDifficulty && currentDifficulty !== 'all') ||
    (currentDuration && currentDuration !== 'all') ||
    (currentMaxPrice && currentMaxPrice !== 'all')

  return (
    <div className="rounded-2xl border border-sky/80 bg-white p-6 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-sky/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ice text-ocean">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-navy">
              Refine Expeditions
            </h2>
            <p className="text-xs text-ocean">
              Showing {totalResults} published {totalResults === 1 ? 'itinerary' : 'itineraries'}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-sky bg-ice/60 px-3.5 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-sky/50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-ocean" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Destination Filter */}
        <div>
          <label
            htmlFor="filter-destination"
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
          >
            Destination
          </label>
          <select
            id="filter-destination"
            value={currentDestination || 'all'}
            onChange={(e) => updateFilter('destination', e.target.value)}
            className="w-full rounded-xl border border-sky bg-ice/30 px-3.5 py-2.5 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="all">All Regions & Latitudes</option>
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label
            htmlFor="filter-difficulty"
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
          >
            Technical Difficulty
          </label>
          <select
            id="filter-difficulty"
            value={currentDifficulty || 'all'}
            onChange={(e) => updateFilter('difficulty', e.target.value)}
            className="w-full rounded-xl border border-sky bg-ice/30 px-3.5 py-2.5 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="Easy">Easy — Coastal & Valley Walks</option>
            <option value="Moderate">Moderate — High Trails & Ridges</option>
            <option value="Challenging">Challenging — Alpine Passes</option>
            <option value="Strenuous">Strenuous — Glacier & Polar Traverse</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div>
          <label
            htmlFor="filter-duration"
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
          >
            Duration
          </label>
          <select
            id="filter-duration"
            value={currentDuration || 'all'}
            onChange={(e) => updateFilter('duration', e.target.value)}
            className="w-full rounded-xl border border-sky bg-ice/30 px-3.5 py-2.5 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="all">Any Length</option>
            <option value="short">Up to 7 Days</option>
            <option value="medium">8 to 10 Days</option>
            <option value="long">11+ Days</option>
          </select>
        </div>

        {/* Price Filter */}
        <div>
          <label
            htmlFor="filter-price"
            className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
          >
            Maximum Tariff
          </label>
          <select
            id="filter-price"
            value={currentMaxPrice || 'all'}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full rounded-xl border border-sky bg-ice/30 px-3.5 py-2.5 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="all">Any Budget</option>
            <option value="5000">Up to $5,000</option>
            <option value="7500">Up to $7,500</option>
            <option value="10000">Up to $10,000</option>
            <option value="15000">Up to $15,000</option>
          </select>
        </div>
      </div>
    </div>
  )
}
