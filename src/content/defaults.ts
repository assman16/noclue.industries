/**
 * Default content.
 *
 * Used twice:
 *   1. by scripts/seed.ts to populate an empty database, and
 *   2. as runtime fallbacks, so an empty CMS field never breaks a page.
 *
 * Rule for everything in this file: only statements that are true today.
 * No invented clients, metrics, certifications or machinery.
 */

export const SITE = {
  name: 'NoClue Industries',
  url: (process.env.NEXT_PUBLIC_SERVER_URL || 'https://noclue.industries').replace(/\/$/, ''),
  studioUrl: 'https://noclue.studio',
  locale: 'en',
}

export const settingsDefaults = {
  contactEmail: 'info@noclue.studio',
  phone: '+421 915 565 511',
  responseTime: '',
  operatorName: 'Sapfir Research & Development s. r. o.',
  operatorAddress: 'Záhradná 953/19\n900 24 Veľký Biel\nSlovak Republic',
  companyId: '56 275 188',
  taxId: '2122265519',
  vatId: '',
  registry: 'Registered in the Commercial Register of the Municipal Court Bratislava III, Section Sro, Insert No. 178856/B.',
  siteTitle: 'NoClue Industries',
  titleTemplate: '%s — NoClue Industries',
  description:
    'NoClue Industries designs custom electronics, firmware, enclosures and mechanical parts — from first schematic to working prototype and production data.',
  links: [
    { label: 'NoClue Studio', url: 'https://noclue.studio' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/noclue-studio' },
  ],
}

export const homeDefaults = {
  heroEyebrow: 'Electronics · Firmware · Mechanical · Prototyping',
  heroLines: ['Engineered', 'to exist.'],
  heroLede: 'Custom electronics, firmware and mechanical parts, designed as one: from first schematic to the prototype in your hand.',

  disciplinesTitle: 'Four disciplines. One bench.',
  disciplinesIntro: 'Designed together, so the interfaces are engineered, not negotiated.',

  processTitle: 'From problem statement to physical hardware.',
  processIntro:
    'Every project moves through the same six stages. Each one ends with something concrete you can review, test or hold — and each one is a natural point to stop, adjust or continue.',
  processSteps: [
    {
      title: 'Brief & requirements',
      body: 'We work out what the device must do, where it will live and what it has to survive: inputs and outputs, power, environment, quantities and budget.',
      output: 'Written requirements and a scoped proposal',
    },
    {
      title: 'Architecture',
      body: 'Block diagram, power budget, microcontroller and key components, interfaces and the mechanical envelope — decided together, before detailed design starts.',
      output: 'System architecture and preliminary bill of materials',
    },
    {
      title: 'Design',
      body: 'Schematic capture and PCB layout, firmware structure, and 3D CAD of the enclosure and mechanical parts. Board and enclosure share one model, so clearances are checked continuously.',
      output: 'Schematic, PCB layout and CAD model',
    },
    {
      title: 'Prototype',
      body: 'Fabrication and assembly data go to specialist PCB manufacturers. Mechanical parts are 3D-printed or sourced from suitable suppliers. Then the first units are assembled, powered up and flashed.',
      output: 'Working prototype hardware',
    },
    {
      title: 'Test & revise',
      body: 'Bring-up, functional tests, fit checks and firmware iteration. What we learn goes back into the design as a documented revision.',
      output: 'Test notes and a revised design',
    },
    {
      title: 'Production preparation',
      body: 'Gerber, drill and pick-and-place files, BOM, engineering drawings, STEP models and firmware builds — packaged for the manufacturer you choose, or coordinated by us.',
      output: 'Manufacturing data package',
    },
  ],

  assemblyTitle: 'Take it apart.',
  assemblyBody: 'Every part on one axis, separating in the order it was designed to come apart. Scroll to disassemble; scroll back to rebuild.',
  assemblyDisclaimer:
    'DA-02 is a demonstration model, designed and rendered in-house to show how we engineer and present mechanical assemblies. It is not a client product.',

  whyTitle: 'One team owns the interfaces.',
  whyPoints: [
    {
      title: 'Fewer hand-offs',
      body: 'The person who assigns the microcontroller pins also writes the firmware against them and routes the board around the enclosure’s mounting points. Decisions travel without translation.',
    },
    {
      title: 'Physical fit, checked early',
      body: 'The PCB sits inside the enclosure model from the first layout pass. Connectors, standoffs, cable entries and clearances are resolved in CAD — not at the assembly bench.',
    },
    {
      title: 'Clear about who makes what',
      body: 'We prepare fabrication and assembly data and work with specialist manufacturers for PCBs and production parts. You always know which steps happen where.',
    },
    {
      title: 'Software, when the device needs it',
      body: 'Our sister studio, NoClue Studio, builds web applications, dashboards and automation — so a connected device can come with the software around it.',
    },
  ],

  contactTitle: 'Have something to build?',
  contactIntro: 'A rough description is enough. We reply with questions, an approach and a sensible next step.',
}

type Capability = { label: string; delivery?: 'in-house' | 'partner' }

export const servicesDefaults: {
  code: string
  title: string
  slug: string
  order: number
  headline: string
  summary: string
  capabilities: Capability[]
  deliverables: string[]
}[] = [
  {
    code: 'EL',
    title: 'Electronics & PCB',
    slug: 'electronics',
    order: 10,
    headline: 'Circuits designed for the board they live on.',
    summary:
      'Circuit design and PCB layout from requirements to manufacturing data: microcontrollers, power supplies, sensor and communication interfaces, and the component choices behind them.',
    capabilities: [
      { label: 'Custom PCB design and layout' },
      { label: 'Electronic circuit development' },
      { label: 'Component selection and integration' },
      { label: 'Microcontrollers and embedded hardware' },
      { label: 'Sensor and communication module integration' },
      { label: 'Hardware bring-up and testing' },
      { label: 'Fabrication and assembly data preparation' },
      { label: 'PCB fabrication and assembly', delivery: 'partner' },
    ],
    deliverables: ['Schematic (PDF and source)', 'PCB layout and 3D board model', 'Gerber, drill, pick-and-place and BOM'],
  },
  {
    code: 'FW',
    title: 'Firmware & embedded',
    slug: 'firmware',
    order: 20,
    headline: 'Firmware written against the actual hardware.',
    summary:
      'Embedded software for the microcontrollers we design around: drivers, peripherals, communication and application logic — written by the people who drew the schematic.',
    capabilities: [
      { label: 'Firmware development' },
      { label: 'Board bring-up and peripheral drivers' },
      { label: 'Wired and wireless communication interfaces' },
      { label: 'Sensor data acquisition' },
      { label: 'Test and diagnostic firmware' },
    ],
    deliverables: ['Source code repository', 'Build and flashing instructions', 'Test firmware'],
  },
  {
    code: 'ME',
    title: 'Mechanical & CAD',
    slug: 'mechanical',
    order: 30,
    headline: 'Enclosures and parts that fit the first time.',
    summary:
      '3D CAD for enclosures, brackets, mechanisms and functional assemblies — designed around the electronics, and for the process that will actually make them.',
    capabilities: [
      { label: '3D CAD modelling' },
      { label: 'Custom enclosures' },
      { label: 'Mechanical component development' },
      { label: 'Functional assemblies' },
      { label: 'Design for manufacturing' },
      { label: 'Production-ready engineering drawings' },
      { label: 'Adapting existing components' },
    ],
    deliverables: ['STEP and native CAD files', 'Engineering drawings (PDF)', 'Assembly documentation'],
  },
  {
    code: 'PR',
    title: 'Prototyping & manufacturing support',
    slug: 'prototyping',
    order: 40,
    headline: 'From files to parts on the bench.',
    summary:
      'Functional prototypes, iteration and the preparation work that gets a design ready for production — with specialist manufacturers wherever the process calls for them.',
    capabilities: [
      { label: 'Functional 3D printing' },
      { label: 'Custom printed components' },
      { label: '3D scanning of components' },
      { label: 'Reverse engineering' },
      { label: 'Prototype development and assembly' },
      { label: 'Fit and assembly testing' },
      { label: 'Iterative design refinement' },
      { label: 'Manufacturing preparation' },
      { label: 'Coordination with manufacturing partners', delivery: 'partner' },
    ],
    deliverables: ['Prototype hardware', 'Revision notes', 'Manufacturing data package'],
  },
]

export const DISCIPLINE_LABEL: Record<string, string> = {
  electronics: 'Electronics & PCB',
  firmware: 'Firmware',
  mechanical: 'Mechanical & CAD',
  prototyping: 'Prototyping',
}

export const STATUS_LABEL: Record<string, string> = {
  concept: 'Concept',
  design: 'In design',
  prototype: 'Prototype',
  fabricated: 'Fabricated',
  testing: 'In testing',
  production: 'In production',
  internal: 'Internal R&D',
}
