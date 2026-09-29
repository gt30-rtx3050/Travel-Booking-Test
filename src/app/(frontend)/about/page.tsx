import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Compass, Award, ArrowUpRight } from 'lucide-react'
import { getSiteSettings, getTeamMembers, resolveMediaUrl } from '@/lib/payload'
import { DynamicIcon } from '@/components/DynamicIcon'
import { FadeIn } from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Heritage, Guiding Collective & Ethos',
  description:
    'Meet the IFMGA-certified alpine guides, polar naturalists, and expedition architects behind Celeste Expeditions in Zürich.',
}

export default async function AboutPage() {
  const [siteSettings, teamMembers] = await Promise.all([
    getSiteSettings(),
    getTeamMembers(),
  ])

  const about = siteSettings?.aboutPage

  return (
    <div className="bg-white text-navy">
      {/* 1. HERO SECTION */}
      <section className="border-b border-sky/60 bg-ice/35 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ocean">
              <Compass className="h-3.5 w-3.5 text-cyan" />
              <span>{about?.heroSubtitle || 'OUR HERITAGE & ETHOS'}</span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
              {about?.heroTitle ||
                'Crafted by Alpinists, Polar Navigators, and Cultural Stewards'}
            </h1>

            <p className="text-base leading-relaxed text-navy sm:text-lg">
              {about?.storyLead ||
                'Founded in Zürich in 2014, Celeste Expeditions was born from a simple conviction: the world’s most dramatic mountain passes and polar fjords deserve unhurried pacing, architectural shelter, and authentic field scholarship.'}
            </p>
          </FadeIn>

          {/* Key Milestones & Figures */}
          {about?.stats && about.stats.length > 0 && (
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.stats.map((stat, idx) => (
                <FadeIn
                  key={idx}
                  delay={idx * 0.06}
                  className="rounded-2xl border border-sky bg-white p-6 shadow-soft"
                >
                  <p className="font-heading text-3xl font-bold text-navy">{stat.value}</p>
                  <p className="mt-1 font-heading text-sm font-semibold text-ocean">
                    {stat.label}
                  </p>
                  {stat.detail && <p className="mt-2 text-xs text-navy">{stat.detail}</p>}
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="border-b border-sky/60 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 space-y-8">
          <FadeIn className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              01 · The Celeste Origin
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              {about?.storyHeadline ||
                'Precision Logistics Meet Unhurried Wilderness Immersion'}
            </h2>
          </FadeIn>

          <div className="space-y-5">
            {(about?.storyParagraphs || []).map((item, idx) => (
              <FadeIn key={idx} delay={idx * 0.06}>
                <p className="text-base leading-relaxed text-navy">{item.paragraph}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES SECTION */}
      <section className="border-b border-sky/60 bg-ice/30 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <FadeIn className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
              02 · Guiding Principles
            </span>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Our Field Values & Stewardship Charter
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {(about?.values || []).map((val, idx) => (
              <FadeIn
                key={idx}
                delay={idx * 0.06}
                className="rounded-2xl border border-sky/80 bg-white p-6 shadow-soft space-y-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky bg-ice text-ocean">
                  <DynamicIcon name={val.icon} className="h-5 w-5 text-ocean" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy">{val.title}</h3>
                <p className="text-sm leading-relaxed text-navy">{val.description}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPEDITION TEAM SECTION */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <FadeIn className="flex flex-col items-start justify-between gap-6 border-b border-sky/60 pb-8 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-ocean">
                03 · Leadership & Field Guides
              </span>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Meet Our Expedition Architects & IFMGA Guides
              </h2>
              <p className="text-sm leading-relaxed text-navy sm:text-base">
                Every Celeste departure is led personally by full-time members of our guiding collective—never outsourced to seasonal contractors.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-6 py-3 text-xs font-semibold text-white shadow-soft transition-colors hover:bg-navy"
            >
              <span>Consult With Our Team</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, idx) => {
              const photo = resolveMediaUrl(member.photo, '/media/team-guide.svg')
              return (
                <FadeIn
                  key={member.id}
                  delay={idx * 0.07}
                  className="flex flex-col overflow-hidden rounded-2xl border border-sky/80 bg-white shadow-soft"
                >
                  <div className="relative aspect-[4/4] w-full bg-ice">
                    <Image
                      src={photo.url}
                      alt={photo.alt || member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                    {member.yearsExperience && (
                      <div className="absolute top-3 right-3">
                        <span className="rounded-full border border-sky bg-white/95 px-3 py-1 text-[11px] font-semibold text-ocean">
                          {member.yearsExperience} Yrs Field Exp
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-heading text-xl font-bold text-navy">{member.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ocean">
                        {member.role}
                      </p>
                      {member.specialty && (
                        <p className="text-xs text-ocean">Specialty: {member.specialty}</p>
                      )}
                      <p className="pt-1 text-sm leading-relaxed text-navy">{member.bio}</p>
                    </div>

                    {member.certifications && (
                      <div className="flex items-center gap-2 border-t border-sky/60 pt-3 text-xs text-ocean">
                        <Award className="h-3.5 w-3.5 shrink-0 text-cyan" />
                        <span className="truncate">{member.certifications}</span>
                      </div>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
