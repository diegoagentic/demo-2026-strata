/**
 * COMPONENT: QuoteSendProposalScene
 * PURPOSE: Flow 3 · Scene 3 — Proposal creation. Two-column layout:
 *          left = action panel (CORE Quote summary + send CTA + FlowHandoff);
 *          right (wider) = inline budget proposal document preview.
 *          Each column is a self-contained card at equal visual weight.
 *
 * USED BY: MBIQuotesPage (wizard scene 3)
 */

import { useState } from 'react'
import {
    Send, CheckCircle2, FileText, Clock, Palette,
    Receipt, Sparkles, Download,
} from 'lucide-react'
import FlowHandoff from './FlowHandoff'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import { StatusBadge } from '../shared'

export default function QuoteSendProposalScene() {
    const [sent, setSent] = useState(false)
    const [sentAt, setSentAt] = useState<Date | null>(null)

    const handleSend = () => {
        setSent(true)
        setSentAt(new Date())
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            {/* ── Left panel (2/5) — action card ── */}
            <div className="lg:col-span-2 bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">

                {/* Panel header */}
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <Send className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Approve & send proposal</div>
                        <div className="text-[10px] text-muted-foreground">QUOT-2026-003 · Enterprise Holdings</div>
                    </div>
                </div>

                {/* Panel body */}
                <div className="p-4 space-y-4">

                    {/* Quote status section */}
                    <div className={`rounded-xl p-3 flex items-start gap-3 transition-colors ${
                        sent
                            ? 'bg-success/10 dark:bg-success/15 border border-success/30'
                            : 'bg-success/5 border border-success/20'
                    }`}>
                        <div className="h-8 w-8 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">
                                {sent ? 'Proposal delivered' : 'CORE Quote · ready to send'}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                7 line items · $372,500 · New HQ Floor 12
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
                            <div className="text-base font-bold text-success">~12 min</div>
                            <div className="text-[10px] text-muted-foreground">was 2h</div>
                        </div>
                    </div>

                    {/* Send CTA section */}
                    {!sent && (
                        <div className="space-y-2.5">
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                Logs the proposal in CORE, notifies Amanda and the sales rep, and marks the project as awaiting client sign-off.
                            </p>
                            <button
                                onClick={handleSend}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                                Send proposal to Enterprise
                            </button>
                        </div>
                    )}

                    {/* Post-send FlowHandoff */}
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
                                { status: 'done', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'GP confirmed · CORE Quote QUOT-2026-003', caption: 'PC reviewed GP · Strata created the quote', flow: '—' },
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
            </div>

            {/* ── Right panel (3/5) — proposal document card ── */}
            <div className="lg:col-span-3">
                <ProposalDocument sent={sent} />
            </div>
        </div>
    )
}

// ─── Inline proposal document preview ────────────────────────────────────────

