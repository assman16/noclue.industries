import type { Media } from '@/payload-types'

const KIND_LABEL: Record<string, string> = {
  render: 'Render',
  photo: 'Photograph',
  cad: 'CAD capture',
  drawing: 'Drawing',
  diagram: 'Diagram',
}

type Props = {
  media: Media | number | null | undefined
  sizes: string
  priority?: boolean
  className?: string
  showKind?: boolean
  fit?: 'cover' | 'contain'
}

/**
 * CMS image with a srcset from Payload's generated WebP sizes.
 * Optionally labels what kind of image it is (render / photo / CAD …) —
 * visitors should always know whether they are looking at a render.
 */
export function MediaImage({ media, sizes, priority, className, showKind = true, fit = 'cover' }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null
  const order = ['thumb', 'card', 'plate', 'wide'] as const
  const srcSet = order
    .map((k) => media.sizes?.[k])
    .filter((v): v is NonNullable<typeof v> => Boolean(v?.url && v.width))
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ')
  const src = media.sizes?.plate?.url || media.url
  return (
    <figure className={className} style={{ margin: 0, position: 'relative' }}>
      <img
        src={src}
        srcSet={srcSet || undefined}
        sizes={sizes}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        alt={media.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ width: '100%', height: '100%', objectFit: fit }}
      />
      {showKind && media.kind && (
        <span
          className="label"
          style={{ position: 'absolute', left: 12, bottom: 10, background: 'rgb(7 9 10 / 0.7)', padding: '3px 7px', color: 'var(--fg-2)' }}
        >
          {KIND_LABEL[media.kind] ?? media.kind}
        </span>
      )}
    </figure>
  )
}
