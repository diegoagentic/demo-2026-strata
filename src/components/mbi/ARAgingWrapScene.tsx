/**
 * COMPONENT: ARAgingWrapScene
 * PURPOSE: Flow 1 · Scene 5 — second half of the AR cycle. Drafts, send,
 *          close the morning. The aging board + analytics moved to
 *          ARAgingReviewScene (scene 4) so the audience reads the analytics
 *          moment and the action moment as two distinct beats — gives AR
 *          parity with the 3 AP scenes (Fase H, Apr 23 Matt's "add the AR
 *          flow").
 *
 *          Two zones on this scene:
 *            1. AI email drafts panel (review · edit · send each)
 *            2. Close morning CTA → FlowHandoff (recap + handoff to Quotes AI)
 *
 * USED BY: MBIAccountingPage (wizard scene 4 · demo step m2.5)
 *
 * DS TOKENS: bg-card · brand-300 CTA in handoff
 */

import { useState } from 'react'
import {
    Mail, CheckCircle2, Clock, FileSignature,
    Receipt, Package, FileText, Sparkles,
} from 'lucide-react'
import AIEmailDraftsPanel from './AIEmailDraftsPanel'
import FlowHandoff from './FlowHandoff'
import { MBI_AR_RECORDS } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

export default function ARAgingWrapScene() {
    const [morningClosed, setMorningClosed] = useState(false)

    const escalated = MBI_AR_RECORDS.filter(r => r.status === 'escalated').length
    const committed = MBI_AR_RECORDS
        .filter(r => r.status === 'committed-to-pay')
        .reduce((acc, r) => acc + r.amount, 0)

    return (
        <div className="space-y-4">
            {/* Auto-sent summary strip */}
            <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="text-xs flex-1">
                    <span className="font-bold text-foreground">8 standard follow-ups auto-sent this morning</span>
                    <span className="text-muted-foreground"> · per payment terms · no action needed</span>
                </div>
            </div>

            {/* Drafts intro — escalation cases only */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">2 escalation cases need your review</div>
                    <div className="text-muted-foreground mt-0.5">
                        Strata drafted each follow-up in the client's tone history. These are the accounts where auto-send wasn't enough — review, edit if needed, send.
                    </div>
                </div>
            </div>

            {/* AI email drafts */}
            <AIEmailDraftsPanel />

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_AR] },
                { sources: [SOURCES.STRATA_NLP] },
                { sources: [SOURCES.OUTLOOK] },
            ]} />

            {/* Close morning CTA · gates FlowHandoff */}
            {!morningClosed ? (
                <div className="bg-card dark:bg-zinc-800 border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Ready to close the morning?</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Vouchers posted · reconciliations logged · collection emails sent · forecast refreshed. Everything's in leadership's live dashboard.
                        </div>
                    </div>
                    <button
                        onClick={() => setMorningClosed(true)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Close morning queue
                    </button>
                </div>
            ) : (
                <FlowHandoff
                    eyebrow="Flow 1 complete"
                    recapHeading="Kathy's morning · done in 18 minutes"
                    recapSubheading="Vouchers posted, reconciliations cleared, AR emails out — everything Strata couldn't auto-handle routed through your eyes only."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '18 min', sub: 'vs 4h before', accent: 'text-success' },
                        { icon: <Sparkles className="h-4 w-4" />, value: '5 / 12', sub: 'bills auto-posted', accent: 'text-success' },
                        { icon: <Mail className="h-4 w-4" />, value: '3', sub: 'collection emails sent' },
                        { icon: <Receipt className="h-4 w-4" />, value: `$${(committed / 1000).toFixed(0)}K`, sub: 'committed to pay', accent: 'text-success' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Morning queue', caption: '12 bills triaged', flow: 'Flow 1 · Accounting AI' },
                        { status: 'done', icon: <Receipt className="h-3.5 w-3.5" />, label: 'HealthTrust posted', caption: '3% rebate applied', flow: '—' },
                        { status: 'done', icon: <Package className="h-3.5 w-3.5" />, label: 'Non-EDI cleared', caption: 'Apex Workspace reconciled', flow: '—' },
                        { status: 'done', icon: <Mail className="h-3.5 w-3.5" />, label: 'AR aging reviewed', caption: `${MBI_AR_RECORDS.length} accounts · ${escalated} escalated`, flow: '—' },
                        { status: 'next', icon: <Mail className="h-3.5 w-3.5" />, label: 'Collection emails sent', caption: '3 follow-ups out', flow: '—' },
                        { status: 'future', icon: <FileSignature className="h-3.5 w-3.5" />, label: 'Next Enterprise PO', caption: 'PC team picks up', flow: 'Flow 2 · Quotes AI', highlight: true },
                    ]}
                    narrative={{
                        eyebrow: 'Meanwhile · upstream',
                        icon: <FileSignature className="h-5 w-5" />,
                        title: `A new client just signed the budget the Account Manager sent last week. The PC team has work to do.`,
                        body: (
                            <>
                                Marcia's team runs <strong className="text-foreground">3.5 PCs for 29 staff</strong> — the biggest bottleneck at MBI. Every approved budget used to trigger hours of manual SIF re-entry into CORE plus 4 audit loops. That's where <strong className="text-foreground">Quotes AI</strong> collapses the work.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Continue to Quotes AI · PC team's queue",
                        icon: <FileText className="h-4 w-4" />,
                        targetStepId: 'm3.1',
                    }}
                    secondaryCTAs={[
                        { label: 'Restart from Accounting', icon: <Receipt className="h-3 w-3" />, targetStepId: 'm2.1' },
                    ]}
                />
            )}
        </div>
    )
}
