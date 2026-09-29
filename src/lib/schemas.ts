import { z } from 'zod'

export const bookingFormSchema = z.object({
  tripId: z.string().min(1, 'Expedition selection is required'),
  tripTitle: z.string().optional(),
  preferredDate: z.string().min(3, 'Please select or enter a preferred departure date'),
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid telephone number'),
  numberOfTravelers: z.coerce
    .number()
    .int()
    .min(1, 'At least 1 traveler is required')
    .max(24, 'Maximum 24 travelers per inquiry'),
  message: z.string().max(2000, 'Message must be under 2000 characters').optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Please provide a brief subject'),
  destinationInterest: z.string().optional(),
  inquiryType: z.enum(['general', 'bespoke', 'newsletter', 'press']).default('general'),
  message: z.string().min(10, 'Please share a few details about your inquiry (at least 10 characters)'),
})

export type ContactFormValues = z.input<typeof contactFormSchema>

export const newsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
})

export type NewsletterFormValues = z.infer<typeof newsletterFormSchema>
