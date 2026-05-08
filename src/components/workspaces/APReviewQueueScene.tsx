/**
 * w2.1 — APReviewQueueScene
 * AP (Letza): list always visible → toast overlay on notification → click to review
 * State machine: 'list' | 'notified'
 * Pain points resolved: PP8 (45 min manual → 4 min), PP10 (open one by one)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AlertTriangle, Sparkles, ChevronRight, Bell, CheckCircle2, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState = 'list' | 'notified'
type FilterKey  = 'all' | 'pending' | 'posted' | 'sla'

// ── Data ──────────────────────────────────────────────────────────────────────

const PENDING_EXPENSES = [
    {
        id: 'john',
        name: 'John Smith',
        amount: '$142.50',
        approvedBy: 'Sarah Johnson',
        approvedDate: 'May 6',
        glLines: [
            { code: '6200 · Vehicle Expenses', amount: '$95.00',  confidence: 94 },
            { code: '6210 · Travel & Transit',  amount: '$47.50',  confidence: 97 },
        ],
        ageDays: 0,
        sla: false,
        focus: true,
        posted: false,
    },
    {
        id: 'maria',
        name: 'Maria Lopez',
        amount: '$89.00',
        approvedBy: 'Sarah Johnson',
        approvedDate: 'May 5',
        glLines: [
            { code: '6100 · Meals & Entertainment', amount: '$89.00', confidence: 96 },
        ],
        ageDays: 1,
        sla: false,
        focus: false,
        posted: false,
    },
    {
        id: 'carlos',
        name: 'Carlos Ruiz',
        amount: '$210.00',
        approvedBy: 'Mike Torres',
        approvedDate: 'May 2',
        glLines: [
            { code: '6210 · Travel & Transit',  amount: '$120.00', confidence: 91 },
            { code: '6200 · Vehicle Expenses',  amount: '$55.00',  confidence: 88 },
            { code: '6300 · Office Expenses',   amount: '$35.00',  confidence: 85 },
        ],
        ageDays: 4,
        sla: true,
        focus: false,
        posted: false,
    },
]

const POSTED_EXPENSES = [
    {
        id: 'ana',
        name: 'Ana Kim',
        amount: '$65.00',
        approvedBy: 'Sarah Johnson',
        approvedDate: 'May 3',
        glLines: [{ code: '6100 · Meals & Entertainment', amount: '$65.00', confidence: 98 }],
        ageDays: 0,
        sla: false,
        focus: false,
        posted: true,
        postedGl: 'GL 6100 ✓',
        postedDate: 'May 3',
    },
    {
        id: 'robert',
        name: 'Robert Kim',
        amount: '$120.00',
        approvedBy: 'Mike Torres',
        approvedDate: 'May 2',
        glLines: [{ code: '6300 · Office Expenses', amount: '$120.00', confidence: 95 }],
        ageDays: 0,
        sla: false,
        focus: false,
        posted: true,
        postedGl: 'GL 6300 ✓',
        postedDate: 'May 2',
    },
]

const ALL_EXPENSES = [...PENDING_EXPENSES, ...POSTED_EXPENSES]

// ── Main component ────────────────────────────────────────────────────────────

export default function APReviewQueueScene({ onReview }: { onReview?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene, setScene]             = useState<SceneState>('list')
    const [filter, setFilter]           = useState<FilterKey>('all')
    const [expandedCard, setExpandedCard] = useState<string | null>(null)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    useEffect(() => {
        pauseAware(() => setScene('notified'), 4000)
    }, [pauseAware])

    const filteredExpenses = useMemo(() => {
        if (filter === 'pending') return PENDING_EXPENSES
        if (filter === 'posted')  return POSTED_EXPENSES
        if (filter === 'sla')     return ALL_EXPENSES.filter(e => e.sla)
        return ALL_EXPENSES
    }, [filter])

    return (
        <div className="max-w-lg mx-auto space-y-4">

            {/* Toast — overlays above list, slides in when notified */}
            {scene === 'notified' && (
                <APQueueToast onReview={onReview} onDismiss={() => setScene('list')} />
            )}

            {/* Header */}
            <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-1">
                <p className="text-xs text-muted-foreground">AP Coordinator · Letza Bombard</p>
                <p className="text-sm font-bold text-foreground">Good morning, Letza</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { value: '8',    label: 'Processed yesterday' },
                    { value: '0',    label: 'Pending now' },
                    { value: '100%', label: 'SLA on-time' },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border border-border rounded-xl px-3 py-3 text-center">
                        <p className="text-base font-bold text-foreground leading-none">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <FilterBar active={filter} onChange={setFilter} />

            {/* Expense list */}
            <div className="space-y-3">
                {filteredExpenses.map(exp => (
                    exp.posted
                        ? <PostedCard key={exp.id} exp={exp as typeof POSTED_EXPENSES[0]} />
                        : <ExpenseCard
                            key={exp.id}
                            exp={exp}
                            expanded={expandedCard === exp.id}
                            onToggleExpand={() => setExpandedCard(expandedCard === exp.id ? null : exp.id)}
                            onReview={onReview}
                          />
                ))}
                {filteredExpenses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No expenses match this filter.</p>
                )}
            </div>

            {/* Bell indicator — only while waiting */}
            {scene === 'list' && (
                <div className="flex items-center gap-2 justify-center py-1">
                    <Bell className="h-3 w-3 text-muted-foreground animate-pulse" />
                    <p className="text-[10px] text-muted-foreground">Waiting for manager approvals to route to AP...</p>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}

// ── Toast overlay ─────────────────────────────────────────────────────────────

function APQueueToast({ onReview, onDismiss }: { onReview?: () => void; onDismiss: () => void }) {
    return (
        <div className="animate-in slide-in-from-top duration-500 bg-card border border-ai/40 rounded-xl px-4 py-3 shadow-sm space-y-2">
            <div className="flex items-start gap-3">
                <div className="relative shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · AP Queue ready</p>
                    <p className="text-xs font-semibold text-foreground leading-snug">
                        3 expenses approved by managers — GL codes pre-filled
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        Sarah Johnson → John Smith + Maria Lopez · Mike Torres → Carlos Ruiz
                    </p>
                </div>
                <button
                    onClick={onDismiss}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                    aria-label="Dismiss notification"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
            <button
                onClick={onReview}
                className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
                Review GL — John Smith
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

const FILTER_LABELS: Record<FilterKey, string> = {
    all:     'All',
    pending: 'Pending GL',
    posted:  'Posted ✓',
    sla:     '⚠ SLA',
}

function FilterBar({ active, onChange }: { active: FilterKey; onChange: (k: FilterKey) => void }) {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map(key => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                        active === key
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    }`}
                >
                    {FILTER_LABELS[key]}
                </button>
            ))}
        </div>
    )
}

// ── Pending expense card ──────────────────────────────────────────────────────

type PendingExpense = typeof PENDING_EXPENSES[0]

function ExpenseCard({ exp, expanded, onToggleExpand, onReview }: {
    exp: PendingExpense
    expanded: boolean
    onToggleExpand: () => void
    onReview?: () => void
}) {
    return (
        <div className={`bg-card border rounded-xl p-4 space-y-3 ${exp.sla ? 'border-warning/50' : exp.focus ? 'border-ai/30' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{exp.name}</p>
                        {exp.sla && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full shrink-0">
                                <AlertTriangle className="h-2.5 w-2.5" /> {exp.ageDays} days · SLA
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Approved by {exp.approvedBy} · {exp.approvedDate}
                        {exp.ageDays > 0 ? ` · ${exp.ageDays} day${exp.ageDays > 1 ? 's' : ''} in queue` : ' · Just arrived'}
                    </p>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{exp.amount}</p>
            </div>

            {/* GL badge */}
            <button
                onClick={exp.focus ? undefined : onToggleExpand}
                className={`flex items-center gap-2 ${!exp.focus ? 'hover:opacity-80 transition-opacity cursor-pointer' : 'cursor-default'}`}
            >
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ai bg-ai/10 border border-ai/20 px-2 py-1 rounded-full">
                    <Sparkles className="h-2.5 w-2.5" />
                    GL pre-filled · {exp.glLines.length} line{exp.glLines.length > 1 ? 's' : ''} ready
                </span>
                {!exp.focus && (
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                )}
            </button>

            {/* Inline GL preview — non-focus cards */}
            {!exp.focus && expanded && (
                <div className="border border-border rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {exp.glLines.map((line, i) => (
                        <div key={line.code} className={`flex items-center justify-between px-3 py-2 gap-2 ${i > 0 ? 'border-t border-border' : ''}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <Sparkles className="h-2.5 w-2.5 text-ai shrink-0" />
                                <span className="text-[11px] text-foreground truncate">{line.code}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-mono text-foreground">{line.amount}</span>
                                <ConfidencePill pct={line.confidence} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA */}
            {exp.focus ? (
                <button
                    onClick={onReview}
                    className="w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Review GL — John Smith
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            ) : (
                <button
                    onClick={onToggleExpand}
                    className="w-full text-xs text-muted-foreground py-2 rounded-lg hover:text-foreground border border-border transition-colors"
                >
                    {expanded ? 'Hide GL preview' : 'Review GL →'}
                </button>
            )}
        </div>
    )
}

// ── Posted expense card (compact, read-only) ──────────────────────────────────

type PostedExpense = typeof POSTED_EXPENSES[0]

function PostedCard({ exp }: { exp: PostedExpense }) {
    return (
        <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground">{exp.postedDate} · {exp.postedGl}</p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground">{exp.amount}</p>
                <p className="text-[10px] text-success font-medium">Posted to CORE ✓</p>
            </div>
        </div>
    )
}

// ── Confidence pill ───────────────────────────────────────────────────────────

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
