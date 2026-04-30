/**
 * COMPONENT: InvoiceDetailPanel
 * PURPOSE: Detail view for the currently-selected invoice. Shows an OCR-style
 *          document preview mockup, extracted fields with per-field confidence,
 *          and (for HealthTrust invoices) the specific 3% rebate flag that
 *          Strata applies automatically per MBI's contract logic.
 *
 *          This is the trust-building moment for Kathy: she sees AI reading
 *          her invoices and pre-populating CORE without losing visibility.
 *
 * PROPS:
 *   - invoice: Invoice                 — the currently selected invoice
 *
 * STATES:
 *   - default — show preview + extracted fields
 *   - HealthTrust — extra ribbon + 3% rebate callout
 *   - exception — warning card at top
 *
 * DS TOKENS: bg-card · border-border · amber (HealthTrust) · red (exception) ·
 *            ai (Strata AI surfaces) · primary (CORE voucher CTA)
 *
 * USED BY: MBIAccountingPage (Document AI section, right column)
 */

import { FileText, AlertTriangle, Building2, Calendar, DollarSign, Sparkles, Clock, CreditCard } from 'lucide-react'
import type { Invoice } from '../../config/profiles/mbi-data'

interface InvoiceDetailPanelProps {
    invoice: Invoice
}

// ─── InvoiceDocPreview ───────────────────────────────────────────────────────
// Panel central: header de la factura + exception banner + mockup del documento
export function InvoiceDocPreview({ invoice }: InvoiceDetailPanelProps) {
    const received = new Date(invoice.received)

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{invoice.id} · {invoice.vendor}</div>
                            <div className="text-[10px] text-muted-foreground">
                                Received {received.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} · {received.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {invoice.isEDI ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 uppercase tracking-wider">EDI</span>
                        ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">OCR</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Exception banner */}
            {invoice.hasException && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <div className="font-bold text-red-700 dark:text-red-400">Exception requires review</div>
                        <div className="text-muted-foreground mt-0.5">{invoice.exceptionReason}</div>
                    </div>
                </div>
            )}

            {/* Document mockup */}
            <div className="p-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Source document</div>
                <div className="aspect-[4/3] bg-white dark:bg-zinc-900 border border-border rounded-xl p-5 text-[10px] text-zinc-900 dark:text-zinc-100 overflow-hidden">
                    <InvoiceMockup invoice={invoice} />
                </div>
            </div>
        </div>
    )
}

// ─── InvoiceExtractedFields ───────────────────────────────────────────────────
// Panel derecho: campos extraídos por AI + rebate callout + CTA de CORE
export function InvoiceExtractedFields({ invoice }: InvoiceDetailPanelProps) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* AI extracted fields */}
            <div className="px-4 pt-4 pb-3 space-y-3">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai" />
                    <div className="text-[10px] font-bold text-ai uppercase tracking-wider">Strata extracted · confidence {invoice.ocrConfidence}%</div>
                </div>
                <div className="space-y-1.5">
                    <FieldRow icon={<Building2 className="h-3 w-3" />} label="Vendor" value={invoice.vendor} confidence={99} />
                    {invoice.clientName && (
                        <FieldRow icon={<Building2 className="h-3 w-3" />} label="Project" value={invoice.clientName} confidence={99} />
                    )}
                    <FieldRow icon={<FileText className="h-3 w-3" />} label="PO Number" value={invoice.poNumber} confidence={invoice.ocrConfidence} />
                    <FieldRow icon={<DollarSign className="h-3 w-3" />} label="Amount" value={`$${invoice.amount.toLocaleString()}`} confidence={invoice.ocrConfidence} />
                    {invoice.invoiceDate && (
                        <FieldRow icon={<Calendar className="h-3 w-3" />} label="Bill Date" value={new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} confidence={invoice.ocrConfidence} />
                    )}
                    {invoice.paymentTerms && (
                        <FieldRow icon={<CreditCard className="h-3 w-3" />} label="Terms" value={invoice.paymentTerms} confidence={invoice.ocrConfidence} />
                    )}
                    {invoice.dueDate && (
                        <FieldRow icon={<Clock className="h-3 w-3" />} label="Due Date" value={new Date(invoice.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} confidence={100} highlight={new Date(invoice.dueDate) < new Date(Date.now() + 7 * 86400000)} />
                    )}
                </div>
            </div>


        </div>
    )
}

// ─── Default export (backwards compat) ───────────────────────────────────────
export default function InvoiceDetailPanel({ invoice }: InvoiceDetailPanelProps) {
    return (
        <div className="space-y-4">
            <InvoiceDocPreview invoice={invoice} />
            <InvoiceExtractedFields invoice={invoice} />
        </div>
    )
}

