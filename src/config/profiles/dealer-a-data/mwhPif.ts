// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · MWH PIF workbook mock · F74 Phase 1B.C (2026-08-14)
// SOT §12d · FC6 multi-vendor PO loop · WC2 Walls line-by-line ·
// MWH residential · 300 product lines + 26 S&H manual entries + 26 vendor POs
// ═══════════════════════════════════════════════════════════════════════════════

export interface PifLine {
    lineNumber: number
    itemCode: string
    description: string
    vendorCode: string
    qty: number
    cost: number
    margin: number      // markup %
    designFee: number   // % of subtotal
    totalPrice: number
    isSnH?: boolean     // shipping-and-handling manual entry
    isAiLotLine?: boolean // Walls-specific "AI lot line" convention
    conf?: number       // OCR confidence
}

// Sample of 24 lines representative of the 300 (mostly Teknion + HBF + Boss + Alamir mix)
export const MWH_PIF_LINES: PifLine[] = [
    // Furniture · Teknion (product lines)
    { lineNumber: 1,  itemCode: 'TK-EXP-42B',  description: 'Expansion desk 42" · walnut',       vendorCode: 'TEK', qty: 12, cost: 420,  margin: 25, designFee: 8, totalPrice: 6804, conf: 98 },
    { lineNumber: 2,  itemCode: 'TK-EXP-52B',  description: 'Expansion desk 52" · walnut',       vendorCode: 'TEK', qty: 8,  cost: 495,  margin: 25, designFee: 8, totalPrice: 5346, conf: 99 },
    { lineNumber: 3,  itemCode: 'TK-CHR-EXE',  description: 'Executive chair · Aeron-equiv',      vendorCode: 'TEK', qty: 6,  cost: 720,  margin: 25, designFee: 8, totalPrice: 5832, conf: 100 },
    { lineNumber: 4,  itemCode: 'TK-STG-VER', description: 'Vertical storage tower · 5-shelf',   vendorCode: 'TEK', qty: 8,  cost: 340,  margin: 25, designFee: 8, totalPrice: 3672, conf: 97 },
    // Furniture · HBF
    { lineNumber: 5,  itemCode: 'HBF-CHR-TSK', description: 'Task chair · ergonomic mesh',        vendorCode: 'HBF', qty: 20, cost: 610,  margin: 22, designFee: 8, totalPrice: 16104, conf: 96 },
    { lineNumber: 6,  itemCode: 'HBF-LNG-2S',  description: '2-seat lounge · Continua fabric',    vendorCode: 'HBF', qty: 2,  cost: 1420, margin: 22, designFee: 8, totalPrice: 3745, conf: 98 },
    // Furniture · Boss Design
    { lineNumber: 7,  itemCode: 'BDG-COL-4P',  description: 'Collaboration seating · 4-pack',     vendorCode: 'BDG', qty: 3,  cost: 1240, margin: 20, designFee: 8, totalPrice: 4842, conf: 99 },
    // Furniture · Alamir accessories
    { lineNumber: 8,  itemCode: 'ALA-MON-DBL', description: 'Monitor arm · dual · black',        vendorCode: 'ALA', qty: 20, cost: 180,  margin: 20, designFee: 8, totalPrice: 4680, conf: 100 },
    { lineNumber: 9,  itemCode: 'ALA-KEY-TRA', description: 'Keyboard tray · under-desk',         vendorCode: 'ALA', qty: 20, cost: 65,   margin: 20, designFee: 8, totalPrice: 1690, conf: 100 },
    // Furniture · Nelson & Co
    { lineNumber: 10, itemCode: 'NLC-CBL-KIT', description: 'Cable management kit · black',       vendorCode: 'NLC', qty: 20, cost: 38,   margin: 15, designFee: 8, totalPrice: 949, conf: 95 },

    // Walls · "AI lot line" convention (per plan §12b)
    { lineNumber: 11, itemCode: 'TK-WALL-A1', description: 'Wall panel · type A · 60" H',        vendorCode: 'TEK', qty: 24, cost: 340,  margin: 25, designFee: 8, totalPrice: 11016, isAiLotLine: true, conf: 94 },
    { lineNumber: 12, itemCode: 'TK-WALL-A2', description: 'Wall panel · type A · 66" H',        vendorCode: 'TEK', qty: 8,  cost: 380,  margin: 25, designFee: 8, totalPrice: 4104, isAiLotLine: true, conf: 94 },
    { lineNumber: 13, itemCode: 'TK-WALL-TRIM', description: 'Wall trim · reveal strips',        vendorCode: 'TEK', qty: 60, cost: 45,   margin: 25, designFee: 8, totalPrice: 3645, isAiLotLine: true, conf: 92 },

    // West Elm accessories
    { lineNumber: 14, itemCode: 'WEL-ART-LG',  description: 'Wall art · large format',           vendorCode: 'WEL', qty: 4,  cost: 340,  margin: 30, designFee: 8, totalPrice: 1913, conf: 96 },

    // S&H manual entries (26 total · showing 5 representative)
    { lineNumber: 300, itemCode: 'SH-TEK',   description: 'Teknion freight · consolidated',       vendorCode: 'TEK', qty: 1, cost: 1420, margin: 0, designFee: 0, totalPrice: 1420, isSnH: true },
    { lineNumber: 301, itemCode: 'SH-HBF',   description: 'HBF freight · lift-gate delivery',     vendorCode: 'HBF', qty: 1, cost: 890,  margin: 0, designFee: 0, totalPrice: 890, isSnH: true },
    { lineNumber: 302, itemCode: 'SH-BDG',   description: 'Boss Design freight · white-glove',    vendorCode: 'BDG', qty: 1, cost: 620,  margin: 0, designFee: 0, totalPrice: 620, isSnH: true },
    { lineNumber: 303, itemCode: 'SH-ALA',   description: 'Alamir freight · $19 flat rule',       vendorCode: 'ALA', qty: 3, cost: 19,   margin: 0, designFee: 0, totalPrice: 57, isSnH: true },
    { lineNumber: 304, itemCode: 'SH-NLC',   description: 'Nelson freight · prepaid + add',       vendorCode: 'NLC', qty: 1, cost: 210,  margin: 0, designFee: 0, totalPrice: 210, isSnH: true },
]

