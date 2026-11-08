import labels from './da01-labels.json'

/**
 * DA-01 demonstration assembly — metadata mirrored from
 * visualization/assemblies/da01_enclosure.py (STEPS + TIMELINE).
 * Label positions come from Blender (da01-labels.json): each part's centre
 * projected into normalised screen space on the final, fully exploded frame.
 */
export const DA01 = {
  frames: 96,
  base: '/sequences/da01/v1',
  /** Widths rendered for the sequence. The client picks one based on viewport × DPR. */
  widths: [720, 1280, 1600],
  aspect: 16 / 9,
  /** Horizontal slice of the frame (0..1) containing the assembly, used on portrait screens. */
  portraitCrop: [0.36, 0.9] as [number, number],
  /** Explode window within the timeline (frames 7–90 of 96). */
  explodeStart: 6 / 96,
  explodeEnd: 90 / 96,
  steps: [
    { id: 'lid_screws', start: 0.0, end: 0.4 },
    { id: 'lid', start: 0.12, end: 0.55 },
    { id: 'window', start: 0.18, end: 0.62 },
    { id: 'gland', start: 0.2, end: 0.6 },
    { id: 'gasket', start: 0.25, end: 0.66 },
    { id: 'pcb_screws', start: 0.35, end: 0.72 },
    { id: 'pcb', start: 0.45, end: 0.86 },
    { id: 'standoffs', start: 0.55, end: 0.92 },
  ],
  labels: (labels.frames as Record<string, { id: string; label: string; note: string; x: number; y: number }[]>)['96'],
}

export const frameUrl = (width: number, frame: number) => `${DA01.base}/${width}/da01-${String(frame).padStart(3, '0')}.webp`
