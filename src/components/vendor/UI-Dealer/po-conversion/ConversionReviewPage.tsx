import { useState, useMemo, useEffect } from 'react'
import { clsx } from 'clsx'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Building2,
    FileText,
    Package,
} from 'lucide-react'
import ConversionStatusBadge from './ConversionStatusBadge'
import type { ConversionReview, SnapshotDiscrepancy } from './types'

// ── Props ──
interface ConversionReviewPageProps {
    onBack?: () => void
    onApprove?: () => void
}

// ── Mock Data ──
const MOCK_REVIEW: ConversionReview = {
    id: 'cr-4401',
    quoteId: 'QT-1025',
    status: 'COMPLETED',
    frozenSnapshot: {
        quoteNumber: 'QT-1025',
        customer: 'Meridian Office Solutions',
        project: 'HQ Floor 12 Refresh',
        totalAmount: 121635,
        lineItems: [
            { index: 1, productNumber: 'SC-LEAP-V2', description: 'Steelcase Leap V2 Task Chair', quantity: 40, unitPrice: 895, total: 35800, vendor: 'Steelcase' },
            { index: 2, productNumber: 'SC-MIGT-48', description: 'Steelcase Migration SE 48" Desk', quantity: 12, unitPrice: 1120, total: 13440, vendor: 'Steelcase' },
            { index: 3, productNumber: 'SC-TS-CTR', description: 'Steelcase Thread Counter Stool', quantity: 8, unitPrice: 485, total: 3880, vendor: 'Steelcase' },
            { index: 4, productNumber: 'HM-AER-RB', description: 'Herman Miller Aeron Remastered', quantity: 20, unitPrice: 1195, total: 23900, vendor: 'Herman Miller' },
            { index: 5, productNumber: 'HM-NLS-72', description: 'Herman Miller Nevi Sit-Stand 72"', quantity: 8, unitPrice: 1295, total: 10360, vendor: 'Herman Miller' },
            { index: 6, productNumber: 'KN-GEN-EX', description: 'Knoll Generation Executive Chair', quantity: 15, unitPrice: 2303.67, total: 34555, vendor: 'Knoll' },
        ],
        metadata: { region: 'US-West', warehouse: 'LAX-02' },
    },
    vendorSplit: [
        {
            vendorName: 'Steelcase',
            vendorCode: 'VND-SC',
            lineItemCount: 3,
            subtotal: 53120,
            lineItems: [
                { index: 1, productNumber: 'SC-LEAP-V2', description: 'Steelcase Leap V2 Task Chair', quantity: 40, unitPrice: 895, total: 35800, vendor: 'Steelcase' },
                { index: 2, productNumber: 'SC-MIGT-48', description: 'Steelcase Migration SE 48" Desk', quantity: 12, unitPrice: 1120, total: 13440, vendor: 'Steelcase' },
                { index: 3, productNumber: 'SC-TS-CTR', description: 'Steelcase Thread Counter Stool', quantity: 8, unitPrice: 485, total: 3880, vendor: 'Steelcase' },
            ],
        },
        {
            vendorName: 'Herman Miller',
            vendorCode: 'VND-HM',
            lineItemCount: 2,
            subtotal: 34260,
            lineItems: [
                { index: 4, productNumber: 'HM-AER-RB', description: 'Herman Miller Aeron Remastered', quantity: 20, unitPrice: 1195, total: 23900, vendor: 'Herman Miller' },
                { index: 5, productNumber: 'HM-NLS-72', description: 'Herman Miller Nevi Sit-Stand 72"', quantity: 8, unitPrice: 1295, total: 10360, vendor: 'Herman Miller' },
            ],
        },
        {
            vendorName: 'Knoll',
            vendorCode: 'VND-KN',
            lineItemCount: 1,
            subtotal: 34555,
            lineItems: [
                { index: 6, productNumber: 'KN-GEN-EX', description: 'Knoll Generation Executive Chair', quantity: 15, unitPrice: 2303.67, total: 34555, vendor: 'Knoll' },
            ],
        },
    ],
    discrepancies: [
        {
            fieldName: 'Unit Price — SC-LEAP-V2',
            snapshotValue: '$895.00',
            currentValue: '$912.00',
            severity: 'MEDIUM',
            type: 'price_change',
        },
        {
            fieldName: 'Quantity — HM-AER-RB',
            snapshotValue: '20',
            currentValue: '18',
            severity: 'HIGH',
            type: 'quantity_change',
        },
    ],
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
}

// ── Helpers ──
const usd = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })

