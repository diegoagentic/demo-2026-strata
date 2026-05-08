/**
 * w1.2 — ApprovalQueueScene
 * Manager desktop: full expense list → notification arrives → approval queue
 *
 * State machine:
 *   'list'     — full expenses dashboard with filters, categories, receipt upload
 *   'notified' — Strata notification slides in: John Smith submitted $142.50
 *   'queue'    — focused approval queue with receipts visible inline + SLA badge
 *
 * Pain points resolved: PP1 (receipts visible), PP5 (GlobalSearch broken), PP9 (receipt upload)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    AlertTriangle, CheckCircle2, ChevronRight, Receipt,
    Bell, Clock, Sparkles, X, Upload, FileText, Image,
    Filter, Search, BarChart2,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState   = 'list' | 'notified' | 'queue'
type StatusFilter = 'all' | 'pending' | 'approved' | 'sla'
type CatFilter    = 'all' | 'fuel' | 'meals' | 'travel' | 'parking' | 'office'

// ── All expenses visible in the initial list view ────────────────────────────

const ALL_EXPENSES = [
    {
        id: 'john', name: 'John Smith',   category: 'Fuel + Parking',     catKey: 'fuel',    amount: '$142.50', date: 'May 5',  status: 'pending',  receipts: 2, hasReceipt: true,  age: '< 1 day', focus: true  },
    {
        id: 'maria', name: 'Maria Lopez',  category: 'Client Meals',        catKey: 'meals',   amount: '$89.00',  date: 'May 4',  status: 'pending',  receipts: 1, hasReceipt: true,  age: '1 day',   focus: false },
    {
        id: 'carlos', name: 'Carlos Ruiz', category: 'Travel',              catKey: 'travel',  amount: '$210.00', date: 'May 1',  status: 'sla',      receipts: 0, hasReceipt: false, age: '4 days',  focus: false },
    {
        id: 'ana', name: 'Ana Kim',        category: 'Office Supplies',     catKey: 'office',  amount: '$34.90',  date: 'Apr 30', status: 'approved', receipts: 1, hasReceipt: true,  age: '2 days',  focus: false },
    {
        id: 'mike', name: 'Mike Torres',   category: 'Travel — Orlando',    catKey: 'travel',  amount: '$312.00', date: 'Apr 28', status: 'approved', receipts: 2, hasReceipt: true,  age: '3 days',  focus: false },
]

// ── Expense approval cards (queue view) ─────────────────────────────────────

const QUEUE_EXPENSES = [
    {
        id: 'john',
        name: 'John Smith',
        amount: '$142.50',
        category: 'Fuel + Parking',
        receipts: 2,
        submitted: 'May 5',
        age: '< 1 day',
        sla: false,
        filters: ['fuel'],
        focus: true,
        aiSuggestion: null,
        editableAmount: '$142.50',
        editableCategory: 'Fuel + Parking',
    },
    {
        id: 'maria',
        name: 'Maria Lopez',
        amount: '$89.00',
        category: 'Client Meals',
        receipts: 1,
        submitted: 'May 4',
        age: '1 day',
        sla: false,
        filters: ['meals'],
        focus: false,
        aiSuggestion: { text: 'GL 6300 · Meals & Entertainment · matches Maria\'s last 4 submissions', confidence: 96 },
        editableAmount: '$89.00',
        editableCategory: 'Client Meals',
    },
    {
        id: 'carlos',
        name: 'Carlos Ruiz',
        amount: '$210.00',
        category: 'Travel',
        receipts: 1,
        submitted: 'May 1',
        age: '4 days',
        sla: true,
        filters: ['travel', 'sla'],
        focus: false,
        aiSuggestion: { text: 'Amount within policy · no duplicate detected · SLA breach at 4 days — immediate review recommended', confidence: 88 },
        editableAmount: '$210.00',
        editableCategory: 'Travel',
    },
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

const QUEUE_FILTER_LABELS: { key: string; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'fuel',   label: 'Fuel' },
    { key: 'meals',  label: 'Meals' },
    { key: 'travel', label: 'Travel' },
    { key: 'sla',    label: '⚠️ SLA' },
]

export default function ApprovalQueueScene({ onReview }: { onReview?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef  = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene,        setScene]       = useState<SceneState>('list')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [catFilter,    setCatFilter]   = useState<CatFilter>('all')
    const [queueFilter,  setQueueFilter] = useState('all')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // Auto-trigger notification after presenter narrates the list state
    useEffect(() => {
        pauseAware(() => setScene('notified'), 6000)
    }, [pauseAware])

    const totalAmount = QUEUE_EXPENSES.reduce(
        (sum, e) => sum + parseFloat(e.amount.replace('$', '').replace(',', '')), 0
    )

    const visibleQueue = QUEUE_EXPENSES.filter(e =>
        queueFilter === 'all' || e.filters.includes(queueFilter)
    )

    const visibleList = ALL_EXPENSES.filter(e => {
        const statusOk = statusFilter === 'all' || e.status === statusFilter
        const catOk    = catFilter === 'all' || e.catKey === catFilter
        return statusOk && catOk
    })

    // ── List state — full expense dashboard ───────────────────────────────────
    if (scene === 'list') {
        return (
            <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-400">
                {/* Manager header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground">Wednesday, May 7, 2026</p>
                        <p className="text-lg font-bold text-foreground">Good morning, Sarah</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </div>
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

                {/* KPI row */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Pending',      value: '3',    sub: 'approvals',   color: 'text-warning',          bg: 'bg-warning/5' },
                        { label: '⚠️ SLA',       value: '1',    sub: 'overdue',     color: 'text-destructive',      bg: 'bg-destructive/5' },
                        { label: 'Approved',     value: '14',   sub: 'this month',  color: 'text-success',          bg: 'bg-success/5' },
                        { label: 'Avg response', value: '1.2d', sub: 'your SLA',    color: 'text-muted-foreground', bg: '' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} border border-border rounded-xl px-3 py-2.5 space-y-0.5`}>
                            <p className={`text-[10px] font-semibold uppercase tracking-wide ${s.color}`}>{s.label}</p>
                            <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Filter row */}
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

                {/* Expense list — table rows */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Table header */}
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
                                <ExpenseListRow key={exp.id} exp={exp} />
                            ))}
                        </div>
                    )}
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </div>
        )
    }

    // ── Notified state ────────────────────────────────────────────────────────
    if (scene === 'notified') {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="animate-in slide-in-from-top duration-500">
                    <button
                        onClick={() => setScene('queue')}
                        className="w-full flex items-start gap-3 bg-card border border-ai/40 rounded-2xl px-4 py-3.5 shadow-lg hover:border-ai/70 hover:shadow-xl transition-all text-left group"
                    >
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-9 w-9 rounded-xl bg-ai/10 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-ai" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-ai border-2 border-card animate-pulse" />
                        </div>
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
                            <p className="text-[11px] text-ai font-medium mt-1.5 group-hover:underline">
                                View approval queue →
                            </p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); setScene('list') }}
                            className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </button>
                </div>

                {/* Dimmed list behind notification */}
                <div className="opacity-30 pointer-events-none space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-foreground">Good morning, Sarah</p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[3,1,14,'1.2d'].map((v, i) => (
                            <div key={i} className="border border-border rounded-xl px-3 py-2.5">
                                <p className="text-xl font-bold text-foreground">{v}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // ── Queue state — focused approval list ───────────────────────────────────
    return (
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-400">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">Pending approvals</p>
                    <p className="text-lg font-bold text-foreground">{QUEUE_EXPENSES.length} expenses · ${totalAmount.toFixed(0)}</p>
                </div>
                <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-full font-medium">
                    1 SLA alert
                </span>
            </div>

            <div className="flex gap-1.5 flex-wrap">
                {QUEUE_FILTER_LABELS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setQueueFilter(f.key)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            queueFilter === f.key
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {visibleQueue.map(exp => (
                    <ExpenseCard
                        key={exp.id}
                        expense={exp}
                        onReview={exp.focus ? onReview : undefined}
                    />
                ))}
            </div>

            <div className="bg-muted/40 border border-border rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Before Strata:</span> managers logged into GlobalSearch to approve — the approval button was grayed out. Tammy approved by email with no receipt visibility.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

// ── Expense list row (initial list view) ─────────────────────────────────────

function ExpenseListRow({ exp }: { exp: typeof ALL_EXPENSES[0] }) {
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle')

    const handleUpload = (e: React.MouseEvent) => {
        e.stopPropagation()
        setUploadState('uploading')
        setTimeout(() => setUploadState('done'), 1200)
    }

    const statusBadge = () => {
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
        // Missing receipt — show upload options
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-warning font-medium">Missing</span>
                <ReceiptUploadMenu onUpload={handleUpload} />
            </div>
        )
    }

    return (
        <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-muted/20 transition-colors ${
            exp.status === 'sla' ? 'bg-warning/3' : ''
        }`}>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{exp.name}</p>
                <p className="text-[10px] text-muted-foreground">{exp.age} ago</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{exp.category}</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{exp.amount}</span>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{exp.date}</span>
            <div className="flex items-center gap-2 justify-end">
                {statusBadge()}
                {receiptCell()}
            </div>
        </div>
    )
}

