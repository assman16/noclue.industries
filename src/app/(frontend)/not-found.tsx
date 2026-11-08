import Link from 'next/link'

import { Arrow } from '@/components/Arrow'

export const metadata = { title: 'Test chamber not found — NoClue Industries', robots: { index: false } }

export default function NotFound() {
  return (
    <section className="wrap" style={{ minHeight: '88svh', display: 'grid', alignContent: 'center', gap: 28, paddingTop: 'var(--header-h)' }}>
      <p className="label">
        <span className="label--signal">Error 404</span> — Test chamber not found
      </p>
      <h1 className="display" style={{ fontSize: 'clamp(3rem, 12vw, 12rem)' }}>
        No clue.
      </h1>
      <p className="lede">
        The page you requested has been relocated, decommissioned, or never passed testing. Please proceed to the nearest exit. There is no
        cake.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn--signal">
          Return to the facility <Arrow />
        </Link>
        <Link href="/contact" className="btn">
          Report an anomaly
        </Link>
      </div>
    </section>
  )
}
