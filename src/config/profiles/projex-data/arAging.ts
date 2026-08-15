// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · AR aging + billing milestones mock · F74 Phase 1B.B (2026-08-14)
// SOT §12c · FC11 progress judgment · FC12 personal Outlook · WC9 Walls gate ·
// AR3 dead-tracker · Net 10 + 1.5%/mo late fee · 50/40/10 furniture · 60/30/10 Walls
// ═══════════════════════════════════════════════════════════════════════════════

export type ARBucket = '0-30' | '31-60' | '61-90' | '90+'
export type ARStatus = 'pending-approval' | 'no-response' | 'committed-to-pay' | 'escalated'

export interface ARRecord {
    id: string
    invoiceNumber: string
    customer: string
    project: string
    amount: number
    daysPastDue: number
    bucket: ARBucket
    status: ARStatus
    lastContact?: string // ISO
    lateFeeAccrued: number
    ownedBy: 'isabella' | 'alec' | 'jacob'
    notes?: string
}

// Bucket helper (net-new per feedback-projex-net-new-gaps)
export function computeARBucket(daysPastDue: number): ARBucket {
    if (daysPastDue <= 30) return '0-30'
    if (daysPastDue <= 60) return '31-60'
    if (daysPastDue <= 90) return '61-90'
    return '90+'
}

// 12 AR records across MWH / Fairport / Denver Financial / NCBA
export const PROJEX_AR_RECORDS: ARRecord[] = [
    // 0-30 bucket · current
    { id: 'AR-3421', invoiceNumber: 'PJX-INV-3421', customer: 'Fairport HQ · phase 2',       project: 'Furniture 50/40/10 · 40% draw',  amount: 24500, daysPastDue: 8,   bucket: '0-30', status: 'pending-approval', ownedBy: 'isabella', lateFeeAccrued: 0,     lastContact: '2026-08-13' },
    { id: 'AR-3418', invoiceNumber: 'PJX-INV-3418', customer: 'MWH residential',              project: 'Deposit 50% · MWH kickoff',      amount: 128000, daysPastDue: 3,   bucket: '0-30', status: 'committed-to-pay', ownedBy: 'isabella', lateFeeAccrued: 0,     lastContact: '2026-08-14' },
    { id: 'AR-3415', invoiceNumber: 'PJX-INV-3415', customer: 'NCBA · install completion',    project: 'Walls 60/30/10 · 30% draw',      amount: 18740, daysPastDue: 12,  bucket: '0-30', status: 'pending-approval', ownedBy: 'alec',     lateFeeAccrued: 0,     lastContact: '2026-08-12' },

    // 31-60 bucket · draft email
    { id: 'AR-3399', invoiceNumber: 'PJX-INV-3399', customer: 'Kenwood Health',                project: 'Nurse station · 10% retention',  amount: 8420,  daysPastDue: 42,  bucket: '31-60', status: 'no-response',      ownedBy: 'isabella', lateFeeAccrued: 176.82, lastContact: '2026-07-15' },
    { id: 'AR-3395', invoiceNumber: 'PJX-INV-3395', customer: 'Denver Tech Corp',              project: 'Furniture · 40% draw',           amount: 32100, daysPastDue: 38,  bucket: '31-60', status: 'no-response',      ownedBy: 'isabella', lateFeeAccrued: 610.05, lastContact: '2026-07-18' },
    { id: 'AR-3392', invoiceNumber: 'PJX-INV-3392', customer: 'Fairport HQ · phase 1',        project: 'Walls · 30% draw',               amount: 14650, daysPastDue: 48,  bucket: '31-60', status: 'pending-approval', ownedBy: 'alec',     lateFeeAccrued: 351.60, lastContact: '2026-07-05' },

    // 61-90 bucket · firm follow-up
    { id: 'AR-3376', invoiceNumber: 'PJX-INV-3376', customer: 'Denver Financial · exec suite', project: 'Deposit 50% · furniture',        amount: 42800, daysPastDue: 68,  bucket: '61-90', status: 'escalated',        ownedBy: 'jacob',    lateFeeAccrued: 1454.53, lastContact: '2026-06-20' },
    { id: 'AR-3372', invoiceNumber: 'PJX-INV-3372', customer: 'Aspen Retreat Group',           project: 'Furniture · 10% retention',      amount: 6250,  daysPastDue: 72,  bucket: '61-90', status: 'no-response',      ownedBy: 'isabella', lateFeeAccrued: 225.00, lastContact: '2026-06-15' },

    // 90+ bucket · escalate to Jacob
    { id: 'AR-3341', invoiceNumber: 'PJX-INV-3341', customer: 'Culture Denver LLC',            project: 'Small hospitality retrofit',     amount: 6250,  daysPastDue: 95,  bucket: '90+', status: 'escalated',         ownedBy: 'jacob',    lateFeeAccrued: 297.66, lastContact: '2026-05-11' },
    { id: 'AR-3335', invoiceNumber: 'PJX-INV-3335', customer: 'Mile High Medical Group',       project: 'Furniture install · final',      amount: 12400, daysPastDue: 102, bucket: '90+', status: 'escalated',         ownedBy: 'jacob',    lateFeeAccrued: 632.40, lastContact: '2026-05-04' },
]

