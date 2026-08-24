// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · Vendor bills sample · F74 Phase 1 (2026-08-14)
// SOT §12a · Bills intake baseline · 224 bills/mo · 287 Q4 peak · sample 14 bills
// para el morning queue overnight sweep (p1.1) + Teknion 291-line PO (p1.2)
// ═══════════════════════════════════════════════════════════════════════════════

export type BillMatchStatus =
    | 'auto-matched'      // Line-item exact-to-the-penny · ready to save
    | 'mismatch'          // Qty / price / substitution mismatch · needs review
    | 'held-no-po'        // AP9 · install vendor · no PO # · awaiting PM confirm
    | 'processing'        // OCR in flight

export type BillEntity = 'dealer-a-inc' | 'dealer-a-corp' | 'culture-llc'

export interface BillLineItem {
    lineNumber: number
    itemCode: string
    description: string
    orderedQty: number
    orderedPrice: number       // Per unit · PO price
    billedQty: number
    billedPrice: number        // Per unit · vendor invoice price
    // Match status per line
    match: 'exact' | 'qty-mismatch' | 'price-mismatch' | 'substitution'
    // Mismatch cause (Jacob's own taxonomy · SOT §12a)
    mismatchCause?: 'tax-rate-change' | 'out-of-stock' | 'substitution' | 'penny-rounding' | 'partial-ship'
}

export interface Bill {
    id: string
    vendorId: string           // FK to DEALER_A_VENDORS
    vendorInvoiceNumber: string
    poNumber?: string          // undefined = held-no-po (AP9)
    entity: BillEntity
    projectName: string
    receivedAt: string         // ISO · overnight arrival
    amount: number
    lineCount: number
    ocrConfidence: number      // 0-100
    status: BillMatchStatus
    // Only populated for the demo Teknion sample (p1.2 · p1.3)
    lineItems?: BillLineItem[]
    // Held bills · awaiting PM confirm
    heldReason?: string
    pmContactId?: string       // FK to DEALER_A_PERSONAS
    // Overnight sweep result
    autoMatchedOvernight?: boolean
}

