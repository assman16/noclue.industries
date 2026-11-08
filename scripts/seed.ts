/**
 * Seed / refresh the initial content.
 *
 *   pnpm seed               # create missing content, never overwrite edits
 *   SEED_FORCE=1 pnpm seed  # also overwrite globals/services/pages/project with defaults
 *
 * Idempotent: documents are matched by slug, media by filename. With --force,
 * existing media get their file and alt text replaced (e.g. after the v2
 * re-render of the SA-100 with its black soldermask).
 * Uses `payload run`, so it works locally and inside the production container.
 */
import fs from 'fs'
import path from 'path'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { homeDefaults, servicesDefaults, settingsDefaults } from '../src/content/defaults'
import { legalMarkdown, privacyMarkdown } from '../src/content/legal'

const force = process.argv.includes('--force') || process.env.SEED_FORCE === '1'
const ctx = { skipRevalidate: true }
const ROOT = process.cwd()

async function md(payload: Payload, markdown: string) {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  return convertMarkdownToLexical({ editorConfig, markdown: markdown.trim() })
}

async function upsertBySlug(payload: Payload, collection: 'services' | 'pages' | 'projects', slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true, overrideAccess: true })
  if (existing.docs[0]) {
    if (!force) {
      payload.logger.info(`  = ${collection}/${slug} exists (use --force to overwrite)`)
      return existing.docs[0]
    }
    payload.logger.info(`  ~ ${collection}/${slug} updated`)
    return payload.update({ collection, id: existing.docs[0].id, data: { ...data, slug } as never, overrideAccess: true, context: ctx })
  }
  payload.logger.info(`  + ${collection}/${slug} created`)
  return payload.create({ collection, data: { ...data, slug } as never, overrideAccess: true, context: ctx })
}

async function media(payload: Payload, file: string, alt: string, caption: string, kind: 'render' | 'photo' | 'cad' | 'drawing' | 'diagram' = 'render') {
  const filename = path.basename(file)
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, overrideAccess: true })
  const abs = path.resolve(ROOT, file)
  if (existing.docs[0]) {
    if (!force || !fs.existsSync(abs)) return existing.docs[0]
    payload.logger.info(`  ~ media ${filename} replaced`)
    return payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data: { alt, caption, kind },
      filePath: abs,
      overwriteExistingFiles: true,
      overrideAccess: true,
      context: ctx,
    })
  }
  if (!fs.existsSync(abs)) {
    payload.logger.warn(`  ! media source missing: ${file}`)
    return null
  }
  payload.logger.info(`  + media ${filename}`)
  return payload.create({ collection: 'media', data: { alt, caption, kind }, filePath: abs, overrideAccess: true, context: ctx })
}

