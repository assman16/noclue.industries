/**
 * Prerendered visual assets produced by the Blender pipeline (visualization/).
 * Files live in /public/renders/<version>/<name>-<width>.{avif,webp}.
 *
 * The folders are served with immutable cache headers. When a re-render changes
 * what an image shows, export to a NEW version folder and bump RENDER_BASE —
 * v2 replaced v1 when the SA-100 renders moved from KiCad's default green
 * soldermask to the board's actual black mask with white silkscreen.
 */
export const RENDER_BASE = '/renders/v2'

export type Provenance = 'real' | 'demo' | 'illustrative'

export type RenderAsset = {
  name: string
  width: number
  height: number
  widths: number[]
  alt: string
  kind: 'render'
  provenance: Provenance
  source: string
  base?: string
}

const r = (
  name: string,
  width: number,
  height: number,
  alt: string,
  source: string,
  provenance: Provenance = 'real',
  widths = [960, 1600, 2400],
): RenderAsset => ({ name, width, height, widths, alt, kind: 'render', provenance, source })

export const RENDERS = {
  // ---------------------------------------------------------------- SA-100 (real project)
  sa100Plan: r(
    'sa100-plan',
    2400,
    1350,
    'The SA-100 board seen from above at an angle: black soldermask, white silkscreen legends and a row of terminal blocks, lit by a low raking light.',
    'SA-100 rev 3.0, rendered from the production KiCad data',
  ),
  sa100Corner: r(
    'sa100-corner',
    2400,
    1350,
    'Macro of the SA-100 board corner: the ESP32-S3 module with gold castellated pads and the USB-C receptacle on black soldermask.',
    'SA-100 rev 3.0: ESP32-S3 module and USB-C',
  ),
  sa100Mark: r(
    'sa100-mark',
    2400,
    1600,
    'Macro of the white silkscreen maker’s mark on the black SA-100 board: the noclue logo, “noclue.industries” and “rev 3.0”.',
    'SA-100 rev 3.0: silkscreen maker’s mark',
  ),
  sa100Hero: r(
    'sa100-hero',
    2400,
    1350,
    'The black SA-100 circuit board in low light, a row of ten green spring terminals with orange levers along its front edge.',
    'SA-100 rev 3.0, rendered from the KiCad 3D export',
  ),
  sa100Detail: r(
    'sa100-detail',
    2400,
    1600,
    'Macro view of the ESP32-S3 module on the black SA-100 board, its gold castellated pads soldered to the board.',
    'SA-100 rev 3.0: ESP32-S3-WROOM-1 module',
  ),
  sa100Soic: r(
    'sa100-soic',
    2400,
    1600,
    'Rows of SOIC integrated circuits on the black SA-100 board, shallow depth of field.',
    'SA-100 rev 3.0: input-side ICs',
  ),
  sa100Terminals: r(
    'sa100-terminals',
    2400,
    1600,
    'Close-up of the two-pole spring terminals along the SA-100 board edge.',
    'SA-100 rev 3.0: field terminals',
  ),
  sa100Top: r(
    'sa100-top',
    2400,
    2116,
    'Orthographic top view of the complete black SA-100 board with all white silkscreen legends.',
    'SA-100 rev 3.0: orthographic top view',
  ),
  sa100Iso: r('sa100-iso', 2400, 1800, 'Isometric view of the black SA-100 board.', 'SA-100 rev 3.0: isometric view'),

  // ---------------------------------------------------------------- DA-02 (demonstration model)
  da02Assembled: r(
    'da02-assembled',
    2400,
    1350,
    'DA-02 demonstration actuator, assembled: a finned bead-blasted aluminium housing between a dark anodised front cover and rear cap.',
    'DA-02 demonstration assembly, closed',
    'demo',
  ),
  da02Exploded: r(
    'da02-exploded',
    2400,
    1350,
    'DA-02 demonstration actuator in exploded view along its shaft axis: connector, rear cap, driver board, bearings, housing, wound stator, rotor, seals, front cover, screws and output flange.',
    'DA-02 demonstration assembly, exploded',
    'demo',
  ),
  da02Hero: r(
    'da02-hero',
    2400,
    1350,
    'Close, low view of the DA-02 demonstration actuator: machined aluminium output flange on a dark anodised front cover.',
    'DA-02 demonstration assembly: output end',
    'demo',
  ),
  da02DetailStator: r(
    'da02-detail-stator',
    2400,
    1600,
    'Macro of the DA-02 demonstration actuator taken apart: copper stator windings and the magnet rotor withdrawn on its stainless shaft.',
    'DA-02 demonstration assembly: stator and rotor',
    'demo',
  ),
} satisfies Record<string, RenderAsset>

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  real: 'NoClue hardware · render from design data',
  demo: 'Demonstration model · not a product',
  illustrative: 'Illustrative photography',
}
