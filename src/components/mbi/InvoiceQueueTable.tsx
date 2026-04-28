/**
 * COMPONENT: InvoiceQueueTable (Kanban)
 * PURPOSE: Kathy's morning AP queue rendered as a 3-column kanban
 *          (Pending · In Progress · Done). Apr 23 transcript commitment from
 *          Christian to Matt: the queue must show in-progress, not just
 *          pending+done — Kathy needs to see what the agents are working on
 *          right now.
 *
 *          File name kept (`InvoiceQueueTable`) so existing imports keep
 *          working; the implementation is now a kanban.
 *
 * PROPS:
 *   - invoices: Invoice[]
 *   - selectedId?: string           — sync with detail panel
 *   - onSelect: (id: string) => void
 *
 * COLUMN STATES per invoice:
 *   - pending      → red/amber accent, exception or HealthTrust royalty needs review
 *   - in-progress  → ai accent + spinner-like dot, agent reconciling
 *   - done         → success accent, auto-posted to CORE
 *
 * USED BY: AccountingMorningQueue (Flow 2 Scene 1)
 */

import { AlertTriangle, Heart, Zap, CheckCircle2, Loader2 } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '../../config/profiles/mbi-data'

interface InvoiceQueueTableProps {
    invoices: Invoice[]
    selectedId?: string
    onSelect: (id: string) => void
}

const COLUMN_ORDER: InvoiceStatus[] = ['pending', 'in-progress', 'done']

const COLUMN_META: Record<InvoiceStatus, { label: string; sub: string; tone: string; chip: string }> = {
    'pending': {
        label: 'Pending',
        sub: 'Needs your eyes',
        tone: 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5',
        chip: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    },
    'in-progress': {
        label: 'In Progress',
        sub: 'Agents working now',
        tone: 'border-ai/40 bg-ai/5 dark:bg-ai/10',
        chip: 'bg-ai/15 text-ai',
    },
    'done': {
        label: 'Done',
        sub: 'Auto-posted to CORE',
        tone: 'border-success/40 bg-success/5 dark:bg-success/10',
        chip: 'bg-success/15 text-success',
    },
}

