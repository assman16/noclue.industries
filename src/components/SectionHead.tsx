import s from './SectionHead.module.css'

type Props = {
  index: string
  label: string
  title: string
  intro?: string
  id?: string
  children?: React.ReactNode
}

/** "§ 01 — LABEL" index, monumental title, optional intro. */
export function SectionHead({ index, label, title, intro, id, children }: Props) {
  return (
    <header className={s.head}>
      <p className={`label ${s.idx}`} data-reveal>
        <span className={s.sect}>§ {index}</span>
        <span className={s.bar} aria-hidden="true" />
        <span>{label}</span>
      </p>
      <h2 id={id} className={`h2 ${s.title}`} data-reveal style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
        {title}
      </h2>
      {intro && (
        <p className={`body ${s.intro}`} data-reveal style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}>
          {intro}
        </p>
      )}
      {children}
    </header>
  )
}
