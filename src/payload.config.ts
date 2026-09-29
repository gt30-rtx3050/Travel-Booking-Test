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

const databaseUri = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/celeste-voyages'

if (databaseUri.includes('127.0.0.1:27017') || databaseUri.includes('localhost:27017')) {
  await startLocalMongoServer(27017, '127.0.0.1')
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
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'concierge@celeste-expeditions.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'Celeste Expeditions Concierge',
    transport,
  }),
  sharp,
})
