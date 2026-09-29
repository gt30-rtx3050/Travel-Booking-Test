import React from 'react'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 space-y-10">
      <div className="h-10 w-64 animate-pulse rounded-full bg-ice" />
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-ice/80" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-96 animate-pulse rounded-2xl border border-sky/60 bg-ice/40"
          />
        ))}
      </div>
    </div>
  )
}
