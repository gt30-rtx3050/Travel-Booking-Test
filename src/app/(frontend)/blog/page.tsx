import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getPublishedPosts, getCategories } from '@/lib/payload'
import { BlogCard } from '@/components/BlogCard'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Expedition Journal — Field Dispatches & Route Notes',
  description:
    'Long-form essays, high-altitude equipment guides, and polar field dispatches written by Celeste Expeditions mountain guides and naturalists.',
}

interface BlogPageProps {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const { category = 'all' } = await searchParams

  const [categories, posts] = await Promise.all([
    getCategories(),
    getPublishedPosts({ categorySlug: category }),
  ])

  return (
    <div className="bg-white text-navy">
      {/* Header */}
      <section className="border-b border-sky/60 bg-ice/35 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-ocean">
              <BookOpen className="h-3.5 w-3.5 text-cyan" />
              <span>The Celeste Journal</span>
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Field Dispatches, Alpinism & Polar Essays
            </h1>
            <p className="text-base leading-relaxed text-navy sm:text-lg">
              Reflections on high-latitude navigation, technical layering systems, and architectural mountain hospitality from our guiding collective.
            </p>
          </FadeIn>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Link
              href="/blog"
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                category === 'all'
                  ? 'border-ocean bg-ocean text-white'
                  : 'border-sky bg-white text-navy hover:bg-ice'
              }`}
            >
              All Dispatches
            </Link>
            {categories.map((cat) => {
              const isActive = category === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-sky bg-white text-navy hover:bg-ice'
                  }`}
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-sky bg-ice/30 p-12 text-center space-y-4">
              <h2 className="font-heading text-2xl font-bold text-navy">
                No Journal Articles Found in This Category
              </h2>
              <p className="text-sm text-navy">
                Select another editorial category above to explore our field dispatches.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full bg-ocean px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy"
              >
                View All Articles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, idx) => (
                <FadeIn key={post.id} delay={idx * 0.06}>
                  <BlogCard post={post} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
