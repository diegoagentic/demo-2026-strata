/**
 * w1.2 — ApprovalQueueScene
 * Manager (Tammy): approval queue with receipt counts visible + SLA aging badge
 * Pain points resolved: PP1 (receipts visible), PP5 (GlobalSearch broken)
 */

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Receipt } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

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
    },
]

const FILTER_LABELS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'meals', label: 'Meals' },
    { key: 'travel', label: 'Travel' },
    { key: 'sla', label: '⚠️ SLA' },
]

export default function ApprovalQueueScene({ onReview }: { onReview?: () => void }) {
    const [filter, setFilter] = useState<Filter>('all')

    const visible = EXPENSES.filter(e =>
        filter === 'all' || e.filters.includes(filter)
    )

    const totalAmount = EXPENSES.reduce((sum, e) => sum + parseFloat(e.amount.replace('$', '').replace(',', '')), 0)

    return (
        <div className="max-w-lg mx-auto space-y-4">
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

function ExpenseCard({ expense: exp, onReview }: {
    expense: typeof EXPENSES[0]
    onReview?: () => void
}) {
    return (
        <div className={`bg-card border rounded-xl p-4 space-y-3 ${exp.sla ? 'border-warning/50' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">{exp.name}</p>
                        {exp.sla && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full shrink-0">
                                <AlertTriangle className="h-2.5 w-2.5" /> SLA exceeded
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{exp.category} · Submitted {exp.submitted} · {exp.age}</p>
                </div>
                <p className="text-sm font-bold text-foreground shrink-0">{exp.amount}</p>
            </div>

            {/* Receipt visibility — the differentiator */}
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

            {exp.sla && (
                <p className="text-xs text-muted-foreground">
                    Push notification sent to Carlos · 4 days pending without review
                </p>
            )}

            {/* Actions */}
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
                        <button className="flex-1 flex items-center justify-center gap-1 bg-success/10 text-success border border-success/20 text-xs font-medium py-2 rounded-lg hover:bg-success/15 transition-colors">
                            ✓ Approve
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 bg-muted text-muted-foreground text-xs font-medium py-2 rounded-lg hover:text-foreground transition-colors">
                            ✗ Reject
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