function useCountdown(expiresAt: string) {
    const [now, setNow] = useState(Date.now())
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60_000)
        return () => clearInterval(interval)
    }, [])
    const diff = Math.max(0, new Date(expiresAt).getTime() - now)
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    if (diff === 0) return 'Expired'
    return `${h}h ${m}m remaining`
}

const severityColor = (s: SnapshotDiscrepancy['severity']) => {
    const map: Record<string, string> = {
        LOW: 'text-blue-600 dark:text-blue-400',
        MEDIUM: 'text-amber-600 dark:text-amber-400',
        HIGH: 'text-red-600 dark:text-red-400',
        CRITICAL: 'text-red-700 dark:text-red-300 font-bold',
    }
    return map[s] ?? ''
}

const changeTypeBg = (type: SnapshotDiscrepancy['type']) => {
    const map: Record<string, string> = {
        price_change: 'bg-amber-100 dark:bg-amber-900/30',
        quantity_change: 'bg-amber-100 dark:bg-amber-900/30',
        item_added: 'bg-green-100 dark:bg-green-900/30',
        item_removed: 'bg-red-100 dark:bg-red-900/30 line-through',
    }
    return map[type] ?? ''
}

// ── Card shell ──
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={clsx('bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm', className)}>
        {children}
    </div>
)

