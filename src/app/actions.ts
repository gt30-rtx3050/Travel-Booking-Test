'use server'

import { revalidatePath } from 'next/cache'
import { createBooking, createContactSubmission } from '@/lib/payload'
import {
  bookingFormSchema,
  contactFormSchema,
  newsletterFormSchema,
  type BookingFormValues,
  type ContactFormValues,
  type NewsletterFormValues,
} from '@/lib/schemas'

export interface ActionResponse {
  success: boolean
  id?: string
  redirectUrl?: string
  message?: string
  errors?: Record<string, string[]>
}

export async function submitBookingAction(rawData: BookingFormValues): Promise<ActionResponse> {
  const parsed = bookingFormSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please review the highlighted fields in your reservation inquiry.',
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const booking = await createBooking({
      tripId: parsed.data.tripId,
      preferredDate: parsed.data.preferredDate,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      numberOfTravelers: parsed.data.numberOfTravelers,
      message: parsed.data.message,
    })

    try {
      revalidatePath('/trips')
    } catch {
      // Gracefully ignore if invoked outside Next.js request context
    }
    const params = new URLSearchParams({
      type: 'booking',
      ref: String(booking.id).slice(-6).toUpperCase(),
      name: parsed.data.name,
      trip: parsed.data.tripTitle || 'Selected Expedition',
      date: parsed.data.preferredDate,
    })

    return {
      success: true,
      id: String(booking.id),
      redirectUrl: `/thank-you?${params.toString()}`,
      message: 'Your expedition inquiry has been recorded.',
    }
  } catch (error) {
    console.error('[submitBookingAction] Error:', error)
    return {
      success: false,
      message: 'We encountered a temporary issue saving your booking inquiry. Please try again.',
    }
  }
}

export async function submitContactAction(rawData: ContactFormValues): Promise<ActionResponse> {
  const parsed = contactFormSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please complete all required fields.',
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const submission = await createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      destinationInterest: parsed.data.destinationInterest,
      inquiryType: parsed.data.inquiryType,
      message: parsed.data.message,
    })

    const params = new URLSearchParams({
      type: 'contact',
      ref: String(submission.id).slice(-6).toUpperCase(),
      name: parsed.data.name,
      subject: parsed.data.subject,
    })

    return {
      success: true,
      id: String(submission.id),
      redirectUrl: `/thank-you?${params.toString()}`,
      message: 'Your inquiry has been received by our Zürich concierge desk.',
    }
  } catch (error) {
    console.error('[submitContactAction] Error:', error)
    return {
      success: false,
      message: 'We encountered a temporary issue submitting your message. Please try again.',
    }
  }
}

export async function submitNewsletterAction(
  rawData: NewsletterFormValues,
): Promise<ActionResponse> {
  const parsed = newsletterFormSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const submission = await createContactSubmission({
      name: parsed.data.name || 'Dispatch Subscriber',
      email: parsed.data.email,
      subject: 'Quarterly Expedition Dispatch Subscription',
      inquiryType: 'newsletter',
      message: `Newsletter subscription requested for ${parsed.data.email}.`,
    })

    return {
      success: true,
      id: String(submission.id),
      message: 'You are now subscribed to the Celeste Quarterly Dispatch.',
    }
  } catch (error) {
    console.error('[submitNewsletterAction] Error:', error)
    return {
      success: false,
      message: 'Unable to process subscription right now. Please try again.',
    }
  }
}