// ── Receipt upload menu (dropdown with Camera / Image / File) ─────────────────

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

// ── Expense approval card (queue view) ───────────────────────────────────────

type CardState = 'idle' | 'editing' | 'rejecting' | 'approved' | 'rejected'

function ExpenseCard({ expense: exp, onReview }: {
    expense: typeof QUEUE_EXPENSES[0]
    onReview?: () => void
}) {
    const [cardState,   setCardState]   = useState<CardState>('idle')
    const [amount,      setAmount]      = useState(exp.editableAmount)
    const [category,    setCategory]    = useState(exp.editableCategory)
    const [rejectNote,  setRejectNote]  = useState('')
    const [aiExpanded,  setAiExpanded]  = useState(false)

    if (cardState === 'approved') {
        return (
            <div className="bg-success/5 border border-success/30 rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{exp.name} — Approved</p>
                    <p className="text-xs text-muted-foreground">{amount} · {category} · Routed to AP automatically</p>
                </div>
            </div>
        )
    }

    if (cardState === 'rejected') {
        return (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                <X className="h-5 w-5 text-destructive shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{exp.name} — Returned</p>
                    <p className="text-xs text-muted-foreground">Note sent · {exp.name.split(' ')[0]} can correct and resubmit</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`bg-card border rounded-xl p-4 space-y-3 transition-all ${exp.sla ? 'border-warning/50' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-foreground">{exp.name}</p>
                        {exp.sla && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full shrink-0">
                                <AlertTriangle className="h-2.5 w-2.5" /> SLA exceeded
                            </span>
                        )}
                    </div>
                    {cardState !== 'editing' && (
                        <p className="text-xs text-muted-foreground mt-0.5">{category} · Submitted {exp.submitted} · {exp.age}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {cardState !== 'editing' && (
                        <p className="text-sm font-bold text-foreground">{amount}</p>
                    )}
                    {!exp.focus && cardState === 'idle' && (
                        <button
                            onClick={() => setCardState('editing')}
                            className="text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-1.5 py-0.5 transition-colors"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {cardState === 'editing' && (
                <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Amount</label>
                            <input
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full text-sm font-semibold bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                                {['Client Meals', 'Travel', 'Fuel', 'Parking', 'Office Supplies'].map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {exp.aiSuggestion && (
                        <div className="flex items-start gap-2 bg-ai/5 border border-ai/20 rounded-lg px-2.5 py-2">
                            <Sparkles className="h-3 w-3 text-ai shrink-0 mt-0.5" />
                            <p className="text-[10px] text-foreground">{exp.aiSuggestion.text}</p>
                        </div>
                    )}
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => setCardState('idle')}
                            className="flex-1 text-xs font-bold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            Save changes
                        </button>
                        <button
                            onClick={() => { setAmount(exp.editableAmount); setCategory(exp.editableCategory); setCardState('idle') }}
                            className="px-3 text-xs font-medium py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {cardState !== 'editing' && (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {Array.from({ length: exp.receipts }).map((_, i) => (
                            <div key={i} className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-xs text-success font-medium">{exp.receipts} receipt{exp.receipts > 1 ? 's' : ''} visible inline</span>
                    </div>
                </div>
            )}

            {exp.aiSuggestion && cardState === 'idle' && (
                <button
                    onClick={() => setAiExpanded(v => !v)}
                    className="w-full flex items-start gap-2 bg-ai/5 border border-ai/20 rounded-lg px-2.5 py-2 text-left hover:bg-ai/10 transition-colors"
                >
                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-ai">✦ AI · {exp.aiSuggestion.confidence}% confidence</span>
                        {aiExpanded && (
                            <p className="text-[10px] text-foreground mt-0.5 animate-in fade-in duration-200">{exp.aiSuggestion.text}</p>
                        )}
                        {!aiExpanded && (
                            <p className="text-[10px] text-muted-foreground truncate">{exp.aiSuggestion.text}</p>
                        )}
                    </div>
                </button>
            )}

            {exp.sla && cardState !== 'editing' && (
                <p className="text-xs text-muted-foreground">
                    Push notification sent to Carlos · 4 days pending without review
                </p>
            )}

            {cardState === 'rejecting' && (
                <div className="space-y-2 animate-in fade-in duration-200">
                    <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Reason for returning (required)..."
                        rows={2}
                        className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-destructive/40 resize-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => rejectNote.trim() && setCardState('rejected')}
                            disabled={!rejectNote.trim()}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                                rejectNote.trim()
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                        >
                            Confirm rejection
                        </button>
                        <button
                            onClick={() => setCardState('idle')}
                            className="px-3 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {cardState === 'idle' && (
                <div className="flex gap-2 pt-1">
                    {exp.focus ? (
                        <button
                            onClick={onReview}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Review John Smith
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setCardState('approved')}
                                className="flex-1 flex items-center justify-center gap-1 bg-success/10 text-success border border-success/20 text-xs font-medium py-2 rounded-lg hover:bg-success/20 transition-colors"
                            >
                                ✓ Approve
                            </button>
                            <button
                                onClick={() => setCardState('rejecting')}
                                className="flex-1 flex items-center justify-center gap-1 bg-muted text-muted-foreground text-xs font-medium py-2 rounded-lg hover:text-foreground transition-colors"
                            >
                                ✗ Reject
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
