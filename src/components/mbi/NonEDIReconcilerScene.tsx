/**
 * COMPONENT: NonEDIReconcilerScene
 * PURPOSE: Flow 1 · Scene 3 — Line-by-line reconciliation for non-EDI vendors.
 *          Shows the Apex Workspace exception flagged in the morning queue
 *          (quantity mismatch + price variance). Controller sees only the
 *          exception list — perfect-match bills auto-posted overnight.
 *
 *          Transcript feedback (Apr 23):
 *          - Align row heights so MATCH rows = MISMATCH rows (no visual fatigue)
 *          - Natural-language mismatch labels per row ("Qty mismatch · PO 6 · bill 5")
 *          - "+ Add freight line" for lines the AI couldn't match from the PO
 *          - Exception queue narrative: what they see IS NOT all bills; perfect
 *            ones already flowed to CORE
 *
 * DS TOKENS: bg-card · success/amber/info accents for diffs
 *
 * USED BY: MBIAccountingPage (wizard scene 2)
 */

import { useState } from 'react'
import {
    GitCompare, Check, Pencil, CheckCircle2,
    AlertTriangle, Package, Sparkles, Plus, Truck, ArrowRight,
} from 'lucide-react'
import { ReasonDialog as MBIReasonModal, StatusBadge } from '../shared'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

interface LineRow {
    id: string
    line: string
    sku: string
    desc: string
    spec: string
    poQty: number
    invQty: number
    poUnitPrice: number
    invUnitPrice: number
    match: 'ok' | 'qty' | 'price' | 'both'
}

const LINES: LineRow[] = [
    { id: 'L-01', line: 'L-01', sku: 'AW-TASK-CHR', desc: 'Task chair · graphite', spec: 'Grade B fabric · graphite frame', poQty: 2, invQty: 2, poUnitPrice: 1420, invUnitPrice: 1420, match: 'ok' },
    { id: 'L-02', line: 'L-02', sku: 'AW-LNG-MDN', desc: 'Lounge seating · modern', spec: 'Vinyl upholstery · chrome base', poQty: 1, invQty: 1, poUnitPrice: 2480, invUnitPrice: 2480, match: 'ok' },
    { id: 'L-03', line: 'L-03', sku: 'AW-DSK-6030', desc: 'Sit-stand desk 60×30', spec: 'Laminate top · black steel frame', poQty: 6, invQty: 5, poUnitPrice: 1180, invUnitPrice: 1180, match: 'qty' },
    { id: 'L-04', line: 'L-04', sku: 'AW-FIN-OAK', desc: 'Oak veneer finish upcharge', spec: 'Premium A-grade · 3/4″ thick veneer', poQty: 6, invQty: 5, poUnitPrice: 85, invUnitPrice: 95, match: 'both' },
    { id: 'L-05', line: 'L-05', sku: 'AW-FRT-INB', desc: 'Inbound freight', spec: 'LTL · dock-to-dock delivery', poQty: 1, invQty: 1, poUnitPrice: 420, invUnitPrice: 420, match: 'ok' },
]

function getMismatchLabel(row: LineRow): string {
    if (row.match === 'qty') return `Qty mismatch · PO ${row.poQty} · bill ${row.invQty}`
    if (row.match === 'price') return `Price variance · $${row.poUnitPrice} → $${row.invUnitPrice}`
    if (row.match === 'both') return `Qty + price variance · PO ${row.poQty}@$${row.poUnitPrice} · bill ${row.invQty}@$${row.invUnitPrice}`
    return ''
}

const OVERRIDE_CATEGORIES = [
    { id: 'vendor-confirmed', label: 'Vendor confirmed change' },
    { id: 'partial-ship', label: 'Partial shipment — accept short' },
    { id: 'price-amendment', label: 'Pricing amendment approved' },
    { id: 'other', label: 'Other (describe below)' },
]

type RowStatus = 'pending' | 'accepted' | 'overridden'