function ProposalDocument({ sent }: { sent: boolean }) {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">Budget Proposal · QUOT-2026-003</div>
                        <div className="text-[10px] text-muted-foreground">Enterprise Holdings · New HQ Floor 12 · {today}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {sent
                        ? <StatusBadge label="Sent" tone="success" size="sm" />
                        : <StatusBadge label="Draft" tone="warning" size="sm" />
                    }
                    <button
                        className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                        title="Download PDF"
                    >
                        <Download className="h-3 w-3" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Document body */}
            <div className="p-4 max-h-[520px] overflow-y-auto space-y-4">

                {/* Total investment */}
                <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 px-4 py-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total investment</div>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg text-muted-foreground">$</span>
                        <span className="text-3xl font-bold text-foreground tabular-nums">372,500</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        HNI Corporate contract · 7 line items · labor + freight included
                    </div>
                </div>

                {/* Financial breakdown */}
                <section className="space-y-2">
                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Financial breakdown</div>
                    <dl className="space-y-1.5 px-1">
                        <BudgetRow label="Product subtotal" value="$349,500" />
                        <BudgetRow label="HNI Corporate contract (applied)" value="Included" note="55% contract locked" tone="success" />
                        <div className="border-t border-border pt-1.5">
                            <BudgetRow label="Product net" value="$349,500" bold />
                        </div>
                        <BudgetRow label="Labor (delivery + installation)" value="+$14,200" tone="info" />
                        <BudgetRow label="Freight" value="+$8,800" tone="info" />
                        <div className="border-t-2 border-primary/40 pt-2">
                            <BudgetRow label="Total proposal" value="$372,500" bold large />
                        </div>
                    </dl>
                </section>

                {/* Line items summary */}
                <section className="space-y-2">
                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Line items · 7 total</div>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                        {[
                            { vendor: 'HNI', description: 'Workstations + storage · 4 lines', amount: '$218,400', contract: 'HNI Corporate 55%' },
                            { vendor: 'Allsteel', description: 'Seating · 2 lines', amount: '$96,200', contract: null },
                            { vendor: 'BluDot', description: 'Lounge + side tables · 1 line', amount: '$34,900', contract: null },
                        ].map(item => (
                            <div key={item.vendor} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
                                <div className="min-w-0">
                                    <div className="font-semibold text-foreground">{item.vendor}</div>
                                    <div className="text-[10px] text-muted-foreground">{item.description}</div>
                                    {item.contract && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success mt-0.5">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            {item.contract}
                                        </span>
                                    )}
                                </div>
                                <div className="font-bold text-foreground tabular-nums shrink-0">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Delivery schedule */}
                <section className="space-y-2">
                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Delivery schedule</div>
                    <ol className="space-y-2">
                        {[
                            { label: 'Contract signed', date: 'Week 0 — today' },
                            { label: 'Orders placed with manufacturers', date: 'Week 1' },
                            { label: 'On-site installation', date: 'Weeks 8–10' },
                            { label: 'Final walk-through + sign-off', date: 'Week 11' },
                        ].map((step, i) => (
                            <li key={step.label} className="flex items-start gap-2 text-xs">
                                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-zinc-900 dark:text-primary text-[10px] font-bold flex items-center justify-center tabular-nums">
                                    {i + 1}
                                </span>
                                <div>
                                    <div className="text-foreground font-semibold leading-tight">{step.label}</div>
                                    <div className="text-[10px] text-muted-foreground">{step.date}</div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Approval chain */}
                <section className="space-y-2">
                    <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Approval chain</div>
                    <ul className="grid grid-cols-2 gap-2">
                        {[
                            'Marcia Ludwig · Director of PM',
                            'Sara Chen · Account Manager',
                            'Amanda Torres · Sales Rep',
                            'Client · Enterprise Holdings',
                        ].map(line => (
                            <li key={line} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-[11px]">
                                <CheckCircle2 className={`w-3 h-3 shrink-0 ${sent ? 'text-success' : 'text-muted-foreground/40'}`} />
                                <span className="text-foreground truncate">{line}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <p className="text-[10px] text-muted-foreground italic text-center">
                    Prepared by Strata AI · logged to CORE on send · {today}
                </p>
            </div>
        </div>
    )
}

function BudgetRow({
    label, value, note, tone, bold, large,
}: {
    label: string
    value: string
    note?: string
    tone?: 'success' | 'info'
    bold?: boolean
    large?: boolean
}) {
    const valueColor = tone === 'success' ? 'text-success' : tone === 'info' ? 'text-info' : 'text-foreground'
    return (
        <div className="flex items-baseline justify-between gap-3 text-xs">
            <dt className={`${bold ? 'font-bold text-foreground' : 'text-muted-foreground'} flex items-center gap-1.5`}>
                {label}
                {note && <span className="text-[9px] text-muted-foreground italic">· {note}</span>}
            </dt>
            <dd className={`tabular-nums font-semibold ${valueColor} ${large ? 'text-base font-black' : ''}`}>{value}</dd>
        </div>
    )
}
