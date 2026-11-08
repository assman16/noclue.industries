/**
 * Prerendered visual assets produced by the Blender pipeline (visualization/).
 * Files live in /public/renders/v1/<name>-<width>.{avif,webp}.
 * Bump the folder version when re-rendering so long-lived caches stay correct.
 */
export const RENDER_BASE = '/renders/v1'

export type RenderAsset = {
  name: string
  width: number
  height: number
  widths: number[]
  alt: string
  kind: 'render'
  source: string
}

const r = (name: string, width: number, height: number, alt: string, source: string, widths = [960, 1600, 2400]): RenderAsset => ({
  name,
  width,
  height,
  widths,
  alt,
  kind: 'render',
  source,
})

export const RENDERS = {
  sa100Hero: r(
    'sa100-hero',
    2400,
    1350,
    'The SA-100 circuit board in low light: a row of ten green spring terminals with orange levers runs diagonally across the frame.',
    'SA-100 rev 3.0 — rendered from the KiCad 3D export',
  ),
  sa100Detail: r(
    'sa100-detail',
    2400,
    1600,
    'Macro view of the ESP32-S3 module on the SA-100 board, its gold castellated pads soldered to the green board.',
    'SA-100 rev 3.0 — ESP32-S3-WROOM-1 module',
  ),
  sa100Soic: r(
    'sa100-soic',
    2400,
    1600,
    'Rows of SOIC integrated circuits on the green SA-100 board, shallow depth of field.',
    'SA-100 rev 3.0 — input-side ICs',
  ),
  sa100Terminals: r(
    'sa100-terminals',
    2400,
    1600,
    'Close-up of the two-pole spring terminals along the SA-100 board edge.',
    'SA-100 rev 3.0 — field terminals',
  ),
  sa100Top: r(
    'sa100-top',
    2400,
    2116,
    'Orthographic top view of the complete SA-100 board with all silkscreen legends.',
    'SA-100 rev 3.0 — orthographic top view',
  ),
  sa100Iso: r(
    'sa100-iso',
    2400,
    1800,
    'Isometric view of the SA-100 board.',
    'SA-100 rev 3.0 — isometric view',
  ),
  da01Assembled: r(
    'da01-assembled',
    2400,
    1350,
    'DA-01 demonstration enclosure, closed: a bead-blasted aluminium base with a dark anodised lid and glass window.',
    'DA-01 demonstration assembly — closed',
  ),
  da01Exploded: r(
    'da01-exploded',
    2400,
    1350,
    'DA-01 demonstration enclosure in exploded view: screws, lid, window, gasket, board, standoffs and base separated along their assembly axes.',
    'DA-01 demonstration assembly — exploded',
  ),
  da01DetailScrew: r(
    'da01-detail-screw',
    2400,
    1600,
    'Macro of a black-oxide cap screw seated in a counterbore in the anodised lid of the DA-01 demonstration enclosure.',
    'DA-01 demonstration assembly — counterbored M3 cap screw',
  ),
  da01DetailGasket: r(
    'da01-detail-gasket',
    2400,
    1600,
    'The orange silicone gasket of the DA-01 demonstration enclosure lifting out of its groove.',
    'DA-01 demonstration assembly — gasket and groove',
  ),
} satisfies Record<string, RenderAsset>
