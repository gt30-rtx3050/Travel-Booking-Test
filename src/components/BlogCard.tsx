import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowUpRight, User } from 'lucide-react'
import type { Post } from '@/payload-types'
import { resolveMediaUrl } from '@/lib/payload'

interface BlogCardProps {
  post: Post
}

export function BlogCard({ post }: BlogCardProps) {
  const image = resolveMediaUrl(post.featuredImage)
  const authorObj = typeof post.author === 'object' && post.author !== null ? post.author : null
  const categories = (post.categories || [])
    .map((c) => (typeof c === 'object' && c !== null ? c : null))
    .filter(Boolean)

  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-ice"
      >
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categories.length > 0 && categories[0] && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center rounded-full border border-sky bg-white/95 px-3 py-1 text-xs font-medium text-ocean backdrop-blur-sm">
              {categories[0].name}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-ocean">
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan" />
                <span>{formattedDate}</span>
              </span>
            )}
            {post.readTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan" />
                <span>{post.readTime}</span>
              </span>
            )}
          </div>

          <h3 className="font-heading text-xl font-bold tracking-tight text-navy transition-colors group-hover:text-ocean">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-navy">{post.excerpt}</p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-sky/60 pt-4">
          <div className="flex items-center gap-2 text-xs text-navy">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky bg-ice text-ocean">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block font-medium text-navy">
                {authorObj?.name || 'Celeste Editorial'}
              </span>
              {authorObj?.role && (
                <span className="block text-[11px] text-ocean">{authorObj.role}</span>
              )}
            </div>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ocean transition-colors hover:text-navy"
          >
            <span>Read Dispatch</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
