// Mock data for Flow 1 — Calendar Sync
//
// 14 install jobs across NY/NJ/PA, 6 weeks starting Mon Jun 1 2026.
// Fairport Public Library is the anchor (5 IQ jobs · all CLC vendors).

export type Region = 'ny' | 'nj' | 'pa'

export interface InstallJob {
    id: string
    iqJobIds: string[]           // 1-5 IQ jobs per project (state-contract structure)
    customer: string
    project: string
    region: Region
    vendors: string[]
    /** ISO date (YYYY-MM-DD) for install start */
    startDate: string
    /** ISO date for install end (same day OK) */
    endDate: string
    crewSize: number
    durationDays: number
    status: 'pending' | 'scheduled' | 'in-flight' | 'complete'
    /** True if Strata auto-scheduled this from IQ data (renders Sparkles) */
    aiScheduled: boolean
    isAnchor?: boolean
}

export interface WeekColumn {
    /** ISO date of the Monday */
    monday: string
    /** "Jun 1" display */
    label: string
}

export interface RegionCapacity {
    region: Region
    label: string
    inHouseCrews: number
    /** Total jobs assigned this week (used as load metric) */
    weeklyLoad: Record<string, number>  // keyed by week monday ISO
    status: 'green' | 'amber' | 'red'
    activeJobs: number
}

// ─── Weeks ───────────────────────────────────────────────────────────────────

export const WEEKS: WeekColumn[] = [
    { monday: '2026-06-01', label: 'Jun 1' },
    { monday: '2026-06-08', label: 'Jun 8' },
    { monday: '2026-06-15', label: 'Jun 15' },
    { monday: '2026-06-22', label: 'Jun 22' },
    { monday: '2026-06-29', label: 'Jun 29' },
    { monday: '2026-07-06', label: 'Jul 6' },
]

// ─── Install Jobs ────────────────────────────────────────────────────────────

export const INITIAL_JOBS: InstallJob[] = [
    // ─── Fairport Public Library · NY · anchor · 5 IQ jobs · all 5 vendors ──
    {
        id: 'job-fairport',
        iqJobIds: ['J-44021', 'J-44022', 'J-44023', 'J-44024', 'J-44025'],
        customer: 'Fairport Public Library',
        project: 'Fairport Library Phase 1',
        region: 'ny',
        vendors: ['TMC', 'KI', 'Smith System', 'Media Tech', 'Aurora'],
        startDate: '2026-06-02',
        endDate: '2026-06-03',
        crewSize: 4,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
        isAnchor: true,
    },
    // ─── Other NY jobs (week of Jun 1 · creating the capacity conflict) ──
    {
        id: 'job-jamestown',
        iqJobIds: ['J-44018'],
        customer: 'Jamestown Branch Library',
        project: 'Jamestown Teen Area Refresh',
        region: 'ny',
        vendors: ['KI'],
        startDate: '2026-06-01',
        endDate: '2026-06-01',
        crewSize: 2,
        durationDays: 1,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-brockport',
        iqJobIds: ['J-44030', 'J-44031'],
        customer: 'Brockport Public Library',
        project: 'Brockport Adult Collection Move',
        region: 'ny',
        vendors: ['Smith System', 'Aurora'],
        startDate: '2026-06-04',
        endDate: '2026-06-04',
        crewSize: 3,
        durationDays: 1,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-ithaca',
        iqJobIds: ['J-44045'],
        customer: 'Ithaca College Library',
        project: 'Ithaca Quiet Study Pods',
        region: 'ny',
        vendors: ['TMC'],
        startDate: '2026-06-15',
        endDate: '2026-06-16',
        crewSize: 2,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-syracuse',
        iqJobIds: ['J-44060'],
        customer: 'Syracuse Public Library',
        project: 'Syracuse Children\'s Area',
        region: 'ny',
        vendors: ['Media Tech'],
        startDate: '2026-06-23',
        endDate: '2026-06-23',
        crewSize: 2,
        durationDays: 1,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-rochester',
        iqJobIds: ['J-44075'],
        customer: 'Rochester Memorial Library',
        project: 'Rochester Service Desk Replacement',
        region: 'ny',
        vendors: ['KI'],
        startDate: '2026-07-07',
        endDate: '2026-07-08',
        crewSize: 3,
        durationDays: 2,
        status: 'pending',
        aiScheduled: false,
    },
    // ─── NJ jobs ────────────────────────────────────────────────────────────
    {
        id: 'job-manalapan',
        iqJobIds: ['J-44012'],
        customer: 'Manalapan Branch Library',
        project: 'Manalapan Lounge Refresh',
        region: 'nj',
        vendors: ['Aurora'],
        startDate: '2026-06-08',
        endDate: '2026-06-08',
        crewSize: 2,
        durationDays: 1,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-newark',
        iqJobIds: ['J-44020', 'J-44021-NJ'],
        customer: 'Newark Public Library',
        project: 'Newark Main Branch Shelving',
        region: 'nj',
        vendors: ['Smith System', 'TMC'],
        startDate: '2026-06-16',
        endDate: '2026-06-17',
        crewSize: 4,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-trenton',
        iqJobIds: ['J-44035'],
        customer: 'Trenton Free Library',
        project: 'Trenton Children\'s Room',
        region: 'nj',
        vendors: ['KI'],
        startDate: '2026-06-29',
        endDate: '2026-06-30',
        crewSize: 3,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-princeton',
        iqJobIds: ['J-44050'],
        customer: 'Princeton Branch Library',
        project: 'Princeton Tech Bar Install',
        region: 'nj',
        vendors: ['Media Tech'],
        startDate: '2026-07-09',
        endDate: '2026-07-10',
        crewSize: 2,
        durationDays: 2,
        status: 'pending',
        aiScheduled: false,
    },
    // ─── PA jobs ────────────────────────────────────────────────────────────
    {
        id: 'job-pittsburgh',
        iqJobIds: ['J-44008'],
        customer: 'Pittsburgh Carnegie Library',
        project: 'Pittsburgh Branch Modernization',
        region: 'pa',
        vendors: ['TMC'],
        startDate: '2026-06-10',
        endDate: '2026-06-11',
        crewSize: 3,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-philly',
        iqJobIds: ['J-44040'],
        customer: 'Free Library of Philadelphia',
        project: 'Philly Central Reading Room',
        region: 'pa',
        vendors: ['KI'],
        startDate: '2026-06-25',
        endDate: '2026-06-26',
        crewSize: 4,
        durationDays: 2,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-harrisburg',
        iqJobIds: ['J-44055'],
        customer: 'Harrisburg State Library',
        project: 'Harrisburg Periodicals Update',
        region: 'pa',
        vendors: ['Aurora'],
        startDate: '2026-07-02',
        endDate: '2026-07-02',
        crewSize: 2,
        durationDays: 1,
        status: 'scheduled',
        aiScheduled: true,
    },
    {
        id: 'job-bethlehem',
        iqJobIds: ['J-44070'],
        customer: 'Bethlehem Public Library',
        project: 'Bethlehem Computer Lab',
        region: 'pa',
        vendors: ['Media Tech'],
        startDate: '2026-07-08',
        endDate: '2026-07-09',
        crewSize: 3,
        durationDays: 2,
        status: 'pending',
        aiScheduled: false,
    },
]

