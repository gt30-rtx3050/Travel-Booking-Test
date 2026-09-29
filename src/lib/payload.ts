import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type {
  Trip,
  Post,
  Booking,
  ContactSubmission,
  SiteSetting,
  Navigation,
  Homepage,
  Category,
  Testimonial,
  TeamMember,
  Media,
} from '@/payload-types'
import { sendBookingNotifications, sendContactNotifications } from './email'

export interface TripFilterParams {
  destination?: string
  difficulty?: string
  duration?: string
  maxPrice?: number
  featured?: boolean
  limit?: number
}

export interface CreateBookingInput {
  tripId: string
  preferredDate: string
  name: string
  email: string
  phone: string
  numberOfTravelers: number
  message?: string
}

export interface CreateContactInput {
  name: string
  email: string
  phone?: string
  subject: string
  destinationInterest?: string
  inquiryType?: 'general' | 'bespoke' | 'newsletter' | 'press'
  message: string
}

export async function getPayloadClient() {
  return await getPayload({ config })
}

/**
 * Fetch all published trips from Payload Local API with optional filtering.
 * Always enforces status === 'published'.
 */
export async function getPublishedTrips(filters?: TripFilterParams): Promise<Trip[]> {
  const payload = await getPayloadClient()

  const whereConditions: Where[] = [
    {
      status: {
        equals: 'published',
      },
    },
  ]

  if (filters?.featured) {
    whereConditions.push({
      featured: {
        equals: true,
      },
    })
  }

  if (filters?.difficulty && filters.difficulty !== 'all') {
    whereConditions.push({
      difficulty: {
        equals: filters.difficulty,
      },
    })
  }

  const result = await payload.find({
    collection: 'trips',
    where: {
      and: whereConditions,
    },
    depth: 2,
    limit: filters?.limit || 100,
    sort: '-createdAt',
  })

  let docs = result.docs

  // Apply destination, duration range, and maxPrice filters cleanly
  if (filters?.destination && filters.destination !== 'all') {
    const q = filters.destination.toLowerCase().trim()
    docs = docs.filter((trip) => trip.destination.toLowerCase().includes(q))
  }

  if (filters?.duration && filters.duration !== 'all') {
    if (filters.duration === 'short') {
      docs = docs.filter((trip) => trip.duration <= 7)
    } else if (filters.duration === 'medium') {
      docs = docs.filter((trip) => trip.duration >= 8 && trip.duration <= 10)
    } else if (filters.duration === 'long') {
      docs = docs.filter((trip) => trip.duration >= 11)
    }
  }

  if (typeof filters?.maxPrice === 'number' && filters.maxPrice > 0) {
    docs = docs.filter((trip) => (trip.pricing?.fromPrice ?? 0) <= filters.maxPrice!)
  }

  return docs
}

/**
 * Fetch a single published trip by slug with full depth so itinerary images and related trips are populated.
 */
export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'trips',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 3,
    limit: 1,
  })

  return result.docs[0] || null
}

/**
 * Fetch all published blog posts with optional category slug filter.
 * Always enforces status === 'published'.
 */
export async function getPublishedPosts(options?: {
  categorySlug?: string
  limit?: number
}): Promise<Post[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    depth: 2,
    limit: options?.limit || 50,
    sort: '-publishedDate',
  })

  let docs = result.docs

  if (options?.categorySlug && options.categorySlug !== 'all') {
    docs = docs.filter((post) =>
      (post.categories || []).some((cat) =>
        typeof cat === 'object' && cat !== null ? cat.slug === options.categorySlug : false,
      ),
    )
  }

  return docs
}

/**
 * Fetch a single published blog post by slug.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] || null
}

/**
 * Create a booking document in Payload and send email notifications.
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const payload = await getPayloadClient()

  const tripDoc = await payload.findByID({
    collection: 'trips',
    id: input.tripId,
    depth: 0,
  })

  const booking = await payload.create({
    collection: 'bookings',
    data: {
      trip: input.tripId,
      preferredDate: input.preferredDate,
      name: input.name,
      email: input.email,
      phone: input.phone,
      numberOfTravelers: input.numberOfTravelers,
      message: input.message || '',
      status: 'new',
    },
    depth: 1,
  })

  await sendBookingNotifications(payload, {
    bookingId: String(booking.id),
    tripTitle: tripDoc?.title || 'Selected Expedition',
    tripSlug: tripDoc?.slug || '',
    preferredDate: input.preferredDate,
    name: input.name,
    email: input.email,
    phone: input.phone,
    numberOfTravelers: input.numberOfTravelers,
    message: input.message,
  })

  return booking
}

/**
 * Create a contact submission document in Payload and send email notifications.
 */
export async function createContactSubmission(
  input: CreateContactInput,
): Promise<ContactSubmission> {
  const payload = await getPayloadClient()

  const submission = await payload.create({
    collection: 'contact-submissions',
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      subject: input.subject,
      destinationInterest: input.destinationInterest || '',
      inquiryType: input.inquiryType || 'general',
      message: input.message,
      status: 'new',
    },
  })

  await sendContactNotifications(payload, {
    submissionId: String(submission.id),
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    inquiryType: input.inquiryType || 'general',
    destinationInterest: input.destinationInterest,
    message: input.message,
  })

  return submission
}

/**
 * Fetch global SiteSettings from Payload Local API.
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  const payload = await getPayloadClient()
  return await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  })
}

/**
 * Fetch global Navigation from Payload Local API.
 */
export async function getNavigation(): Promise<Navigation> {
  const payload = await getPayloadClient()
  return await payload.findGlobal({
    slug: 'navigation',
    depth: 1,
  })
}

/**
 * Fetch global Homepage content from Payload Local API.
 */
export async function getHomepage(): Promise<Homepage> {
  const payload = await getPayloadClient()
  return await payload.findGlobal({
    slug: 'homepage',
    depth: 2,
  })
}

/**
 * Fetch all blog categories.
 */
export async function getCategories(): Promise<Category[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'categories',
    limit: 50,
    sort: 'name',
  })
  return res.docs
}

/**
 * Fetch featured testimonials with trip relationship populated.
 */
export async function getTestimonials(limit = 6): Promise<Testimonial[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'testimonials',
    where: {
      featured: {
        equals: true,
      },
    },
    depth: 2,
    limit,
  })
  return res.docs
}

/**
 * Fetch team members ordered by display order.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'team-members',
    depth: 2,
    limit: 20,
    sort: 'order',
  })
  return res.docs
}

/**
 * Helper to resolve a Payload Media relationship to a safe image URL and alt text.
 */
export function resolveMediaUrl(
  media: string | Media | null | undefined,
  fallbackUrl = '/media/alpine-hero.svg',
): { url: string; alt: string; caption?: string | null } {
  if (!media) {
    return { url: fallbackUrl, alt: 'Celeste Expeditions' }
  }
  if (typeof media === 'string') {
    return { url: fallbackUrl, alt: 'Celeste Expeditions' }
  }
  const url = media.url || (media.filename ? `/media/${media.filename}` : fallbackUrl)
  return {
    url,
    alt: media.alt || 'Celeste Expeditions',
    caption: media.caption,
  }
}

/**
 * Format currency nicely.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
