/**
 * w2.1 — APReviewQueueScene
 * AP (Letza): morning state → notification → queue with GL pre-filled
 * State machine: 'morning' | 'notified' | 'queue'
 * Pain points resolved: PP8 (45 min manual → 4 min), PP10 (open one by one)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, Sparkles, ChevronRight, Bell, CheckCircle2, Clock } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type SceneState = 'morning' | 'notified' | 'queue'

const RECENT_ACTIVITY = [
    { manager: 'Sarah Johnson', action: 'approved 2 expenses', date: 'May 5', done: true },
    { manager: 'Mike Torres',   action: 'approved 1 expense',  date: 'May 4', done: true },
    { manager: 'Carlos Ruiz',   action: '1 expense awaiting approval', date: '3 days', done: false },
]

const EXPENSES = [
    {
        id: 'john',
        name: 'John Smith',
        amount: '$142.50',
        approvedBy: 'Sarah Johnson',
        approvedDate: 'May 6',
        glLines: [
            { code: '6200 · Vehicle Expenses', amount: '$95.00', confidence: 94 },
            { code: '6210 · Travel & Transit',  amount: '$47.50', confidence: 97 },
        ],
        ageDays: 0,
        sla: false,
        focus: true,
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
    },
]

export default function APReviewQueueScene({ onReview }: { onReview?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene, setScene] = useState<SceneState>('morning')
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

    if (scene === 'morning') {
        return <MorningState />
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Notification — slides in */}
            {scene === 'notified' && (
                <button
                    onClick={() => setScene('queue')}
                    className="w-full animate-in slide-in-from-top duration-500 flex items-start gap-3 bg-card border border-ai/40 rounded-xl px-4 py-3 text-left hover:border-ai/70 transition-all shadow-sm group"
                >
                    <div className="relative shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-ai" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · AP Queue ready</p>
                        <p className="text-xs font-semibold text-foreground leading-snug">
                            3 expenses approved by managers
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            Sarah Johnson approved John Smith + Maria Lopez · Mike Torres approved Carlos Ruiz · GL codes pre-filled
                        </p>
                        <p className="text-[10px] text-ai font-medium mt-1 group-hover:underline">Tap to open queue →</p>
                    </div>
                </button>
            )}

            {/* Queue */}
            {scene === 'queue' && (
                <div className="animate-in fade-in duration-400 space-y-4">
                    <div className="bg-ai/5 border border-ai/20 rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-ai" />
                                <p className="text-xs font-semibold text-ai">GL pre-filled · 3 expenses ready</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">$441.50 total · Est. 4 min</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground line-through">~45 min manual</p>
                            <p className="text-xs font-bold text-success">~4 min with Strata</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {EXPENSES.map(exp => (
                            <ExpenseCard
                                key={exp.id}
                                exp={exp}
                                expanded={expandedCard === exp.id}
                                onToggleExpand={() => setExpandedCard(expandedCard === exp.id ? null : exp.id)}
                                onReview={onReview}
                            />
                        ))}
                    </div>

                    <p className="text-xs text-center text-muted-foreground px-2">
                        Strata pre-filled all GL codes from expense category rules — Letza reviews, confirms or overrides. No lookup needed.
                    </p>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                </div>
            )}
        </div>
    )
}

// ── Morning state ─────────────────────────────────────────────────────────────

function MorningState() {
    return (
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-500">
            <div className="bg-card border border-border rounded-xl px-4 py-4 space-y-1">
                <p className="text-xs text-muted-foreground">AP Coordinator</p>
                <p className="text-sm font-bold text-foreground">Good morning, Letza</p>
            </div>

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

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Manager Activity</p>
                    <p className="text-[10px] text-muted-foreground">Strata monitors approvals — no manual checking needed</p>
                </div>
                <div className="divide-y divide-border">
                    {RECENT_ACTIVITY.map(item => (
                        <div key={item.manager} className="flex items-center justify-between px-4 py-2.5 gap-2">
                            <div className="flex items-center gap-2">
                                {item.done
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                    : <Clock className="h-3.5 w-3.5 text-warning shrink-0" />
                                }
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{item.manager}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.action}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] shrink-0 ${item.done ? 'text-muted-foreground' : 'text-warning font-medium'}`}>
                                {item.date}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-2">
                <Bell className="h-3 w-3 text-muted-foreground animate-pulse" />
                <p className="text-[10px] text-muted-foreground">Waiting for manager approvals to route to AP...</p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}

// ── Expense card with expandable GL preview ───────────────────────────────────

type ExpenseType = typeof EXPENSES[0]

function ExpenseCard({ exp, expanded, onToggleExpand, onReview }: {
    exp: ExpenseType
    expanded: boolean
    onToggleExpand: () => void
    onReview?: () => void
}) {
    return (
        <div className={`bg-card border rounded-xl p-4 space-y-3 ${exp.sla ? 'border-warning/50' : 'border-border'}`}>
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

            {/* Inline GL preview — secondary cards only */}
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

function ConfidencePill({ pct }: { pct: number }) {
    const color = pct >= 90 ? 'text-success bg-success/10' : pct >= 75 ? 'text-warning bg-warning/10' : 'text-muted-foreground bg-muted'
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{pct}%</span>
    )
}