async function run() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding NoClue Industries content…')

  // ------------------------------------------------------------- globals
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  if (force || !settings.contactEmail) {
    await payload.updateGlobal({ slug: 'site-settings', data: settingsDefaults as never, overrideAccess: true, context: ctx })
    payload.logger.info('  ~ site settings')
  }
  const home = await payload.findGlobal({ slug: 'home', overrideAccess: true })
  if (force || !home.heroLede) {
    await payload.updateGlobal({
      slug: 'home',
      data: { ...homeDefaults, heroLines: homeDefaults.heroLines.map((line) => ({ line })) } as never,
      overrideAccess: true,
      context: ctx,
    })
    payload.logger.info('  ~ homepage')
  }

  // ------------------------------------------------------------- services
  for (const s of servicesDefaults) {
    await upsertBySlug(payload, 'services', s.slug, {
      ...s,
      capabilities: s.capabilities.map((c) => ({ label: c.label, delivery: c.delivery ?? null })),
      deliverables: s.deliverables.map((label) => ({ label })),
    })
  }

  // ------------------------------------------------------------- pages
  await upsertBySlug(payload, 'pages', 'privacy', {
    title: 'Privacy notice',
    eyebrow: 'Legal',
    intro: 'How we handle personal data on this website — what we collect, why, for how long, and your rights.',
    effectiveDate: '2026-11-08',
    content: await md(payload, privacyMarkdown),
    _status: 'published',
  })
  await upsertBySlug(payload, 'pages', 'legal', {
    title: 'Legal information',
    eyebrow: 'Legal',
    intro: 'Who operates this website, and how to reach us.',
    content: await md(payload, legalMarkdown),
    _status: 'published',
  })

  // ------------------------------------------------------------- SA-100 archive entry
  const R = 'public/renders/v2' // flattened, web-ready masters produced by visualization/scripts/export_web.py
  const plan = await media(payload, `${R}/sa100-plan-2400.webp`, 'The black SA-100 board seen from above at an angle under a low raking light: white silkscreen legends, ICs and a row of terminal blocks.', 'SA-100 rev 3.0, rendered from the production KiCad data')
  const corner = await media(payload, `${R}/sa100-corner-2400.webp`, 'Macro of the SA-100 board corner: the ESP32-S3 module with gold castellated pads and the USB-C receptacle on black soldermask.', 'ESP32-S3 module and USB-C')
  const hero = await media(payload, `${R}/sa100-hero-2400.webp`, 'The black SA-100 circuit board in low light, a row of ten green spring terminals with orange levers along its front edge.', 'SA-100 rev 3.0, rendered from the KiCad 3D export')
  const top = await media(payload, `${R}/sa100-top-2400.webp`, 'Orthographic top view of the black SA-100 board with its white silkscreen legends: 12V IN, TEST/ACK, TAMPER, FIRE, MONITOR 1–4, SIREN IN and SIREN OUT.', 'Top view: terminal legends and the 65 × 52 mm battery bay')
  const detail = await media(payload, `${R}/sa100-detail-2400.webp`, 'Macro view of the ESP32-S3-WROOM-1 module and its gold castellated pads on the black board.', 'ESP32-S3-WROOM-1 module')
  const iso = await media(payload, `${R}/sa100-iso-2400.webp`, 'Isometric view of the complete black SA-100 board.', 'Isometric view')
  const terminals = await media(payload, `${R}/sa100-terminals-2400.webp`, 'Close-up of the two-pole spring terminals along the board edge.', 'Field terminals')
  const soic = await media(payload, `${R}/sa100-soic-2400.webp`, 'SOIC integrated circuits on the input side of the black SA-100 board.', 'Input-side ICs')
  const mark = await media(payload, `${R}/sa100-mark-2400.webp`, 'Macro of the white silkscreen maker’s mark on the SA-100: the noclue logo, “noclue.industries” and “rev 3.0”.', 'Silkscreen maker’s mark')

  const gallery = [plan, corner, top, detail, mark, terminals, soic, hero].filter(Boolean).map((m) => ({ image: m!.id }))

  await upsertBySlug(payload, 'projects', 'sa-100', {
    title: 'SA-100',
    subtitle: 'Field interface board with Wi-Fi and cellular connectivity',
    summary:
      'A 170 × 150 mm controller board with ten two-pole spring terminals for supply, test/acknowledge, tamper, fire, four monitor inputs and siren in/out — built around an ESP32-S3 module, with a SIMCom A7670G cellular module, a nanoSIM socket and a dedicated 65 × 52 mm battery bay.',
    reference: 'NCI-A-0001',
    status: 'design',
    statusNote: 'Revision 3.0',
    disciplines: ['electronics'],
    featured: true,
    order: 10,
    heroImage: plan?.id ?? iso?.id ?? hero?.id,
    gallery,
    work: [
      { item: 'Schematic capture and PCB layout in KiCad', discipline: 'electronics' },
      { item: 'Component selection and integration: MCU module, cellular module, power conversion, protection', discipline: 'electronics' },
      { item: 'Board outline, mounting holes and a component/copper keep-out for the battery bay', discipline: 'electronics' },
      { item: 'Full 3D board model for mechanical integration and visualisation', discipline: 'electronics' },
    ],
    components: [
      { part: 'ESP32-S3-WROOM-1', role: 'Microcontroller module (Wi-Fi + Bluetooth LE)' },
      { part: 'SIMCom A7670G', role: 'Cellular module' },
      { part: 'SMN-304', role: 'nanoSIM socket' },
      { part: 'TPS63020', role: 'Buck-boost converter' },
      { part: 'MF-R300', role: 'Resettable PTC fuse' },
      { part: 'USB Type-C receptacle', role: 'USB connection' },
      { part: 'JST B2P-VH', role: 'Two-pin VH-series connector' },
      { part: '2 × 8 IDC header, 2.54 mm', role: 'Ribbon-cable header' },
    ],
    facts: [
      { label: 'Board outline', value: '170 × 150 mm' },
      { label: 'Board thickness', value: '1.6 mm' },
      { label: 'Field terminals', value: '10 × two-pole spring terminals' },
      { label: 'Battery bay', value: '65 × 52 mm, no components, no copper' },
      { label: 'Revision', value: '3.0' },
      { label: 'ECAD', value: 'KiCad' },
    ],
    notes: await md(
      payload,
      `The terminal legends on the silkscreen read **12V IN, TEST/ACK, TAMPER, FIRE, MONITOR 1–4, SIREN IN** and **SIREN OUT**. The battery bay is kept free of components and copper so a 65 × 52 mm cell can sit directly on the board.

The renders on this page were produced in Blender from the board's KiCad 3D export. The geometry is unaltered. The board is specified with a black soldermask and white silkscreen; KiCad's export carries a default green, so the mask material was corrected in the render pipeline. Lighting and camera were set up for presentation.

One line on the silkscreen, reproduced verbatim: *certified probably fine*.`,
    ),
    seo: { description: 'SA-100: a 170 × 150 mm field interface board with an ESP32-S3 module, cellular module and ten spring terminals, designed by NoClue Industries.' },
    _status: 'published',
  })

  payload.logger.info('Seed complete.')
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error(e)
  process.exit(1)
}