// ─── Internal row helper ─────────────────────────────────────────────────────
function FieldRow({
    icon,
    label,
    value,
    confidence,
    highlight,
}: {
    icon: React.ReactNode
    label: string
    value: string
    confidence: number
    highlight?: boolean
}) {
    return (
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${highlight ? 'bg-amber-50/60 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' : 'bg-muted/20 border-border'}`}>
            <div className={`shrink-0 ${highlight ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>{icon}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-20 shrink-0">{label}</div>
            <div className={`flex-1 font-semibold truncate ${highlight ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>{value}</div>
            <div className="text-[9px] font-bold text-ai tabular-nums">{confidence}%</div>
        </div>
    )
}

// ─── Mini invoice mockup — Leland-style corporate document ───────────────────
function InvoiceMockup({ invoice }: { invoice: Invoice }) {
    const invoiceDate = invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : new Date(invoice.received).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        : '—'

    return (
        <div className="h-full w-full text-[8px] text-zinc-900 dark:text-zinc-900 flex flex-col overflow-hidden leading-snug bg-white dark:bg-white">
            {/* ── Header ── */}
            <div className="flex justify-between items-start pb-1 border-b border-zinc-400">
                <div>
                    <div className="text-[10px] font-black font-serif">Vendor Invoice</div>
                </div>
                <div className="text-right">
                    <div className="text-[13px] font-black tracking-widest font-serif leading-none">{invoice.vendor.toUpperCase()}</div>
                    <div className="text-[7px] text-zinc-500 mt-0.5">Office Furniture · St. Louis, MO</div>
                    <div className="text-[7px] text-zinc-500">Phone: 314-555-0190</div>
                </div>
            </div>

            {/* ── Metadata rows ── */}
            <div className="mt-1 space-y-0.5">
                {[
                    { label: 'Invoice Number:', value: `${invoice.id}  (Please reference on your P.O.)` },
                    { label: 'Invoice Date:', value: invoiceDate },
                    { label: 'PO Reference:', value: invoice.poNumber },
                    { label: 'Terms:', value: invoice.paymentTerms ?? 'Net 30' },
                ].map(row => (
                    <div key={row.label} className="flex items-baseline gap-2 border-b border-zinc-200 pb-0.5">
                        <span className="text-zinc-500 w-20 shrink-0">{row.label}</span>
                        <span className="font-semibold truncate">{row.value}</span>
                    </div>
                ))}
            </div>

            {/* ── Bill To / Ship To ── */}
            <div className="flex gap-4 mt-1.5">
                <div>
                    <div className="font-bold uppercase text-[6px] tracking-wider text-zinc-500">BILL TO:</div>
                    <div className="font-semibold">Modern Business Interiors</div>
                    <div className="text-zinc-500">2020 N Highway 94 Service Rd W</div>
                    <div className="text-zinc-500">St. Charles, MO 63303 USA</div>
                </div>
                <div>
                    <div className="font-bold uppercase text-[6px] tracking-wider text-zinc-500">SHIP TO:</div>
                    <div className="text-zinc-500">Missouri</div>
                    <div className="text-zinc-500">Due: {dueDate}</div>
                </div>
            </div>

            {/* ── Terms bar ── */}
            <div className="grid grid-cols-4 gap-x-2 mt-1.5 border-t border-b border-zinc-300 py-0.5 text-[7px]">
                <div><div className="font-bold text-zinc-400 uppercase">FOB</div><div>St. Louis</div></div>
                <div><div className="font-bold text-zinc-400 uppercase">Type</div><div>Standard</div></div>
                <div><div className="font-bold text-zinc-400 uppercase">Terms</div><div>{invoice.paymentTerms ?? 'Net 30'}</div></div>
                <div><div className="font-bold text-zinc-400 uppercase">Ship Via</div><div>Prepaid</div></div>
            </div>

            {/* ── List Priced Items ── */}
            <div className="mt-1 flex-1 min-h-0">
                <div className="bg-zinc-800 text-white flex items-center px-1.5 py-0.5 text-[7px] font-bold mb-0.5">
                    <span>List Priced Items</span>
                </div>
                <div className="grid grid-cols-[1.5rem_1rem_1fr_auto_auto] gap-x-1.5 text-[6.5px] font-bold uppercase text-zinc-500 px-1 mb-0.5">
                    <span>ITEM</span><span>QTY</span><span>DESCRIPTION</span><span className="text-right">LIST PRICE</span><span className="text-right">EXTENDED</span>
                </div>
                <div className="grid grid-cols-[1.5rem_1rem_1fr_auto_auto] gap-x-1.5 px-1 border-b border-zinc-200 pb-0.5">
                    <span>1</span>
                    <span>1</span>
                    <div>
                        <div className="font-semibold">{invoice.vendor} — standard order</div>
                        <div className="text-zinc-500">Ref: {invoice.poNumber}</div>
                    </div>
                    <span className="tabular-nums text-right">${invoice.amount.toLocaleString()}</span>
                    <span className="tabular-nums text-right font-bold">${invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-3 mt-0.5 text-[7px] pr-1">
                    <span className="text-zinc-500">List SubTotal</span>
                    <span className="font-bold tabular-nums">${invoice.amount.toLocaleString()}</span>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-zinc-300 pt-0.5 flex justify-between text-[6px] text-zinc-400 mt-auto">
                <span className="italic">Auto-extracted by Strata Document AI · logged to CORE</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    )
}
