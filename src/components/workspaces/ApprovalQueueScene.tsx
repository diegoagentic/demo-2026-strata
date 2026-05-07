/**
 * w1.2 — ApprovalQueueScene
 * Manager desktop: calm initial state → notification arrives → queue reveals
 *
 * State machine:
 *   'initial'  — clean dashboard, nothing pending (manager thinks they're done)
 *   'notified' — Strata notification slides in: John Smith submitted $142.50
 *   'queue'    — full approval queue with receipts visible inline + SLA badge
 *
 * Pain points resolved: PP1 (receipts visible), PP5 (GlobalSearch broken)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    AlertTriangle, CheckCircle2, ChevronRight, Receipt,
    Bell, BarChart2, Clock, Sparkles, X,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState = 'initial' | 'notified' | 'queue'
type Filter = 'all' | 'fuel' | 'meals' | 'travel' | 'sla'

const EXPENSES = [
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

const FILTER_LABELS: { key: Filter; label: string }[] = [
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

    const [scene,  setScene]  = useState<SceneState>('initial')
    const [filter, setFilter] = useState<Filter>('all')

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // Auto-trigger notification — long pause so the presenter can narrate the initial state
    useEffect(() => {
        pauseAware(() => setScene('notified'), 5500)
    }, [pauseAware])

    const totalAmount = EXPENSES.reduce(
        (sum, e) => sum + parseFloat(e.amount.replace('$', '').replace(',', '')), 0
    )

    const visible = EXPENSES.filter(e =>
        filter === 'all' || e.filters.includes(filter)
    )

    // ── Initial state — manager dashboard calm ────────────────────────────────
    if (scene === 'initial') {
        return (
            <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-400">
                <ManagerGreeting />
                <QuickStats />
                <RecentActivity />
            </div>
        )
    }

    // ── Notified state — notification banner appears, queue still hidden ──────
    if (scene === 'notified') {
        return (
            <div className="max-w-lg mx-auto space-y-4">
                {/* Notification toast — inside content area, below navbar */}
                <div className="animate-in slide-in-from-top duration-500">
                    <button
                        onClick={() => setScene('queue')}
                        className="w-full flex items-start gap-3 bg-card border border-ai/40 rounded-2xl px-4 py-3.5 shadow-lg hover:border-ai/70 hover:shadow-xl transition-all text-left group"
                    >
                        {/* Sparkle icon with pulse dot */}
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-9 w-9 rounded-xl bg-ai/10 flex items-center justify-center">
                                <Sparkles className="h-4.5 w-4.5 text-ai" />
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
                            onClick={e => { e.stopPropagation(); setScene('initial') }}
                            className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </button>
                </div>

                {/* Manager dashboard stays visible behind — grayed slightly */}
                <div className="opacity-40 pointer-events-none space-y-4">
                    <ManagerGreeting />
                    <QuickStats />
                </div>
            </div>
        )
    }

    // ── Queue state — full approval list ──────────────────────────────────────
    return (
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-400">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">Pending approvals</p>
                    <p className="text-lg font-bold text-foreground">{EXPENSES.length} expenses · ${totalAmount.toFixed(0)}</p>
                </div>
                <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-full font-medium">
                    1 SLA alert
                </span>
            </div>

            {/* Filter bar */}
            <div className="flex gap-1.5 flex-wrap">
                {FILTER_LABELS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            filter === f.key
                                ? 'bg-foreground text-background'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {visible.map(exp => (
                    <ExpenseCard
                        key={exp.id}
                        expense={exp}
                        onReview={exp.focus ? onReview : undefined}
                    />
                ))}
            </div>

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Before Strata:</span> managers logged into GlobalSearch to approve — the approval button was grayed out. Tammy approved by email with no receipt visibility.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}

// ── Manager greeting (initial calm state) ────────────────────────────────────

function ManagerGreeting() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-muted-foreground">Wednesday, May 7</p>
                <p className="text-lg font-bold text-foreground">Good morning, Sara</p>
            </div>
            <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                    <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
            </div>
        </div>
    )
}

// ── Quick stats cards ─────────────────────────────────────────────────────────

function QuickStats() {
    return (
        <div className="grid grid-cols-3 gap-3">
            {[
                { label: 'Pending',      value: '0',      sub: 'approvals',   icon: <Receipt className="h-4 w-4 text-muted-foreground" /> },
                { label: 'Approved',     value: '12',     sub: 'this month',  icon: <CheckCircle2 className="h-4 w-4 text-success" /> },
                { label: 'Avg response', value: '1.2d',   sub: 'your SLA',    icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
            ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl px-3 py-3 space-y-1.5">
                    {s.icon}
                    <p className="text-base font-bold text-foreground leading-none">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{s.label}<br />{s.sub}</p>
                </div>
            ))}
        </div>
    )
}

// ── Recent activity feed (initial calm state) ─────────────────────────────────

function RecentActivity() {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent activity</p>
            {[
                { name: 'Maria Lopez',  action: 'Approved · $89.00 · Client Meals',  time: 'Yesterday',  icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" /> },
                { name: 'Carlos Ruiz',  action: 'Awaiting review · $210.00 · Travel', time: 'May 1',     icon: <AlertTriangle className="h-3.5 w-3.5 text-warning" /> },
                { name: 'Team spend',   action: '$441.50 total this week',             time: 'Running',   icon: <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" /> },
            ].map(a => (
                <div key={a.name} className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-3">
                    <div className="shrink-0">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{a.action}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
                </div>
            ))}
        </div>
    )
}

// ── Expense approval card ─────────────────────────────────────────────────────

type CardState = 'idle' | 'editing' | 'rejecting' | 'approved' | 'rejected'

function ExpenseCard({ expense: exp, onReview }: {
    expense: typeof EXPENSES[0]
    onReview?: () => void
}) {
    const [cardState,   setCardState]   = useState<CardState>('idle')
    const [amount,      setAmount]      = useState(exp.editableAmount)
    const [category,    setCategory]    = useState(exp.editableCategory)
    const [rejectNote,  setRejectNote]  = useState('')
    const [aiExpanded,  setAiExpanded]  = useState(false)

    // ── Approved state ──────────────────────────────────────────────────────
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

    // ── Rejected state ──────────────────────────────────────────────────────
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
            {/* Header row */}
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

            {/* ── Edit form ── */}
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
                    {/* AI suggestion in edit mode */}
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

            {/* Receipt row */}
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

            {/* AI suggestion chip */}
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

            {/* SLA note */}
            {exp.sla && cardState !== 'editing' && (
                <p className="text-xs text-muted-foreground">
                    Push notification sent to Carlos · 4 days pending without review
                </p>
            )}

            {/* ── Reject form ── */}
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

            {/* ── Action buttons ── */}
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
