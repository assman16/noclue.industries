# NoClue Industries — visualisation pipeline

A reusable, scriptable Blender (Cycles) pipeline for product renders, macro shots and
scroll-scrubbed exploded-view sequences. Everything is deterministic: configs in, images out.

Tested with **Blender 4.5 LTS** (`winget install BlenderFoundation.Blender.LTS.4.5`).
Python dependency for compositing/export: Pillow ≥ 11 with AVIF support (`pip install pillow`).

```
visualization/
  lib/
    nci_studio.py     scene reset, Cycles presets, GPU/CPU selection, cameras, lights,
                      shadow catcher, material library (anodised Al, steel, brass, silicone,
                      glass, soldermask, ENIG, FR4, silkscreen …)
    nci_pcb.py        KiCad glTF import, centring, PCB material upgrade (geometry untouched)
    nci_geo.py        parametric parts in millimetres: rounded prisms, booleans, bevels,
                      ISO-proportioned screws, hex standoffs, swept gaskets, text
    nci_explode.py    exploded-view choreography: steps, easing, spin, label projection
  configs/
    sa100.py          SA-100 shots + lighting rigs (template for any new board)
  assemblies/
    da02_actuator.py  DA-02 demonstration actuator (shown on the site): build → explode → render
    da01_enclosure.py DA-01 demonstration enclosure (v1, kept as a simpler reference)
  scripts/
    inspect_model.py  print objects / sizes / materials of any GLB
    render_pcb.py     render PCB shots from a config
    composite.py      flatten onto #07090A, export WebP/AVIF at several widths
    export_web.py     renders → public/renders/<RENDER_VERSION> + sequences → public/sequences/<seq>/<ver> + OG image
    grade_photos.py   licensed photography → house grade → public/photography/v1
    prepare_brand_assets.py  logo variants + favicon crop (logo itself unaltered)
  renders/            masters (16-bit PNG, alpha) + saved .blend scenes  ← keep these
  drafts/             throwaway previews (git-ignored)
```

Set `BLENDER` to your executable, e.g.
`BLENDER="/c/Program Files/Blender Foundation/Blender 4.5/blender.exe"`.

## Render a PCB

```bash
# 1. look at the model
"$BLENDER" -b --factory-startup --python visualization/scripts/inspect_model.py -- path/to/board.glb

# 2. copy configs/sa100.py → configs/myboard.py, set MODEL, NAME, cameras
# 3. quick framing pass
"$BLENDER" -b --factory-startup --python visualization/scripts/render_pcb.py -- \
    --config myboard --preset draft --scale 0.4 --out visualization/drafts
# 4. finals (+ .blend per shot for manual tweaking)
"$BLENDER" -b --factory-startup --python visualization/scripts/render_pcb.py -- \
    --config myboard --out visualization/renders/myboard --save-blend
```

KiCad export: *File → Export → glTF* (or `kicad-cli pcb export glb`). Include copper/tracks
if you want traces visible. The pipeline recognises the `index_PCB`, `index_soldermask`,
`index_silkscreen` and `index_pad` layer meshes automatically.

What the pipeline changes — and doesn't:

- ✔ lighting, camera, background, finishes (gloss mask, ENIG, metal/plastic roughness)
- ✔ silkscreen lifted by its physical ink thickness (30 µm) to avoid z-fighting
- ✔ unrealistically saturated display colours toned to plausible plastic (hue preserved)
- ✘ no geometry edits, no added components, no invented connectors

## Build an exploded view for a real CAD assembly

1. Export the assembly as glTF/GLB (or STEP → FreeCAD/Blender add-on → glTF) with **one object per part**.
2. Write a script modelled on `assemblies/da01_enclosure.py`, but replace `build()` with an import.
3. Describe the disassembly with `ExplodeStep`s — **along real assembly axes**, outermost parts first:

   ```python
   STEPS = [
       ex.ExplodeStep("lid_screws", ["Screw_Lid*"], (0, 0, 90), 0.00, 0.40, spin_turns=4, label="4 × M3 cap screws"),
       ex.ExplodeStep("lid", ["Lid"], (0, 0, 60), 0.12, 0.55, label="Lid"),
       ex.ExplodeStep("board", ["PCB*"], (0, 0, 20), 0.45, 0.85, label="Main board"),
   ]
   ```
   Offsets are mm, times are fractions of the explode window. Fasteners can spin while they travel.
