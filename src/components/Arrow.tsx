export function Arrow({ className = 'arrow' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 18 10" fill="none" aria-hidden="true">
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
