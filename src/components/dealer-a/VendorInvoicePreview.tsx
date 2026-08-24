/**
 * COMPONENT: VendorInvoicePreview (Dealer A)
 * PURPOSE: Vendor invoice mock preview · usa MockDocumentPreview como shell y
 *          renderea el layout específico de un invoice comercial (vendor
 *          letterhead · bill-to · invoice metadata · sample line items
 *          extracted del bill data · totals · payment terms). Mock porque
 *          los vendors son ficticios (Teknion · HBF · Boss · etc.).
 *
 *          Sample line items · toma los primeros N líneas para preview
 *          (invoices con 291 lines muestra 6-8 samples + "···N more lines").
 *
 * DS TOKENS: bg-background · border-border · text-foreground · text-muted-foreground
 *            · bg-primary/5 · bg-success/10 · text-success
 *
 * USED BY: APBillIntakeScene (p1.2 · click attachment card to preview)
 * REUSE FROM: MockDocumentPreview.tsx (generic shell)
 */

import { ScanLine, FileText } from 'lucide-react'
import MockDocumentPreview from './MockDocumentPreview'
import type { Bill } from '../../config/profiles/dealer-a-data/bills'

interface VendorInvoicePreviewProps {
    isOpen: boolean
    onClose: () => void
    bill: Bill
    vendorName: string
    vendorAddress?: string
    /** When true, tint fields OCR extracted (visual cue). */
    highlightExtractedFields?: boolean
}

interface SampleLine {
    line: number
    sku: string
    description: string
    qty: number
    unitPrice: number
}

// Mock sample line items · Teknion NCBA-style (real product codes)
const NCBA_SAMPLE_LINES: SampleLine[] = [
    { line: 1,  sku: 'TWU-6624-VN',    description: 'Upstage panel · 66"×24" · velum · tackable',    qty: 12, unitPrice: 342.50 },
    { line: 2,  sku: 'TWU-3624-VN',    description: 'Upstage panel · 36"×24" · velum · tackable',    qty: 8,  unitPrice: 218.00 },
    { line: 3,  sku: 'TCS-30D-BLK',    description: 'Chief task chair · 3D arms · black frame',      qty: 24, unitPrice: 618.75 },
    { line: 4,  sku: 'TWK-6642-WH',    description: 'Work surface · 66"×42" · white laminate',       qty: 6,  unitPrice: 384.20 },
    { line: 5,  sku: 'TSP-24-CH',      description: 'Storage pedestal · 24" · charcoal',             qty: 12, unitPrice: 429.00 },
    { line: 6,  sku: 'TWU-4224-VN',    description: 'Upstage panel · 42"×24" · velum · tackable',    qty: 4,  unitPrice: 246.50 },
    { line: 7,  sku: 'TCK-KEYSTONE-M', description: 'Keystone monitor arm · dual · medium',          qty: 24, unitPrice: 189.00 },
]

