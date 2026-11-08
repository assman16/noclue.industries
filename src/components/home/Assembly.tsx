'use client'

import { useEffect, useRef, useState } from 'react'

import { DA01, frameUrl } from '@/content/assembly'
import { RENDERS } from '@/content/renders'

import { RenderImage } from '../RenderImage'
import s from './Assembly.module.css'

type Props = { title: string; body: string; disclaimer: string }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/**
 * Scroll-scrubbed exploded view. 96 prerendered frames (Blender/Cycles) are
 * drawn to a canvas; scroll position picks the frame, so the sequence plays
 * forwards and backwards with the scrollbar. Frames load progressively
 * (a coarse pass first, then the rest) once the section approaches the viewport.
 *
 * Reduced motion → two static renders (closed / exploded) with the part list.
 */
export function Assembly({ title, body, disclaimer }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentRef = useRef(-1)
  const [mode, setMode] = useState<'sequence' | 'static'>('sequence')
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setMode(mq.matches ? 'static' : 'sequence')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (mode !== 'sequence') return
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const N = DA01.frames
    const frames: (HTMLImageElement | null)[] = new Array(N).fill(null)
    let width = DA01.widths[1]
    let started = false
    let raf = 0
    let loadedCount = 0
    let disposed = false

    const pickWidth = () => {
      const need = canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)
      return DA01.widths.find((w) => w >= need * 0.9) ?? DA01.widths[DA01.widths.length - 1]
    }

    const draw = (index: number) => {
      // nearest loaded frame keeps scrubbing smooth while the rest loads
      let img: HTMLImageElement | null = null
      for (let d = 0; d < N && !img; d++) img = frames[index - d] ?? frames[index + d] ?? null
      if (!img) return
      const cw = canvas.width
      const ch = canvas.height
      const ir = img.naturalWidth / img.naturalHeight
      ctx.fillStyle = '#07090a'
      ctx.fillRect(0, 0, cw, ch)
      if (cw / ch < 1.1) {
        // Portrait (phones): the frames are composed with the assembly on the right
        // (desktop text column on the left), so crop to that region and fit it to the width.
        const sx = img.naturalWidth * DA01.portraitCrop[0]
        const sw = img.naturalWidth * (DA01.portraitCrop[1] - DA01.portraitCrop[0])
        const sh = img.naturalHeight
        const dw = cw
        const dh = (sh / sw) * dw
        ctx.drawImage(img, sx, 0, sw, sh, 0, (ch - dh) * 0.66, dw, dh)
        return
      }
      let dw = cw
      let dh = cw / ir
      if (dh < ch) {
        dh = ch
        dw = ch * ir
      }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    const update = () => {
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      const p = clamp(-rect.top / Math.max(1, total))
      const index = Math.round(p * (N - 1))
      setProgress(p)
      if (index !== currentRef.current) {
        currentRef.current = index
        draw(index)
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      currentRef.current = -1
      update()
    }

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = frameUrl(width, i + 1)
        img.onload = () => {
          if (disposed) return resolve()
          frames[i] = img
          loadedCount++
          setLoaded(loadedCount)
          if (i === 0) setReady(true)
          currentRef.current = -1
          update()
          resolve()
        }
        img.onerror = () => resolve()
      })

    const loadAll = async () => {
      if (started) return
      started = true
      width = pickWidth()
      // coarse-to-fine order: 0, 8, 16 … then 4, 12 … then the rest
      const order: number[] = []
      for (const step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i)
      if (!order.includes(N - 1)) order.splice(1, 0, N - 1)
      let cursor = 0
      await Promise.all(
        Array.from({ length: 4 }, async () => {
          while (cursor < order.length && !disposed) await load(order[cursor++])
        }),
      )
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadAll(), { rootMargin: '150% 0px' })
    io.observe(section)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    window.addEventListener('scroll', onScroll, { passive: true })
    resize()

    return () => {
      disposed = true
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [mode])

  const u = clamp((progress - DA01.explodeStart) / (DA01.explodeEnd - DA01.explodeStart))
  const showLabels = u > 0.96
  const frame = Math.round(progress * (DA01.frames - 1)) + 1
  const parts = DA01.labels

  if (mode === 'static') {
    return (
      <section className={`section ${s.static}`} aria-labelledby="assembly-title">
        <div className="wrap">
          <Intro title={title} body={body} disclaimer={disclaimer} />
          <div className={s.pair}>
            <figure>
              <RenderImage asset={RENDERS.da01Assembled} sizes="(max-width: 900px) 100vw, 50vw" />
              <figcaption className="label">Closed</figcaption>
            </figure>
            <figure>
              <RenderImage asset={RENDERS.da01Exploded} sizes="(max-width: 900px) 100vw, 50vw" />
              <figcaption className="label">Exploded</figcaption>
            </figure>
          </div>
          <PartList parts={parts} activeUntil={1} />
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className={s.scroller} aria-labelledby="assembly-title">
      <div className={s.sticky}>
        {/* Poster: the closed assembly. Shown before frames load, and as the no-JS view. */}
        <RenderImage asset={RENDERS.da01Assembled} sizes="100vw" className={s.poster} alt="" style={{ opacity: ready ? 0 : 1 }} />
        <canvas
          ref={canvasRef}
          className={s.canvas}
          role="img"
          aria-label="Animation: the DA-01 demonstration enclosure separating into its parts as you scroll."
        />
        <div className={s.vignette} aria-hidden="true" />

        <div className={`wrap ${s.overlay}`}>
          <Intro title={title} body={body} disclaimer={disclaimer} />

          <div className={s.labels} aria-hidden="true" data-show={showLabels || undefined}>
            {parts.map((p, i) => (
              <span key={p.id} className={s.callout} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transitionDelay: `${i * 45}ms` }}>
                <i />
                <b>{p.label}</b>
              </span>
            ))}
          </div>

          <div className={s.hud}>
            <PartList parts={parts} activeUntil={u} />
            <div className={s.meter}>
              <span className="label">
                Frame {String(frame).padStart(3, '0')} / {DA01.frames}
              </span>
              <span className={s.track}>
                <span style={{ transform: `scaleX(${progress})` }} />
              </span>
              <span className="label">
                {loaded < DA01.frames && loaded > 0
                  ? `Loading ${Math.round((loaded / DA01.frames) * 100)}%`
                  : u >= 1
                    ? 'Exploded'
                    : u <= 0
                      ? 'Assembled'
                      : 'Separating'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Intro({ title, body, disclaimer }: Props) {
  return (
    <div className={s.intro}>
      <p className="label">
        <span className="label--signal">§ 03</span> — Assembly
      </p>
      <h2 id="assembly-title" className={`h2 ${s.title}`}>
        {title}
      </h2>
      <p className={`body ${s.body}`}>{body}</p>
      <p className={s.disclaimer}>
        <span className="tag tag--signal">Demonstration</span>
        <span>{disclaimer}</span>
      </p>
    </div>
  )
}

function PartList({ parts, activeUntil }: { parts: { id: string; label: string; note: string }[]; activeUntil: number }) {
  return (
    <ol className={s.parts} aria-label="Parts">
      {parts.map((p) => {
        const step = DA01.steps.find((st) => st.id === p.id)
        const active = step ? activeUntil >= step.start + (step.end - step.start) * 0.5 : activeUntil >= 0.98
        return (
          <li key={p.id} data-active={active || undefined}>
            <span>{p.label}</span>
            {p.note && <span className={s.note}>{p.note}</span>}
          </li>
        )
      })}
    </ol>
  )
}