// ─── Morning queue · 14 bills overnight (p1.1 hero mock) ───
export const DEALER_A_BILLS_OVERNIGHT: Bill[] = [
    // 12 auto-matched
    {
        id: 'PJX-BILL-8471',
        vendorId: 'teknion',
        vendorInvoiceNumber: 'TEK-2026-0847',
        poNumber: 'PO-2026-4421',
        entity: 'dealer-a-inc',
        projectName: 'NCBA · National Cattlemen\'s Beef Association',
        receivedAt: '2026-08-14T02:14:00Z',
        amount: 47238.11,
        lineCount: 291,
        ocrConfidence: 97,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8472',
        vendorId: 'hbf',
        vendorInvoiceNumber: 'HBF-24911',
        poNumber: 'PO-2026-4358',
        entity: 'dealer-a-inc',
        projectName: 'Denver Financial · executive suite refresh',
        receivedAt: '2026-08-14T03:02:00Z',
        amount: 12420.00,
        lineCount: 8,
        ocrConfidence: 99,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8473',
        vendorId: 'boss-design',
        vendorInvoiceNumber: 'BDG-00-1928',
        poNumber: 'PO-2026-4359',
        entity: 'dealer-a-inc',
        projectName: 'Denver Financial · executive suite refresh',
        receivedAt: '2026-08-14T03:04:00Z',
        amount: 3855.40,
        lineCount: 4,
        ocrConfidence: 98,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8474',
        vendorId: 'alamir',
        vendorInvoiceNumber: 'AL-2026-08-0033',
        poNumber: 'PO-2026-4402',
        entity: 'dealer-a-corp',
        projectName: 'Seattle Tech Firm · Phase 2',
        receivedAt: '2026-08-14T04:19:00Z',
        amount: 892.00,
        lineCount: 6,
        ocrConfidence: 100,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8475',
        vendorId: 'nelson',
        vendorInvoiceNumber: 'NLC-99120',
        poNumber: 'PO-2026-4360',
        entity: 'dealer-a-inc',
        projectName: 'Fairport-style · standard 50/40/10 furniture',
        receivedAt: '2026-08-14T04:41:00Z',
        amount: 6720.00,
        lineCount: 12,
        ocrConfidence: 96,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8476',
        vendorId: 'teknion',
        vendorInvoiceNumber: 'TEK-2026-0851',
        poNumber: 'PO-2026-4400',
        entity: 'dealer-a-corp',
        projectName: 'Seattle Tech Firm · Phase 2',
        receivedAt: '2026-08-14T05:12:00Z',
        amount: 18240.55,
        lineCount: 44,
        ocrConfidence: 99,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8477',
        vendorId: 'hbf',
        vendorInvoiceNumber: 'HBF-24915',
        poNumber: 'PO-2026-4361',
        entity: 'dealer-a-inc',
        projectName: 'Denver Financial · executive suite refresh',
        receivedAt: '2026-08-14T05:47:00Z',
        amount: 2140.00,
        lineCount: 3,
        ocrConfidence: 98,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8478',
        vendorId: 'west-elm',
        vendorInvoiceNumber: 'WEL-INV-88221',
        poNumber: 'PO-2026-4362',
        entity: 'dealer-a-inc',
        projectName: 'MWH residential · art install',
        receivedAt: '2026-08-14T06:02:00Z',
        amount: 3450.00,
        lineCount: 5,
        ocrConfidence: 95,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8479',
        vendorId: 'boss-design',
        vendorInvoiceNumber: 'BDG-00-1934',
        poNumber: 'PO-2026-4363',
        entity: 'dealer-a-inc',
        projectName: 'Denver Financial · executive suite refresh',
        receivedAt: '2026-08-14T06:19:00Z',
        amount: 8125.00,
        lineCount: 7,
        ocrConfidence: 99,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8480',
        vendorId: 'alamir',
        vendorInvoiceNumber: 'AL-2026-08-0041',
        poNumber: 'PO-2026-4404',
        entity: 'culture-llc',
        projectName: 'Small hospitality retrofit',
        receivedAt: '2026-08-14T06:33:00Z',
        amount: 445.00,
        lineCount: 3,
        ocrConfidence: 100,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8481',
        vendorId: 'nelson',
        vendorInvoiceNumber: 'NLC-99128',
        poNumber: 'PO-2026-4364',
        entity: 'dealer-a-inc',
        projectName: 'Fairport-style · standard 50/40/10 furniture',
        receivedAt: '2026-08-14T06:58:00Z',
        amount: 4820.00,
        lineCount: 9,
        ocrConfidence: 97,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },
    {
        id: 'PJX-BILL-8482',
        vendorId: 'teknion',
        vendorInvoiceNumber: 'TEK-2026-0855',
        poNumber: 'PO-2026-4405',
        entity: 'dealer-a-corp',
        projectName: 'Seattle Tech Firm · Phase 2',
        receivedAt: '2026-08-14T07:11:00Z',
        amount: 14330.00,
        lineCount: 22,
        ocrConfidence: 98,
        status: 'auto-matched',
        autoMatchedOvernight: true,
    },

    // ─── 2 EXCEPTIONS · surface at top of queue ───
    {
        id: 'PJX-BILL-8483',
        vendorId: 'teknion',
        vendorInvoiceNumber: 'TEK-2026-0858',
        poNumber: 'PO-2026-4421',  // Same NCBA PO as bill 8471 · partial ship
        entity: 'dealer-a-inc',
        projectName: 'NCBA · National Cattlemen\'s Beef Association',
        receivedAt: '2026-08-14T07:44:00Z',
        amount: 8410.75,
        lineCount: 15,  // Sample subset of the 291-line PO
        ocrConfidence: 96,
        status: 'mismatch',
        // Line items pobladas para p1.3 scene
        lineItems: buildNCBALines(),
    },
    {
        id: 'PJX-BILL-8484',
        vendorId: 'warehouse-by-design',
        vendorInvoiceNumber: 'WBD-2026-0812',
        poNumber: undefined,  // AP9 pattern · no PO #
        entity: 'dealer-a-inc',
        projectName: 'Denver Financial · install labor Aug 12-13',
        receivedAt: '2026-08-14T08:02:00Z',
        amount: 3200.00,
        lineCount: 1,
        ocrConfidence: 92,
        status: 'held-no-po',
        heldReason: 'Install vendor invoice · no PO # · needs PM double-check',
        pmContactId: 'jeff',
    },
]

