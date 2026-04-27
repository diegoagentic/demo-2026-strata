import type { Invoice } from './types';

// Kathy's morning AP queue · 12 invoices distributed across 3 workflow columns.
// Apr 23 transcript (Christian to Matt @ 13:36): the queue must show
// PENDING / IN-PROGRESS / DONE, not just pending+done.
//
//   PENDING (4)      Needs Kathy's eyes — exceptions + HealthTrust royalty approvals
//   IN PROGRESS (3)  Agent reconciling or awaiting vendor reply
//   DONE (5)         Auto-posted to CORE (EDI · clean OCR · matched PO)
export const MBI_INVOICES: Invoice[] = [
    // ── DONE · 5 auto-posted EDI invoices ────────────────────────────────────
    { id: 'INV-0482', vendor: 'Allsteel',              poNumber: 'PO-2026-0047', amount: 41400, received: '2026-04-19T06:15:00Z', isEDI: true,  ocrConfidence: 98, status: 'done' },
    { id: 'INV-0483', vendor: 'The HON Company',       poNumber: 'PO-2026-0049', amount: 17850, received: '2026-04-19T06:22:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },
    { id: 'INV-0487', vendor: 'Gunlocke',              poNumber: 'PO-2026-0055', amount: 8750,  received: '2026-04-19T08:15:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },
    { id: 'INV-0489', vendor: 'Kimball International', poNumber: 'PO-2026-0058', amount: 22450, received: '2026-04-19T08:45:00Z', isEDI: true,  ocrConfidence: 98, status: 'done' },
    { id: 'INV-0493', vendor: 'The HON Company',       poNumber: 'PO-2026-0062', amount: 11250, received: '2026-04-19T09:55:00Z', isEDI: true,  ocrConfidence: 99, status: 'done' },

    // ── IN PROGRESS · 3 non-EDI being agent-reconciled ───────────────────────
    { id: 'INV-0488', vendor: 'Knoll',      poNumber: 'PO-2026-0056', amount: 16800, received: '2026-04-19T08:22:00Z', isEDI: false, ocrConfidence: 91, status: 'in-progress', inProgressReason: 'Non-EDI · agent reconciling line items vs PO' },
    { id: 'INV-0490', vendor: 'Humanscale', poNumber: 'PO-2026-0059', amount: 4250,  received: '2026-04-19T09:01:00Z', isEDI: false, ocrConfidence: 88, status: 'in-progress', inProgressReason: 'Awaiting vendor confirmation on freight terms' },
    { id: 'INV-0491', vendor: 'HBF',        poNumber: 'PO-2026-0060', amount: 6800,  received: '2026-04-19T09:15:00Z', isEDI: false, ocrConfidence: 89, status: 'in-progress', inProgressReason: 'Non-EDI · agent matching SKUs to catalog' },

    // ── PENDING · 4 need Kathy's eyes ────────────────────────────────────────
    { id: 'INV-0484', vendor: 'Herman Miller',      poNumber: 'PO-2026-0051', amount: 12900, received: '2026-04-19T07:04:00Z', isEDI: false, ocrConfidence: 92, hasException: true, exceptionReason: 'Quantity mismatch: PO 6, invoice 5', status: 'pending' },
    { id: 'INV-0485', vendor: 'Steelcase',          poNumber: 'PO-2026-0052', amount: 38250, received: '2026-04-19T07:30:00Z', isEDI: false, ocrConfidence: 94, hasException: true, exceptionReason: 'Missing freight line', status: 'pending' },
    { id: 'INV-0486', vendor: 'HealthTrust Mercy',  poNumber: 'PO-2026-0053', amount: 62400, received: '2026-04-19T08:00:00Z', isEDI: true,  isHealthTrust: true, has3PctRoyalty: true, ocrConfidence: 97, status: 'pending' },
    { id: 'INV-0492', vendor: 'HealthTrust BJC',    poNumber: 'PO-2026-0061', amount: 48200, received: '2026-04-19T09:30:00Z', isEDI: true,  isHealthTrust: true, has3PctRoyalty: true, ocrConfidence: 96, status: 'pending' },
];
