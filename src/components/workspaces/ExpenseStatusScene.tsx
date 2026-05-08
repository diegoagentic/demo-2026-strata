/**
 * w1.4 — ExpenseStatusScene
 * Employee mobile view: status timeline → notification arrives → tap → data updates
 *
 * State machine:
 *   'watching'  — timeline: 4 done, Posted to CORE + Payment Issued pending
 *   'notified'  — Strata push notification slides in: "Posted to CORE · Payment scheduled May 8"
 *   'updated'   — tap notification → timeline fully updated: Posted ✓ + Payment ✓ with timestamps
 *
 * Pain points resolved: PP9 (no status visibility) · PP10 (one by one report opening)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, Clock, Circle, Sparkles, X, Bell, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'
import { MobileNavbar } from './ExpenseSubmitScene'
import { useDemo } from '../../context/DemoContext'

type SceneState = 'watching' | 'notified' | 'updated'

const TIMELINE_BASE = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',             done: true  },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Sarah Johnson',            done: true  },
    { label: 'Approved',         time: 'May 6, 9:15 AM',  note: 'Sarah Johnson · 1 day · within SLA ✓',  done: true  },
    { label: 'In AP Review',     time: 'May 6, 9:16 AM',  note: "Routed to Letza's queue",               done: true  },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                                       done: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                                       done: false },
]

const TIMELINE_UPDATED = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',             done: true  },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Sarah Johnson',            done: true  },
    { label: 'Approved',         time: 'May 6, 9:15 AM',  note: 'Sarah Johnson · 1 day · within SLA ✓',  done: true  },
    { label: 'In AP Review',     time: 'May 6, 9:16 AM',  note: "Letza confirmed · GL 6200 + 6210 · auto-posted to CORE", done: true },
    { label: 'Posted to CORE',   time: 'May 6, 2:48 PM',  note: 'Entry #CR-2847 · no manual re-entry',  done: true  },
    { label: 'Payment Issued',   time: 'May 8, 9:00 AM',  note: 'Check #44821 · 3 days total · within avg ✓', done: true },
]

const HISTORY = [
    { description: 'Parking',         amount: '$47.00', date: 'Apr 28', status: 'Paid ✓', days: '2.8 days' },
    { description: 'Office Supplies', amount: '$23.00', date: 'Apr 15', status: 'Paid ✓', days: '3.1 days' },
]

export default function ExpenseStatusScene({ onBack }: { onBack?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [scene, setScene] = useState<SceneState>('watching')
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['Approved']))

    const toggleStep = (label: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(label) ? next.delete(label) : next.add(label)
            return next
        })
    }

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

    const timeline = scene === 'updated' ? TIMELINE_UPDATED : TIMELINE_BASE

    return (
        <MobileDeviceFrame>
            {/* Navbar with back button */}
            <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-border bg-background">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-xs font-medium text-ai hover:opacity-80 transition-opacity"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Expenses
                </button>
                <p className="text-xs font-bold text-foreground">Expense Detail</p>
                <div className="w-14" />
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* User context */}
                <p className="text-[10px] text-muted-foreground">John Smith · Field Staff</p>

                {/* Push notification — slides in after delay */}
                {scene === 'notified' && (
                    <button
                        onClick={() => setScene('updated')}
                        className="w-full animate-in slide-in-from-top duration-500 flex items-start gap-2.5 bg-card border border-ai/40 rounded-2xl px-3 py-3 text-left shadow-lg hover:border-ai/70 transition-all group"
                    >
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-ai" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · Expense update</p>
                            <p className="text-xs font-semibold text-foreground leading-snug">
                                Your expense was posted to CORE
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                $142.50 · Fuel + Parking · Payment scheduled May 8
                            </p>
                            <div className="flex items-center gap-1 mt-1.5">
                                <p className="text-xs font-semibold text-ai group-hover:underline">Tap to see full status</p>
                                <ChevronRight className="h-3.5 w-3.5 text-ai" />
                            </div>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); setScene('watching') }}
                            className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </button>
                )}

                {/* Current expense — status timeline */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-bold text-foreground">Fuel + Parking</p>
                            <p className="text-[11px] text-muted-foreground">$142.50 · May 5 · 2 receipts</p>
                        </div>
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium shrink-0 transition-all duration-500 ${
                            scene === 'updated'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-warning/10 text-warning border-warning/20'
                        }`}>
                            {scene === 'updated' ? 'Paid ✓' : 'In AP Review'}
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0">
                        {timeline.map((step, i) => {
                            const isOpen = expanded.has(step.label)
                            const hasNote = !!step.note
                            return (
                                <div key={step.label} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        {step.done
                                            ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5 animate-in zoom-in duration-300" />
                                            : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                                        }
                                        {i < timeline.length - 1 && (
                                            <div className={`w-px flex-1 mt-1 mb-1 min-h-[16px] transition-colors duration-500 ${step.done ? 'bg-success/30' : 'bg-border'}`} />
                                        )}
                                    </div>
                                    <div className="pb-3 flex-1 min-w-0">
                                        <button
                                            onClick={() => hasNote && toggleStep(step.label)}
                                            className={`w-full flex items-center justify-between gap-2 text-left ${hasNote ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={`text-xs font-semibold transition-colors duration-300 ${step.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                                    {step.label}
                                                </p>
                                                <span className={`text-[10px] transition-colors duration-300 ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                                                    {step.time}
                                                </span>
                                            </div>
                                            {hasNote && (
                                                <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                        {isOpen && hasNote && (
                                            <p className="text-[10px] text-muted-foreground mt-1 animate-in fade-in duration-200">
                                                {step.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">
                            {scene === 'updated'
                                ? <>Total: <span className="text-foreground font-medium">3 days</span> · within avg · <span className="text-success font-medium">On time ✓</span></>
                                : <>Avg payment: <span className="text-foreground font-medium">3.2 days</span> · On track</>
                            }
                        </p>
                    </div>
                </div>

                {/* Bell icon prompt — only while watching */}
                {scene === 'watching' && (
                    <div className="flex items-center gap-2 justify-center">
                        <Bell className="h-3 w-3 text-muted-foreground animate-pulse" />
                        <p className="text-[10px] text-muted-foreground">Waiting for AP to post to CORE...</p>
                    </div>
                )}

                {/* Expense history */}
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Previous</p>
                    {HISTORY.map(h => (
                        <div key={h.description} className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-foreground">{h.description}</p>
                                <p className="text-[10px] text-muted-foreground">{h.date} · {h.days}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-foreground">{h.amount}</p>
                                <p className="text-[10px] text-success font-medium">{h.status}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AS-IS contrast */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Before Strata:</span> employees called AP to ask where their expense stood. No tracker, no timestamps, no payment ETA.
                    </p>
                </div>
            </div>

            <div className="px-4 pb-2 pt-2 space-y-3">
                <button
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    New expense
                </button>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </div>
        </MobileDeviceFrame>
    )
}
