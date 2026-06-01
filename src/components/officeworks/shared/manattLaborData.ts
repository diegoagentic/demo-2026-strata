// ═══════════════════════════════════════════════════════════════════════════════
// MANATT · Labor & Delivery Estimation demo data
//
// Same project as MANATT_ORDER_META (manattOrderData.ts) · PO-DC-0009642 ·
// MANATT Phelps & Phillips · 4th Floor · DC market · 1551 K St NW.
//
// The L&D flow runs IN PARALLEL to the Spec Check & Design flow per the
// AS-IS BPMN: while Kimberly's BOM is being designed, Alan's ops team is
// running the labor RFP to 3 approved DC installers.
//
// Source anchors (every datum traces to AS-IS doc / clarification call):
//   - Volumes:        Notion AS-IS §Summary
//   - Conditions:     Notion AS-IS §3 + Clarification call ~6:54 / ~52:05
//   - Installers:     Notion AS-IS §4 (DC pool consolidation)
//   - Benchmark:      Notion AS-IS §6 (Alan's mental formula)
//   - DC 2024 case:   Notion AS-IS §8 ($160k → $106k post-rebid)
// ═══════════════════════════════════════════════════════════════════════════════

export const MANATT_LD_RFP = {
    poNumber: 'PO-DC-0009642',                          // mismo PO sc1.x
    projectName: 'MANATT Phelps & Phillips · 4th Floor',
    market: 'DC',
    gcCompany: 'CBRE',
    gcContact: 'jonathan.spence@cbre.com',
    gcContactName: 'Jonathan Spence',
    drawingFile: 'manatt-4th-floor.dwg',                // mismo file sc1.0b
    rfpReceivedAt: '2026-05-12 09:14',
    slaDeadlineHours: 48,
    slaDeadlineAt: '2026-05-14 09:14',
    gcPortalRef: 'BC-RFP-882041',
    gcPortal: 'Building Connected',
    buildingAddress: '1551 K St NW · Washington DC',
    priorProjectsAtAddress: 5,
} as const;

export const MANATT_TAKEOFF = {
    workstationCount: 127,
    crCount: 18,
    estimatedLaborHours: 320,
    estimatedDeliveryStops: 2,
    takeoffSourceFile: 'manatt-4th-floor.dwg',
    bluebeamTimeManualMin: 150,                          // 2.5h manual count
    strataTimeSec: 18,
} as const;

export const TAKEOFF_BULLETS = [
    'Reading manatt-4th-floor.dwg · 4,820 entities',
    'Detecting workstations · 127 found',
    'Detecting CRs · 18 found',
    'Estimating labor hours · 320 h',
    'Detecting delivery stops · 2 stops',
] as const;

export type ConditionConfidence = 'high' | 'medium' | 'low';