// Milestone thresholds per project (billing structures)
export interface BillingMilestone {
    project: string
    structure: '50/40/10' | '60/30/10' | '50/25/15/10' // MWH outlier
    department: 'Furniture' | 'Walls'
    orderedPct: number
    shippedPct: number
    invoicedPct: number
    thresholds: { name: string; atPct: number; fired: boolean }[]
    nextMilestoneAt: number
    nextMilestoneName: string
    totalValue: number
}

export const PROJEX_MILESTONES: BillingMilestone[] = [
    {
        project: 'Fairport HQ · phase 2',
        structure: '50/40/10',
        department: 'Furniture',
        orderedPct: 52, // just crossed 50 · trigger for demo
        shippedPct: 18,
        invoicedPct: 40,
        thresholds: [
            { name: '40% draw',  atPct: 40, fired: true },
            { name: '80% draw',  atPct: 80, fired: false },
            { name: 'Retention', atPct: 100, fired: false },
        ],
        nextMilestoneAt: 50,
        nextMilestoneName: '50% ordered · fires 40% draw',
        totalValue: 61250, // 50/40/10 = 40% * 61250 = 24500 (matches AR-3421)
    },
    {
        project: 'MWH residential',
        structure: '50/25/15/10',
        department: 'Furniture',
        orderedPct: 78,
        shippedPct: 42,
        invoicedPct: 50,
        thresholds: [
            { name: 'Deposit 50%', atPct: 0, fired: true },
            { name: 'Order draw 25%', atPct: 60, fired: true },
            { name: 'Ship draw 15%', atPct: 90, fired: false },
            { name: 'Retention 10%', atPct: 100, fired: false },
        ],
        nextMilestoneAt: 90,
        nextMilestoneName: '90% shipped · fires 15% draw',
        totalValue: 256000,
    },
    {
        project: 'NCBA · install completion',
        structure: '60/30/10',
        department: 'Walls',
        orderedPct: 65,
        shippedPct: 30,
        invoicedPct: 60,
        thresholds: [
            { name: '60% ordered', atPct: 60, fired: true },
            { name: '90% shipped',  atPct: 90, fired: false },
            { name: 'Retention',    atPct: 100, fired: false },
        ],
        nextMilestoneAt: 90,
        nextMilestoneName: '90% shipped · fires PM-review gate (WC9)',
        totalValue: 62466,
    },
]

// Chart data para p3.1 threshold visualization (last 12 weeks)
export interface ForecastPoint {
    week: string // 'W22' - 'W33'
    ordered: number
    shipped: number
    invoiced: number
}

export const FAIRPORT_FORECAST: ForecastPoint[] = [
    { week: 'W22', ordered: 8,  shipped: 2,  invoiced: 0 },
    { week: 'W23', ordered: 15, shipped: 5,  invoiced: 0 },
    { week: 'W24', ordered: 22, shipped: 8,  invoiced: 0 },
    { week: 'W25', ordered: 28, shipped: 10, invoiced: 0 },
    { week: 'W26', ordered: 34, shipped: 12, invoiced: 0 },
    { week: 'W27', ordered: 38, shipped: 14, invoiced: 0 },
    { week: 'W28', ordered: 42, shipped: 15, invoiced: 40 }, // 40% draw fired
    { week: 'W29', ordered: 45, shipped: 16, invoiced: 40 },
    { week: 'W30', ordered: 47, shipped: 17, invoiced: 40 },
    { week: 'W31', ordered: 49, shipped: 18, invoiced: 40 },
    { week: 'W32', ordered: 51, shipped: 18, invoiced: 40 }, // just crossed 50 · this week
    { week: 'W33', ordered: 52, shipped: 18, invoiced: 40 }, // today
]

