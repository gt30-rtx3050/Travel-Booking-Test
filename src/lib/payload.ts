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

// ---------------------------------------------------------------------------
// Cached payload client + build-safe fallbacks
// ---------------------------------------------------------------------------

let cachedPayload: Awaited<ReturnType<typeof getPayload>> | null = null
let payloadInitFailed = false

export async function getPayloadClient() {
  if (cachedPayload) return cachedPayload
  if (payloadInitFailed) {
    // Avoid hammering failed connection during build - return cached failure
    // But still attempt once per process if needed
  }
  try {
    const payload = await getPayload({ config })
    cachedPayload = payload
    return payload
  } catch (err) {
    payloadInitFailed = true
    const msg = (err as Error)?.message || String(err)
    // During Next.js build (NEXT_PHASE=phase-production-build) we do NOT want to crash the build
    // because Vercel may have invalid DATABASE_URI. Log and rethrow with more context.
    console.warn('[Payload Client] Failed to initialize Payload / connect to MongoDB:', msg)
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[Payload Client] Build phase detected - throwing will be caught by fallback handlers. Details: bad auth or missing DB.')
    }
    throw err
  }
}

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function logFallback(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  // Only warn, don't crash build
  console.warn(`[Payload Fallback] ${context} failed, returning fallback data. Reason: ${msg}`)
}

// ---------------------------------------------------------------------------
// Fallback data for globals - ensures frontend layout never crashes build
// ---------------------------------------------------------------------------