export const MANATT_BUILDING_CONDITIONS = [
    { id: 'freight',    label: 'Freight elevator',          value: "Yes · 8'×6'×9'",       confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW (5 prior projects)' },
    { id: 'lift',       label: 'Single vs double lift',     value: 'Single lift',           confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'dock',       label: 'Loading dock',              value: 'Dock with leveler',     confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'trailer',    label: 'Trailer size limit',        value: "48' max",               confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'union',      label: 'Union building',            value: 'Yes · IBEW Local 26',   confidence: 'high'   as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'hours',      label: 'Receiving hours',           value: 'M-F 7am-4pm',           confidence: 'medium' as ConditionConfidence, source: 'Project intake form (CBRE)' },
    { id: 'ot',         label: 'OT vs straight-time',       value: 'Straight-time only',    confidence: 'high'   as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'noise',      label: 'Noise restriction hours',   value: 'After 8pm',             confidence: 'medium' as ConditionConfidence, source: 'Building KB · 1551 K St NW' },
    { id: 'prevailing', label: 'Prevailing wage',           value: 'No',                    confidence: 'medium' as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'osha',       label: 'OSHA + badging',            value: 'OSHA-30 + badging',     confidence: 'high'   as ConditionConfidence, source: 'GC RFP attachment' },
    { id: 'stair',      label: 'Stair carry required',      value: 'No',                    confidence: 'high'   as ConditionConfidence, source: 'Floor plan analysis' },
    { id: 'equipment',  label: 'Equipment provision',       value: '100% installer-provided', confidence: 'high' as ConditionConfidence, source: 'OW MSA policy · all special equipment by installer' },
] as const;

export type BuildingCondition = (typeof MANATT_BUILDING_CONDITIONS)[number];

export const APPROVED_INSTALLERS_DC = [
    {
        id: 'V001',
        name: 'Pinnacle Systems Inc',
        markets: 'DC · NoVA',
        msaRate: '$58/hr blended',
        headroom: 'Low (3 active)',
        headroomTone: 'warning' as const,
        onTimeRate: 92,
        changeOrderRate: 4,
        unionStatus: 'Union',
        flagText: 'Capacity headroom Low',
        flagTone: 'warning' as const,
    },
    {
        id: 'V002',
        name: 'Northeast Installation Co',
        markets: 'DC · MD',
        msaRate: '$62/hr blended',
        headroom: 'Available',
        headroomTone: 'neutral' as const,
        onTimeRate: 88,
        changeOrderRate: 7,
        unionStatus: 'Union',
        flagText: null,
        flagTone: null,
    },
    {
        id: 'V003',
        name: 'TriState Labor Solutions',
        markets: 'DC · NJ · NY',
        msaRate: '$56/hr blended',
        headroom: 'High',
        headroomTone: 'success' as const,
        onTimeRate: 96,
        changeOrderRate: 2,
        unionStatus: 'Union + non-union',
        flagText: 'Strata recommends',
        flagTone: 'success' as const,
    },
] as const;

export type Installer = (typeof APPROVED_INSTALLERS_DC)[number];

export const BID_RESPONSES = [
    { vendorId: 'V001', laborTotal: 18450, deliveryTotal: 2800, total: 21250, receivedAt: '2026-05-13 14:22', deliveryHours: 28, arrivalDelayMs:  800 },
    { vendorId: 'V002', laborTotal: 19200, deliveryTotal: 2500, total: 21700, receivedAt: '2026-05-13 16:08', deliveryHours: 32, arrivalDelayMs: 1700 },
    { vendorId: 'V003', laborTotal: 17800, deliveryTotal: 3100, total: 20900, receivedAt: '2026-05-14 09:45', deliveryHours: 24, arrivalDelayMs: 2700 },
] as const;

export type BidResponse = (typeof BID_RESPONSES)[number];

export const INTERNAL_BENCHMARK = {
    laborHours: 320,
    hourlyRateBlend: 60,
    laborBaseline: 19200,
    deliveryStops: 2,
    deliveryRateEach: 1350,
    deliveryBaseline: 2700,
    totalBaseline: 21900,
    formulaText: '320 hrs × $60/hr (MSA blended DC) + 2 stops × $1,350',
    varianceThresholdPct: 15,
} as const;

export const FINAL_QUOTE = {
    winnerVendorId: 'V003',
    vendorNet: 20900,                                   // TriState total
    owMarginPct: 0.18,
    owMarginAmount: 3762,
    quotedTotal: 24662,
    excelTemplate: 'CBRE-Quote-Template-v3.xlsx',
    excelCells: { labor: 'B12', delivery: 'B13', owTotal: 'B14', owMarginPct: 'D17' },
    portalSubmittedAt: '2026-05-14 16:42',
    portalRef: 'BC-RFP-882041',
} as const;

export const PORTAL_UPLOAD_BULLETS = [
    'Validating Excel cells · B12 / B13 / B14 / D17',
    'Verifying formula integrity · 4/4 cells balanced',
    'Encrypting payload · Building Connected secure channel',
    'Uploading to Building Connected · BC-RFP-882041',
] as const;

export const HISTORICAL_RECEIPTS = {
    dcRebid2024:        { quoted: 160000, actual: 106000, delta: 54000, note: 'DC job 2024 · $160k/floor quoted → $106k/floor post-rebid' },
    colonialBoston2024: { quoted: 175000, internal: 100000, delta: 75000, note: 'Colonial/Boston 2024 · $175k quoted vs $100k internal check' },
    netflixNearMiss:    { note: 'Netflix RFP 2024 · priced manually on phone with Alan minutes before portal close' },
} as const;

// ─── Volume painpoints citados literalmente del AS-IS / call transcript ─────
export const LD_VOLUME_FACTS = {
    estimatesPerMonth: 300,
    furniturePct: 80,                                   // ~240/mes
    wallsPct: 20,                                       // ~40/mes
    activeSimultaneous: '50–100',
    outboundEmailsPerMonth: '700–900',
    bluebeamManualNote: 'Single most time-consuming step entire process · Alan + Paul confirmed',
    nowhereCurrentlyQuote: '"Nowhere currently. Nowhere currently." — Alan McPhee · clarification call ~6:54',
    vendorConsolidationNote: 'DC pool consolidated May/2026 · 20 → 6 vendors · target ≤4 per market',
} as const;

// ─── L&D actor ───────────────────────────────────────────────────────────────
// Alan McPhee · Sr Operations · Burlington MA · 25+ yrs · Furniture vertical
// regional lead · equivalente operativo a Felicia en design.
export const ALAN_MCPHEE = {
    fullName: 'Alan McPhee',
    initials: 'AM',
    role: 'Sr Operations · Furniture',
    region: 'Burlington MA · Regional Lead',
    seniorityYears: 25,
    email: 'alan.mcphee@officeworks.com',
} as const;

// ─── L&D Pipeline data · context cards + MANATT badges/subtitles per col ────
// Mirrors the shape of CONTEXT_CARDS / MANATT_BADGE / MANATT_SUBTITLE in
// OfficeworksFunnel.tsx so the funnel can render the L&D flow consistently.

export interface LDContextCard {
    code: string
    initials: string
    client: string
    value: string
    colIdx: number
    avatarBg: string
    avatarColor: string
    desc: string
    designer: string
}

export const LD_CONTEXT_PROJECTS: LDContextCard[] = [
    {
        code: 'TECHVIEW-MA-2F', initials: 'TV', client: 'TechView Systems · Cambridge MA',
        value: '$18,200', colIdx: 2,                              // Vendor Bid column
        avatarBg: 'bg-warning/20', avatarColor: 'text-warning',
        desc: '3 RFPs sent · awaiting installer responses · 18h remaining',
        designer: 'Priya Shah (MA)',
    },
    {
        code: 'BAYHILL-NJ-3F', initials: 'BH', client: 'Bay Hill Law · Newark NJ',
        value: '$32,400', colIdx: 3,                              // Bid Eval column
        avatarBg: 'bg-primary/20', avatarColor: 'text-primary',
        desc: '3 bids received · Northeast winner candidate · variance 8%',
        designer: 'Marcus Chen (NJ)',
    },
    {
        code: 'GENSCAP-PA-5F', initials: 'GC', client: 'GenCap Capital · Philadelphia PA',
        value: '$48,800', colIdx: 4,                              // Final Quote column
        avatarBg: 'bg-success/20', avatarColor: 'text-success',
        desc: 'Quote $48.8k · uploaded to GC portal · awaiting award',
        designer: 'Marcus Chen (NJ)',
    },
];

export const MANATT_LD_BADGE: Record<number, { label: string; className: string }> = {
    0: { label: 'RFP routed',     className: 'bg-ai/10 text-ai border border-ai/20' },
    1: { label: 'Conditions OK',  className: 'bg-info/10 text-info border border-info/20' },
    2: { label: 'Bid sent',       className: 'bg-warning/10 text-warning border border-warning/20' },
    3: { label: 'Variance OK',    className: 'bg-primary/10 text-primary border border-primary/20' },
    4: { label: 'Quote uploaded', className: 'bg-success/10 text-success border border-success/20' },
};

export const MANATT_LD_BADGE_BY_STEP: Record<string, { label: string; className: string }> = {
    'sc-LD.0': { label: 'New RFP',       className: 'bg-ai/10 text-ai border border-ai/20' },
    'sc-LD.1': { label: 'Takeoff ready', className: 'bg-info/10 text-info border border-info/20' },
};

export const MANATT_LD_SUBTITLE: Record<number, string> = {
    0: 'RFP from CBRE · 3 attachments · SLA 48h running',
    1: '12 conditions captured · 1551 K St NW · union IBEW 26',
    2: '3 installers DC · Pinnacle · Northeast · TriState',
    3: '3 bids in · benchmark $21.9k · TriState recommended',
    4: 'Net $20.9k + 18% margin = $24,662 · uploaded · BC-RFP-882041',
};

export const MANATT_LD_SUBTITLE_BY_STEP: Record<string, string> = {
    'sc-LD.0': 'New RFP from CBRE via Building Connected · awaiting acknowledge',
    'sc-LD.1': 'RFP routed · ready to run AI takeoff on manatt-4th-floor.dwg',
    'sc-LD.5': '3 bids received within 48h · variance check in progress',
    'sc-LD.6': 'TriState selected · loser notifications drafted',
};
