import type { Media } from '@/payload-types'

/**
 * Helper to resolve a Payload Media relationship to a safe image URL and alt text.
 * Safe for both Client and Server Components.
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
 * Safe for both Client and Server Components.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
