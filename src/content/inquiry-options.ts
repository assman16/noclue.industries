/** Inquiry form options — shared by the form (client), validation (server) and the CMS collection. */

export const INQUIRY_SCOPE = [
  { label: 'Electronics / PCB', value: 'electronics' },
  { label: 'Firmware', value: 'firmware' },
  { label: 'Mechanical / enclosure', value: 'mechanical' },
  { label: 'Prototyping / 3D printing', value: 'prototyping' },
  { label: 'Complete device', value: 'complete' },
  { label: 'Not sure yet', value: 'unsure' },
] as const

export const INQUIRY_STAGE = [
  { label: 'An idea or a problem', value: 'idea' },
  { label: 'Written requirements', value: 'requirements' },
  { label: 'An existing prototype', value: 'prototype' },
  { label: 'An existing product to redesign', value: 'redesign' },
] as const

export const INQUIRY_TIMELINE = [
  { label: 'As soon as possible', value: 'asap' },
  { label: 'Within 3 months', value: '3m' },
  { label: '3–6 months', value: '6m' },
  { label: 'Flexible', value: 'flexible' },
] as const

export const INQUIRY_BUDGET = [
  { label: 'Not decided yet', value: 'undecided' },
  { label: 'Under €5,000', value: 'lt5k' },
  { label: '€5,000 – €15,000', value: '5-15k' },
  { label: '€15,000 – €50,000', value: '15-50k' },
  { label: 'Over €50,000', value: 'gt50k' },
] as const

export const labelOf = (list: readonly { label: string; value: string }[], value?: string | null) =>
  list.find((o) => o.value === value)?.label ?? value ?? '—'

export type InquiryFields = 'name' | 'email' | 'company' | 'scope' | 'stage' | 'timeline' | 'budget' | 'message' | 'privacy'

export type InquiryState =
  | { status: 'idle' }
  | { status: 'success'; reference: string; emailed: boolean }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<InquiryFields, string>>
      values?: Partial<Record<InquiryFields, string | string[]>>
    }
