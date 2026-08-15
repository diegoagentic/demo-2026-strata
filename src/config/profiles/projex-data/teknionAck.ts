// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · Teknion ACK + designer chain + shipment tracking mock · F74 Phase 1B.E
// SOT §12e · FC8 designer chain net-new · FC9 unstructured ACK PDFs ·
// PO-DC-0009642-style ACK · 71 lines · 13 CRs · sentinel 10/10/2050
// ═══════════════════════════════════════════════════════════════════════════════

export type CRType = 'leadtime' | 'BIFMA advisory' | 'width change' | 'pricer comment'

export interface AckCR {
    id: string
    type: CRType
    lineNumber: number
    detail: string
    severity: 'info' | 'warn'
    poField?: string
    ackField?: string
}

export interface AckLine {
    lineNumber: number
    itemCode: string
    description: string
    poQty: number
    ackQty: number
    poPrice: number
    ackPrice: number
    poESD: string  // '10/10/2050' sentinel until real ESD from ACK
    ackESD: string // real ESD from Teknion
    match: 'exact' | 'partial' | 'cr'
}

// 13 CRs · Teknion CR taxonomy real
export const NCBA_ACK_CRS: AckCR[] = [
    { id: 'CR-01', type: 'leadtime',       lineNumber: 12, detail: 'ESD shifted 2026-09-10 → 2026-09-24',                severity: 'warn', poField: '10/10/2050', ackField: '2026-09-24' },
    { id: 'CR-02', type: 'BIFMA advisory', lineNumber: 18, detail: 'BIFMA X5.5 · edge banding note · cosmetic only',      severity: 'info' },
    { id: 'CR-03', type: 'width change',   lineNumber: 24, detail: '60" → 66" · confirm before ship · Teknion notified',  severity: 'warn', poField: '60"', ackField: '66"' },
    { id: 'CR-04', type: 'pricer comment', lineNumber: 31, detail: 'Discount extended · net unchanged',                    severity: 'info' },
    { id: 'CR-05', type: 'leadtime',       lineNumber: 44, detail: 'ESD tight · 2026-09-15 · monitor',                      severity: 'info' },
    { id: 'CR-06', type: 'BIFMA advisory', lineNumber: 52, detail: 'BIFMA X5.1 · caster upgrade · standard',                severity: 'info' },
    { id: 'CR-07', type: 'width change',   lineNumber: 58, detail: '48" → 52" · surface material extra',                     severity: 'warn', poField: '48"', ackField: '52"' },
    { id: 'CR-08', type: 'pricer comment', lineNumber: 61, detail: 'Q3 volume tier extended · +2% discount',                severity: 'info' },
    { id: 'CR-09', type: 'leadtime',       lineNumber: 63, detail: 'Ships 2026-10-02 · post-Q3',                             severity: 'info' },
    { id: 'CR-10', type: 'BIFMA advisory', lineNumber: 65, detail: 'BIFMA X5.11 · fabric flame test',                       severity: 'info' },
    { id: 'CR-11', type: 'pricer comment', lineNumber: 67, detail: 'GSA schedule verified',                                 severity: 'info' },
    { id: 'CR-12', type: 'width change',   lineNumber: 69, detail: '30" → 32" · countertop adjustment',                     severity: 'warn', poField: '30"', ackField: '32"' },
    { id: 'CR-13', type: 'pricer comment', lineNumber: 71, detail: 'Extended warranty applied · 5yr',                       severity: 'info' },
]

// Sample of 12 lines from 71-line ACK
export const NCBA_ACK_LINES: AckLine[] = [
    { lineNumber: 1,  itemCode: 'TK-EXP-42B',  description: 'Expansion desk 42" walnut',       poQty: 12, ackQty: 12, poPrice: 420,  ackPrice: 420,  poESD: '10/10/2050', ackESD: '2026-09-10', match: 'exact' },
    { lineNumber: 2,  itemCode: 'TK-EXP-52B',  description: 'Expansion desk 52" walnut',       poQty: 8,  ackQty: 8,  poPrice: 495,  ackPrice: 495,  poESD: '10/10/2050', ackESD: '2026-09-10', match: 'exact' },
    { lineNumber: 3,  itemCode: 'TK-CHR-EXE',  description: 'Executive chair · Aeron-equiv',   poQty: 6,  ackQty: 6,  poPrice: 720,  ackPrice: 720,  poESD: '10/10/2050', ackESD: '2026-09-15', match: 'exact' },
    { lineNumber: 12, itemCode: 'TK-WALL-A1',  description: 'Wall panel type A · 60"',          poQty: 24, ackQty: 24, poPrice: 340,  ackPrice: 340,  poESD: '10/10/2050', ackESD: '2026-09-24', match: 'cr' },
    { lineNumber: 18, itemCode: 'TK-STG-VER',  description: 'Vertical storage · 5-shelf',       poQty: 8,  ackQty: 8,  poPrice: 340,  ackPrice: 340,  poESD: '10/10/2050', ackESD: '2026-09-15', match: 'cr' },
    { lineNumber: 24, itemCode: 'TK-WALL-A2',  description: 'Wall panel type A · 66"',          poQty: 8,  ackQty: 8,  poPrice: 380,  ackPrice: 380,  poESD: '10/10/2050', ackESD: '2026-09-24', match: 'cr' },
    { lineNumber: 31, itemCode: 'TK-CBL-KIT',  description: 'Cable mgmt kit black',            poQty: 20, ackQty: 20, poPrice: 38,   ackPrice: 38,   poESD: '10/10/2050', ackESD: '2026-09-08', match: 'cr' },
    { lineNumber: 44, itemCode: 'TK-MON-ARM',  description: 'Monitor arm dual',                poQty: 10, ackQty: 10, poPrice: 180,  ackPrice: 180,  poESD: '10/10/2050', ackESD: '2026-09-15', match: 'cr' },
    { lineNumber: 52, itemCode: 'TK-CHR-TSK',  description: 'Task chair mesh · standard',       poQty: 20, ackQty: 20, poPrice: 380,  ackPrice: 380,  poESD: '10/10/2050', ackESD: '2026-09-10', match: 'cr' },
    { lineNumber: 58, itemCode: 'TK-WALL-B1',  description: 'Wall panel type B · 48"',          poQty: 12, ackQty: 12, poPrice: 320,  ackPrice: 320,  poESD: '10/10/2050', ackESD: '2026-09-24', match: 'cr' },
    { lineNumber: 63, itemCode: 'TK-STG-HOR',  description: 'Horizontal storage · 3-shelf',     poQty: 4,  ackQty: 4,  poPrice: 285,  ackPrice: 285,  poESD: '10/10/2050', ackESD: '2026-10-02', match: 'cr' },
    { lineNumber: 71, itemCode: 'TK-FIN-STN',  description: 'Finish · stain sample kit',        poQty: 2,  ackQty: 2,  poPrice: 87.55, ackPrice: 87.55, poESD: '10/10/2050', ackESD: '2026-09-15', match: 'cr' },
]