// ── Component ──
export default function ConversionReviewPage({ onBack, onApprove }: ConversionReviewPageProps) {
    const review = MOCK_REVIEW
    const countdown = useCountdown(review.expiresAt)

    const [viewMode, setViewMode] = useState<'snapshot' | 'compare'>('snapshot')
    const [snapshotOpen, setSnapshotOpen] = useState(review.discrepancies.length > 0)
    const [showRejectConfirm, setShowRejectConfirm] = useState(false)
    const [toast, setToast] = useState<string | null>(null)

    const totalValue = useMemo(() => review.vendorSplit.reduce((s, v) => s + v.subtotal, 0), [review])

    const handleApprove = () => {
        setToast('POs created successfully — 3 drafts ready for review')
        onApprove?.()
        setTimeout(() => setToast(null), 4000)
    }

    const handleReject = () => {
        setShowRejectConfirm(false)
        setToast('Conversion rejected')
        setTimeout(() => setToast(null), 4000)
    }

    return (
        <div className="space-y-6 pb-12">
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <h1 className="text-xl font-semibold text-foreground">Conversion Review</h1>

                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-foreground">
                    Quote {review.quoteId}
                </span>

                <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {countdown}
                </span>
            </div>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{review.vendorSplit.length}</p>
                        <p className="text-xs text-muted-foreground">Total POs</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/10">
                        <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{usd(totalValue)}</p>
                        <p className="text-xs text-muted-foreground">Total Value</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{review.discrepancies.length}</p>
                        <p className="text-xs text-muted-foreground">Discrepancies</p>
                    </div>
                </Card>
            </div>

            {/* ── Snapshot Comparison (FE-17) ── */}
            <Card className="overflow-hidden">
                <button
                    onClick={() => setSnapshotOpen(!snapshotOpen)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-500" />
                        <span className="font-semibold text-foreground">Snapshot Comparison</span>
                        {review.discrepancies.length > 0 && (
                            <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                {review.discrepancies.length} changes
                            </span>
                        )}
                    </div>
                    {snapshotOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {snapshotOpen && (
                    <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                        {/* Toggle */}
                        <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 text-sm">
                            <button
                                onClick={() => setViewMode('snapshot')}
                                className={clsx(
                                    'rounded-md px-4 py-1.5 font-medium transition-colors',
                                    viewMode === 'snapshot'
                                        ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Snapshot
                            </button>
                            <button
                                onClick={() => setViewMode('compare')}
                                className={clsx(
                                    'rounded-md px-4 py-1.5 font-medium transition-colors',
                                    viewMode === 'compare'
                                        ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                Compare with Live
                            </button>
                        </div>

                        {viewMode === 'snapshot' && (
                            <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Frozen Snapshot (read-only)</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div><span className="text-muted-foreground">Customer:</span> <span className="text-foreground font-medium">{review.frozenSnapshot.customer}</span></div>
                                    <div><span className="text-muted-foreground">Project:</span> <span className="text-foreground font-medium">{review.frozenSnapshot.project}</span></div>
                                    <div><span className="text-muted-foreground">Total:</span> <span className="text-foreground font-medium">{usd(review.frozenSnapshot.totalAmount)}</span></div>
                                    <div><span className="text-muted-foreground">Items:</span> <span className="text-foreground font-medium">{review.frozenSnapshot.lineItems.length}</span></div>
                                </div>
                                <table className="w-full text-xs mt-2">
                                    <thead>
                                        <tr className="border-b border-border text-left text-muted-foreground">
                                            <th className="pb-2 font-medium">#</th>
                                            <th className="pb-2 font-medium">Product</th>
                                            <th className="pb-2 font-medium">Description</th>
                                            <th className="pb-2 font-medium text-right">Qty</th>
                                            <th className="pb-2 font-medium text-right">Unit Price</th>
                                            <th className="pb-2 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {review.frozenSnapshot.lineItems.map((li) => (
                                            <tr key={li.index} className="border-b border-border/50">
                                                <td className="py-2 text-muted-foreground">{li.index}</td>
                                                <td className="py-2 font-mono text-foreground">{li.productNumber}</td>
                                                <td className="py-2 text-foreground">{li.description}</td>
                                                <td className="py-2 text-right text-foreground">{li.quantity}</td>
                                                <td className="py-2 text-right text-foreground">{usd(li.unitPrice)}</td>
                                                <td className="py-2 text-right font-medium text-foreground">{usd(li.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {viewMode === 'compare' && (
                            <div className="space-y-4">
                                {/* Changes banner */}
                                <div className="flex items-center gap-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    {review.discrepancies.length} changes detected since snapshot was taken
                                </div>

                                {/* Side-by-side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Left: Frozen */}
                                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frozen Snapshot</p>
                                        {review.discrepancies.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card dark:bg-zinc-800 px-4 py-2.5 text-sm">
                                                <span className="text-muted-foreground">{d.fieldName}</span>
                                                <span className="font-medium text-foreground">{d.snapshotValue}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right: Live */}
                                    <div className="rounded-xl border border-border bg-card dark:bg-zinc-800 p-4 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live Quote (current)</p>
                                        {review.discrepancies.map((d, i) => (
                                            <div
                                                key={i}
                                                className={clsx(
                                                    'flex items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm',
                                                    changeTypeBg(d.type)
                                                )}
                                            >
                                                <span className="text-muted-foreground">{d.fieldName}</span>
                                                <span className={clsx('font-medium', severityColor(d.severity))}>{d.currentValue}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* ── Vendor Split Preview ── */}
            <div className="space-y-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Vendor Split Preview
                </h2>

                {review.vendorSplit.map((vs) => (
                    <Card key={vs.vendorCode} className="overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Building2 className="h-4 w-4 text-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{vs.vendorName}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">{vs.vendorCode}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-foreground">{usd(vs.subtotal)}</p>
                                <p className="text-[10px] text-muted-foreground">{vs.lineItemCount} item{vs.lineItemCount !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                                    <th className="px-6 py-2 font-medium">Product</th>
                                    <th className="px-6 py-2 font-medium">Description</th>
                                    <th className="px-6 py-2 font-medium text-right">Qty</th>
                                    <th className="px-6 py-2 font-medium text-right">Unit Price</th>
                                    <th className="px-6 py-2 font-medium text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vs.lineItems.map((li) => (
                                    <tr key={li.index} className="border-b border-border/50">
                                        <td className="px-6 py-2.5 font-mono text-foreground">{li.productNumber}</td>
                                        <td className="px-6 py-2.5 text-foreground">{li.description}</td>
                                        <td className="px-6 py-2.5 text-right text-foreground">{li.quantity}</td>
                                        <td className="px-6 py-2.5 text-right text-foreground">{usd(li.unitPrice)}</td>
                                        <td className="px-6 py-2.5 text-right font-medium text-foreground">{usd(li.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                ))}
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex items-center justify-end gap-3 pt-2">
                {showRejectConfirm ? (
                    <div className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-900/20 px-4 py-2.5">
                        <span className="text-sm text-red-700 dark:text-red-300">Reject this conversion?</span>
                        <button
                            onClick={handleReject}
                            className="rounded-lg bg-red-500 hover:bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowRejectConfirm(false)}
                            className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowRejectConfirm(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 dark:border-red-500/30 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <XCircle className="h-4 w-4" />
                        Reject Conversion
                    </button>
                )}

                <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-300 dark:bg-brand-500 px-5 py-2 text-sm font-semibold text-zinc-900 hover:opacity-90 transition-colors"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve &amp; Create POs
                </button>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 rounded-xl border border-border bg-card dark:bg-zinc-800 px-5 py-3 shadow-lg text-sm text-foreground">
                    {toast}
                </div>
            )}
        </div>
    )
}