export default function VendorInvoicePreview({
    isOpen,
    onClose,
    bill,
    vendorName,
    vendorAddress = '1150 Flint Rd · Toronto ON M3J 2J5 · Canada',
    highlightExtractedFields = false,
}: VendorInvoicePreviewProps) {
    const boxCls = highlightExtractedFields
        ? 'bg-ai-light/50 ring-1 ring-inset ring-ai/40 rounded px-1'
        : ''

    const fileName = `${bill.vendorInvoiceNumber}.pdf`
    const sampleLines = NCBA_SAMPLE_LINES.slice(0, Math.min(NCBA_SAMPLE_LINES.length, bill.lineCount))
    const sampleTotal = sampleLines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
    const remainingLines = Math.max(0, bill.lineCount - sampleLines.length)
    const remainingAmount = bill.amount - sampleTotal

    return (
        <MockDocumentPreview
            isOpen={isOpen}
            onClose={onClose}
            fileName={fileName}
            headerBadge={{ label: `OCR ${bill.ocrConfidence}%`, tone: 'ai' }}
            subtitle={`Vendor invoice · ${bill.lineCount} line items · received ${new Date(bill.receivedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}
            width="4xl"
            footer={
                <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                        <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                        291 lines mapped exact-to-the-penny · confidence {bill.ocrConfidence}%
                    </span>
                    <span className="ml-auto text-muted-foreground italic">
                        Mock document · showing first {sampleLines.length} of {bill.lineCount} lines
                    </span>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto bg-background border border-border rounded-lg shadow-sm p-8 font-sans text-foreground text-sm">
                {/* Letterhead */}
                <div className="flex items-start justify-between pb-6 border-b-2 border-foreground">
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            <span className={boxCls}>{vendorName}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                            {vendorAddress}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            billing@{vendorName.toLowerCase().replace(/\s+/g, '')}.com · +1 416 661 3370
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Document</div>
                        <div className="text-3xl font-bold tracking-tight">Invoice</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Original · not a duplicate</div>
                    </div>
                </div>

                {/* Bill-to + metadata */}
                <div className="grid grid-cols-[1.4fr_1fr] gap-6 mt-5">
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bill to</div>
                        <div className="mt-1 text-[13px] leading-relaxed">
                            <div className="font-semibold"><span className={boxCls}>Dealer A</span></div>
                            <div>Bills</div>
                            <div>bills@dealer-a.com</div>
                            <div className="text-muted-foreground text-[11px] mt-1">4820 Wynkoop St · Denver CO 80216</div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-[12px]">
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Invoice #</span>
                            <span className={`font-mono font-semibold ${boxCls}`}>{bill.vendorInvoiceNumber}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Invoice date</span>
                            <span className="font-mono">{new Date(bill.receivedAt).toISOString().slice(0, 10)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">PO #</span>
                            <span className={`font-mono font-semibold ${boxCls}`}>{bill.poNumber ?? '—'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Project</span>
                            <span className={`text-right ${boxCls}`}>{bill.projectName}</span>
                        </div>
                        <div className="flex justify-between gap-3 pt-1 border-t border-border">
                            <span className="text-muted-foreground">Terms</span>
                            <span className={`font-semibold ${boxCls}`}>Net 10 · 1.5%/mo late</span>
                        </div>
                    </div>
                </div>

                {/* Line items table */}
                <div className="mt-6">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Line items · showing {sampleLines.length} of {bill.lineCount}
                    </div>
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr className="border-y border-foreground text-[10px] uppercase tracking-wider text-muted-foreground">
                                <th className="text-left py-2 px-2 w-[36px]">#</th>
                                <th className="text-left py-2 px-2 w-[120px]">SKU</th>
                                <th className="text-left py-2 px-2">Description</th>
                                <th className="text-right py-2 px-2 w-[50px]">Qty</th>
                                <th className="text-right py-2 px-2 w-[90px]">Unit price</th>
                                <th className="text-right py-2 px-2 w-[100px]">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleLines.map(l => (
                                <tr key={l.line} className="border-b border-border/50">
                                    <td className="py-1.5 px-2 font-mono text-muted-foreground tabular-nums">{l.line}</td>
                                    <td className="py-1.5 px-2 font-mono text-[11px] text-foreground">
                                        <span className={boxCls}>{l.sku}</span>
                                    </td>
                                    <td className="py-1.5 px-2 text-foreground">{l.description}</td>
                                    <td className="py-1.5 px-2 text-right tabular-nums">{l.qty}</td>
                                    <td className="py-1.5 px-2 text-right tabular-nums">${l.unitPrice.toFixed(2)}</td>
                                    <td className="py-1.5 px-2 text-right tabular-nums font-semibold">
                                        ${(l.qty * l.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {remainingLines > 0 && (
                                <tr className="border-b border-border/50">
                                    <td colSpan={5} className="py-2 px-2 text-muted-foreground italic text-[11px]">
                                        ··· plus {remainingLines} additional line items (total ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) omitted for preview
                                    </td>
                                    <td className="py-2 px-2 text-right text-muted-foreground italic tabular-nums text-[11px]">
                                        ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-foreground">
                                <td colSpan={5} className="py-2 px-2 text-right text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Invoice total</td>
                                <td className="py-2 px-2 text-right text-lg font-bold tabular-nums text-foreground">
                                    <span className={boxCls}>${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer note */}
                <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
                    <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            Please remit payment within terms. Late payments accrue 1.5% per month.
                            Reference invoice # <span className="font-mono">{bill.vendorInvoiceNumber}</span> and PO # <span className="font-mono">{bill.poNumber}</span> on all correspondence.
                            <span className="block mt-1 italic">Thank you for your business.</span>
                        </div>
                    </div>
                </div>
            </div>
        </MockDocumentPreview>
    )
}
