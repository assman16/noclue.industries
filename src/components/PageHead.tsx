import s from './PageHead.module.css'

/** Inner-page header: index label, monumental title, intro. */
export function PageHead({ label, title, intro, meta }: { label: string; title: string; intro?: string | null; meta?: React.ReactNode }) {
  return (
    <header className={`wrap ${s.head}`}>
      <p className="label" data-reveal>
        <span className="label--signal">§</span> {label}
      </p>
      <h1 className={`display ${s.title}`} data-reveal="mask">
          <span>{title}</span>
      </h1>
      {intro && (
        <p className={`lede ${s.intro}`} data-reveal style={{ '--reveal-delay': '0.2s' } as React.CSSProperties}>
          {intro}
        </p>
      )}
      {meta && <div className={s.meta}>{meta}</div>}
      <hr className="rule" data-reveal="rule" />
    </header>
  )
}
