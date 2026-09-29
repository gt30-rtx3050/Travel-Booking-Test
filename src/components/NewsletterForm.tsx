'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { newsletterFormSchema, type NewsletterFormValues } from '@/lib/schemas'
import { submitNewsletterAction } from '@/app/actions'

interface NewsletterFormProps {
  buttonLabel?: string
  disclaimer?: string
}

export function NewsletterForm({
  buttonLabel = 'Subscribe to Dispatches',
  disclaimer = 'Issued quarterly from Zürich. Zero promotional clutter; unsubscribe in one click.',
}: NewsletterFormProps) {
  const [serverMsg, setServerMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onSubmit = async (values: NewsletterFormValues) => {
    setServerMsg(null)
    const res = await submitNewsletterAction(values)
    if (res.success) {
      setIsSuccess(true)
      setServerMsg(res.message || 'Subscribed to quarterly dispatches.')
      reset()
    } else {
      setIsSuccess(false)
      setServerMsg(res.message || 'Please check your email and try again.')
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-sky bg-white p-6 text-left shadow-soft">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ocean" />
          <div>
            <p className="font-heading text-base font-bold text-navy">
              Welcome to the Celeste Dispatch List
            </p>
            <p className="mt-1 text-sm text-navy">{serverMsg}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email Address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email address..."
            {...register('email')}
            className="w-full rounded-full border border-sky bg-white px-5 py-3.5 text-sm text-navy placeholder:text-ocean/70 focus:border-ocean focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ocean px-7 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-navy disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <span>{buttonLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {errors.email && (
        <p className="text-xs font-medium text-ocean">{errors.email.message}</p>
      )}
      {serverMsg && !isSuccess && (
        <p className="text-xs font-medium text-ocean">{serverMsg}</p>
      )}
      <p className="text-xs text-ocean">{disclaimer}</p>
    </form>
  )
}
