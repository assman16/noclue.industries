import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/**
 * Liveness + readiness probe for Docker / Coolify.
 * 200 when the app is up and PostgreSQL answers; 503 otherwise.
 */
export async function GET() {
  const started = Date.now()
  try {
    const payload = await getPayload({ config })
    const db = payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<unknown> } }
    await db.drizzle.execute(sql`select 1`)
    return Response.json({ status: 'ok', db: 'ok', ms: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error('[healthz] database check failed', e instanceof Error ? e.message : e)
    return Response.json({ status: 'error', db: 'unreachable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
