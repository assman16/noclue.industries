import type { RenderAsset } from './renders'

/**
 * Licensed editorial photography (Unsplash License). Graded copies live in
 * /public/photography/v1 (visualization/scripts/grade_photos.py); originals,
 * source URLs and the licence check are recorded in
 * website-assets/photography/MANIFEST.md. Keep the two in sync.
 *
 * These photographs illustrate the KIND of work a discipline involves. They do
 * not show NoClue premises, machines, clients or projects, and every placement
 * carries the "Illustrative photography" provenance label.
 */
export const PHOTO_BASE = '/photography/v1'

export type PhotoAsset = RenderAsset & {
  credit: { name: string; handle: string; url: string }
  subject: string
}

const UNSPLASH = 'https://unsplash.com/photos/'

const p = (
  name: string,
  width: number,
  height: number,
  alt: string,
  subject: string,
  credit: [string, string],
  sourceSlug: string,
): PhotoAsset => ({
  name,
  width,
  height,
  widths: [960, 1600, 2400],
  alt,
  subject,
  kind: 'render',
  provenance: 'illustrative',
  source: UNSPLASH + sourceSlug,
  base: PHOTO_BASE,
  credit: { name: credit[0], handle: credit[1], url: `https://unsplash.com/@${credit[1]}` },
})

export const PHOTOS = {
  endmill: p(
    'endmill',
    3600,
    2216,
    'An end mill finishing a round aluminium part inside a machining centre, coolant mist behind it.',
    'End mill finishing an aluminium part',
    ['Jelifer Maniago', 'jelly1024'],
    'a-machine-that-is-cutting-a-piece-of-metal-8MBTn3Z71zI',
  ),
  facemill: p(
    'facemill',
    3600,
    2026,
    'A face mill poised above a turned metal blank clamped in a vice.',
    'Face mill above a turned blank',
    ['Jelifer Maniago', 'jelly1024'],
    'a-machine-that-is-cutting-a-piece-of-metal-O5rSp_U-Pa0',
  ),
  sparks: p(
    'sparks',
    3600,
    2064,
    'A laser cutting head throwing two fans of sparks across a metal sheet, printed in signal orange.',
    'Laser cutting head and spark fan',
    ['Le Trung', 'letrung7'],
    'a-piece-of-metal-being-cut-with-a-machine-fBCQz7OUUww',
  ),
  ring: p(
    'ring',
    3600,
    5400,
    'Black-and-white close-up of a precision-machined metal ring with a tapped hole, light running along its turned faces.',
    'Machined ring with tapped hole',
    ['Greg Rosenke', 'greg_rosenke'],
    'black-and-white-round-frame-cq2_Wg8Ebd4',
  ),
  pcbPads: p(
    'pcb-pads',
    3600,
    2703,
    'Macro of a bare dark circuit board: rows of gold pads, fine traces and vias at a shallow angle.',
    'Bare circuit board, gold pads',
    ['Vishnu Mohanan', 'vishnumaiea'],
    'close-up-of-dark-blue-circuit-board-pfR18JNEMv8',
  ),
  pcbCrystal: p(
    'pcb-crystal',
    3600,
    2399,
    'A populated circuit board in cool light: a fine-pitch processor package, a quartz crystal and small passive components.',
    'Populated board, crystal and QFP',
    ['Anne Nygård', 'polarmermaid'],
    'a-circuit-board-with-many-small-components-vILVKROnyGA',
  ),
  pocket: p(
    'pocket',
    3600,
    2400,
    'A coated end mill cutting a pocket into an aluminium plate, coolant pooled on the bright machined surfaces.',
    'End mill in a machined pocket',
    ['nik biziuk', 'nikbizuk'],
    'stainless-steel-and-blue-hand-tool-hJ4JxDJkRUw',
  ),
  balls: p(
    'balls',
    3600,
    3600,
    'Black-and-white macro of polished steel balls packed together, reflections sliding across their surfaces.',
    'Polished steel balls',
    ['Random Thinking', 'randomthinking'],
    'black-and-white-photograph-of-shiny-balls-gOo1gDEhS5c',
  ),
  printer: p(
    'printer',
    3600,
    4104,
    'An FDM print head with a hexagon-patterned fan shroud laying the first perimeter of a part on a dark build plate.',
    'FDM print head laying a perimeter',
    ['Kenneth Li', 'kennethliphotography'],
    '3d-printer-creating-a-hexagonal-shape-bTPDkYQ9-xk',
  ),
  gearbox: p(
    'gearbox',
    3600,
    2025,
    'A sectioned transmission revealing clutch packs, gears and shafts machined in steel.',
    'Sectioned transmission (museum exhibit)',
    ['Kirill Prikhodko', 'kirillq'],
    'a-close-up-of-a-machine-with-many-gears-kRp5woiVDaY',
  ),
} satisfies Record<string, PhotoAsset>

export const PHOTO_LICENSE = { name: 'Unsplash License', url: 'https://unsplash.com/license', checked: '2026-11-08' }