export const MWH_TOTALS = {
    productLines: 300,
    snhEntries: 26,
    totalPOs: 26,
    subtotal: 82000,   // approx
    grandTotal: 256000, // matches MWH milestone from arAging.ts
}

// 26 vendor POs (batch grid) · 6 anchor vendors visible + 20 batched
export interface POBatchItem {
    poNumber: string
    vendorCode: string
    vendorName: string
    lineCount: number
    amount: number
    method: 'SIF · Teknion Online' | 'Portal · HBF' | 'Email · PDF attach' | 'Email · order form'
    status: 'draft' | 'ready' | 'sending' | 'sent' | 'held'
    diffFromBaseline?: number // qty of lines diff vs prior human baseline
}

export const MWH_PO_BATCH: POBatchItem[] = [
    { poNumber: 'PO-2026-4501', vendorCode: 'TEK', vendorName: 'Teknion',            lineCount: 84, amount: 62450, method: 'SIF · Teknion Online', status: 'draft', diffFromBaseline: 3 },
    { poNumber: 'PO-2026-4502', vendorCode: 'TEK', vendorName: 'Teknion',            lineCount: 44, amount: 28100, method: 'SIF · Teknion Online', status: 'draft', diffFromBaseline: 1 },
    { poNumber: 'PO-2026-4503', vendorCode: 'HBF', vendorName: 'HBF',                lineCount: 22, amount: 18420, method: 'Portal · HBF',         status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4504', vendorCode: 'BDG', vendorName: 'Boss Design',        lineCount: 12, amount:  9240, method: 'Email · PDF attach',   status: 'draft', diffFromBaseline: 2 },
    { poNumber: 'PO-2026-4505', vendorCode: 'ALA', vendorName: 'Alamir',             lineCount: 18, amount:  4820, method: 'Email · order form',   status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4506', vendorCode: 'NLC', vendorName: 'Nelson and Company', lineCount: 14, amount:  8940, method: 'Email · PDF attach',   status: 'draft', diffFromBaseline: 1 },
    { poNumber: 'PO-2026-4507', vendorCode: 'WEL', vendorName: 'West Elm',           lineCount:  9, amount:  3450, method: 'Email · order form',   status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4508', vendorCode: 'TEK', vendorName: 'Teknion',            lineCount: 24, amount: 14200, method: 'SIF · Teknion Online', status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4509', vendorCode: 'HBF', vendorName: 'HBF',                lineCount: 11, amount:  7820, method: 'Portal · HBF',         status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4510', vendorCode: 'ALA', vendorName: 'Alamir',             lineCount:  8, amount:  1420, method: 'Email · order form',   status: 'draft', diffFromBaseline: 0 },
    { poNumber: 'PO-2026-4511', vendorCode: 'BDG', vendorName: 'Boss Design',        lineCount:  7, amount:  5210, method: 'Email · PDF attach',   status: 'draft', diffFromBaseline: 1 },
    { poNumber: 'PO-2026-4512', vendorCode: 'TEK', vendorName: 'Teknion',            lineCount: 18, amount: 12440, method: 'SIF · Teknion Online', status: 'draft', diffFromBaseline: 0 },
]
