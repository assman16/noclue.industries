import Link from 'next/link'

import { NAV } from '@/content/nav'
import type { SiteSettings } from '@/lib/data'

import s from './Footer.module.css'
import { Logo } from './Logo'

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const tel = settings.phone?.replace(/[^+\d]/g, '')
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.statement} aria-hidden="true">
          <span className="display">Hardware,</span>
          <span className="display">
            built <em>whole.</em>
          </span>
        </div>

        <div className={s.grid}>
          <div className={s.brandCol}>
            <Logo width={168} />
            <p className={s.tagline}>
              Electronics, firmware and mechanical engineering — the hardware counterpart to{' '}
              <a className="link" href="https://noclue.studio" rel="noopener">
                NoClue Studio
              </a>
              .
            </p>
          </div>

          <nav className={s.col} aria-label="Footer">
            <h2 className="label">Navigate</h2>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.col}>
            <h2 className="label">Contact</h2>
            <ul>
              <li>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </li>
              {settings.phone && (
                <li>
                  <a href={`tel:${tel}`}>{settings.phone}</a>
                </li>
              )}
              {settings.links?.map((l) => (
                <li key={l.url}>
                  <a href={l.url} rel="noopener">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={s.col}>
            <h2 className="label">Operator</h2>
            <address className={s.operator}>
              {settings.operatorName}
              <br />
              {settings.operatorAddress.split('\n').map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              {settings.companyId && <span>IČO {settings.companyId}</span>}
              {settings.taxId && <span> · DIČ {settings.taxId}</span>}
              {settings.vatId && <span> · IČ DPH {settings.vatId}</span>}
            </address>
          </div>
        </div>

        <div className={s.base}>
          <p className="label">
            © {year} NoClue Industries · {settings.operatorName}
          </p>
          <ul className={s.legal}>
            <li>
              <Link className="label label--fg" href="/legal">
                Legal information
              </Link>
            </li>
            <li>
              <Link className="label label--fg" href="/privacy">
                Privacy
              </Link>
            </li>
          </ul>
          <p className={s.stamp} title="Verbatim from the SA-100 rev 3.0 silkscreen.">
            <span>certified probably fine</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
