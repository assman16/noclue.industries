'use client'

import { useEffect } from 'react'

/** A small note for anyone who opens the developer console. */
export function ConsoleNote() {
  useEffect(() => {
    const w = window as unknown as { __nciNote?: boolean }
    if (w.__nciNote) return
    w.__nciNote = true
    console.log(
      '%cNOCLUE INDUSTRIES%c\nTest subject detected in the developer console.\nThis page was engineered, not generated. If you read schematics for fun, we should talk: /contact\n\nStatus: certified probably fine.',
      'font: 900 20px/1.2 sans-serif; letter-spacing:-0.03em; color:#ff5a1f',
      'font: 12px/1.6 monospace; color:#a8b1b4',
    )
  }, [])
  return null
}
