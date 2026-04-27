/**
 * COMPONENT: ARAgingReviewScene
 * PURPOSE: Flow 1 · Scene 4 — first half of the AR cycle. Kathy moves from
 *          AP closure into AR by reviewing the live aging board: status
 *          taxonomy, totals, escalations, committed-to-pay. The drafts +
 *          send + close happen in the next scene (ARAgingWrapScene).
 *
 *          Apr 23 stakeholder ask (Matt): "keep AP, add AR". Originally AR
 *          was a single wrap-up scene. Splitting it gives AR parity with
 *          AP (3 scenes) and lets the audience see the analytics moment
 *          separately from the action moment.
 *
 * USED BY: MBIAccountingPage (wizard scene 3 · demo step m2.4)
 *
 * DS TOKENS: bg-card · success/info/destructive accents
 */

import { TrendingDown, ArrowRight } from 'lucide-react'
import ARStatusBoard from './ARStatusBoard'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'

export default function ARAgingReviewScene() {
    const totalAR = MBI_AR_RECORDS.reduce((acc, r) => acc + r.amount, 0)
    const escalated = MBI_AR_RECORDS.filter(r => r.status === 'escalated').length
    const committed = MBI_AR_RECORDS
        .filter(r => r.status === 'committed-to-pay')
        .reduce((acc, r) => acc + r.amount, 0)
    const escalatedAmount = MBI_AR_RECORDS
        .filter(r => r.status === 'escalated')
        .reduce((acc, r) => acc + r.amount, 0)

    return (
        <div className="space-y-4">
            {/* AP→AR transition intro */}
            <div className="bg-success/5 dark:bg-success/10 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                <TrendingDown className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">AP closed · now AR aging stays live</div>
                    <div className="text-muted-foreground mt-0.5">
                        Vouchers posted, reconciliations cleared. Now the morning shifts to receivables: live aging board replaces the bi-weekly Excel, and Strata routes the open accounts by status so you know exactly which need a nudge.
                    </div>
                </div>
            </div>

            {/* Aging stats — 4 buckets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryTile
                    label="Total AR open"
                    value={`$${(totalAR / 1000).toFixed(0)}K`}
                    sub={`${MBI_AR_RECORDS.length} accounts`}
                    accent="text-foreground"
                />
                <SummaryTile
                    label="Committed to pay"
                    value={`$${(committed / 1000).toFixed(0)}K`}
                    sub="will close this week"
                    accent="text-success"
                />
                <SummaryTile
                    label="Escalated"
                    value={`${escalated}`}
                    sub={`$${(escalatedAmount / 1000).toFixed(0)}K at risk`}
                    accent="text-red-600 dark:text-red-400"
                />
                <SummaryTile
                    label="Forecast"
                    value="live"
                    sub="vs bi-weekly Excel"
                    accent="text-ai"
                />
            </div>

            {/* AR status board */}
            <ARStatusBoard records={MBI_AR_RECORDS} />

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <div className="flex-1">
                    <div className="font-bold text-foreground">Next · review the AI-drafted collection emails</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        Strata pre-drafted follow-ups for every open account using each client's tone history. You review, edit if needed, and send.
                    </div>
                </div>
            </div>
        </div>
    )
}

function SummaryTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl p-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold tabular-nums mt-0.5 ${accent}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
        </div>
    )
}