export default function InvoiceQueueTable({ invoices, selectedId, onSelect }: InvoiceQueueTableProps) {
    const byStatus: Record<InvoiceStatus, Invoice[]> = {
        'pending': invoices.filter(i => i.status === 'pending'),
        'in-progress': invoices.filter(i => i.status === 'in-progress'),
        'done': invoices.filter(i => i.status === 'done'),
    }

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-foreground">Morning invoice queue · 12 invoices</div>
                    <div className="text-[10px] text-muted-foreground">AI extracted overnight · workflow in 3 columns · click any card</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                    <Legend color="bg-amber-500/20 text-amber-700 dark:text-amber-400" label="HT" />
                    <Legend color="bg-blue-500/20 text-blue-700 dark:text-blue-400" label="EDI" />
                    <Legend color="bg-red-500/20 text-red-700 dark:text-red-400" label="Exception" />
                </div>
            </div>

            {/* 3 columns */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-background/40 dark:bg-zinc-900/40">
                {COLUMN_ORDER.map(status => {
                    const items = byStatus[status]
                    const meta = COLUMN_META[status]
                    return (
                        <div key={status} className={`flex flex-col rounded-xl border ${meta.tone}`}>
                            {/* Column header */}
                            <div className="px-2.5 py-2 border-b border-border/60 flex items-center justify-between">
                                <div className="min-w-0">
                                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.chip}`}>
                                        {status === 'in-progress' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                                        {status === 'done' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                        {meta.label}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground mt-1 truncate">{meta.sub}</div>
                                </div>
                                <span className="text-[10px] font-bold text-foreground tabular-nums shrink-0">{items.length}</span>
                            </div>

                            {/* Cards */}
                            <div className="p-1.5 space-y-1.5 max-h-[440px] overflow-y-auto">
                                {items.map(inv => (
                                    <InvoiceCard
                                        key={inv.id}
                                        invoice={inv}
                                        selected={inv.id === selectedId}
                                        onClick={() => onSelect(inv.id)}
                                    />
                                ))}
                                {items.length === 0 && (
                                    <div className="text-[10px] text-muted-foreground italic text-center py-4">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function InvoiceCard({ invoice, selected, onClick }: { invoice: Invoice; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left bg-card dark:bg-zinc-800 border rounded-lg p-2 transition-all hover:shadow-sm
                ${selected
                    ? 'border-primary ring-1 ring-primary/40'
                    : invoice.hasException
                        ? 'border-red-500/40 hover:border-red-500/60'
                        : 'border-border hover:border-zinc-300 dark:hover:border-zinc-600'
                }
            `}
        >
            <div className="flex items-start justify-between gap-1 mb-1">
                <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-foreground truncate leading-tight">{invoice.vendor}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{invoice.id}</div>
                </div>
                <div className="text-[11px] font-bold text-foreground tabular-nums shrink-0">
                    ${(invoice.amount / 1000).toFixed(1)}K
                </div>
            </div>

            <div className="flex items-center gap-0.5 flex-wrap">
                {invoice.isEDI && (
                    <CardFlag tone="blue" icon={<Zap className="h-2 w-2" />} label="EDI" />
                )}
                {invoice.isHealthTrust && (
                    <CardFlag tone="amber" icon={<Heart className="h-2 w-2" />} label="HT" />
                )}
                {invoice.hasException && (
                    <CardFlag tone="red" icon={<AlertTriangle className="h-2 w-2" />} label="Fix" />
                )}
                <span className={`ml-auto text-[9px] font-bold tabular-nums ${invoice.ocrConfidence >= 95 ? 'text-success' : invoice.ocrConfidence >= 90 ? 'text-zinc-900 dark:text-primary' : 'text-amber-700 dark:text-amber-400'}`}>
                    {invoice.ocrConfidence}%
                </span>
            </div>

            {invoice.status === 'in-progress' && invoice.inProgressReason && (
                <div className="text-[9.5px] text-muted-foreground italic mt-1 leading-tight line-clamp-2">
                    {invoice.inProgressReason}
                </div>
            )}
            {invoice.status === 'pending' && invoice.exceptionReason && (
                <div className="text-[9.5px] text-red-600 dark:text-red-400 mt-1 leading-tight line-clamp-2">
                    {invoice.exceptionReason}
                </div>
            )}
            {invoice.status === 'pending' && invoice.isHealthTrust && !invoice.hasException && (
                <div className="text-[9.5px] text-amber-700 dark:text-amber-400 mt-1 leading-tight">
                    HealthTrust royalty · approve 3%
                </div>
            )}
        </button>
    )
}

// Plain-language tooltips for the acronym badges so a non-finance audience
// (and MBI's own team during the demo) can hover and understand without
// needing background knowledge.
const FLAG_TOOLTIPS: Record<string, string> = {
    EDI: 'EDI · Electronic Data Interchange. Vendor sends the invoice straight into CORE — no manual entry, no OCR.',
    HT: 'HealthTrust · Group Purchasing Organization for healthcare clients. MBI owes a 3% royalty on every invoice tied to a HealthTrust member (e.g. Riverside Medical, Lakeside).',
    Fix: 'Exception flagged · the line items, quantities or amounts don\'t match the matching purchase order. Needs a human decision.',
}

function CardFlag({ tone, icon, label }: { tone: 'blue' | 'amber' | 'red'; icon: React.ReactNode; label: string }) {
    const cls =
        tone === 'blue' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' :
        tone === 'amber' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400' :
        'bg-red-500/15 text-red-700 dark:text-red-400'
    return (
        <span
            className={`text-[8.5px] font-bold px-1 py-0.5 rounded inline-flex items-center gap-0.5 ${cls}`}
            title={FLAG_TOOLTIPS[label]}
        >
            {icon}
            {label}
        </span>
    )
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${color}`}>{label}</span>
    )
}