// Per-vendor OCR confidence (Teknion 98% · HBF 91% · Alamir 74%)
export interface VendorOcrConf {
    vendorCode: string
    vendorName: string
    conf: number
    band: 'excellent' | 'good' | 'review-recommended'
    ackReceived: boolean
    ackReceivedAt?: string
}

export const VENDOR_ACK_CONF: VendorOcrConf[] = [
    { vendorCode: 'TEK', vendorName: 'Teknion',            conf: 98, band: 'excellent',          ackReceived: true,  ackReceivedAt: '2026-08-14T10:47:00Z' },
    { vendorCode: 'HBF', vendorName: 'HBF',                conf: 91, band: 'good',                ackReceived: true,  ackReceivedAt: '2026-08-14T12:14:00Z' },
    { vendorCode: 'BDG', vendorName: 'Boss Design',        conf: 93, band: 'good',                ackReceived: true,  ackReceivedAt: '2026-08-14T14:22:00Z' },
    { vendorCode: 'ALA', vendorName: 'Alamir',             conf: 74, band: 'review-recommended', ackReceived: true,  ackReceivedAt: '2026-08-14T15:38:00Z' },
    { vendorCode: 'NLC', vendorName: 'Nelson and Company', conf: 89, band: 'good',                ackReceived: false },
    { vendorCode: 'WEL', vendorName: 'West Elm',           conf: 82, band: 'good',                ackReceived: false },
]

// Designer chain · Layne → Tate → Josh
export interface DesignerChainEntry {
    id: string
    designer: string
    role: string
    action: string
    stamp: string
    attachments?: string[]
    reply?: string
}

export const DESIGNER_CHAIN: DesignerChainEntry[] = [
    {
        id: 'DC-01', designer: 'Layne', role: 'Lead Designer', stamp: 'Aug 14 · 11:20 AM',
        action: 'Reviewed CR-01 · leadtime shift 2026-09-10 → 2026-09-24 · approved',
        attachments: ['NCBA_wall_leadtime_impact.pdf'],
    },
    {
        id: 'DC-02', designer: 'Tate', role: 'Spec Designer', stamp: 'Aug 14 · 12:45 PM',
        action: 'Reviewed CR-03 + CR-07 + CR-12 · width changes · confirmed with client',
        attachments: ['NCBA_width_revision_v2.dwg'],
    },
    {
        id: 'DC-03', designer: 'Josh', role: 'PM Coordinator', stamp: 'Aug 14 · 2:15 PM',
        action: 'Signed off · ready to update PMO · sentinel clear approved',
        reply: 'All CRs reviewed · width changes have client sign-off · leadtime absorbed en Q3 schedule. PMO update ready.',
    },
]

// Shipment tracking · daily ESD sweep
export interface ShipmentSN {
    id: string
    poNumber: string
    vendorCode: string
    lineCount: number
    esd: string
    status: 'in-production' | 'shipping-scheduled' | 'shipped' | 'delivered'
    carrier?: string
    trackingNumber?: string
}

export const NCBA_SHIPMENTS: ShipmentSN[] = [
    { id: 'SN-4501', poNumber: 'PO-2026-4421', vendorCode: 'TEK', lineCount: 47, esd: '2026-09-10', status: 'in-production',       carrier: 'Yellow Freight', trackingNumber: 'YRC-8842-01' },
    { id: 'SN-4502', poNumber: 'PO-2026-4421', vendorCode: 'TEK', lineCount: 24, esd: '2026-09-24', status: 'in-production' },
    { id: 'SN-4503', poNumber: 'PO-2026-4503', vendorCode: 'HBF', lineCount: 22, esd: '2026-09-12', status: 'shipping-scheduled', carrier: 'HBF In-House',  trackingNumber: 'HBF-2810-02' },
    { id: 'SN-4504', poNumber: 'PO-2026-4504', vendorCode: 'BDG', lineCount: 12, esd: '2026-09-18', status: 'in-production' },
    { id: 'SN-4505', poNumber: 'PO-2026-4505', vendorCode: 'ALA', lineCount: 18, esd: '2026-09-05', status: 'shipped',              carrier: 'UPS Freight',   trackingNumber: '1Z-ALA-8842' },
    { id: 'SN-4506', poNumber: 'PO-2026-4506', vendorCode: 'NLC', lineCount: 14, esd: '2026-09-14', status: 'in-production' },
]
