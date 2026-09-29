import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Trips } from './collections/Trips'
import { Bookings } from './collections/Bookings'
import { Posts } from './collections/Posts'
import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { Testimonials } from './collections/Testimonials'
import { TeamMembers } from './collections/TeamMembers'

import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'
import { startLocalMongoServer } from '../scripts/local-mongo-server.mjs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Resolve DATABASE_URI with robust validation to prevent build failures
 * on Vercel when the env var contains placeholder characters (< >) or is invalid.
 *
 * Common failure: .env.example contains:
 *   mongodb+srv://kishorshahi67_db_user:<iCfwVupWN0yETuw8>@...
 * The < > brackets are Atlas UI placeholders and must be removed and the password URL-encoded.
 * If left as-is, MongoDB driver throws: bad auth : authentication failed (AtlasError 8000)
 * which crashes `next build` because Payload tries to connect during page data collection.
 *
 * Fix strategy:
 * 1. Detect invalid/placeholder URIs (contains < or > or empty)
 * 2. During Next.js production build (NEXT_PHASE=phase-production-build), always use local shim
 *    so `npm run build` succeeds even without external DB or when Vercel env is misconfigured.
 * 3. Otherwise fallback to local shim with a warning.
 */

function isValidMongoUri(uri: string | undefined): boolean {
  if (!uri) return false
  const trimmed = uri.trim()
  if (!trimmed) return false
  // Placeholder detection - Atlas example uses <password> brackets
  if (trimmed.includes('<') || trimmed.includes('>')) return false
  // Common placeholder tokens
  if (trimmed.includes('your_') || trimmed.includes('example') || trimmed.includes('changeme')) return false
  // Must start with mongodb:// or mongodb+srv://
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) return false
  return true
}

const rawUri = process.env.DATABASE_URI?.trim()
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

// Vercel sets VERCEL=1 at build and runtime. During build we want to avoid requiring Atlas.
const isVercelBuild = isBuildPhase || (process.env.VERCEL === '1' && isBuildPhase)

let databaseUri: string

if (isBuildPhase) {
  // Always use local shim during `next build` so build never depends on external Atlas
  // At runtime on Vercel, NEXT_PHASE is not set, so real DATABASE_URI will be used.
  console.log('[Payload Config] Build phase detected (NEXT_PHASE=phase-production-build). Using local MongoDB shim to allow build without external DB.')
  databaseUri = 'mongodb://127.0.0.1:27017/celeste-voyages'
} else if (!isValidMongoUri(rawUri)) {
  if (rawUri) {
    console.warn(
      `[Payload Config] DATABASE_URI looks invalid or contains placeholder characters. Received: "${rawUri.slice(0, 60)}...". ` +
        'Falling back to local MongoDB shim (mongodb://127.0.0.1:27017/celeste-voyages). ' +
        'If you are using Atlas, ensure you removed < > around password and URL-encoded special chars. ' +
        'Example: mongodb+srv://user:MyP%40ssword@cluster.mongodb.net/db',
    )
  } else {
    console.log('[Payload Config] DATABASE_URI not set, using local MongoDB shim.')
  }
  databaseUri = 'mongodb://127.0.0.1:27017/celeste-voyages'
} else {
  databaseUri = rawUri!
}

if (databaseUri.includes('127.0.0.1:27017') || databaseUri.includes('localhost:27017')) {
  try {
    await startLocalMongoServer(27017, '127.0.0.1')
  } catch (err) {
    console.warn('[Payload Config] Failed to start local MongoDB shim, will attempt to continue:', (err as Error)?.message)
    // Don't crash build if shim fails to start - payload will retry connection
  }
}

const hasSmtpCredentials = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const transport = hasSmtpCredentials
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    })

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Celeste Expeditions CMS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Trips,
    Bookings,
    Posts,
    Authors,
    Categories,
    ContactSubmissions,
    Testimonials,
    TeamMembers,
  ],
  globals: [SiteSettings, Navigation, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'celeste-alpine-coastal-secret-key-2026-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: databaseUri,
    transactionOptions: false,
    // Increase timeouts slightly and allow build to not hang forever on bad auth
    connectOptions: {
      serverSelectionTimeoutMS: 5000,
      // Don't retry indefinitely during build
      maxPoolSize: 5,
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'concierge@celeste-expeditions.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Celeste Expeditions Concierge',
    transport,
  }),
  sharp,
})
