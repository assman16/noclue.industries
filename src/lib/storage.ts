/**
 * Object storage (Garage, S3-compatible) configuration.
 *
 * Heavy imagery (renders, photography, the assembly sequence) and everything
 * uploaded through the CMS live in ONE bucket that Garage also serves publicly
 * through its static-website endpoint:
 *
 *   s3://<S3_BUCKET>/renders/v2/…        prerendered stills      (pnpm assets:upload)
 *   s3://<S3_BUCKET>/photography/v1/…    licensed photography    (pnpm assets:upload)
 *   s3://<S3_BUCKET>/sequences/da02/v1/… assembly frames         (pnpm assets:upload)
 *   s3://<S3_BUCKET>/media/…             CMS uploads             (Payload storage-s3)
 *
 *   ASSET_URL  = public base of that bucket, e.g. https://assets.noclue.industries
 *
 * Without ASSET_URL the site falls back to /public (local development), and
 * without the S3_* variables Payload keeps uploads on the local disk (MEDIA_DIR).
 * Both are read at runtime, so one Docker image serves any environment.
 */

/** Public base URL for heavy imagery, without trailing slash. Empty = same origin (/public). */
export function assetBase(): string {
  return (process.env.ASSET_URL || '').trim().replace(/\/+$/, '')
}

/** S3 object prefix used for CMS uploads. */
export const MEDIA_PREFIX = 'media'

export function s3Settings() {
  const endpoint = process.env.S3_ENDPOINT?.trim()
  const bucket = process.env.S3_BUCKET?.trim()
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim()
  const enabled = Boolean(endpoint && bucket && accessKeyId && secretAccessKey)
  return {
    enabled,
    bucket: bucket || 'unset',
    config: {
      endpoint,
      region: process.env.S3_REGION?.trim() || 'garage',
      // Garage addresses buckets by path, not by virtual host.
      forcePathStyle: true,
      credentials: { accessKeyId: accessKeyId || '', secretAccessKey: secretAccessKey || '' },
      // Newer AWS SDKs add CRC32 checksums to every request by default; only send
      // them when an operation requires it, which keeps S3-compatible servers happy.
      requestChecksumCalculation: 'WHEN_REQUIRED' as const,
      responseChecksumValidation: 'WHEN_REQUIRED' as const,
    },
  }
}
