/**
 * COMPONENT: QuoteSendProposalScene
 * PURPOSE: Flow 3 · Scene 3 — PC human review + send. Proposal summary card
 *          + OrderExecutionPanel (how the order routes to each manufacturer).
 *          Send CTA flips into FlowHandoff that bridges to Flow 4 (Design AI).
 *
 *          Narrative role: closes the PC loop, then pivots the story
 *          upstream — "we caught the $18K in Flow 1, but the real leverage
 *          is preventing those spec issues at the source, inside the
 *          designer's CET".
 *
 * USED BY: MBIQuotesPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    Send, CheckCircle2, FileText, Clock, Palette,
    Receipt, Sparkles,
} from 'lucide-react'
import FlowHandoff from './FlowHandoff'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'

export default function QuoteSendProposalScene() {
    const [sent, setSent] = useState(false)
    const [sentAt, setSentAt] = useState<Date | null>(null)

    const handleSend = () => {
        setSent(true)
        setSentAt(new Date())
    }

    return (
        <div className="space-y-4">
            {/* Proposal summary card */}
            <div className={`
                border rounded-2xl p-5 flex items-start gap-4 transition-colors
                ${sent ? 'bg-success/10 dark:bg-success/15 border-success/40' : 'bg-success/5 border-success/30'}
            `}>
                <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground">
                        {sent
                            ? 'Proposal delivered to Enterprise Holdings'
                            : 'CORE proposal PROP-2026-003 · ready to send'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        Enterprise Holdings · New HQ Floor 12 · 7 line items · $372,500 · HNI Corporate contract
                    </div>
                    {sent && sentAt && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div className="text-[11px] text-success font-semibold inline-flex items-center gap-1">
                                <Send className="h-3 w-3" />
                                Sent {sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · copy to Amanda + sales rep
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Pending Client Approval
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PC effort</div>
                    <div className="text-xl font-bold text-success">~12 min</div>
                    <div className="text-[10px] text-muted-foreground">was 2h per proposal</div>
                </div>
            </div>

            {/* Send CTA — pre-delivery */}
            {!sent && (
                <div className="bg-card dark:bg-zinc-800 border border-primary/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">Approve + send proposal</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Logs the proposal in CORE, notifies Amanda and the sales rep, and marks the project as awaiting client sign-off.
                        </div>
                    </div>
                    <button
                        onClick={handleSend}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Send className="h-4 w-4" />
                        Send proposal to Enterprise
                    </button>
                </div>
            )}

            {/* Post-send FlowHandoff to Flow 4 */}
            {sent && (
                <FlowHandoff
                    eyebrow="Flow 2 complete"
                    recapHeading="PC bottleneck · collapsed"
                    recapSubheading="4 audit loops → 1 AI pass + 1 human review. What used to take 2 hours per proposal takes 12 minutes."
                    recapStats={[
                        { icon: <Clock className="h-4 w-4" />, value: '12 min', sub: 'vs 2h per proposal', accent: 'text-success' },
                        { icon: <Sparkles className="h-4 w-4" />, value: '4 → 1+1', sub: 'audit loops collapsed', accent: 'text-success' },
                        { icon: <Send className="h-4 w-4" />, value: '1 proposal', sub: 'delivered · awaiting sign-off' },
                    ]}
                    timeline={[
                        { status: 'done', icon: <FileText className="h-3.5 w-3.5" />, label: 'Budget → PC queue', caption: 'signed last week', flow: 'Flow 2 · Quotes AI' },
                        { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'SIF → CORE auto-import', caption: '87 seconds, 0 keystrokes', flow: '—' },
                        { status: 'done', icon: <Send className="h-3.5 w-3.5" />, label: 'Proposal delivered to client', caption: 'just now', flow: '—' },
                        { status: 'future', icon: <Palette className="h-3.5 w-3.5" />, label: 'Phase 4 · Design AI', caption: 'available via the Design AI tab', flow: 'Phase 4 directional', highlight: false },
                    ]}
                    narrative={{
                        eyebrow: 'Tour complete · what comes next',
                        icon: <Palette className="h-5 w-5" />,
                        title: "Phase 1 (Accounting) + Phase 3 (Quotes) are the active demo. Phase 4 is directional.",
                        body: (
                            <>
                                The active tour ends here — <strong className="text-foreground">Phase 1 ships
                                Accounting AI</strong> and the <strong className="text-foreground">Quotes
                                AI</strong> module is the natural next step (Phase 4 of the roadmap). Spec
                                Check (Q10 #1 priority for the design team) is built and available via the
                                <strong className="text-foreground"> Design AI</strong> tab in the navbar
                                if the conversation goes there — but it's not part of the Phase 1 demo focus.
                            </>
                        ),
                    }}
                    primaryCTA={{
                        label: "Restart from Accounting",
                        icon: <Receipt className="h-4 w-4" />,
                        targetStepId: 'm2.1',
                    }}
                />
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI] },
                { sources: [SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
