// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · W-9 records mock · F74 Phase 1B.D (2026-08-14)
// Compliance schema per feedback-acme-dealer-net-new-gaps · net-new fields
// (TIN · entity type · signed date freshness · 1099 · ACH · W-8 BEN-E)
// ═══════════════════════════════════════════════════════════════════════════════

export type EntityType =
    | 'Sole Proprietor'
    | 'LLC'
    | 'C-Corp'
    | 'S-Corp'
    | 'Partnership'
    | 'Non-profit'
    | 'Foreign (W-8 BEN-E)'

export type OcrConfidenceBand = 'high' | 'medium' | 'low' // ≥95 / 70-94 / <70

export interface W9Field {
    key: string
    label: string
    value: string
    conf: number // 0-100
    band: OcrConfidenceBand
    correctable?: boolean
}

export interface W9Record {
    id: string
    vendorName: string // matches request intake
    mfgCode?: string
    fileName: string
    signedDate: string // ISO
    freshDays: number // days since signed
    fields: W9Field[]
    is1099Individual: boolean
    achOnFile: boolean
    achLastVerified?: string // ISO
    w8BenERequired: boolean
    ofacClear: boolean
    isNonUS: boolean
}

// The vendor Kelly is onboarding in the demo (F2 anchor)
export const WBD_W9: W9Record = {
    id: 'W9-WBD-2026-08-14',
    vendorName: 'Warehouse by Design',
    mfgCode: 'WBD',
    fileName: 'WarehouseByDesign_W-9_signed.pdf',
    signedDate: '2026-03-12',
    freshDays: 155,
    is1099Individual: false,
    achOnFile: true,
    achLastVerified: '2026-03-15',
    w8BenERequired: false,
    ofacClear: true,
    isNonUS: false,
    fields: [
        { key: 'legal-name',  label: 'Legal name',   value: 'Warehouse by Design LLC',    conf: 99, band: 'high' },
        { key: 'entity-type', label: 'Entity type',  value: 'LLC · Single-member',        conf: 96, band: 'high' },
        { key: 'ein',         label: 'EIN / TIN',    value: '**-***2841',                  conf: 92, band: 'medium', correctable: true },
        { key: 'signed-date', label: 'Signed date',  value: '2026-03-12 · fresh (< 12 mo)', conf: 100, band: 'high' },
        { key: 'address',     label: 'Address',      value: '4820 Wynkoop St · Denver CO 80216', conf: 88, band: 'medium', correctable: true },
    ],
}

// The other 7 vendors that appear en la registry grid (row-per-row for animation)
export interface RegistryRow {
    id: number
    vendorName: string
    mfgCode: string
    entityType: EntityType
    w9SignedDate: string
    w9Age: 'fresh' | '30-day-out' | 'expired'
    achOnFile: boolean
    is1099: boolean
    activelyPaid: boolean
    activeProjects: number
}

export const ACME_DEALER_VENDOR_REGISTRY: RegistryRow[] = [
    { id: 734, vendorName: 'Warehouse by Design',    mfgCode: 'WBD',  entityType: 'LLC',            w9SignedDate: '2026-03-12', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: false, activeProjects: 1 },
    { id: 733, vendorName: 'Teknion',                mfgCode: 'TEK',  entityType: 'C-Corp',         w9SignedDate: '2025-11-04', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 8 },
    { id: 732, vendorName: 'HBF',                    mfgCode: 'HBF',  entityType: 'C-Corp',         w9SignedDate: '2026-02-12', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 3 },
    { id: 731, vendorName: 'Boss Design',            mfgCode: 'BDG',  entityType: 'C-Corp',         w9SignedDate: '2025-08-19', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 2 },
    { id: 730, vendorName: 'Alamir',                 mfgCode: 'ALA',  entityType: 'LLC',            w9SignedDate: '2025-06-01', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 4 },
    { id: 729, vendorName: 'Nelson and Company',     mfgCode: 'NLC',  entityType: 'C-Corp',         w9SignedDate: '2025-09-22', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 1 },
    { id: 728, vendorName: 'West Elm',               mfgCode: 'WEL',  entityType: 'C-Corp',         w9SignedDate: '2025-01-18', w9Age: '30-day-out',  achOnFile: false, is1099: false, activelyPaid: true,  activeProjects: 1 },
    { id: 727, vendorName: 'Ryan\'s Carpentry',      mfgCode: 'RYC',  entityType: 'Sole Proprietor', w9SignedDate: '2023-11-05', w9Age: 'expired',    achOnFile: true,  is1099: true,  activelyPaid: true,  activeProjects: 0 },
    { id: 726, vendorName: 'Clear Space Solutions',  mfgCode: 'CSS',  entityType: 'LLC',            w9SignedDate: '2025-05-20', w9Age: 'fresh',       achOnFile: true,  is1099: false, activelyPaid: true,  activeProjects: 2 },
    { id: 725, vendorName: 'Digital Interior Group', mfgCode: 'DIG',  entityType: 'C-Corp',         w9SignedDate: '2025-07-11', w9Age: 'fresh',       achOnFile: false, is1099: false, activelyPaid: true,  activeProjects: 1 },
]

// Preflight checks para p2.3
export interface PreflightCheck {
    id: string
    label: string
    detail: string
    result: 'pass' | 'warn' | 'fail'
    checkedAt?: string
}

export const WBD_PREFLIGHT: PreflightCheck[] = [
    { id: 'w9-fresh',    label: 'W-9 signed date < 12 mo',       detail: 'Signed 2026-03-12 · 155 days · well within Jacob\'s 12-mo rule', result: 'pass' },
    { id: '1099-flag',   label: '1099-NEC required · individual', detail: 'LLC single-member · NOT 1099-flagged · corporate withholding',   result: 'pass' },
    { id: 'ach-verified', label: 'ACH bank routing verified',    detail: 'Routing 102000076 · verified via Plaid 2026-03-15',                 result: 'pass' },
    { id: 'w8-bene',     label: 'W-8 BEN-E · non-US only',       detail: 'US address (Denver CO) · W-8 BEN-E not required',                 result: 'pass' },
]

// Active projects para p2.6 dealer readiness view
export interface ProjectStatus {
    id: string
    name: string
    vendorReady: boolean
    nextPaymentRun?: string // "Tue Aug 19"
    expirationsIn30: number
}

export const KELLY_PROJECTS: ProjectStatus[] = [
    { id: 'NCBA',            name: 'NCBA · National Cattlemen\'s',  vendorReady: true,  nextPaymentRun: 'Tue Aug 19',  expirationsIn30: 0 },
    { id: 'MWH',             name: 'MWH residential',                vendorReady: true,  nextPaymentRun: 'Tue Aug 19',  expirationsIn30: 1 },
    { id: 'Fairport',        name: 'Fairport HQ · phase 2',          vendorReady: true,  nextPaymentRun: 'Tue Aug 19',  expirationsIn30: 0 },
    { id: 'DenverFinancial', name: 'Denver Financial · install',    vendorReady: true,  nextPaymentRun: 'Tue Aug 19',  expirationsIn30: 1 },
]
