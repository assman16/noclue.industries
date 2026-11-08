# Creative direction & key decisions

## The idea

*A real engineering company that happens to exist a few decades ahead of us.*
Not a cyberpunk-themed site: no glitch, no neon, no HUD noise. The futurism comes from
**typographic confidence, material restraint and engineering precision** — the way a
serious hardware manufacturer would present itself.

The design had to work with a **small, honest portfolio** (one real board, no finished
product photography). So the site's strength is carried by type, composition, a coherent
technical graphic language and a few genuinely good renders — not by volume.

## Brand relationship with NoClue Studio

Studied on noclue.studio: Rajdhani display + Archivo sans, ink `#0B0F11`, teal `#5F8B84` /
`#9CC5BD`, amber `#B88948`, easing `cubic-bezier(0.16,1,0.3,1)`, numbered sections, "§"-like
index labels, confident short headlines.

Carried over: **Archivo** (shared family), the ink black, the out-easing curve, numbered
section indices, the "Start a project" CTA language, the teal as a small *status* colour.

Pushed further for Industries: Archivo's **width axis at 125 % + weight 860–880** for
monumental, tightly kerned uppercase headlines — echoing the wide, heavy INDUSTRIES lettering
of the supplied logo. Darker, cooler foundation; one industrial accent.

## Palette

| Token | Value | Use |
|---|---|---|
| `--void` | `#07090A` | page background; all renders are composited onto exactly this colour |
| `--carbon` / `--gunmetal` / `--graphite` / `--steel` | `#0C0F11` … `#2A3338` | surfaces, rules, depth |
| `--fg` / `--fg-2` / `--fg-3` / `--fg-4` | cool white → dim steel | text hierarchy; `--fg-4` = decorative only |
| `--sheet` | `#E6E9E6` | light "drawing sheet" sections (Process, Why) |
| `--signal` | `#FF5A1F` | **the** accent: CTAs, indices, active states, the gasket in DA-01 |
| `--teal` | `#9CC5BD` | status marker (heritage from Studio) |

**Why signal orange:** it is already *in the hardware* — the spring-terminal levers on SA-100
are orange. The accent isn't decoration; it's taken from the product. Used sparingly.

## Typography

- **Archivo NCI** (variable: wght 100–900, wdth 62–125) — self-hosted, latin + latin-ext
  (for Slovak operator data), preloaded, metric-matched fallback.
  - Display: width 125 %, weight ~860, tracking −0.035 em, line-height 0.86, uppercase.
  - Headings: width 112–122 %, weight 760–820.
  - Body: width 100 %, weight 400.
- **JetBrains Mono** — technical labels, references, frame counters. Small, uppercase,
  modest tracking (0.04 em, deliberately not the usual excessive spacing).

## Technical graphic language

Designed to transfer to silkscreens, labels and documentation:

- **§ section indices** (`§ 01 — Disciplines`) and stage numbers.
- **Site references**: `NCI-A-0001` (archive entries), `NCI-Q-0001` (inquiries), `DA-01`
  (demonstration assembly). These are *catalogue numbers of this website*, stated as such on the page.
- **Registration marks** framing hero visuals; **fine rules**; a faint drawing **grid with zone letters**
  and a **title block** on drawing-sheet sections.
- **PCB trace with vias** as the process timeline (routes itself as you scroll).
- **Real dimensions only** (170 × 150 mm, 1.6 mm, 65 × 52 mm battery bay — all from the design files).
- **Decorative vs. real data are visually distinct**: decorative markings use `.deco`
  (`--fg-4`, mono, never essential); verified data uses full-contrast text in data tables.
- Every image carries its **kind** (Render / Photograph / CAD capture / Drawing).

## Information architecture

Compact, by design:

- **/** — Hero · §01 Disciplines · §02 Process · §03 Exploded assembly · §04 Selected work · §05 Why one team · §06 Start a project
- **/capabilities** — each discipline in depth, deliverables, how they combine, what's done by partners
- **/archive** — a *register* (table) + identification plates; reads well with 1 entry and with 20
- **/archive/[slug]** — plate header, hero, spec sheet, components, work performed, adaptive gallery
- **/contact**, **/privacy**, **/legal** (CMS pages), custom **404** ("Test chamber not found")

## Motion

Engineered, not playful: one easing family (`--ease-mech`, `--ease-out`), short distances.

- Headlines rise out of a mask; rules draw left-to-right; sections reveal once.
- Hero render *emerges from darkness* on load and drifts slightly with scroll (CSS scroll timeline).
- Disciplines use native `<details>` with animated height where supported.
- Process trace routes on scroll (CSS `view()` timeline, static elsewhere).
- **Exploded assembly**: 96 prerendered frames scrubbed by scroll on a canvas — forwards and
  backwards — with part list, frame counter and Blender-projected callouts.
- `prefers-reduced-motion`: all reveals off, no drift, assembly replaced by two static renders + part list.
- Without JavaScript all content is visible; the inquiry form still works (server action).

## The renders

All from the Blender pipeline (`visualization/`):

- **SA-100**: hero (low front-right, grazing back-light), ESP32-S3 macro, SOIC macro, terminal
  macro, orthographic top, isometric. Real KiCad geometry, untouched. Finishes upgraded
  (gloss soldermask + clear coat, ENIG pads, metals, moulded plastics); silkscreen lifted 30 µm
  (ink thickness) to fix coplanar z-fighting; KiCad's neon terminal green toned to a plausible
  plastic saturation (hue kept).
- **DA-01**: original demonstration enclosure (procedural, mechanically plausible: R8 corners,
  5 mm walls, gasket groove, M3 bosses, counterbores, M12 gland). Its PCB literally reads
  "DEMONSTRATION BOARD", and the site labels it as a demonstration everywhere.

Why prerendered instead of WebGL: better lighting/materials than a real-time scene can match
here, predictable performance on phones, zero GPU work on the VPS, and nothing heavier than
~2–4 MB of progressively loaded WebP frames for the whole sequence.

## Key technical decisions

- **One Next.js app with Payload embedded** (official integration) → one container, one deploy.
- **Pages render dynamically; data is cached by tag** (`unstable_cache` + `revalidateTag` in
  Payload hooks). Builds need no database, edits are live instantly, and cache misses for
  missing pages are re-checked so new content never sticks as a 404.
- **Migrations committed and applied on boot** (`prodMigrations`); schema *push* only in dev.
- **Inquiries are persisted first, emailed second**, and the delivery outcome is recorded —
  the site never claims a message was emailed when it wasn't.
- **No analytics, no third-party scripts, no cookies for visitors** → no consent banner needed.
- **Static renders bypass the Next image optimizer**: they ship as pre-encoded AVIF/WebP at
  three widths with long immutable caching (versioned folders).
- **i18n-ready**: Payload localization enabled (en), all content fields localized.
