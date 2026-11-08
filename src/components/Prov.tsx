import type { PhotoAsset } from '@/content/photography'
import { PROVENANCE_LABEL, type Provenance } from '@/content/renders'

/**
 * Provenance tag. Every image on the site states what it is: NoClue hardware
 * (rendered from real design data), a demonstration model, or licensed
 * illustrative photography (with the photographer credited).
 */
export function Prov({ kind, photo, className = '' }: { kind: Provenance; photo?: PhotoAsset; className?: string }) {
  return (
    <span className={`prov prov--${kind} ${className}`}>
      {PROVENANCE_LABEL[kind]}
      {photo && (
        <>
          {' · '}
          <a href={photo.source} rel="noopener" style={{ color: 'inherit' }}>
            {photo.credit.name} / Unsplash
          </a>
        </>
      )}
    </span>
  )
}
