'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Users,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Compass,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { bookingFormSchema, type BookingFormValues } from '@/lib/schemas'
import { submitBookingAction } from '@/app/actions'
import { formatCurrency } from '@/lib/utils'

export interface AvailabilityItem {
  id?: string | null
  date: string
  spotsLeft: number
  priceOverride?: number | null
}

interface BookingAvailabilitySectionProps {
  tripId: string
  tripTitle: string
  basePrice: number
  currency: string
  maxGroupSize: number
  availability: AvailabilityItem[]
}

export function BookingAvailabilitySection({
  tripId,
  tripTitle,
  basePrice,
  currency,
  maxGroupSize,
  availability,
}: BookingAvailabilitySectionProps) {
  const router = useRouter()
  const firstOpen = availability.find((a) => a.spotsLeft > 0) || availability[0]
  const [selectedDate, setSelectedDate] = useState<string>(firstOpen?.date || '2026-10-18')
  const [formExpanded, setFormExpanded] = useState<boolean>(true)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      tripId,
      tripTitle,
      preferredDate: firstOpen?.date || '2026-10-18',
      name: '',
      email: '',
      phone: '',
      numberOfTravelers: 2,
      message: '',
    },
  })

  const watchedTravelers = watch('numberOfTravelers') || 2
  const activeDeparture = availability.find((a) => a.date === selectedDate)
  const effectivePrice = activeDeparture?.priceOverride || basePrice

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    setValue('preferredDate', dateStr, { shouldValidate: true })
    setFormExpanded(true)
    const formEl = document.getElementById('booking-inquiry-panel')
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const onSubmit = async (values: BookingFormValues) => {
    setServerError(null)
    const res = await submitBookingAction({
      ...values,
      tripId,
      tripTitle,
    })

    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
    } else {
      setServerError(res.message || 'Unable to submit booking inquiry. Please check your details.')
    }
  }

  return (
    <div id="booking-calendar" className="scroll-mt-28 space-y-8">
      {/* Departure Dates Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {availability.map((item, idx) => {
          const isSelected = selectedDate === item.date
          const isSoldOut = item.spotsLeft <= 0
          const priceToShow = item.priceOverride || basePrice
          const parsedDate = new Date(`${item.date}T00:00:00`)
          const formattedDate = !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : item.date

          return (
            <button
              key={item.id || idx}
              type="button"
              disabled={isSoldOut}
              onClick={() => handleSelectDate(item.date)}
              className={`group flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                isSoldOut
                  ? 'cursor-not-allowed border-sky/40 bg-ice/20 opacity-55'
                  : isSelected
                    ? 'border-ocean bg-ice/80 shadow-card'
                    : 'border-sky/80 bg-white shadow-soft hover:border-ocean hover:bg-ice/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-ocean">
                    <Calendar className="h-3.5 w-3.5 text-cyan" />
                    <span>Departure {idx + 1}</span>
                  </span>
                  {isSelected && !isSoldOut && (
                    <span className="rounded-full bg-ocean px-2.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                      Selected
                    </span>
                  )}
                </div>

                <p className="mt-3 font-heading text-lg font-bold text-navy">{formattedDate}</p>
                <p className="mt-0.5 text-xs text-ocean">Code: {item.date}</p>
              </div>

              <div className="mt-5 border-t border-sky/60 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-heading text-lg font-bold text-navy">
                    {formatCurrency(priceToShow, currency)}
                  </span>
                  <span className="text-xs text-ocean">/ guest</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span
                    className={`font-medium ${
                      isSoldOut
                        ? 'text-ocean/60'
                        : item.spotsLeft <= 3
                          ? 'text-ocean font-semibold'
                          : 'text-navy'
                    }`}
                  >
                    {isSoldOut
                      ? 'Waitlist Only (0 spots)'
                      : `${item.spotsLeft} of ${maxGroupSize} spots left`}
                  </span>
                  {!isSoldOut && (
                    <span className="font-semibold text-ocean group-hover:underline">
                      Inquire →
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Inline Booking Inquiry Form */}
      <AnimatePresence initial={false}>
        {formExpanded && (
          <motion.div
            id="booking-inquiry-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-sky bg-ice/40 p-6 shadow-soft lg:p-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Summary Column */}
              <div className="space-y-5 lg:col-span-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold text-ocean">
                  <Sparkles className="h-3.5 w-3.5 text-cyan" />
                  <span>Direct Reservation Inquiry</span>
                </div>

                <h3 className="font-heading text-2xl font-bold text-navy">
                  Request Space on {tripTitle}
                </h3>

                <p className="text-sm leading-relaxed text-navy">
                  Select a departure window above or specify a bespoke private charter date. No immediate credit card charge is taken until our Zürich specialist confirms your cabin and mountain refuge allocation.
                </p>

                <div className="rounded-2xl border border-sky bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-ocean">
                    <span>Selected Departure</span>
                    <span className="font-semibold text-navy">{selectedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ocean">
                    <span>Tariff Per Guest</span>
                    <span className="font-semibold text-navy">
                      {formatCurrency(effectivePrice, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ocean">
                    <span>Travelers</span>
                    <span className="font-semibold text-navy">{watchedTravelers} Guests</span>
                  </div>
                  <div className="border-t border-sky/60 pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ocean">
                      Estimated Total
                    </span>
                    <span className="font-heading text-xl font-bold text-navy">
                      {formatCurrency(effectivePrice * Number(watchedTravelers || 1), currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-navy">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                  <span>
                    100% Swiss Travel Guarantee protection & complimentary date transfer up to 60 days prior to departure.
                  </span>
                </div>
              </div>

              {/* Right Form Column */}
              <div className="lg:col-span-8">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="rounded-2xl border border-sky bg-white p-6 shadow-soft lg:p-8 space-y-5"
                  noValidate
                >
                  <input type="hidden" {...register('tripId')} />
                  <input type="hidden" {...register('tripTitle')} />

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="booking-preferredDate"
                        className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                      >
                        Preferred Departure Date *
                      </label>
                      <input
                        id="booking-preferredDate"
                        type="text"
                        {...register('preferredDate')}
                        onChange={(e) => {
                          setSelectedDate(e.target.value)
                          setValue('preferredDate', e.target.value, { shouldValidate: true })
                        }}
                        className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
                      />
                      {errors.preferredDate && (
                        <p className="mt-1 text-xs text-ocean">{errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-travelers"
                        className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                      >
                        Number of Travelers *
                      </label>
                      <input
                        id="booking-travelers"
                        type="number"
                        min={1}
                        max={maxGroupSize}
                        {...register('numberOfTravelers')}
                        className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
                      />
                      {errors.numberOfTravelers && (
                        <p className="mt-1 text-xs text-ocean">
                          {errors.numberOfTravelers.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label
                        htmlFor="booking-name"
                        className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                      >
                        Full Name *
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        placeholder="Dr. Clara Lindqvist"
                        {...register('name')}
                        className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-ocean">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-email"
                        className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                      >
                        Email Address *
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="clara@domain.com"
                        {...register('email')}
                        className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-ocean">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="booking-phone"
                        className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                      >
                        Telephone *
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        placeholder="+41 79 204 11 80"
                        {...register('phone')}
                        className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-ocean">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="booking-message"
                      className="mb-1.5 block text-xs font-semibold tracking-wider uppercase text-ocean"
                    >
                      Trekking Experience, Dietary Preferences, or Private Charter Notes
                    </label>
                    <textarea
                      id="booking-message"
                      rows={3}
                      placeholder="Share any prior alpine experience, rooming preferences, or questions for your route specialist..."
                      {...register('message')}
                      className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
                    />
                  </div>

                  {serverError && (
                    <div className="rounded-xl border border-ocean bg-ice px-4 py-3 text-xs font-medium text-navy">
                      {serverError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-ocean">
                      Response guaranteed within 24 hours from Zürich HQ.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-ocean px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Recording Reservation...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Booking Inquiry</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export interface CollapsibleSectionItem {
  id: string
  title: string
  renderedContent: React.ReactNode
}

export function CollapsibleEssentialInfo({ items }: { items: CollapsibleSectionItem[] }) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const first = items[0]?.id
    return first ? { [first]: true } : {}
  })

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = Boolean(openIds[item.id])
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-ice/40"
            >
              <span className="font-heading text-lg font-bold text-navy">{item.title}</span>
              <ChevronDown
                className={`h-5 w-5 text-ocean transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden border-t border-sky/50 bg-ice/20"
                >
                  <div className="px-6 py-5">{item.renderedContent}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export interface FaqAccordionItem {
  id: string
  question: string
  renderedAnswer: React.ReactNode
}

export function FaqAccordion({ items }: { items: FaqAccordionItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null)

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = activeId === item.id
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft"
          >
            <button
              type="button"
              onClick={() => setActiveId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-ice/40"
            >
              <span className="font-heading text-base font-bold text-navy sm:text-lg">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ocean transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden border-t border-sky/50 bg-white"
                >
                  <div className="px-6 py-5">{item.renderedAnswer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export interface MapMarkerItem {
  id?: string | null
  dayNumber?: number | null
  title: string
  latitude: number
  longitude: number
  description?: string | null
}

interface ExpeditionMapSectionProps {
  tripTitle: string
  destination: string
  latitude: number
  longitude: number
  zoom: number
  routeDescription: string
  markers: MapMarkerItem[]
}

export function ExpeditionMapSection({
  tripTitle,
  destination,
  latitude,
  longitude,
  zoom,
  routeDescription,
  markers,
}: ExpeditionMapSectionProps) {
  const [selectedMarkerIdx, setSelectedMarkerIdx] = useState<number>(0)
  const activeMarker = markers[selectedMarkerIdx] || {
    dayNumber: 1,
    title: destination,
    latitude,
    longitude,
    description: routeDescription,
  }

  return (
    <div className="rounded-2xl border border-sky/80 bg-white p-6 shadow-soft lg:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Interactive Topographic & Telemetry Map Canvas */}
        <div className="lg:col-span-7">
          <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-sky bg-ice/60 p-6">
            {/* Topographic contour lines SVG */}
            <svg
              viewBox="0 0 800 500"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-75"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d="M -50 120 Q 180 40 360 140 T 850 90"
                fill="none"
                stroke="#90e0ef"
                strokeWidth="1.5"
              />
              <path
                d="M -50 200 Q 220 110 410 210 T 850 170"
                fill="none"
                stroke="#90e0ef"
                strokeWidth="1.5"
              />
              <path
                d="M -50 290 Q 160 220 430 300 T 850 260"
                fill="none"
                stroke="#90e0ef"
                strokeWidth="1.5"
              />
              <path
                d="M -50 390 Q 240 310 490 380 T 850 350"
                fill="none"
                stroke="#90e0ef"
                strokeWidth="1.5"
              />
              {/* Route polyline connecting waypoints */}
              <polyline
                points="110,360 240,280 380,220 530,170 680,125"
                fill="none"
                stroke="#0077b6"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Top coordinate telemetry bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky bg-white/95 px-4 py-2.5 text-xs text-navy shadow-soft">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-ocean" />
                <span className="font-semibold">{destination}</span>
              </div>
              <div className="font-mono text-xs text-ocean">
                LAT {latitude.toFixed(4)}° · LON {longitude.toFixed(4)}° · ZOOM {zoom}x
              </div>
            </div>

            {/* Interactive Waypoint Nodes on Canvas */}
            <div className="relative z-10 my-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {markers.map((marker, idx) => {
                const isSelected = idx === selectedMarkerIdx
                return (
                  <button
                    key={marker.id || idx}
                    type="button"
                    onClick={() => setSelectedMarkerIdx(idx)}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-ocean bg-navy text-white shadow-card'
                        : 'border-sky bg-white/95 text-navy hover:border-ocean'
                    }`}
                  >
                    <MapPin
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isSelected ? 'text-sky' : 'text-cyan'
                      }`}
                    />
                    <div className="min-w-0">
                      <span
                        className={`block text-[10px] font-semibold uppercase tracking-wider ${
                          isSelected ? 'text-sky' : 'text-ocean'
                        }`}
                      >
                        {marker.dayNumber ? `Day ${marker.dayNumber}` : `Waypoint ${idx + 1}`}
                      </span>
                      <span className="block truncate font-heading text-xs font-bold">
                        {marker.title}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active Waypoint Telemetry Card */}
            <div className="relative z-10 rounded-xl border border-sky bg-white/95 p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ocean">
                  Selected Stage: {activeMarker.title}
                </span>
                <span className="font-mono text-xs text-navy">
                  {activeMarker.latitude.toFixed(4)}° N, {activeMarker.longitude.toFixed(4)}° E
                </span>
              </div>
              {activeMarker.description && (
                <p className="mt-1.5 text-xs leading-relaxed text-navy">
                  {activeMarker.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Route Narrative & Waypoint Directory */}
        <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
          <div className="space-y-4">
            <span className="inline-block rounded-full border border-sky bg-ice px-3 py-1 text-xs font-semibold tracking-wider uppercase text-ocean">
              Cartography & Route Brief
            </span>
            <h3 className="font-heading text-2xl font-bold text-navy">
              {tripTitle} — Geographic Corridor
            </h3>
            <p className="text-sm leading-relaxed text-navy">{routeDescription}</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ocean">
              Key GPS Checkpoints ({markers.length})
            </h4>
            <div className="divide-y divide-sky/50 rounded-xl border border-sky/80 bg-ice/30">
              {markers.map((m, idx) => (
                <button
                  key={m.id || idx}
                  type="button"
                  onClick={() => setSelectedMarkerIdx(idx)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                    idx === selectedMarkerIdx ? 'bg-ice font-semibold text-navy' : 'text-navy hover:bg-ice/60'
                  }`}
                >
                  <span>
                    {m.dayNumber ? `Day ${m.dayNumber}: ` : ''}
                    {m.title}
                  </span>
                  <span className="font-mono text-ocean">
                    {m.latitude.toFixed(2)}°, {m.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StickyBookNowBarProps {
  tripTitle: string
  duration: number
  difficulty: string
  fromPrice: number
  currency: string
  nextDepartureDate?: string
}

export function StickyBookNowBar({
  tripTitle,
  duration,
  difficulty,
  fromPrice,
  currency,
  nextDepartureDate,
}: StickyBookNowBarProps) {
  const scrollToCalendar = () => {
    const el = document.getElementById('booking-calendar')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky bottom-0 z-30 border-t border-sky bg-white/95 py-3.5 shadow-elevated backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-heading text-sm font-bold text-navy sm:text-base">{tripTitle}</p>
            <p className="text-xs text-ocean">
              {duration} Days · {difficulty}
              {nextDepartureDate ? ` · Next Departure: ${nextDepartureDate}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <span className="block text-[10px] uppercase tracking-wider text-ocean">
              Tariff From
            </span>
            <span className="font-heading text-lg font-bold text-navy">
              {formatCurrency(fromPrice, currency)}
            </span>
            <span className="text-xs text-ocean"> / guest</span>
          </div>

          <button
            type="button"
            onClick={scrollToCalendar}
            className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy"
          >
            <span>Book Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
