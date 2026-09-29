import type { MetadataRoute } from 'next'
import { getPublishedTrips, getPublishedPosts } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/trips',
    '/blog',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const [trips, posts] = await Promise.all([
      getPublishedTrips(),
      getPublishedPosts(),
    ])

    const tripRoutes: MetadataRoute.Sitemap = trips.map((trip) => ({
      url: `${baseUrl}/trips/${trip.slug}`,
      lastModified: new Date(trip.updatedAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...tripRoutes, ...postRoutes]
  } catch {
    return staticRoutes
  }
}