// Collection email drafts (queue de Isabella + Alec compartida)
export interface CollectionDraft {
    id: string
    recordId: string // FK to ARRecord
    subject: string
    body: string
    tone: 'friendly' | 'firm' | 'escalation'
    authoredBy: 'isabella' | 'alec' | 'strata'
    status: 'draft' | 'edited' | 'sent'
    createdAt: string // ISO
}

export const COLLECTION_DRAFTS: CollectionDraft[] = [
    {
        id: 'DRFT-01',
        recordId: 'AR-3399',
        subject: 'Friendly follow-up · Invoice PJX-INV-3399 · $8,420 · Net 10',
        tone: 'friendly',
        authoredBy: 'strata',
        status: 'draft',
        createdAt: '2026-08-14T07:15:00Z',
        body: `Hi Kenwood AP team,

Quick check-in on invoice PJX-INV-3399 ($8,420) for the Nurse Station install · dated 2026-07-05, Net 10 terms. Records show it's a touch past due (~42 days · $176.82 late fee accrued).

Please let me know if there's a question on the retention or receiving paperwork · happy to resend.

Thanks —
Isabella · Projex Furniture Coordination`,
    },
    {
        id: 'DRFT-02',
        recordId: 'AR-3395',
        subject: 'Denver Tech Corp · Invoice PJX-INV-3395 · $32,100 · 38 days past',
        tone: 'friendly',
        authoredBy: 'strata',
        status: 'draft',
        createdAt: '2026-08-14T07:15:00Z',
        body: `Hi Denver Tech AP,

Following up on invoice PJX-INV-3395 for $32,100 (Furniture 40% draw). Dated 2026-07-07 · Net 10 · currently 38 days past due · late fee accrued $610.05.

Would you confirm expected payment date so I can update our aging forecast? Reply to this email or upload PO number if that's holding things up.

Thanks —
Isabella`,
    },
    {
        id: 'DRFT-03',
        recordId: 'AR-3376',
        subject: 'Overdue 60+ days · Invoice PJX-INV-3376 · $42,800 · Denver Financial deposit',
        tone: 'firm',
        authoredBy: 'strata',
        status: 'draft',
        createdAt: '2026-08-14T07:15:00Z',
        body: `Hello Denver Financial AP,

Invoice PJX-INV-3376 for $42,800 (Exec Suite · 50% deposit) is now 68 days past our Net 10 terms · cumulative late fee accrued $1,454.53.

Per contract, please remit at your earliest convenience or reply with expected pay date. Escalating to Matt Magrann (Projex CEO) if we do not hear back this week.

Thanks —
Isabella (cc: Jacob)`,
    },
    {
        id: 'DRFT-04',
        recordId: 'AR-3341',
        subject: '90+ day escalation · Invoice PJX-INV-3341 · $6,250',
        tone: 'escalation',
        authoredBy: 'strata',
        status: 'draft',
        createdAt: '2026-08-14T07:15:00Z',
        body: `Culture Denver ownership,

Invoice PJX-INV-3341 for $6,250 remains open at 95 days past Net 10. Cumulative 1.5%/mo late fee has accrued to $297.66.

Per Projex policy this account is escalated to Jacob Swearingen (Director of Accounting) for collection follow-up. Please reach out with a resolution path this week or we\'ll begin next-step collections process.

Thanks —
Isabella (cc: Jacob)`,
    },
    // One authored by Alec · demonstrates shared queue
    {
        id: 'DRFT-05',
        recordId: 'AR-3392',
        subject: 'Fairport phase 1 · Walls 30% draw · pending approval reminder',
        tone: 'friendly',
        authoredBy: 'alec',
        status: 'draft',
        createdAt: '2026-08-14T09:22:00Z',
        body: `Hi Fairport PM team,

Following up on Walls invoice PJX-INV-3392 ($14,650 · 30% draw) for phase 1. Dated 2026-06-30 · Net 10 · 48 days past · late fee accrued $351.60.

Understand it\'s pending internal approval · could you confirm target release date? Happy to jump on a call.

Thanks —
Alec · Projex Walls Director`,
    },
]
