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

import { TrendingDown, ArrowRight, Mail } from 'lucide-react'
import ARStatusBoard from './ARStatusBoard'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'

interface ARAgingReviewSceneProps {
    /** When provided, the "review collection emails" cue at the bottom
     *  becomes a real button that advances the wizard to the next scene. */
    onContinue?: () => void
}

export default function ARAgingReviewScene({ onContinue }: ARAgingReviewSceneProps = {}) {
    const totalAR = MBI_AR_RECORDS.reduce((acc, r) => acc + r.amount, 0)
    const escalated = MBI_AR_RECORDS.filter(r => r.status === 'escalated').length
    const committed = MBI_AR_RECORDS
        .filter(r => r.status === 'committed-to-pay')
        .reduce((acc, r) => acc + r.amount, 0)
    const escalatedAmount = MBI_AR_RECORDS
        .filter(r => r.status === 'escalated')
        .reduce((acc, r) => acc + r.amount, 0)

    // The next scene (ARAgingWrapScene) renders 2 AI-drafted emails: one
    // for the first escalated account and one for the first no-response
    // account. Mark THOSE specific records on the board so the audience
    // sees the funnel narrowing — many open accounts here, the 2 with
    // drafts highlighted, and only those 2 surface for action next.
    const firstEscalated = MBI_AR_RECORDS.find(r => r.status === 'escalated')
    const firstNoResponse = MBI_AR_RECORDS.find(r => r.status === 'no-response')
    const draftReadyIds = [firstEscalated?.id, firstNoResponse?.id].filter(Boolean) as string[]

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

            {/* AR status board · highlights the records that have drafts queued next */}
            <ARStatusBoard records={MBI_AR_RECORDS} highlightedIds={draftReadyIds} />

            {/* Forward cue · now a real button so the funnel from list → action
                is one click instead of "next" copy without a control */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/30 rounded-xl p-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="font-bold text-foreground">
                            Next · review the {draftReadyIds.length} AI-drafted follow-up{draftReadyIds.length === 1 ? '' : 's'}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Strata pre-drafted emails for the highlighted accounts above using each client's tone history. You review, edit if needed, send.
                        </div>
                    </div>
                </div>
                {onContinue && (
                    <button
                        onClick={onContinue}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Mail className="h-4 w-4" />
                        Review {draftReadyIds.length} draft{draftReadyIds.length === 1 ? '' : 's'}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
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
