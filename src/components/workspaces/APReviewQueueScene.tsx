/**
 * w2.1 — APReviewQueueScene
 * AP (Letza): approved expenses with GL pre-suggested, aging outlier flagged
 * Pain point resolved: PP8 (manual GL + CORE entry — 45 min batch → < 5 min)
 */

import { AlertTriangle, Sparkles, ChevronRight } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

const EXPENSES = [
    {
        id: 'john',
        name: 'John Smith',
        amount: '$142.50',
        approvedBy: 'Sarah Johnson',
        approvedDate: 'May 6',
        glLines: 2,
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
        glLines: 1,
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
        glLines: 3,
        ageDays: 4,
        sla: true,
        focus: false,
    },
]

export default function APReviewQueueScene({ onReview }: { onReview?: () => void }) {
    const total = EXPENSES.reduce((s, e) => s + parseFloat(e.amount.replace('$', '').replace(',', '')), 0)

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Header with time savings callout */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai" />
                        <p className="text-xs font-semibold text-ai">GL pre-filled by Strata AI</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">3 expenses · ${total.toFixed(0)} · Est. 4 min</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground line-through">~45 min manual</p>
                    <p className="text-xs font-bold text-success">~4 min with Strata</p>
                </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {EXPENSES.map(exp => (
                    <div
                        key={exp.id}
                        className={`bg-card border rounded-xl p-4 space-y-3 ${exp.sla ? 'border-warning/50' : 'border-border'}`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-foreground">{exp.name}</p>
                                    {exp.sla && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-full shrink-0">
                                            <AlertTriangle className="h-2.5 w-2.5" /> {exp.ageDays} days
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

                        {/* GL pre-suggestion badge */}
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ai bg-ai/10 border border-ai/20 px-2 py-1 rounded-full">
                                <Sparkles className="h-2.5 w-2.5" />
                                GL pre-filled · {exp.glLines} line{exp.glLines > 1 ? 's' : ''} ready
                            </span>
                        </div>

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
                            <button className="w-full text-xs text-muted-foreground py-2 rounded-lg hover:text-foreground border border-border transition-colors">
                                Review GL →
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <p className="text-xs text-center text-muted-foreground px-2">
                Strata pre-filled all GL codes from expense category rules — Letza reviews, confirms or overrides. No lookup needed.
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