const fallbackNavigation: Navigation = {
  id: 'fallback-navigation',
  headerItems: [
    { label: 'Expeditions', href: '/trips', description: 'All routes' },
    { label: 'Journal', href: '/blog', description: 'Field notes' },
    { label: 'About', href: '/about', description: 'Our ethos' },
    { label: 'Contact', href: '/contact', description: 'Concierge' },
  ],
  ctaButton: {
    label: 'Explore Expeditions',
    href: '/trips',
  },
  footerColumns: [
    {
      title: 'Explore',
      links: [
        { label: 'All Expeditions', href: '/trips' },
        { label: 'Journal', href: '/blog' },
        { label: 'About Us', href: '/about' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
  ],
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
} as unknown as Navigation

const fallbackSiteSettings: SiteSetting = {
  id: 'fallback-site-settings',
  siteName: 'Celeste Expeditions',
  tagline: 'Architectural Alpine & Polar Voyages',
  contactInfo: {
    email: 'concierge@celeste-expeditions.com',
    bookingsEmail: 'bookings@celeste-expeditions.com',
    phone: '+41 44 580 29 40',
    emergencyPhone: '+41 44 580 29 99',
    address: 'Bahnhofstrasse 42, 8001 Zürich, Switzerland',
    officeHours: 'Mon – Sat · 08:00 – 20:00 CET',
    latitude: 47.3717,
    longitude: 8.5386,
  },
  socials: [],
  footer: {
    description: 'Bespoke and small-group mountain, fjord, and polar expeditions crafted in Zürich by IFMGA guides and polar naturalists.',
    copyrightText: '© 2026 Celeste Expeditions. All rights reserved.',
    certifications: [{ label: 'IFMGA Certified' }, { label: 'AECO Member' }],
  },
  aboutPage: {
    heroSubtitle: 'OUR HERITAGE & ETHOS',
    heroTitle: 'Crafted by Alpinists, Polar Navigators, and Cultural Stewards',
    storyHeadline: 'Precision Logistics Meet Unhurried Wilderness Immersion',
    storyLead: 'Founded in Zürich in 2014, Celeste Expeditions was born from a simple conviction: the world’s most dramatic mountain passes and polar fjords deserve unhurried pacing, architectural shelter, and authentic field scholarship.',
    storyParagraphs: [],
    stats: [],
    values: [],
  },
  legalPages: {
    privacyLastUpdated: 'September 1, 2026',
    privacySections: [],
    termsLastUpdated: 'September 1, 2026',
    termsSections: [],
  },
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
} as unknown as SiteSetting

const fallbackHomepage: Homepage = {
  id: 'fallback-homepage',
  hero: {
    badge: '2026 / 2027 PRIVATE & SMALL-GROUP EXPEDITIONS',
    title: 'Architectural Journeys Across High Alpine & Polar Horizons',
    subtitle: 'We pair IFMGA-certified mountain guides and polar naturalists with private architectural refuges, expedition sailing vessels, and unhurried itineraries limited to 8–12 guests.',
    primaryCtaLabel: 'Explore All Expeditions',
    primaryCtaHref: '/trips',
    secondaryCtaLabel: 'Speak With a Specialist',
    secondaryCtaHref: '/contact',
    highlights: [
      { value: '12', label: 'Guests Max' },
      { value: 'IFMGA', label: 'Certified Guides' },
      { value: '2014', label: 'Founded in Zürich' },
    ],
  },
  featuredTripsSection: {
    eyebrow: 'CURATED DEPARTURES',
    heading: 'Signature Expeditions for the Coming Season',
    subheading: 'Every route is scouted firsthand by our Zürich guiding team.',
  },
  whyUsSection: {
    eyebrow: 'THE CELESTE STANDARD',
    heading: 'Engineered for Depth, Calm, and Uncompromising Field Craft',
    subheading: 'We reject rushed sightseeing in favor of architectural shelters and low guest-to-guide ratios.',
    pillars: [],
  },
  testimonialsSection: {
    eyebrow: 'FIELD PERSPECTIVES',
    heading: 'Reflections from Our Guests',
    subheading: 'Stories from high passes and polar fjords.',
  },
  latestBlogsSection: {
    eyebrow: 'THE EXPEDITION JOURNAL',
    heading: 'Field Dispatches, Route Notes & Equipment Essays',
    subheading: 'Reflections on high-latitude navigation and mountain hospitality.',
  },
  newsletterSection: {
    eyebrow: 'PRIVATE DISPATCHES',
    heading: 'Receive Seasonal Route Releases & Polar Ice Briefings',
    subheading: 'Issued quarterly from Zürich.',
    buttonLabel: 'Subscribe to Dispatches',
    disclaimer: 'Zero promotional clutter; unsubscribe in one click.',
  },
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
} as unknown as Homepage

// ---------------------------------------------------------------------------
// Data fetching helpers - all wrapped in try/catch to prevent build crashes
// ---------------------------------------------------------------------------

/**
 * Fetch all published trips from Payload Local API with optional filtering.
 * Always enforces status === 'published'.
 * Returns empty array on DB failure to allow build to succeed.
 */
export async function getPublishedTrips(filters?: TripFilterParams): Promise<Trip[]> {
  try {
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
  } catch (err) {
    logFallback('getPublishedTrips', err)
    return []
  }
}

/**
 * Fetch a single published trip by slug with full depth so itinerary images and related trips are populated.
 */
export async function getTripBySlug(slug: string): Promise<Trip | null> {
  try {
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
  } catch (err) {
    logFallback(`getTripBySlug(${slug})`, err)
    return null
  }
}

/**
 * Fetch all published blog posts with optional category slug filter.
 * Always enforces status === 'published'.
 */
export async function getPublishedPosts(options?: {
  categorySlug?: string
  limit?: number
}): Promise<Post[]> {
  try {
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
  } catch (err) {
    logFallback('getPublishedPosts', err)
    return []
  }
}

/**
 * Fetch a single published blog post by slug.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
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
  } catch (err) {
    logFallback(`getPostBySlug(${slug})`, err)
    return null
  }
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
 * Returns fallback data if DB unavailable (prevents build crash).
 */
export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({
      slug: 'site-settings',
      depth: 2,
    })
  } catch (err) {
    logFallback('getSiteSettings', err)
    return fallbackSiteSettings
  }
}

/**
 * Fetch global Navigation from Payload Local API.
 * Returns fallback data if DB unavailable.
 */
export async function getNavigation(): Promise<Navigation> {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({
      slug: 'navigation',
      depth: 1,
    })
  } catch (err) {
    logFallback('getNavigation', err)
    return fallbackNavigation
  }
}

/**
 * Fetch global Homepage content from Payload Local API.
 * Returns fallback data if DB unavailable.
 */
export async function getHomepage(): Promise<Homepage> {
  try {
    const payload = await getPayloadClient()
    return await payload.findGlobal({
      slug: 'homepage',
      depth: 2,
    })
  } catch (err) {
    logFallback('getHomepage', err)
    return fallbackHomepage
  }
}

/**
 * Fetch all blog categories.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'categories',
      limit: 50,
      sort: 'name',
    })
    return res.docs
  } catch (err) {
    logFallback('getCategories', err)
    return []
  }
}

/**
 * Fetch featured testimonials with trip relationship populated.
 */
export async function getTestimonials(limit = 6): Promise<Testimonial[]> {
  try {
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
  } catch (err) {
    logFallback('getTestimonials', err)
    return []
  }
}

/**
 * Fetch team members ordered by display order.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'team-members',
      depth: 2,
      limit: 20,
      sort: 'order',
    })
    return res.docs
  } catch (err) {
    logFallback('getTeamMembers', err)
    return []
  }
}

export { resolveMediaUrl, formatCurrency } from './utils'
