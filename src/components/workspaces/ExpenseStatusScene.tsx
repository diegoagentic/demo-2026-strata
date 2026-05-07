/**
 * w1.4 — ExpenseStatusScene
 * Employee: timeline with timestamps, expense history, avg payment time
 * Pain point resolved: PP9 (no status visibility — employees called AP)
 */

import { CheckCircle2, Clock, Circle } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

const TIMELINE = [
    { label: 'Submitted',        time: 'May 5, 10:32 AM', note: 'Form submitted via mobile',            done: true  },
    { label: 'Manager Notified', time: 'May 5, 10:33 AM', note: 'Push sent to Sarah Johnson',           done: true  },
    { label: 'Approved',         time: 'May 6, 9:15 AM',  note: 'Sarah Johnson · 1 day · within SLA ✓', done: true  },
    { label: 'In AP Review',     time: 'May 6, 9:16 AM',  note: 'Routed to Letza\'s queue',             done: true  },
    { label: 'Posted to CORE',   time: 'Pending',          note: '',                                      done: false },
    { label: 'Payment Issued',   time: 'Pending',          note: '',                                      done: false },
]

const HISTORY = [
    { description: 'Parking',        amount: '$47.00',  date: 'Apr 28', status: 'Paid ✓', days: '2.8 days' },
    { description: 'Office Supplies', amount: '$23.00', date: 'Apr 15', status: 'Paid ✓', days: '3.1 days' },
]

export default function ExpenseStatusScene() {
    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Header */}
            <div>
                <p className="text-xs text-muted-foreground">My Expenses</p>
                <p className="text-base font-bold text-foreground">John Smith</p>
            </div>

            {/* Current expense timeline */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-foreground">Fuel + Parking</p>
                        <p className="text-xs text-muted-foreground">$142.50 · May 5, 2026 · 2 receipts</p>
                    </div>
                    <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-full font-medium">
                        In AP Review
                    </span>
                </div>

                {/* Timeline */}
                <div className="space-y-0">
                    {TIMELINE.map((step, i) => (
                        <div key={step.label} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                {step.done
                                    ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                    : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                                }
                                {i < TIMELINE.length - 1 && (
                                    <div className={`w-px flex-1 mt-1 mb-1 min-h-[16px] ${step.done ? 'bg-success/30' : 'bg-border'}`} />
                                )}
                            </div>
                            <div className="pb-3">
                                <div className="flex items-center gap-2">
                                    <p className={`text-xs font-semibold ${step.done ? 'text-foreground' : 'text-muted-foreground/50'}`}>{step.label}</p>
                                    <span className={`text-[10px] ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>{step.time}</span>
                                </div>
                                {step.note && <p className="text-[11px] text-muted-foreground mt-0.5">{step.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                        Average time to payment: <span className="text-foreground font-medium">3.2 days</span> · You're on track
                    </p>
                </div>
            </div>

            {/* Expense history */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Previous Expenses</p>
                {HISTORY.map(h => (
                    <div key={h.description} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">{h.description}</p>
                            <p className="text-xs text-muted-foreground">{h.date} · {h.days}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-foreground">{h.amount}</p>
                            <p className="text-[11px] text-success font-medium">{h.status}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Before Strata:</span> employees called AP to ask where their expense stood. No status tracker, no timestamps, no payment estimate.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
        </div>
    )
}
