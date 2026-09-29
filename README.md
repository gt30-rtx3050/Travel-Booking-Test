# Celeste Expeditions

High-end multipage adventure & luxury travel booking platform. Next.js 15 (App Router) front end on
Payload CMS 3, with trips, a journal, testimonials, team pages, and booking/contact forms wired to
the Payload Local API.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15.5, React 19, App Router |
| CMS | Payload 3.60 (Local API only — no REST/GraphQL queries from components) |
| Database | MongoDB, via `@payloadcms/db-mongodb` |
| Rich text | `@payloadcms/richtext-lexical` |
| Styling | Tailwind CSS 3.4, `framer-motion`, `lucide-react` |
| Forms | `react-hook-form` + `zod` |
| Email | Resend, with a Nodemailer fallback |

Requires Node 18.18 or newer (developed against Node 22 / npm 10). A MongoDB install is **not**
needed for local development — see [How the database is resolved](#how-the-database-is-resolved).

## Quick start

```bash
npm install
cp .env.example .env   # optional for local work; sane fallbacks cover it
npm run seed           # writes the dev database + all sample content
npm run dev            # http://localhost:3000 · admin UI at /admin
```

The seeded admin account is `admin@celeste-expeditions.com` / `CelesteExpeditions2026!`
(set in `scripts/seed.ts`). It is a development credential only — change it anywhere real.

## Install scripts

npm 11.16+ tracks which dependencies are allowed to run `postinstall`/`install` scripts. The
`allowScripts` block in `package.json` names the three packages in this tree that need to: `esbuild`
(used by `tsx` for `npm run seed` and by Payload's own CLI), `sharp` (Payload image processing), and
`fsevents` (macOS file watching). Without the block, `npm install` prints an
`install-scripts ... not yet covered by allowScripts` warning, and npm 12 will hard-block those
scripts instead of warning.

The entries are name-only rather than version-pinned, so a routine `npm update` does not reintroduce
the warning. When you add a dependency with an install script, review it and then either run
`npm approve-scripts <pkg> --no-allow-scripts-pin` or add the entry by hand.

## How the database is resolved

`src/payload.config.ts` picks the connection string in one step:

1. `DATABASE_URI`, if set.
2. Otherwise `mongodb://127.0.0.1:27017/celeste-voyages`.

When the URI points at `127.0.0.1:27017` or `localhost:27017`, the config boots
`scripts/local-mongo-server.mjs` in-process: a small MongoDB wire-protocol shim that persists to
`.data/mongo-store.json` (gitignored). Practical consequences:

- No `mongod` to install, and seeded data survives restarts.
- Wipe the database with `rm .data/mongo-store.json`, then re-run `npm run seed`.
- The shim binds `127.0.0.1:27017` and only one process can own that port. While `npm run dev` is
  up, `npm run seed` connects to the already-running instance instead of starting a second one.
- Any non-local `DATABASE_URI` skips the shim entirely, so pointing at Atlas or a replica set is a
  one-line env change.

`PAYLOAD_SECRET` also has a dev fallback; set it explicitly in any deployed environment.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Starts the local DB shim, then `next dev` on `0.0.0.0:3000` |
| `npm run dev:next` | `next dev` only — use with an external `DATABASE_URI` |
| `npm run seed` | Idempotent content seeding (`tsx scripts/seed.ts`) |
| `npm run build` / `npm run start` | Production build and start (start bootstraps the local DB too) |
| `npm run typecheck` | `tsc --noEmit` over `src` and `scripts` |
| `npm run generate:types` | Regenerates `src/payload-types.ts` after collection changes |
| `npm run generate:importmap` | Regenerates `src/app/(payload)/admin/importMap.js` |

Run both `generate:*` scripts after editing a collection or global and commit the output, so
`payload-types.ts` and the admin import map stay in step with the config.

## Content model

**Collections:** `trips`, `bookings`, `posts`, `authors`, `categories`, `contact-submissions`,
`testimonials`, `team-members`, `media`, `users`.

**Globals:** `site-settings`, `navigation`, `homepage`.

Trips and posts are status-gated: every read helper in `src/lib/payload.ts` forces
`status === 'published'`, so drafts never leak to the public site.

## Routes

| Path | Contents |
| --- | --- |
| `/` | Homepage, assembled from the `homepage` global |
| `/trips`, `/trips/[slug]` | Expedition catalogue with filtering, plus detail pages |
| `/blog`, `/blog/[slug]` | Journal index and articles |
| `/about`, `/contact` | Team/testimonials and the enquiry form |
| `/thank-you` | Booking and contact confirmation landing |
| `/privacy`, `/terms` | Legal pages |
| `/admin` | Payload admin |
| `/sitemap.xml`, `/robots.txt` | Generated from `NEXT_PUBLIC_SITE_URL` |

## Seeding

`npm run seed` is safe to re-run. It creates 15 media assets, 6 trips, 4 journal posts,
4 categories, 3 authors, 4 team members, 3 testimonials, the admin user, and all three globals,
skipping any record that already exists.

Illustrations are generated as SVG and saved into `public/media/`, which is tracked in this repo.
Payload's local disk storage de-duplicates on write by appending `-1`, `-2`, … when a file of that
name is already present, so seeding a fresh database against a checkout that already ships these
assets used to leave duplicate `*-1.svg` files in the working tree. `ensureMedia` now clears a
byte-identical file on disk before uploading, which keeps the tree clean and the media documents on
their canonical filenames. A file that differs from the generated art is never overwritten — the
seed warns and lets Payload store the new asset under a de-duplicated name.

## Email

With `RESEND_API_KEY` set, booking and contact submissions send a guest confirmation and an admin
notification through Resend. Without it, `payload.sendEmail` falls back to the Nodemailer adapter,
which runs in JSON transport mode unless `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are all present —
messages are serialized, never delivered. Delivery failures are logged as warnings and do not fail
the request; the submission is stored regardless.
