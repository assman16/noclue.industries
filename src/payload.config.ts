import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Home } from './globals/Home'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

/** SMTP is optional: without SMTP_HOST, Payload logs emails to the console and inquiries are still stored. */
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'no-reply@noclue.industries',
      defaultFromName: process.env.SMTP_FROM_NAME || 'NoClue Industries',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      },
    })
  : undefined

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET must be set in production.')
}

export default buildConfig({
  serverURL,
  secret: process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret-change-me',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — NoClue Industries',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Projects, Services, Pages, Media, Inquiries, Users],
  globals: [Home, SiteSettings],
  localization: {
    // English only for now. Add { label: 'Slovenčina', code: 'sk' } here to enable translations.
    locales: [{ label: 'English', code: 'en' }],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Schema push only in development. Production applies committed migrations on boot.
    push: process.env.NODE_ENV !== 'production' && process.env.PAYLOAD_DB_PUSH !== 'false',
    prodMigrations: migrations,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email,
  sharp,
  graphQL: { disable: true },
  cors: [serverURL],
  csrf: [serverURL],
  upload: { limits: { fileSize: 25 * 1024 * 1024 } },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
})
