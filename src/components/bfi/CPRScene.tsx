/**
 * COMPONENT: CPRScene  (a1.3)
 * PURPOSE: Agency Fee step 3 — combined CPR Reconciliation + pre-drafted relay.
 *
 *   Phase 'reconciling': per-line CPR review (Carpenters −5h · OT −2h)
 *   Phase 'messaging':   pre-drafted message to Michael/Nancy · Lauren sends inline
 *
 * Payment-critical: City of NY does not pay if CPR hours don't match.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, Building2, Edit3, Send, ChevronRight } from 'lucide-react'
import { ReasonDialog } from '../shared'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'

interface CPRSceneProps {
    onSend?: () => void
}

type Phase = 'documents' | 'reconciling' | 'messaging'
type LineState = 'pending' | 'approved' | 'edited'

const CPR_LINES = [
    { id: 'teamsters',       category: 'Teamsters',       quoted: '24h', cpr: '24h', diff: null,  impact: null,      ok: true  },
    { id: 'carpenters',      category: 'Carpenters',      quoted: '50h', cpr: '45h', diff: '-5h', impact: '-$1,800', ok: false },
    { id: 'ot-carpenters',   category: 'OT Carpenters',   quoted: '8h',  cpr: '6h',  diff: '-2h', impact: '-$540',   ok: false },
    { id: 'inside-delivery', category: 'Inside Delivery', quoted: '4h',  cpr: '4h',  diff: null,  impact: null,      ok: true  },
]

const EDIT_REASONS = [
    { id: 'verified-cpr', label: 'CPR verified manually with the union' },
    { id: 'partial-work', label: 'Partial work confirmed — hours are correct' },
    { id: 'override',     label: 'Override approved by Director' },
    { id: 'other',        label: 'Other (describe below)' },
]

const DRAFT_DEFAULT = `Lauren has reconciled the CPR for order DOE-2847. Adjusted amounts:\n• Carpenters: 50h → 45h (−5h, −$1,800)\n• OT Carpenters: 8h → 6h (−2h, −$540)\n• Total adjustment: −$2,340\n\nPlease update the Miller Knoll invoice accordingly.\n\n— Michael Boyle, Director of Strategic Accounts`

export default function CPRScene({ onSend }: CPRSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase]           = useState<Phase>('documents')
    const [lineStates, setLineStates] = useState<Record<string, LineState>>({
        carpenters: 'pending',
        'ot-carpenters': 'pending',
    })
    const [editingLine, setEditingLine] = useState<string | null>(null)
    const [allApproved, setAllApproved] = useState(false)

    const [draftText, setDraftText]   = useState(DRAFT_DEFAULT)
    const [editing, setEditing]       = useState(false)
    const [sent, setSent]             = useState(false)
    const [nancyReply, setNancyReply] = useState(false)

    const discrepancyLines = CPR_LINES.filter(l => !l.ok)
    const allDiscrepanciesResolved = discrepancyLines.every(
        l => lineStates[l.id] === 'approved' || lineStates[l.id] === 'edited'
    )

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const approveLine = (id: string) => {
        setLineStates(prev => ({ ...prev, [id]: 'approved' }))
    }

    const handleApproveAll = () => {
        setAllApproved(true)
        setTimeout(pauseAware(() => setPhase('messaging')), 800)
    }

    const handleSend = () => {
        setSent(true)
        setEditing(false)
        setTimeout(() => setNancyReply(true), 1800)
        setTimeout(pauseAware(() => {
            onSend?.()
            nextStep()
        }), 2600)
    }

    const totalImpact = discrepancyLines
        .map(l => l.impact ?? '$0')
        .reduce((sum, v) => sum + parseInt(v.replace(/[^0-9-]/g, '')), 0)

    // ── Phase: documents ──────────────────────────────────────────────────────
    if (phase === 'documents') {
        return (
            <div className="space-y-4">
                {/* Stakes banner */}
                <div className="bg-warning/5 border border-warning/30 rounded-xl p-3.5 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Payment-critical · City of New York</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            Union labor (Teamsters · Carpenters) — payments must match to the cent.
                            This is an extra charge billed to the city for installation labor.{' '}
                            <span className="font-bold text-foreground">City of NY does not pay if CPR hours don't match.</span>
                        </div>
                    </div>
                </div>

                {/* AI banner */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0" />
                    <div className="text-xs">
                        <span className="font-bold text-foreground">CPR documentation received</span>
                        <span className="text-muted-foreground"> · Vendor Order #17706 · 4 documents · Strata extracted hours for review</span>
                    </div>
                </div>

                {/* Doc cards — real PDFs via BFIDocViewer */}
                <BFIDocViewer {...BFI_DOCS.INVOICE_EMAIL_17706} height={220} />
                <BFIDocViewer {...BFI_DOCS.INVOICE_030923}      height={300} />
                <BFIDocViewer {...BFI_DOCS.SIGNIN_NYPL_17706}   height={380} badge="Signed" badgeColor="success" />
                <BFIDocViewer {...BFI_DOCS.CPR_NYPL_17706}      height={420} />

                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Before Strata:</span> Lauren compared CPR documents manually against CORE entries — 45–60 minutes per order. Files arrived by email and were cross-referenced line by line with no system support.
                    </p>
                </div>

                <button
                    onClick={() => setPhase('reconciling')}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                >
                    Run CPR reconciliation
                    <ChevronRight className="h-4 w-4" />
                </button>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Phase: reconciling ────────────────────────────────────────────────────
    if (phase === 'reconciling') {
        return (
            <div className="space-y-4">
                {/* Stakes banner */}
                <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Payment-critical · City of New York</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            Union labor (Teamsters · Carpenters) — if any CPR line has an error →{' '}
                            <span className="font-bold text-foreground">City of NY does not pay</span>{' '}
                            · payments must match to the cent. 75% of orders have at least one discrepancy.
                        </div>
                    </div>
                </div>

                {/* CPR documentation chain */}
                <div className="border border-border rounded-xl px-3 py-2.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                        CPR Documentation · Vendor Order #17706
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {['✉ Email to Michael', '📄 Workplace Invoice', '✍ Timesheet (carpenter)', '💰 Certified Pay Stub'].map(doc => (
                            <span key={doc} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{doc}</span>
                        ))}
                    </div>
                </div>

                {/* AI context */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">CPR Reconciliation · DOE-2847</div>
                        <div className="text-muted-foreground mt-0.5">
                            Strata detected 2 discrepancies vs quoted hours. Before Strata: Lauren compared these manually line by line (~45–60 min).
                        </div>
                    </div>
                </div>

                {/* CPR table */}
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-5 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="col-span-2">Category</span>
                        <span>Quoted</span>
                        <span>CPR Actual</span>
                        <span className="text-right">Impact</span>
                    </div>

                    {CPR_LINES.map(line => {
                        const state = line.ok ? 'ok' : (lineStates[line.id] ?? 'pending')
                        const isResolved = state === 'approved' || state === 'edited' || line.ok

                        return (
                            <div key={line.id} className="border-t border-border">
                                <div className={`grid grid-cols-5 px-3.5 py-2.5 text-xs transition-colors ${
                                    state === 'pending' && !line.ok ? 'bg-warning/5' : isResolved ? '' : ''
                                }`}>
                                    <span className="col-span-2 font-medium text-foreground">{line.category}</span>
                                    <span className="text-muted-foreground tabular-nums">{line.quoted}</span>
                                    <span className={`tabular-nums font-medium ${
                                        !line.ok && state === 'pending' ? 'text-warning' : 'text-foreground'
                                    }`}>
                                        {line.cpr}
                                        {line.diff && state === 'pending' && (
                                            <span className="ml-1 text-[10px] text-warning">{line.diff}</span>
                                        )}
                                    </span>
                                    <span className="text-right flex items-center justify-end gap-1">
                                        {line.ok && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                                        {!line.ok && state === 'pending' && (
                                            <span className="text-warning font-bold tabular-nums text-[11px]">
                                                <AlertTriangle className="h-3 w-3 inline mr-0.5" />{line.impact}
                                            </span>
                                        )}
                                        {!line.ok && state !== 'pending' && (
                                            <span className="text-success flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                <span className="text-[10px]">{state === 'edited' ? 'Edited' : 'Approved'}</span>
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {!line.ok && state === 'pending' && !allApproved && (
                                    <div className="flex items-center gap-2 px-3.5 pb-2.5 bg-warning/5">
                                        <span className="text-[10px] text-muted-foreground flex-1">
                                            {line.category}: {line.quoted} quoted → {line.cpr} actual ({line.diff})
                                        </span>
                                        <button
                                            onClick={() => setEditingLine(line.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <Edit3 className="h-3 w-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => approveLine(line.id)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                                        >
                                            <CheckCircle2 className="h-3 w-3" /> Accept CPR
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <div className="px-3.5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Total adjustment</span>
                        <span className="font-bold tabular-nums text-warning">
                            {`-$${Math.abs(totalImpact).toLocaleString()}`}
                        </span>
                    </div>
                </div>

                {!allApproved && allDiscrepanciesResolved && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                        <p className="text-[11px] text-muted-foreground flex-1">
                            All discrepancies resolved · pre-drafted message to Michael ready.
                        </p>
                        <button
                            onClick={handleApproveAll}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm shrink-0"
                        >
                            <Building2 className="h-3.5 w-3.5" />
                            Approve & relay
                        </button>
                    </div>
                )}

                {!allApproved && !allDiscrepanciesResolved && (
                    <p className="text-[11px] text-muted-foreground">
                        Review each discrepancy — accept the CPR hours or edit with a reason before approving.
                    </p>
                )}

                {editingLine !== null && (
                    <ReasonDialog
                        isOpen={true}
                        onClose={() => setEditingLine(null)}
                        onSubmit={() => {
                            setLineStates(prev => ({ ...prev, [editingLine]: 'edited' }))
                            setEditingLine(null)
                        }}
                        tone="neutral"
                        title="Edit hours manually"
                        subtitle={`DOE-2847 · ${CPR_LINES.find(l => l.id === editingLine)?.category ?? ''}`}
                        categories={EDIT_REASONS}
                        defaultCategoryId="verified-cpr"
                        categoryPrompt="Reason for adjustment"
                        notesPlaceholder="e.g. CPR confirmed by Receiving Coordinator — Carpenters worked 45h per official report."
                        notesRequiredForCategoryId="other"
                        confirmLabel="Apply adjustment"
                    />
                )}

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Phase: messaging ──────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Success — CPR approved */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">CPR approved · CORE updated · −$2,340 applied to DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5">Carpenters: 50h → 45h · OT Carpenters: 8h → 6h</div>
                </div>
            </div>

            {/* Pre-drafted relay */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Pre-drafted relay · Michael Boyle → Nancy Bos</div>
                    <div className="text-muted-foreground mt-0.5">
                        Before Strata: this email took 1–3 days via manual follow-up. Review, edit if needed, send inline.
                    </div>
                </div>
            </div>

            {/* Adjustments summary */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Approved adjustments · DOE-2847</span>
                </div>
                {[
                    { category: 'Carpenters',    change: '50h → 45h (−5h)',  impact: '−$1,800' },
                    { category: 'OT Carpenters', change: '8h → 6h (−2h)',    impact: '−$540'   },
                ].map(adj => (
                    <div key={adj.category} className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0">
                        <div>
                            <div className="text-xs font-medium text-foreground">{adj.category}</div>
                            <div className="text-[11px] text-muted-foreground">{adj.change}</div>
                        </div>
                        <div className="text-xs font-bold text-warning tabular-nums">{adj.impact}</div>
                    </div>
                ))}
            </div>

            {/* Draft message */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">To: Michael Boyle (via Strata)</div>
                        <div className="text-[10px] text-muted-foreground">Relayed to: Nancy Bos · Miller Knoll Invoice Processor</div>
                    </div>
                    {!sent && (
                        <button onClick={() => setEditing(v => !v)} className="text-[11px] font-semibold text-ai hover:text-ai/80 transition-colors">
                            {editing ? 'Done editing' : 'Edit'}
                        </button>
                    )}
                </div>
                <div className="p-3.5">
                    {editing ? (
                        <textarea
                            value={draftText}
                            onChange={e => setDraftText(e.target.value)}
                            className="w-full h-40 text-xs text-foreground bg-background border border-border rounded-xl px-3 py-2.5 resize-none font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-ai/40"
                        />
                    ) : (
                        <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">{draftText}</pre>
                    )}
                </div>
            </div>

            {!sent ? (
                <button
                    onClick={handleSend}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                >
                    <Send className="h-4 w-4" />
                    Send to Michael — relay to Nancy
                </button>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Sent to Michael · relayed to Nancy Bos</div>
                            <div className="text-muted-foreground mt-0.5">City of NY payment path unblocked</div>
                        </div>
                    </div>
                    {nancyReply && (
                        <div className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Nancy Bos replied</div>
                            <div className="text-xs text-foreground italic">
                                "Got it, updating the MK invoice now. DOE-2847 will be corrected by EOD."
                            </div>
                            <div className="text-[10px] text-muted-foreground">2 minutes ago · loop closed without a phone call</div>
                        </div>
                    )}
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