// ─── Capacity by region ─────────────────────────────────────────────────────

export const CAPACITY_BY_REGION: RegionCapacity[] = [
    {
        region: 'ny',
        label: 'New York',
        inHouseCrews: 2,
        weeklyLoad: {
            '2026-06-01': 3,   // OVER — 3 jobs simultaneously week of Jun 1
            '2026-06-08': 0,
            '2026-06-15': 1,
            '2026-06-22': 1,
            '2026-06-29': 0,
            '2026-07-06': 1,
        },
        status: 'red',
        activeJobs: 6,
    },
    {
        region: 'nj',
        label: 'New Jersey',
        inHouseCrews: 2,
        weeklyLoad: {
            '2026-06-01': 0,
            '2026-06-08': 1,
            '2026-06-15': 1,
            '2026-06-22': 0,
            '2026-06-29': 1,
            '2026-07-06': 1,
        },
        status: 'amber',
        activeJobs: 4,
    },
    {
        region: 'pa',
        label: 'Pennsylvania',
        inHouseCrews: 1,
        weeklyLoad: {
            '2026-06-01': 0,
            '2026-06-08': 1,
            '2026-06-15': 0,
            '2026-06-22': 1,
            '2026-06-29': 1,
            '2026-07-06': 1,
        },
        status: 'green',
        activeJobs: 4,
    },
]

// ─── Region colors (DS tokens · brand-300 lime never used for text) ─────────

export const REGION_BADGE: Record<Region, string> = {
    ny: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    nj: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    pa: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

export const REGION_LABEL: Record<Region, string> = {
    ny: 'NY',
    nj: 'NJ',
    pa: 'PA',
}

// ─── Third-party installer suggestion (Flow 1 · clc1.3) ──────────────────────

export const THIRD_PARTY_INSTALLER = {
    name: 'Albany Install Co.',
    distance: 'Albany · 4hr radius',
    history: '7 prior CLC jobs · COI on file · vetted 2024-Q2',
    note: 'Available the week of Jun 1 · 1 crew of 3 available Mon-Wed',
}
