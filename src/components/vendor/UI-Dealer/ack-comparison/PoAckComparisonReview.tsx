/**
 * PoAckComparisonReview
 *
 * Dealer-facing review of a PO ↔ ACK comparison. View-only — the dealer
 * cannot resolve discrepancies in UI-Dealer; resolution happens in
 * Expert Hub. The dealer's role here is to read the side-by-side documents,
 * leave a note for the resolver, and escalate.
 *
 * Used by:
 *   · AckReviewSlideOver — opened from quick actions across the app
 *   · AckDetail          — embedded inline above the QuickActions bar
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, FileSearch, FileText } from 'lucide-react'
import ComparisonStatusBadge from './ComparisonStatusBadge'
import { type AckComparisonReport, type ComparisonField } from './ComparisonSummaryPanel'

// Demo simulation: pre-fill the textarea with a realistic note so stakeholders
// can see the end-to-end flow without having to type during a presentation.
const SIMULATED_DEALER_NOTE =
    "Triple Locker shortage is the blocker for our Dec 1 install at the Dallas site. Backorder split is acceptable if Lounge 2-Seat ships before Nov 30. Please confirm vendor's revised ETA and let me know if the $2,095 delta needs a change order from the customer."

interface PoAckComparisonReviewProps {
    report: AckComparisonReport
    /**
     * Called when the dealer escalates with a note. The note may be empty.
     * If omitted, the Send to Expert Hub button is hidden (read-only mode).
     */
    onSendToExpert?: (note: string) => void
    /** Compact heading for embedded use; defaults to true (always shows). */
    showHeading?: boolean
    /** Reset the textarea when this key changes (e.g. when a slide-over reopens). */
    resetKey?: string | number | boolean
}

