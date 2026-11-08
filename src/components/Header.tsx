'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { NAV } from '@/content/nav'

import { Arrow } from './Arrow'
import s from './Header.module.css'
import { Logo } from './Logo'


export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on navigation (state reset during render, not in an effect).
  const [navPath, setNavPath] = useState(pathname)
  if (navPath !== pathname) {
    setNavPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`${s.header} ${scrolled || open ? s.solid : ''}`} data-open={open || undefined}>
      <div className={`wrap ${s.bar}`}>
        <Link href="/" className={s.brand} aria-label="NoClue Industries — home">
          <Logo width={118} priority />
        </Link>

        <nav className={s.nav} aria-label="Primary">
          <ol>
            {NAV.map((item, i) => {
              const active = item.href !== '/#process' && pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link href={item.href} className={s.navLink} aria-current={active ? 'page' : undefined}>
                    <span className={s.idx} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className={s.actions}>
          <a className={s.studio} href="https://noclue.studio" rel="noopener">
            Software → Studio <span aria-hidden="true">↗</span>
          </a>
          <Link href="/contact" className={`btn btn--signal ${s.cta}`}>
            Start a project <Arrow />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={s.toggle}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={s.sheet} hidden={!open}>
        <nav aria-label="Mobile">
          <ol>
            {[{ href: '/', label: 'Home' }, ...NAV].map((item, i) => (
              <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  <span className="label">{String(i).padStart(2, '0')}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className={s.sheetFoot}>
          <Link href="/contact" className="btn btn--signal" onClick={() => setOpen(false)}>
            Start a project <Arrow />
          </Link>
          <a className="label label--fg" href="https://noclue.studio" rel="noopener">
            Software, web &amp; automation → noclue.studio ↗
          </a>
        </div>
      </div>
    </header>
  )
}
