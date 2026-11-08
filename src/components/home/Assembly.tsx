'use client'

import { useEffect, useRef, useState } from 'react'

import { ASSEMBLY, frameUrl } from '@/content/assembly'
import { RENDERS } from '@/content/renders'

import { Prov } from '../Prov'
import { RenderImage } from '../RenderImage'
import s from './Assembly.module.css'

type Props = { title: string; body: string; disclaimer: string }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/**
 * ACT III: the assembly. 120 prerendered frames (Blender/Cycles) drawn to a
 * canvas; scroll position picks the frame, so the module comes apart scrolling
 * down and goes back together scrolling up. Frames load coarse-to-fine once
 * the section approaches the viewport.
 *
 * Reduced motion: static closed / exploded renders and a part list.
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

    const N = ASSEMBLY.frames
    const frames: (HTMLImageElement | null)[] = new Array(N).fill(null)
    let width = ASSEMBLY.widths[1]
    let started = false
    let raf = 0
    let loadedCount = 0
    let disposed = false

    const pickWidth = () => {
      const need = canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)
      return ASSEMBLY.widths.find((w) => w >= need * 0.85) ?? ASSEMBLY.widths[ASSEMBLY.widths.length - 1]
    }

    const draw = (index: number) => {
      let img: HTMLImageElement | null = null
      for (let d = 0; d < N && !img; d++) img = frames[index - d] ?? frames[index + d] ?? null
      if (!img) return
      const cw = canvas.width
      const ch = canvas.height
      const ir = img.naturalWidth / img.naturalHeight
      ctx.fillStyle = '#07090a'
      ctx.fillRect(0, 0, cw, ch)
      let dw: number
      let dh: number
      if (cw / ch < 1.1) {
        // Portrait: the assembly runs horizontally, so fit the frame to the width
        // (slightly zoomed) and sit it in the lower-middle of the screen.
        dw = cw * 1.22
        dh = dw / ir
        ctx.drawImage(img, (cw - dw) / 2, ch * 0.56 - dh / 2, dw, dh)
        return
      }
      dw = cw
      dh = cw / ir
      if (dh < ch) {
        dh = ch
        dw = ch * ir
      }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    const update = () => {
      const rect = section.getBoundingClientRect()
      const total = section.offsetHeight - window.innerHeight
      // The sequence completes at 86 % of the pinned scroll; the rest is a hold on the
      // labelled, fully exploded state before the section releases.
      const p = clamp(-rect.top / Math.max(1, total) / 0.86)
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
      const order: number[] = [0]
      for (const step of [12, 6, 3, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i)
      if (!order.includes(N - 1)) order.splice(1, 0, N - 1)
      let cursor = 0
      await Promise.all(
        Array.from({ length: 5 }, async () => {
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

  const u = clamp((progress - ASSEMBLY.explodeStart) / (ASSEMBLY.explodeEnd - ASSEMBLY.explodeStart))
  const showLabels = u > 0.94
  const frame = Math.round(progress * (ASSEMBLY.frames - 1)) + 1
  const introOut = clamp((u - 0.04) / 0.22)

  if (mode === 'static') {
    return (
      <section id="assembly" className={`section ${s.static}`} aria-labelledby="assembly-title">
        <div className="wrap">
          <Intro title={title} body={body} disclaimer={disclaimer} />
          <figure className={s.staticWide}>
            <RenderImage asset={RENDERS.da02Exploded} sizes="100vw" />
          </figure>
          <div className={s.pair}>
            <figure>
              <RenderImage asset={RENDERS.da02Assembled} sizes="(max-width: 900px) 100vw, 50vw" />
              <figcaption className="label">Assembled</figcaption>
            </figure>
            <figure>
              <RenderImage asset={RENDERS.da02DetailStator} sizes="(max-width: 900px) 100vw, 50vw" />
              <figcaption className="label">Stator and rotor</figcaption>
            </figure>
          </div>
          <PartList />
        </div>
      </section>
    )
  }

  return (
    <section id="assembly" ref={sectionRef} className={s.scroller} aria-labelledby="assembly-title">
      <div className={s.sticky}>
        <RenderImage asset={RENDERS.da02Assembled} sizes="100vw" className={s.poster} alt="" style={{ opacity: ready ? 0 : 1 }} />
        <canvas
          ref={canvasRef}
          className={s.canvas}
          role="img"
          aria-label="Animation: the DA-02 demonstration actuator separating into its parts along its shaft axis as you scroll."
        />

        <div className={`wrap ${s.overlay}`}>
          <div style={{ opacity: 1 - introOut, translate: `0 ${-introOut * 32}px`, visibility: introOut >= 1 ? 'hidden' : undefined }}>
            <Intro title={title} body={body} disclaimer={disclaimer} />
          </div>

          <div className={s.callouts} aria-hidden="true" data-show={showLabels || undefined}>
            {ASSEMBLY.callouts.map((p, i) => (
              <span
                key={p.id}
                className={s.callout}
                data-side={i % 2 ? 'below' : 'above'}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transitionDelay: `${i * 50}ms` } as React.CSSProperties}
              >
                <i />
                <b>{p.label}</b>
              </span>
            ))}
          </div>

          <div className={s.meter}>
            <span className="label">
              {ASSEMBLY.id} · Frame {String(frame).padStart(3, '0')} / {ASSEMBLY.frames}
            </span>
            <span className={s.track}>
              <span style={{ transform: `scaleX(${progress})` }} />
            </span>
            <span className="label label--fg">
              {loaded < ASSEMBLY.frames && loaded > 0
                ? `Loading ${Math.round((loaded / ASSEMBLY.frames) * 100)}%`
                : u >= 1
                  ? 'Exploded'
                  : u <= 0
                    ? 'Assembled'
                    : 'Separating'}
            </span>
          </div>
        </div>
        <PartList hidden />
      </div>
    </section>
  )
}

function Intro({ title, body, disclaimer }: Props) {
  return (
    <div className={s.intro}>
      <p className="label">
        <span className="label--signal">§ 03</span> — Assembly · {ASSEMBLY.id} {ASSEMBLY.name}
      </p>
      <h2 id="assembly-title" className={`display ${s.title}`}>
        {title}
      </h2>
      <p className={s.body}>{body}</p>
      <p className={s.disclaimer}>
        <Prov kind="demo" />
        <span className="sr-only">{disclaimer}</span>
        <span aria-hidden="true" className={s.disclaimerText}>
          {disclaimer}
        </span>
      </p>
    </div>
  )
}

function PartList({ hidden }: { hidden?: boolean }) {
  return (
    <ol className={hidden ? 'sr-only' : s.parts} aria-label={`${ASSEMBLY.id} parts`}>
      {ASSEMBLY.parts.map((p) => (
        <li key={p.id}>
          <span>{p.label}</span>
          {p.note && <span className={s.note}>{p.note}</span>}
        </li>
      ))}
    </ol>
  )
}