export default function PoAckComparisonReview({
    report,
    onSendToExpert,
    showHeading = true,
    resetKey,
}: PoAckComparisonReviewProps) {
    const [note, setNote] = useState(SIMULATED_DEALER_NOTE)
    const [sent, setSent] = useState(false)
    const [sentNote, setSentNote] = useState('')
    useEffect(() => {
        setNote(SIMULATED_DEALER_NOTE)
        setSent(false)
        setSentNote('')
    }, [resetKey])

    const handleSend = () => {
        const trimmed = note.trim()
        setSentNote(trimmed)
        setSent(true)
        onSendToExpert?.(trimmed)
    }

    const mismatchCount = report.fields.filter(f => f.status === 'mismatch').length
    const partialCount = report.fields.filter(f => f.status === 'partial').length

    if (sent) {
        return (
            <div className="bg-card dark:bg-zinc-800 border border-success/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-success/10 text-success flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-foreground">Sent to Expert Hub</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{report.ackId}</span> escalated for resolution.
                            The expert will respond inside Expert Hub — you'll be notified when the comparison is updated.
                        </p>
                        {sentNote && (
                            <div className="mt-3 bg-muted/30 dark:bg-zinc-900/40 border border-border rounded-lg px-3 py-2 text-[12px] text-foreground italic">
                                "{sentNote}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl shadow-sm overflow-hidden">
            {showHeading && (
                <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">PO vs ACK · side-by-side</h3>
                    <ComparisonStatusBadge status={report.comparisonStatus} size="sm" />
                    <span className="text-[11px] text-muted-foreground ml-auto">
                        {report.poId} ↔ {report.ackId} · compared {report.comparedAt}
                    </span>
                </div>
            )}

            <div className="p-4 sm:p-5 bg-muted/20 dark:bg-zinc-900/40">
                {(mismatchCount > 0 || partialCount > 0) && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            Differences detected: <strong>{mismatchCount}</strong> mismatch · <strong>{partialCount}</strong> partial. Highlights tagged on the ACK column.
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <DocumentPaper
                        kind="po"
                        title="Purchase Order"
                        docNumber={report.poId}
                        vendor={report.vendor}
                        report={report}
                    />
                    <DocumentPaper
                        kind="ack"
                        title="Vendor Acknowledgment"
                        docNumber={report.ackId}
                        vendor={report.vendor}
                        report={report}
                        comparedAt={report.comparedAt}
                    />
                </div>

                {/* Note for the expert */}
                <div className="mt-4 bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
                    <label htmlFor={`expert-note-${report.ackId}`} className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Note for the Expert
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                        Optional context for the resolver — what to prioritize, what's acceptable, deadlines, etc.
                    </p>
                    <textarea
                        id={`expert-note-${report.ackId}`}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder="e.g. Backorder is fine if shipment splits before Nov 30. Triple Locker shortage is the blocker."
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 resize-none"
                    />
                    {onSendToExpert && (
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-[11px] text-muted-foreground">
                                Dealer review only — resolution happens in Expert Hub.
                            </p>
                            <button
                                type="button"
                                onClick={handleSend}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 hover:bg-brand-400 dark:hover:bg-brand-600 rounded-lg transition-colors"
                            >
                                <FileSearch className="h-4 w-4" />
                                Send to Expert Hub
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Document Paper ───────────────────────────────────────────────────────
// Compact "paper" rendering of either the PO or the ACK side. The ACK column
// highlights cells where status !== 'match' so the dealer can spot the diff
// without reading both docs in full.

interface DocumentPaperProps {
    kind: 'po' | 'ack'
    title: string
    docNumber: string
    vendor: string
    report: AckComparisonReport
    comparedAt?: string
}

function DocumentPaper({ kind, title, docNumber, vendor, report, comparedAt }: DocumentPaperProps) {
    const lineFields = report.fields.filter(f => f.category === 'line-item')
    const total = report.fields.find(f => f.field === 'Total Amount')
    const shipDate = report.fields.find(f => f.field === 'Estimated Ship Date')
    const shipTo = report.fields.find(f => f.field === 'Ship-To Address')
    const freight = report.fields.find(f => f.field === 'Freight Terms')
    const payment = report.fields.find(f => f.field === 'Payment Terms')

    const valueOf = (f: ComparisonField | undefined) =>
        f ? (kind === 'po' ? f.poValue : f.ackValue) : '—'

    const isACK = kind === 'ack'

    const diffCls = (status: 'match' | 'mismatch' | 'partial') => {
        if (!isACK || status === 'match') return ''
        return status === 'mismatch'
            ? 'bg-red-100 text-red-700 px-1 rounded font-semibold'
            : 'bg-amber-100 text-amber-700 px-1 rounded font-semibold'
    }

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {isACK ? 'ACK · Vendor copy' : 'PO · Dealer copy'}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{docNumber}</span>
            </div>

            <div className="bg-white text-zinc-900 p-5 text-[11px] flex-1">
                <div className="flex justify-between items-end pb-3 mb-3 border-b-2 border-zinc-900">
                    <h2 className="text-base font-bold uppercase tracking-tight">{title}</h2>
                    <div className="text-right">
                        <div className="font-bold text-xs">{isACK ? vendor : 'STRATA INC.'}</div>
                        <div className="text-[10px] text-zinc-500">{isACK ? 'Vendor confirmation' : 'Dealer originator'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{isACK ? 'Vendor' : 'Bill To'}</div>
                        <div className="font-semibold">{isACK ? vendor : 'Acme Corp.'}</div>
                        <div className="text-[10px] text-zinc-500">
                            {isACK ? 'AIS HQ · Leominster, MA' : '1200 Commerce Dr, Dallas TX'}
                        </div>
                    </div>
                    <div className="text-right space-y-0.5">
                        <Row label="Doc #" value={docNumber} />
                        {isACK && <Row label="Ref PO" value={report.poId} />}
                        <Row label="Date" value={isACK ? (comparedAt ?? 'Apr 10, 2026') : 'Apr 02, 2026'} />
                        <Row label="Ship date" value={valueOf(shipDate)} highlight={diffCls(shipDate?.status ?? 'match')} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
                    <Row label="Ship to" value={valueOf(shipTo)} />
                    <Row label="Freight" value={valueOf(freight)} />
                    <Row label="Payment" value={valueOf(payment)} />
                    {isACK && <Row label="Status" value="Confirmed (partial)" />}
                </div>

                {/* Line items */}
                <div className="mt-3">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1 bg-zinc-100 text-[9px] font-bold uppercase tracking-wider text-zinc-500 rounded">
                        <span>Item</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Note</span>
                    </div>
                    {lineFields.map((f, i) => {
                        const val = isACK ? f.ackValue : f.poValue
                        return (
                            <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1.5 border-b border-zinc-100 items-baseline text-[10px]">
                                <span className="text-zinc-700 truncate">{f.field.replace(/^Line \d+: /, '')}</span>
                                <span className={`tabular-nums text-right min-w-[28px] ${diffCls(f.status)}`}>{val}</span>
                                <span className="text-right text-[9px] text-zinc-400">
                                    {isACK && f.status !== 'match' ? (f.severity?.toUpperCase() ?? '—') : '—'}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-3 pt-2 border-t-2 border-zinc-900 flex justify-between items-baseline">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total</span>
                    <span className={`text-base font-bold tabular-nums ${diffCls(total?.status ?? 'match')}`}>{valueOf(total)}</span>
                </div>
            </div>
        </div>
    )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
    return (
        <div className="flex justify-between gap-2 text-[10px]">
            <span className="text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
            <span className={`text-zinc-700 ${highlight ?? ''}`}>{value}</span>
        </div>
    )
}
