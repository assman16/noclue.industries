import { RENDER_BASE, type RenderAsset } from '@/content/renders'

type Props = {
  asset: RenderAsset
  sizes: string
  priority?: boolean
  className?: string
  alt?: string
  style?: React.CSSProperties
}

/** AVIF → WebP <picture> for renders and graded photography, with intrinsic size to avoid layout shift. */
export function RenderImage({ asset, sizes, priority, className, alt, style }: Props) {
  const base = asset.base ?? RENDER_BASE
  const set = (ext: string) => asset.widths.map((w) => `${base}/${asset.name}-${w}.${ext} ${w}w`).join(', ')
  const fallback = `${base}/${asset.name}-${asset.widths[Math.min(1, asset.widths.length - 1)]}.webp`
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={fallback}
        width={asset.width}
        height={asset.height}
        alt={alt ?? asset.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={style}
      />
    </picture>
  )
}
