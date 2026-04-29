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

// ─── Mini invoice mockup ─────────────────────────────────────────────────────
function InvoiceMockup({ invoice }: { invoice: Invoice }) {
    return (
        <div className="h-full w-full font-mono flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-700 pb-1">
                <div>
                    <div className="font-bold text-[10px]">{invoice.vendor.toUpperCase()}</div>
                    <div className="text-zinc-400">Bill</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-[10px]">{invoice.id}</div>
                    <div className="text-zinc-400">{new Date(invoice.received).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                </div>
            </div>
            <div className="mt-2 space-y-0.5">
                <div className="text-zinc-500">BILL TO</div>
                <div>Modern Business Interiors</div>
                <div className="text-zinc-500">2020 N Highway 94 Service Rd W</div>
                <div className="text-zinc-500">St. Charles, MO 63303</div>
            </div>
            <div className="mt-2 pt-1 border-t border-zinc-200 dark:border-zinc-700 space-y-0.5">
                <div className="flex justify-between">
                    <span className="text-zinc-500">Ref PO</span>
                    <span>{invoice.poNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="tabular-nums">${invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-zinc-200 dark:border-zinc-700">
                    <span>Total Due</span>
                    <span className="tabular-nums">${invoice.amount.toLocaleString()}</span>
                </div>
            </div>
            <div className="mt-auto text-[7px] text-zinc-400 italic">
                Auto-extracted by Strata Document AI
            </div>
        </div>
    )
}
