/**
 * w1.2 — ApprovalQueueScene
 * Manager desktop: full expense list → notification toast overlays → review detail (w1.3)
 *
 * State machine:
 *   'list'     — full expenses dashboard with filters, categories, receipt upload
 *   'notified' — same list + Strata toast slides in from top (list stays 100% visible)
 *
 * Notification click → onReview() → w1.3 (ApproveWithReceiptScene) directly.
 * Pain points resolved: PP1 (receipts visible), PP5 (GlobalSearch broken), PP9 (receipt upload)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    AlertTriangle, CheckCircle2, Receipt,
    Bell, Clock, Sparkles, X, Upload, FileText, Image,
    Filter, Search, ChevronRight, Check,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState   = 'list' | 'notified'
type StatusFilter = 'all' | 'pending' | 'approved' | 'sla'
type CatFilter    = 'all' | 'fuel' | 'meals' | 'travel' | 'parking' | 'office'

// ── All expenses visible in the list view ────────────────────────────────────

const ALL_EXPENSES = [
    { id: 'john',   name: 'John Smith',   category: 'Fuel + Parking',  catKey: 'fuel',   amount: '$142.50', date: 'May 5',  status: 'pending',  receipts: 2, hasReceipt: true,  age: '< 1 day', focus: true  },
    { id: 'maria',  name: 'Maria Lopez',  category: 'Client Meals',    catKey: 'meals',  amount: '$89.00',  date: 'May 4',  status: 'pending',  receipts: 1, hasReceipt: true,  age: '1 day',   focus: false },
    { id: 'carlos', name: 'Carlos Ruiz',  category: 'Travel',          catKey: 'travel', amount: '$210.00', date: 'May 1',  status: 'sla',      receipts: 0, hasReceipt: false, age: '4 days',  focus: false },
    { id: 'ana',    name: 'Ana Kim',      category: 'Office Supplies', catKey: 'office', amount: '$34.90',  date: 'Apr 30', status: 'approved', receipts: 1, hasReceipt: true,  age: '2 days',  focus: false },
    { id: 'mike',   name: 'Mike Torres',  category: 'Travel — Orlando',catKey: 'travel', amount: '$312.00', date: 'Apr 28', status: 'approved', receipts: 2, hasReceipt: true,  age: '3 days',  focus: false },
]

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'sla',      label: '⚠️ SLA' },
]

const CAT_FILTERS: { key: CatFilter; label: string }[] = [
    { key: 'all',     label: 'All categories' },
    { key: 'fuel',    label: 'Fuel' },
    { key: 'meals',   label: 'Meals' },
    { key: 'travel',  label: 'Travel' },
    { key: 'parking', label: 'Parking' },
    { key: 'office',  label: 'Office' },
]

export default function ApprovalQueueScene({ onReview }: { onReview?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef  = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene,        setScene]        = useState<SceneState>('list')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [catFilter,    setCatFilter]    = useState<CatFilter>('all')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // Auto-trigger notification — long pause so presenter can narrate the list
    useEffect(() => {
        pauseAware(() => setScene('notified'), 6000)
    }, [pauseAware])

    const visibleList = ALL_EXPENSES.filter(e => {
        const statusOk = statusFilter === 'all' || e.status === statusFilter
        const catOk    = catFilter === 'all' || e.catKey === catFilter
        return statusOk && catOk
    })

    // Single render — list always visible, toast overlays when notified
    return (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-400">

            {/* ── Notification toast — overlays list, slides from top ── */}
            {scene === 'notified' && (
                <NotificationToast
                    onReview={onReview}
                    onDismiss={() => setScene('list')}
                />
            )}

            {/* ── Manager header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">Wednesday, May 7, 2026</p>
                    <p className="text-lg font-bold text-foreground">Good morning, Sarah</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="h-9 w-9 rounded-xl overflow-hidden border border-border">
                        <img
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
                            alt="Sarah Johnson"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* ── KPI row ── */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Pending',      value: '3',    sub: 'approvals',   color: 'text-warning',          bg: 'bg-warning/5'      },
                    { label: '⚠️ SLA',       value: '1',    sub: 'overdue',     color: 'text-destructive',      bg: 'bg-destructive/5'  },
                    { label: 'Approved',     value: '14',   sub: 'this month',  color: 'text-success',          bg: 'bg-success/5'      },
                    { label: 'Avg response', value: '1.2d', sub: 'your SLA',    color: 'text-muted-foreground', bg: ''                  },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border border-border rounded-xl px-3 py-2.5 space-y-0.5`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter row ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-muted/60 rounded-full px-1 py-0.5">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                                statusFilter === f.key
                                    ? 'bg-card text-foreground shadow-sm border border-border'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <select
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value as CatFilter)}
                    className="text-[11px] bg-card border border-border rounded-full px-3 py-1.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                >
                    {CAT_FILTERS.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                </select>

                <div className="flex items-center gap-1.5 ml-auto text-[11px] text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>{visibleList.length} results</span>
                </div>
            </div>

            {/* ── Expense table ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-2 border-b border-border bg-muted/30">
                    {['Employee', 'Category', 'Amount', 'Date', 'Status'].map(h => (
                        <p key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{h}</p>
                    ))}
                </div>

                {/* Rows */}
                {visibleList.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">No expenses match the current filters</div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {visibleList.map(exp => (
                            <ExpenseListRow
                                key={exp.id}
                                exp={exp}
                                onReview={exp.focus ? onReview : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> managers received an email → logged into GlobalSearch → UI was often grayed out or non-functional → no receipts visible → approved blind. One approval could take 10+ minutes.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

// ── Notification toast — slides in from top, overlays list ───────────────────

function NotificationToast({ onReview, onDismiss }: {
    onReview?: () => void
    onDismiss: () => void
}) {
    return (
        <div className="animate-in slide-in-from-top duration-500">
            <div className="flex items-start gap-3 bg-card border border-ai/40 rounded-2xl px-4 py-3.5 shadow-lg">
                {/* Icon with pulse dot */}
                <div className="relative shrink-0 mt-0.5">
                    <div className="h-9 w-9 rounded-xl bg-ai/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-ai" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-ai border-2 border-card animate-pulse" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-ai uppercase tracking-wide">Strata · Action required</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                        John Smith submitted a $142.50 expense
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Fuel + Parking · May 5 · 2 receipts attached inline
                    </p>
                    <button
                        onClick={() => onReview?.()}
                        className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-ai hover:underline transition-colors"
                    >
                        Review expense
                        <ChevronRight className="h-3 w-3" />
                    </button>
                </div>

                {/* Dismiss */}
                <button
                    onClick={onDismiss}
                    className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ── Expense list row ──────────────────────────────────────────────────────────

function ExpenseListRow({ exp, onReview }: {
    exp: typeof ALL_EXPENSES[0]
    onReview?: () => void
}) {
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle')

    const handleUpload = (e: React.MouseEvent) => {
        e.stopPropagation()
        setUploadState('uploading')
        setTimeout(() => setUploadState('done'), 1200)
    }

    const statusCell = () => {
        // John Smith (focus) — Review + quick Approve/Reject (brief S2 spec)
        if (exp.focus) {
            return (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onReview?.()}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-full hover:opacity-90 transition-opacity"
                    >
                        Review
                        <ChevronRight className="h-3 w-3" />
                    </button>
                    <button
                        onClick={() => onReview?.()}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-success/15 text-success hover:bg-success/25 transition-colors"
                        title="Approve"
                    >
                        <Check className="h-3 w-3" />
                    </button>
                    <button
                        onClick={() => onReview?.()}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        title="Reject"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )
        }
        if (exp.status === 'approved') return (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-2.5 w-2.5" /> Approved
            </span>
        )
        if (exp.status === 'sla') return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-2.5 w-2.5" /> {exp.age}
            </span>
        )
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                <Clock className="h-2.5 w-2.5" /> Pending
            </span>
        )
    }

    const receiptCell = () => {
        if (uploadState === 'done') return (
            <span className="text-[10px] text-success font-medium flex items-center gap-1 animate-in fade-in duration-200">
                <CheckCircle2 className="h-3 w-3" /> Uploaded ✓
            </span>
        )
        if (uploadState === 'uploading') return (
            <span className="text-[10px] text-ai font-medium flex items-center gap-1 animate-pulse">
                <Sparkles className="h-3 w-3" /> Processing...
            </span>
        )
        if (exp.hasReceipt) return (
            <div className="flex items-center gap-1">
                <Receipt className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{exp.receipts}</span>
                <CheckCircle2 className="h-3 w-3 text-success" />
            </div>
        )
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-destructive">Missing</span>
                <ReceiptUploadMenu onUpload={handleUpload} />
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 transition-colors ${
            exp.focus ? 'bg-muted/30 hover:bg-muted/50' : exp.status === 'sla' ? 'hover:bg-muted/20' : 'hover:bg-muted/20'
        }`}>
            <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${exp.focus ? 'text-foreground' : 'text-foreground'}`}>{exp.name}</p>
                <p className="text-[10px] text-muted-foreground">{exp.age} ago</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.category}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{exp.amount}</span>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{exp.date}</span>
            <div className="flex items-center gap-2 justify-end">
                {statusCell()}
                {receiptCell()}
            </div>
        </div>
    )
}

// ── Receipt upload dropdown ───────────────────────────────────────────────────

function ReceiptUploadMenu({ onUpload }: { onUpload: (e: React.MouseEvent) => void }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
                className="flex items-center gap-0.5 text-[10px] font-medium text-ai border border-ai/30 bg-ai/5 hover:bg-ai/10 px-1.5 py-0.5 rounded-md transition-colors"
            >
                <Upload className="h-2.5 w-2.5" />
                Upload
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden w-44 animate-in fade-in slide-in-from-top-1 duration-150">
                    {[
                        { icon: Image,    label: 'Upload image',    sub: 'JPG, PNG' },
                        { icon: FileText, label: 'Upload document',  sub: 'PDF, DOCX' },
                        { icon: Search,   label: 'Scan with camera', sub: 'OCR enabled' },
                    ].map(({ icon: Icon, label, sub }) => (
                        <button
                            key={label}
                            onClick={e => { setOpen(false); onUpload(e) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                        >
                            <div className="h-6 w-6 rounded-md bg-ai/10 flex items-center justify-center shrink-0">
                                <Icon className="h-3.5 w-3.5 text-ai" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">{label}</p>
                                <p className="text-[9px] text-muted-foreground">{sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