// Sample line items para el Teknion partial-ship mismatch bill (p1.3 scene)
// Represents 15 sample lines de las 291 total en el NCBA PO
function buildNCBALines(): BillLineItem[] {
    return [
        // 12 exact matches
        { lineNumber: 1,  itemCode: 'TK-EXP-42B',  description: 'Expansion desk 42" · walnut · task leg', orderedQty: 12, orderedPrice: 420, billedQty: 12, billedPrice: 420, match: 'exact' },
        { lineNumber: 2,  itemCode: 'TK-EXP-52B',  description: 'Expansion desk 52" · walnut · task leg', orderedQty: 8,  orderedPrice: 495, billedQty: 8,  billedPrice: 495, match: 'exact' },
        { lineNumber: 3,  itemCode: 'TK-EXP-BOX',  description: 'Expansion box · walnut', orderedQty: 24, orderedPrice: 145, billedQty: 24, billedPrice: 145, match: 'exact' },
        { lineNumber: 4,  itemCode: 'TK-CBL-KIT',  description: 'Cable management kit · black', orderedQty: 20, orderedPrice: 38, billedQty: 20, billedPrice: 38, match: 'exact' },
        { lineNumber: 5,  itemCode: 'TK-LEG-4P',   description: '4-post leg assembly · black', orderedQty: 20, orderedPrice: 89, billedQty: 20, billedPrice: 89, match: 'exact' },
        { lineNumber: 6,  itemCode: 'TK-SCR-M6',   description: 'M6 mounting screws · 50-pack', orderedQty: 30, orderedPrice: 12, billedQty: 30, billedPrice: 12, match: 'exact' },
        { lineNumber: 7,  itemCode: 'TK-GRO-BLK',  description: 'Grommet · 2" · black', orderedQty: 40, orderedPrice: 5, billedQty: 40, billedPrice: 5, match: 'exact' },
        { lineNumber: 8,  itemCode: 'TK-PWR-STR',  description: 'Power strip · 6-outlet', orderedQty: 12, orderedPrice: 42, billedQty: 12, billedPrice: 42, match: 'exact' },
        { lineNumber: 9,  itemCode: 'TK-MON-ARM',  description: 'Monitor arm · dual · black', orderedQty: 10, orderedPrice: 180, billedQty: 10, billedPrice: 180, match: 'exact' },
        { lineNumber: 10, itemCode: 'TK-KEY-TRA',  description: 'Keyboard tray · under-desk', orderedQty: 10, orderedPrice: 65, billedQty: 10, billedPrice: 65, match: 'exact' },
        { lineNumber: 11, itemCode: 'TK-FTR-REST', description: 'Footrest · adjustable · black', orderedQty: 8, orderedPrice: 55, billedQty: 8, billedPrice: 55, match: 'exact' },
        { lineNumber: 12, itemCode: 'TK-LBL-DSK',  description: 'Desk label · engraved', orderedQty: 20, orderedPrice: 18, billedQty: 20, billedPrice: 18, match: 'exact' },

        // 2 qty mismatches · partial ship
        { lineNumber: 13, itemCode: 'TK-CHR-EXE',  description: 'Executive chair · Aeron-equiv · black mesh', orderedQty: 6, orderedPrice: 720, billedQty: 4, billedPrice: 720, match: 'qty-mismatch', mismatchCause: 'partial-ship' },
        { lineNumber: 14, itemCode: 'TK-STG-VER', description: 'Vertical storage tower · 5-shelf', orderedQty: 8, orderedPrice: 340, billedQty: 6, billedPrice: 340, match: 'qty-mismatch', mismatchCause: 'partial-ship' },

        // 1 price mismatch · penny rounding
        { lineNumber: 15, itemCode: 'TK-FIN-STN', description: 'Finish · stain sample kit', orderedQty: 2, orderedPrice: 87.55, billedQty: 2, billedPrice: 87.53, match: 'price-mismatch', mismatchCause: 'penny-rounding' },
    ]
}

// ─── Overnight sweep summary (p1.1 hero KPIs) ───
export const DEALER_A_MORNING_SUMMARY = {
    totalReceived: 14,
    autoMatched: 12,
    exceptions: 2,
    breakdown: {
        mismatch: 1,        // Partial ship + price variance
        heldNoPo: 1,        // AP9 pattern
    },
    entityBreakdown: {
        dealerAInc: 10,      // Bills for Dealer A Inc.
        dealerACorp: 3,      // Bills for Dealer A Corp.
        cultureLlc: 1,      // Bills for Culture LLC
    },
    baselineNote: '224 bills/mo baseline · 287 Q4 peak · 20 bills/hr easy · 5 bills/hr tough vendors',
}

/** Fast lookup */
export function getBill(id: string): Bill | undefined {
    return DEALER_A_BILLS_OVERNIGHT.find(b => b.id === id)
}
