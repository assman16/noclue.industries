'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * One shared IntersectionObserver for every [data-reveal] element.
 * Elements get `.is-in` once, when they enter the viewport. With reduced motion
 * the CSS never hides them in the first place.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