4. Render: `--mode all` (stills + sequence + labels JSON). Rendering is **resumable** — rerun to
   continue; `--overwrite` to redo. `NCI_DEVICE=CPU` forces CPU if the GPU is busy.
5. `python visualization/scripts/export_web.py` → web assets. Copy `da01-labels.json` style
   output to `src/content/` and update `src/content/assembly.ts` (frame count, steps).

## SA-100 board finish

The board is specified with a **black soldermask and white silkscreen**. KiCad's glTF export
carries its default green, so `configs/sa100.py` overrides it in `BOARD_COLORS` (black LPI mask,
`soldermask_finish: "satin"` = semi-gloss clear coat, white ink). Change finishes there, at
material level, never in post. Black masks need light to read on a black page:
`rig_cinematic` and `rig_raking` use long strip lights whose reflections sweep across the mask,
and `rig_technical_black` lets the overhead softbox reflect, so the plan views read as a
graphite plate.

Shots: `hero`, `detail`, `soic`, `terminals`, `top`, `iso`, plus the campaign shots
`plan_raking`, `cine_corner` and `macro_mark`.

## Versioning web output

`/renders`, `/sequences` and `/photography` are served with immutable cache headers. When a
re-render changes what an image shows, bump `RENDER_VERSION` in `export_web.py` (and
`RENDER_BASE` in `src/content/renders.ts`) instead of overwriting files. v2 is the black SA-100.

## DA-02 (demonstration assembly, on the site)

A sealed BLDC actuator module, designed as an **original concept** for this pipeline. It is *not a
product*. All parts sit on one axis (local Z) and explode along it, outermost first. Front and
rear unstack simultaneously, and the rotor is withdrawn once the front cover is off. Dimensions
and part list are in the script docstring. 18 explode steps, a 120-frame timeline (8 hold / 100
explode / 12 hold), and a camera that pulls back while orbiting.

```bash
"$BLENDER" -b --factory-startup --python visualization/assemblies/da02_actuator.py --     --mode all [--draft] [--frames 1-120x8] [--stills hero,exploded] [--overwrite]
python visualization/scripts/export_web.py --only sequence
cp visualization/renders/da02/da02-labels.json src/content/
```

**Note on EXACT booleans:** joining overlapping meshes before a boolean can wipe the result,
and booleans occasionally leave stray vertices at the origin, which stretch into thin lines
during the explode. `strip_outside()` removes them. Check new parts with a draft frame from the
fully exploded end of the timeline.

## DA-01 (demonstration assembly, v1)

An **original** enclosure designed for this pipeline — *not a client product*. The board's
silkscreen reads "DEMONSTRATION BOARD". Key dimensions (mm): base 120 × 80 × 30, R8, 5 mm
walls; 2 × 1 mm gasket groove with a 1.8 mm silicone section; M3 corner bosses; brass M3
standoffs on a 90 × 50 pattern; 100 × 60 × 1.6 board; 5 mm lid with Ø6 counterbores for
ISO 4762 M3 × 12; 38 × 14 glass window; M12 gland.

## Presets

| preset | use |
|---|---|
| `draft` | 960 × 540, 24 spp — framing |
| `still` | 384 spp — web stills |
| `still_light` | 192 spp — stills when VRAM is tight |
| `master` | 3840 × 2160, 512 spp |
| `sequence` | 1600 × 900 (DA-02 renders it at 1920 × 1080), 48 spp + OIDN — animation frames |

All renders use AgX (Medium High Contrast), transparent film and a shadow catcher; compositing
onto `#07090A` happens in `composite.py`/`export_web.py` so images sit seamlessly on the site.
