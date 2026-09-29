import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, User, Award } from 'lucide-react'
import { getPublishedPosts, getPostBySlug, resolveMediaUrl } from '@/lib/payload'
import { RichText } from '@/components/RichText'
import { BlogCard } from '@/components/BlogCard'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

interface SingleBlogPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts()
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: SingleBlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  const ogMedia = resolveMediaUrl(post.seo?.ogImage || post.featuredImage)
  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedDate,
      images: [{ url: ogMedia.url, alt: ogMedia.alt }],
    },
  }
}

export default async function SingleBlogPostPage({ params }: SingleBlogPageProps) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts({ limit: 4 }),
  ])

  if (!post) {
    notFound()
  }

  const featuredMedia = resolveMediaUrl(post.featuredImage)
  const authorObj = typeof post.author === 'object' && post.author !== null ? post.author : null
  const categories = (post.categories || [])
    .map((c) => (typeof c === 'object' && c !== null ? c : null))
    .filter(Boolean)

  const relatedPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 3)

  const formattedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedDate,
    author: {
      '@type': 'Person',
      name: authorObj?.name || 'Celeste Editorial',
      jobTitle: authorObj?.role || 'Field Guide',
    },
    image: featuredMedia.url,
  }

  return (
    <div className="bg-white text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article Header */}
      <article>
        <header className="border-b border-sky/60 bg-ice/35 py-12 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ocean transition-colors hover:text-navy"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Expedition Journal</span>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) =>
                  cat ? (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${cat.slug}`}
                      className="rounded-full border border-sky bg-white px-3.5 py-1 text-xs font-semibold text-ocean hover:bg-ice"
                    >
                      {cat.name}
                    </Link>
                  ) : null,
                )}
              </div>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-navy sm:text-5xl">
              {post.title}
            </h1>

            <p className="text-base leading-relaxed text-navy sm:text-lg">{post.excerpt}</p>

            {/* Meta & Author Strip */}
            <div className="flex flex-wrap items-center gap-6 border-t border-sky/70 pt-6 text-xs text-ocean">
              {authorObj && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky bg-white text-ocean">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-navy">{authorObj.name}</span>
                    <span className="block text-[11px] text-ocean">{authorObj.role}</span>
                  </div>
                </div>
              )}

              {formattedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-cyan" />
                  <span>{formattedDate}</span>
                </span>
              )}

              {post.readTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan" />
                  <span>{post.readTime}</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mx-auto -mt-6 max-w-5xl px-6">
          <div className="overflow-hidden rounded-2xl border border-sky bg-white p-2.5 shadow-card">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-ice">
              <Image
                src={featuredMedia.url}
                alt={featuredMedia.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Rich Text Article Body */}
        <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20 space-y-12">
          <FadeIn>
            <RichText content={post.content} />
          </FadeIn>

          {/* Author Bio Dossier Box */}
          {authorObj && (
            <div className="rounded-2xl border border-sky bg-ice/40 p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sky bg-white text-ocean">
                  <Award className="h-6 w-6 text-cyan" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-navy">
                      Written by {authorObj.name}
                    </h3>
                    {authorObj.credentials && (
                      <span className="rounded-full border border-sky bg-white px-3 py-0.5 text-xs font-medium text-ocean">
                        {authorObj.credentials}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ocean">
                    {authorObj.role}
                  </p>
                  <p className="text-sm leading-relaxed text-navy">{authorObj.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Dispatches */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-sky/60 bg-ice/25 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 space-y-10">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
                  Continue Reading
                </span>
                <h2 className="mt-1 font-heading text-3xl font-bold text-navy">
                  More From the Expedition Journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs font-semibold uppercase tracking-wider text-ocean hover:text-navy"
              >
                All Articles →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedPosts.map((relPost) => (
                <BlogCard key={relPost.id} post={relPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
