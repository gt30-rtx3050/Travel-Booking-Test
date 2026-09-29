'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { contactFormSchema, type ContactFormValues } from '@/lib/schemas'
import { submitContactAction } from '@/app/actions'

interface ContactFormProps {
  destinations?: string[]
}

export function ContactForm({ destinations = [] }: ContactFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      destinationInterest: '',
      inquiryType: 'general',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null)
    const res = await submitContactAction(values)
    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl)
    } else {
      setServerError(res.message || 'Unable to send message right now. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-sky bg-white p-6 shadow-soft lg:p-10 space-y-6"
      noValidate
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
          Private Consultation & Dossier Request
        </span>
        <h2 className="mt-1 font-heading text-2xl font-bold text-navy sm:text-3xl">
          Initiate a Conversation With Our Route Specialists
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-navy">
          Every inquiry is answered personally by an IFMGA mountain guide or polar expedition planner at our Zürich desk within one business day.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
          >
            Full Name *
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Henrik Lindholm"
            {...register('name')}
            className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-xs text-ocean">{errors.name.message}</p>}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
          >
            Email Address *
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="henrik@nordic-atelier.se"
            {...register('email')}
            className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-xs text-ocean">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
          >
            Telephone
          </label>
          <input
            id="contact-phone"
            type="tel"
            placeholder="+41 44 580 29 40"
            {...register('phone')}
            className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="contact-inquiryType"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
          >
            Inquiry Category *
          </label>
          <select
            id="contact-inquiryType"
            {...register('inquiryType')}
            className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="general">Scheduled Small-Group Expedition</option>
            <option value="bespoke">Private / Bespoke Charter</option>
            <option value="press">Press & Editorial Partnerships</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="contact-destination"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
          >
            Region of Interest
          </label>
          <select
            id="contact-destination"
            {...register('destinationInterest')}
            className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy focus:border-ocean focus:bg-white focus:outline-none"
          >
            <option value="">Undecided / Multiple Regions</option>
            {destinations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
        >
          Subject *
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="Private Autumn Traverse in the Dolomites for 6 Guests"
          {...register('subject')}
          className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
        />
        {errors.subject && <p className="mt-1 text-xs text-ocean">{errors.subject.message}</p>}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ocean"
        >
          Expedition Brief & Questions *
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us about your preferred travel dates, party size, trekking pace, and accommodation preferences..."
          {...register('message')}
          className="w-full rounded-xl border border-sky bg-ice/30 px-4 py-3 text-sm text-navy placeholder:text-ocean/50 focus:border-ocean focus:bg-white focus:outline-none"
        />
        {errors.message && <p className="mt-1 text-xs text-ocean">{errors.message.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-xl border border-ocean bg-ice px-4 py-3 text-xs font-medium text-navy">
          {serverError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sky/60 pt-5">
        <div className="flex items-center gap-2 text-xs text-ocean">
          <ShieldCheck className="h-4 w-4 text-cyan" />
          <span>Discreet handling guaranteed. Your details are never shared with third parties.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-ocean px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-navy disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Dispatching Message...</span>
            </>
          ) : (
            <>
              <span>Send Concierge Inquiry</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