export default function NonEDIReconcilerScene() {
    const invoice = MBI_INVOICES.find(i => i.id === 'INV-0484')!
    const [statuses, setStatuses] = useState<Record<string, RowStatus>>({})
    const [metaById, setMetaById] = useState<Record<string, { reasonCategory?: string; notes?: string }>>({})
    const [modalRow, setModalRow] = useState<LineRow | null>(null)
    const [freightAdded, setFreightAdded] = useState(false)
    const [toast, setToast] = useState<{ id: string; message: string; tone: 'success' | 'info' } | null>(null)

    const pushToast = (id: string, tone: 'success' | 'info', message: string) => {
        setToast({ id, tone, message })
        setTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 3500)
    }

    const setRowStatus = (row: LineRow, s: RowStatus) => setStatuses(prev => ({ ...prev, [row.id]: s }))

    const handleAccept = (row: LineRow) => {
        setRowStatus(row, 'accepted')
        const label = row.match === 'qty' ? 'Short-shipped accepted' : 'Price variance accepted'
        pushToast(row.id, 'success', `${row.line} · ${label}`)
    }

    const handleOverrideSubmit = (row: LineRow, payload: { reasonCategory: string; notes: string }) => {
        setRowStatus(row, 'overridden')
        setMetaById(prev => ({ ...prev, [row.id]: payload }))
        setModalRow(null)
        pushToast(row.id, 'info', `${row.line} · override logged to audit trail`)
    }

    const handleAddFreight = () => {
        setFreightAdded(true)
        pushToast('freight', 'success', 'Freight line added · $680 · pending approval')
    }

    const totalPO = LINES.reduce((acc, r) => acc + r.poQty * r.poUnitPrice, 0)
    const totalInv = LINES.reduce((acc, r) => acc + r.invQty * r.invUnitPrice, 0)
    const diff = totalInv - totalPO

    const flaggedRows = LINES.filter(r => r.match !== 'ok')
    const allDecided = flaggedRows.every(r => (statuses[r.id] ?? 'pending') !== 'pending')

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <GitCompare className="h-3 w-3 shrink-0" />
                <span>Bill queue · recent &amp; pending</span>
                <span className="text-border">›</span>
                <span className="font-bold text-foreground">{invoice.id} · {invoice.vendor} · line-by-line reconciliation</span>
            </div>

            {/* Invoice header + total comparison — single unified card */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                {/* Header row */}
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${diff < 0 ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                        <GitCompare className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{invoice.vendor}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{invoice.id}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">·</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{invoice.poNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                10 auto-posted
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                2 exceptions pending
                            </span>
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-sm font-bold text-muted-foreground tabular-nums">${totalPO.toLocaleString()}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            <span className={`text-sm font-bold tabular-nums ${diff < 0 ? 'text-success' : 'text-amber-600 dark:text-amber-400'}`}>
                                ${totalInv.toLocaleString()}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff < 0 ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}>
                                {diff < 0 ? `−$${Math.abs(diff).toLocaleString()}` : `+$${Math.abs(diff).toLocaleString()}`}
                            </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">PO vs invoice · 2 lines flagged</div>
                    </div>
                </div>

                {/* Line-by-line table header */}
                <div className="px-4 py-2 bg-muted/20 dark:bg-zinc-900/40 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-foreground">Line-by-line comparison</span>
                    <span className="text-[10px] text-muted-foreground">· line # · model # · unit price · ship-to excluded</span>
                </div>
            </div>

            {/* Line-by-line diff table */}
            <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
                {/* Column headers */}
                <div className="px-4 py-2.5 border-b border-border bg-muted/20 dark:bg-zinc-900/40 grid grid-cols-[2.5rem_1fr_3rem_3rem_5rem_5rem_4rem_8rem] gap-2 items-end">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line</div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Item · Model # · Spec</div>
                        <div className="text-[9px] text-muted-foreground/60 mt-0.5">line · model · unit price only</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                        <div>PO</div>
                        <div className="text-[9px] font-normal">qty</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                        <div>Bill</div>
                        <div className="text-[9px] font-normal">qty</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                        <div>Unit $</div>
                        <div className="text-[9px] font-normal">PO</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                        <div>Unit $</div>
                        <div className="text-[9px] font-normal">Bill</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Delta</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Action</div>
                </div>

                <div className="divide-y divide-border">
                    {LINES.map(row => {
                        const status = statuses[row.id] ?? 'pending'
                        const meta = metaById[row.id]
                        const poLine = row.poQty * row.poUnitPrice
                        const invLine = row.invQty * row.invUnitPrice
                        const lineDiff = invLine - poLine
                        const isException = row.match !== 'ok'
                        const mismatchLabel = getMismatchLabel(row)
                        const qtyMismatch = row.poQty !== row.invQty
                        const priceMismatch = row.poUnitPrice !== row.invUnitPrice
                        return (
                            <div
                                key={row.id}
                                className={`
                                    grid grid-cols-[2.5rem_1fr_3rem_3rem_5rem_5rem_4rem_8rem] gap-2 px-4 items-center text-xs transition-colors border-l-4 min-h-[60px]
                                    ${status === 'accepted' ? 'border-l-success/60 bg-success/5 dark:bg-success/10 py-2.5' : ''}
                                    ${status === 'overridden' ? 'border-l-info/60 bg-info/5 dark:bg-info/10 py-2.5' : ''}
                                    ${status === 'pending' && isException ? 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-500/5 py-2.5' : ''}
                                    ${status === 'pending' && !isException ? 'border-l-transparent py-2.5' : ''}
                                `}
                            >
                                {/* Line # */}
                                <div className="font-mono text-[10px] text-muted-foreground">{row.line}</div>

                                {/* Item + spec + mismatch badge */}
                                <div className="min-w-0">
                                    <div className="text-foreground truncate font-medium text-[11px]">{row.desc}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono truncate">{row.sku}</div>
                                    <div className="text-[10px] text-muted-foreground/80 truncate italic">{row.spec}</div>
                                    {isException && status === 'pending' && (
                                        <div className="mt-0.5">
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                <AlertTriangle className="h-2 w-2 shrink-0" />
                                                {mismatchLabel}
                                            </span>
                                        </div>
                                    )}
                                    {meta?.notes && (
                                        <div className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">"{meta.notes}"</div>
                                    )}
                                </div>

                                {/* PO Qty */}
                                <div className={`text-center tabular-nums font-bold text-[12px] ${qtyMismatch && status === 'pending' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {row.poQty}
                                </div>

                                {/* Bill Qty */}
                                <div className={`text-center tabular-nums font-bold text-[12px] ${qtyMismatch && status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                    {row.invQty}
                                    {qtyMismatch && status === 'pending' && (
                                        <div className="text-[9px] font-normal text-amber-600/80 dark:text-amber-400/80">
                                            {row.invQty < row.poQty ? `−${row.poQty - row.invQty}` : `+${row.invQty - row.poQty}`}
                                        </div>
                                    )}
                                </div>

                                {/* PO Unit Price */}
                                <div className={`text-right tabular-nums text-[11px] ${priceMismatch && status === 'pending' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                    ${row.poUnitPrice.toLocaleString()}
                                </div>

                                {/* Bill Unit Price */}
                                <div className={`text-right tabular-nums text-[11px] font-semibold ${priceMismatch && status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                    ${row.invUnitPrice.toLocaleString()}
                                    {priceMismatch && status === 'pending' && (
                                        <div className="text-[9px] font-normal text-amber-600/80 dark:text-amber-400/80">
                                            {row.invUnitPrice > row.poUnitPrice ? `+$${row.invUnitPrice - row.poUnitPrice}` : `−$${row.poUnitPrice - row.invUnitPrice}`}
                                        </div>
                                    )}
                                </div>

                                {/* Line Delta */}
                                <div className={`text-right tabular-nums font-bold text-[11px] ${lineDiff < 0 ? 'text-success' : lineDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                    {lineDiff === 0 ? '—' : `${lineDiff > 0 ? '+' : '−'}$${Math.abs(lineDiff).toLocaleString()}`}
                                </div>

                                {/* Action */}
                                <div className="flex items-center gap-1 justify-end">
                                    {!isException && status === 'pending' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Match
                                        </span>
                                    )}
                                    {isException && status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => setModalRow(row)}
                                                title="Override with reason"
                                                className="h-7 w-7 flex items-center justify-center text-foreground bg-background dark:bg-zinc-800 border border-border rounded-md hover:bg-muted hover:border-info/40 transition-colors"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleAccept(row)}
                                                title="Accept variance"
                                                className="h-7 flex items-center gap-1 px-2.5 text-[10px] font-bold text-zinc-900 bg-primary rounded-md hover:opacity-90 transition-opacity shadow-sm"
                                            >
                                                <Check className="h-3 w-3" />
                                                Accept
                                            </button>
                                        </>
                                    )}
                                    {status === 'accepted' && (
                                        <StatusBadge label="Accepted" tone="success" size="sm" icon={<CheckCircle2 className="h-3 w-3" />} />
                                    )}
                                    {status === 'overridden' && (
                                        <StatusBadge label="Override" tone="info" size="sm" icon={<Pencil className="h-3 w-3" />} />
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Freight added row */}
                    {freightAdded && (
                        <div className="grid grid-cols-[2.5rem_1fr_3rem_3rem_5rem_5rem_4rem_8rem] gap-2 px-4 py-2.5 items-center text-xs border-l-4 border-l-info/60 bg-info/5 dark:bg-info/10 min-h-[60px] animate-in fade-in duration-300">
                            <div className="font-mono text-[10px] text-muted-foreground">L-06</div>
                            <div className="min-w-0">
                                <div className="text-foreground font-medium text-[11px]">Outbound freight — added manually</div>
                                <div className="text-[10px] text-muted-foreground font-mono">AW-FRT-OUT</div>
                                <div className="text-[10px] text-muted-foreground/80 italic">LTL · outbound · not on PO</div>
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-info/15 text-info uppercase tracking-wider mt-0.5">
                                    <Plus className="h-2 w-2" />
                                    Manually added · pending approval
                                </span>
                            </div>
                            <div className="text-center text-muted-foreground text-[12px] font-bold">—</div>
                            <div className="text-center tabular-nums font-bold text-info text-[12px]">1</div>
                            <div className="text-right text-muted-foreground text-[11px]">—</div>
                            <div className="text-right tabular-nums font-semibold text-info text-[11px]">$680</div>
                            <div className="text-right tabular-nums font-bold text-[11px] text-amber-600 dark:text-amber-400">+$680</div>
                            <div className="flex justify-end">
                                <StatusBadge label="Pending" tone="info" size="sm" />
                            </div>
                        </div>
                    )}

                    {/* + Add line row */}
                    {!freightAdded && (
                        <div className="px-4 py-2.5 border-l-4 border-l-transparent border-t border-dashed border-border/60">
                            <button
                                onClick={handleAddFreight}
                                className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors group"
                            >
                                <div className="h-5 w-5 rounded border border-dashed border-border group-hover:border-primary/50 flex items-center justify-center transition-colors">
                                    <Plus className="h-3 w-3" />
                                </div>
                                <Truck className="h-3.5 w-3.5 text-muted-foreground/60" />
                                <span>Add freight / missing line not on PO</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Resolution banner */}
            {allDecided && (
                <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Reconciliation complete</div>
                        <div className="text-muted-foreground">
                            {invoice.vendor} bill posted · variance logged in audit trail · GL updated.
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300
                    ${toast.tone === 'success' ? 'bg-success/15 text-success border border-success/30' : 'bg-info/15 text-info border border-info/30'}
                `}>
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>{toast.message}</span>
                </div>
            )}

            {/* AI learning footer */}
            <div className="flex items-center gap-2.5 bg-muted/30 dark:bg-zinc-800 border border-border rounded-xl p-3">
                <div className="h-8 w-8 rounded-lg bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-[11px] text-muted-foreground flex-1">
                    <strong className="text-foreground">Every override trains the matcher.</strong> Strata learns your acceptable variance thresholds per vendor — next time Apex Workspace ships 5-of-6 on Jarvis, it'll auto-approve without asking.
                </div>
            </div>

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.VENDOR_EMAIL] },
                { sources: [SOURCES.DOC_AI] },
                { sources: [SOURCES.CORE_PO, SOURCES.INVOICE_HISTORY] },
                { sources: [SOURCES.CORE_GL, SOURCES.CORE_RPA] },
            ]} />

            {/* Override modal */}
            {modalRow && (
                <MBIReasonModal
                    isOpen
                    onClose={() => setModalRow(null)}
                    onSubmit={payload => handleOverrideSubmit(modalRow, { reasonCategory: payload.categoryId, notes: payload.notes })}
                    tone="info"
                    icon={<Pencil className="h-5 w-5" />}
                    title="Override line variance"
                    subtitle={`${modalRow.line} · ${modalRow.desc}`}
                    contextBanner={{
                        tone: 'info',
                        icon: <Package className="h-4 w-4" />,
                        title: `${modalRow.match === 'qty' ? 'Quantity' : 'Price'} differs from PO.`,
                        body: (
                            <>
                                PO says <span className="font-mono">{modalRow.poQty} × ${modalRow.poUnitPrice}</span>, bill says <span className="font-mono">{modalRow.invQty} × ${modalRow.invUnitPrice}</span>. Your reason is logged to the vendor's audit trail and to Strata's matcher.
                            </>
                        ),
                    }}
                    categories={OVERRIDE_CATEGORIES}
                    defaultCategoryId="vendor-confirmed"
                    categoryPrompt="Why accept the variance?"
                    notesPlaceholder="e.g. Apex Workspace emailed 04/17 confirming short ship on Jarvis — backorder coming on next PO."
                    notesRequiredForCategoryId="other"
                    confirmLabel="Post with override"
                />
            )}
        </div>
    )
}
