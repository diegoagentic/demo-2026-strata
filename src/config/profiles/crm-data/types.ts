import type { Stage, IntakeColumn, Vertical } from './enums'

export type BadgeColor = 'green' | 'orange' | 'yellow' | 'blue' | 'purple' | 'red'

export interface Participant {
    name: string
    role: string
}

export interface RevenueSplit {
    furniture: number
    arch: number
    install: number
    prof: number
}

export interface Opportunity {
    id: string | null
    name: string
    company: string
    vertical: Vertical
    stage: Stage
    probability: number
    closeDate: string
    color: BadgeColor
    primaryMfr: string
    ancillaryMfrs: string[]
    revenue: RevenueSplit
    participants: Participant[]
    gsaContract: string
    contractVehicle: string
    pricingTier: string
    gpo: string
    phasedSchedule: string
    generalContractor: string
    permitStatus: string
    prevailingWage: boolean
    headcount: string
    budgetSF: string
    sources: string[]
    aiGenerated: boolean
}

export interface IntakeCardData {
    code: string
    badge: string
    color: BadgeColor
    org: string
    meta: string
    assignee: string
    amount: number
    column: IntakeColumn
}

export interface ExtractionRow {
    label: string
    value: string
    source?: string
    conf: 'high' | 'med'
}

export interface ExtractionResult {
    prefill: Opportunity
    rows: ExtractionRow[]
}

export interface ImportFile {
    name: string
    size: number
    kind: 'email' | 'pdf' | 'cad' | 'image' | 'other'
}
