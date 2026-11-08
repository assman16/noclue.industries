import type { HomeContent } from '@/lib/data'

import { SectionHead } from '../SectionHead'
import s from './Process.module.css'

/**
 * The engineering process as a drawing sheet: six stages connected by a
 * PCB-style trace with vias. The trace "routes" itself as the section scrolls
 * into view (CSS scroll timeline where supported, static otherwise).
 */
export function Process({ home }: { home: HomeContent }) {
  const steps = home.processSteps
  return (
    <section id="process" className={`section sheet ${s.process}`} aria-labelledby="process-title">
      <div className={s.frame} aria-hidden="true">
        <span className={`deco ${s.zoneTop}`}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map((z) => (
            <i key={z}>{z}</i>
          ))}
        </span>
        <span className={`deco ${s.zoneSide}`}>
          {['1', '2', '3', '4'].map((z) => (
            <i key={z}>{z}</i>
          ))}
        </span>
      </div>

      <div className="wrap">
        <SectionHead index="02" label="Process" title={home.processTitle} intro={home.processIntro} id="process-title" />

        <div className={s.track}>
          <svg className={s.trace} viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 20 H1200" pathLength={1} />
          </svg>
          <ol className={s.steps}>
          {steps.map((step, i) => (
            <li key={step.title} className={s.step} data-reveal style={{ '--reveal-delay': `${i * 0.07}s` } as React.CSSProperties}>
              <span className={s.via} aria-hidden="true" />
              <span className={`label ${s.num}`}>Stage {String(i + 1).padStart(2, '0')}</span>
              <h3 className={s.title}>{step.title}</h3>
              <p className={s.body}>{step.body}</p>
              {step.output && (
                <p className={s.output}>
                  <span className="label">Output</span>
                  {step.output}
                </p>
              )}
            </li>
          ))}
          </ol>
        </div>

        <div className={s.titleBlock} aria-hidden="true">
          <div>
            <span className="deco">Sheet</span>
            <span>02 / 06</span>
          </div>
          <div>
            <span className="deco">Title</span>
            <span>Process — concept to hardware</span>
          </div>
          <div>
            <span className="deco">Scale</span>
            <span>NTS</span>
          </div>
          <div>
            <span className="deco">Drawn</span>
            <span>NoClue Industries</span>
          </div>
        </div>
      </div>
    </section>
  )
}
