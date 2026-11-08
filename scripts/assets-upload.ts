/**
 * Upload local imagery to Garage (S3-compatible object storage).
 *
 *   pnpm assets:upload                 # web assets + local CMS uploads → S3_BUCKET
 *   pnpm assets:upload --source        # …and source files → S3_SOURCE_BUCKET (private archive)
 *   pnpm assets:upload --dry-run       # list what would be uploaded
 *   pnpm assets:upload --force         # re-upload even if the object is unchanged
 *   pnpm assets:upload --only media    # one group: renders | photography | sequences | media | source
 *
 * Reads S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 * (and S3_SOURCE_BUCKET for --source) from the environment / .env.
 *
 * Idempotent: an object is skipped when its ETag equals the local file's MD5
 * (single-part uploads), so re-running only sends what changed.
 *
 * Bucket layout (public bucket, served by Garage's web endpoint at ASSET_URL):
 *   renders/…  photography/…  sequences/…   versioned folders, immutable cache
 *   media/…                                  CMS uploads (same keys Payload's S3 adapter uses)
 * Source archive (private bucket, never public):
 *   visualization/renders/…  website-assets/…   Blender masters, .blend scenes, GLB, photo originals
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { HeadBucketCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const opt = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const DRY = flag('dry-run')
const FORCE = flag('force')
const ONLY = opt('only')
const WITH_SOURCE = flag('source') || ONLY === 'source'
const ROOT = process.cwd()

const env = (k: string) => process.env[k]?.trim() || ''
const required = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']
const missing = required.filter((k) => !env(k))
if (missing.length) {
  console.error(`Missing environment: ${missing.join(', ')} (see .env.example / docs/STORAGE.md)`)
  process.exit(1)
}
if (WITH_SOURCE && !env('S3_SOURCE_BUCKET')) {
  console.error('--source needs S3_SOURCE_BUCKET (a private bucket for the source archive).')
  process.exit(1)
}

const s3 = new S3Client({
  endpoint: env('S3_ENDPOINT'),
  region: env('S3_REGION') || 'garage',
  forcePathStyle: true,
  credentials: { accessKeyId: env('S3_ACCESS_KEY_ID'), secretAccessKey: env('S3_SECRET_ACCESS_KEY') },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const IMMUTABLE = 'public, max-age=31536000, immutable'
const SHORT = 'public, max-age=3600'

type Group = {
  name: string
  bucket: string
  dir: string // local directory, relative to ROOT
  prefix: string // key prefix in the bucket
  cache: string
  include?: (file: string) => boolean
}

const mediaDir = env('MEDIA_DIR') || 'media'
const groups: Group[] = [
  { name: 'renders', bucket: env('S3_BUCKET'), dir: 'public/renders', prefix: 'renders', cache: IMMUTABLE },
  { name: 'photography', bucket: env('S3_BUCKET'), dir: 'public/photography', prefix: 'photography', cache: IMMUTABLE },
  { name: 'sequences', bucket: env('S3_BUCKET'), dir: 'public/sequences', prefix: 'sequences', cache: IMMUTABLE },
  // Payload can overwrite a filename (seed --force), so CMS media get a short cache.
  { name: 'media', bucket: env('S3_BUCKET'), dir: mediaDir, prefix: 'media', cache: SHORT },
]
if (WITH_SOURCE) {
  const binary = (f: string) => /\.(png|jpe?g|webp|avif|glb|gltf|blend|exr|tiff?)$/i.test(f)
  groups.push(
    { name: 'source', bucket: env('S3_SOURCE_BUCKET'), dir: 'visualization/renders', prefix: 'visualization/renders', cache: 'private', include: (f) => !/[\\/]seq[\\/]/.test(f) && !f.endsWith('.blend1') },
    { name: 'source', bucket: env('S3_SOURCE_BUCKET'), dir: 'website-assets', prefix: 'website-assets', cache: 'private', include: binary },
  )
}

const TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.blend': 'application/x-blender',
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.isFile() ? [p] : []
  })
}

const md5 = (buf: Buffer) => createHash('md5').update(buf).digest('hex')

async function unchanged(bucket: string, key: string, hash: string): Promise<boolean> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return head.ETag?.replace(/"/g, '') === hash
  } catch {
    return false
  }
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

async function main() {
  const selected = groups.filter((g) => !ONLY || g.name === ONLY)
  for (const bucket of new Set(selected.map((g) => g.bucket))) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }))
    } catch (e) {
      console.error(`Bucket "${bucket}" is not reachable with these credentials: ${(e as Error).name}`)
      process.exit(1)
    }
  }

  let sent = 0
  let skipped = 0
  let bytes = 0
  for (const g of selected) {
    const base = path.resolve(ROOT, g.dir)
    const files = walk(base).filter((f) => !path.basename(f).startsWith('.') && (!g.include || g.include(f)))
    if (!files.length) {
      console.log(`· ${g.dir}: nothing to upload`)
      continue
    }
    console.log(`→ ${g.dir} (${files.length} files) → s3://${g.bucket}/${g.prefix}/`)
    await pool(files, 8, async (file) => {
      const key = `${g.prefix}/${path.relative(base, file).split(path.sep).join('/')}`
      const body = fs.readFileSync(file)
      if (!FORCE && (await unchanged(g.bucket, key, md5(body)))) {
        skipped++
        return
      }
      if (DRY) {
        console.log(`  would upload ${key} (${(body.length / 1e6).toFixed(2)} MB)`)
      } else {
        await s3.send(
          new PutObjectCommand({
            Bucket: g.bucket,
            Key: key,
            Body: body,
            ContentType: TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
            CacheControl: g.cache,
          }),
        )
      }
      sent++
      bytes += body.length
    })
  }
  console.log(`${DRY ? 'Would upload' : 'Uploaded'} ${sent} files (${(bytes / 1e6).toFixed(1)} MB), ${skipped} unchanged.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
