import labels from './da02-labels.json'

/**
 * DA-02 demonstration assembly (sealed BLDC actuator module), mirrored from
 * visualization/assemblies/da02_actuator.py (STEPS + TIMELINE).
 * Label positions come from Blender (da02-labels.json): each part's centre
 * projected into normalised screen space on the final, fully exploded frame.
 *
 * The earlier DA-01 enclosure (visualization/assemblies/da01_enclosure.py,
 * /public/sequences/da01/v1) is kept in the pipeline but no longer shown.
 */
type Label = { id: string; label: string; note: string; x: number; y: number }

const all = (labels.frames as Record<string, Label[]>)['120']

/** Parts annotated on screen (the rest are listed for screen readers only). */
const SHOWN = ['connector', 'pcb', 'housing', 'stator', 'rotor', 'front_bearing', 'cover', 'front_screws', 'flange']

export const ASSEMBLY = {
  id: 'DA-02',
  name: 'Sealed actuator module',
  frames: 120,
  base: '/sequences/da02/v1',
  /** Widths rendered for the sequence. The client picks one based on canvas size × DPR. */
  widths: [720, 1280, 1920],
  aspect: 16 / 9,
  /** Explode window within the timeline (frames 9–109 of 120). */
  explodeStart: 8 / 120,
  explodeEnd: 108 / 120,
  parts: all,
  callouts: all.filter((l) => SHOWN.includes(l.id)).sort((a, b) => a.x - b.x),
}

export const frameUrl = (width: number, frame: number) => `${ASSEMBLY.base}/${width}/da02-${String(frame).padStart(3, '0')}.webp`
