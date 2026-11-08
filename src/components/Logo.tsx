/**
 * The supplied NoClue Industries logo (raster PNG, white on transparent).
 * Served as trimmed, resized copies — never redrawn.
 */
export function Logo({ width = 132, priority = false, className }: { width?: number; priority?: boolean; className?: string }) {
  const ratio = 534 / 1993
  return (
    <picture className={className}>
      <source type="image/webp" srcSet="/brand/logo-200.webp 200w, /brand/logo-320.webp 320w, /brand/logo-480.webp 480w, /brand/logo-640.webp 640w" sizes={`${width}px`} />
      <img
        src="/brand/logo-320.png"
        width={width}
        height={Math.round(width * ratio)}
        alt="NoClue Industries"
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ width, height: 'auto' }}
      />
    </picture>
  )
}
