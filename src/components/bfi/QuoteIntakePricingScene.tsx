/**
 * COMPONENT: QuoteIntakePricingScene  (a1.2)
 * PURPOSE: Agency Fee step 2 — 3-phase flow:
 *   Phase 'email':      Email from Robert Chen (MK Rep) · PDF + SIF · OCR
 *   Phase 'validating': OVNIQ validation · 4 lines progressive · Panel System restricted
 *   Phase 'discount':   Discount formula · City/State NY toggle · Labor panel · Agency fee
 *
 * Order: DOE-2847 · Q-2026-0089 · NYC Dept. of Education
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, ChevronRight, FileText, Mail, Building2, X } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

type Phase = 'email' | 'validating' | 'discount'

const VALIDATION_LINES = [
    { product: 'Workstations ×24',       sif: '$144,000', contract: '$144,000', status: 'ok'         as const },
    { product: 'Lounge Seating ×12',     sif: '$84,000',  contract: '$84,000',  status: 'ok'         as const },
    { product: 'Filing Units ×6',        sif: '$8,100',   contract: '$7,560',   status: 'corrected'  as const },
    { product: 'Panel System (custom)',   sif: '$4,200',   contract: '—',        status: 'restricted' as const },
]

const DISCOUNT_LINES = [
    { product: 'Workstations ×24',   list: '$240,000', sale: '$144,000', formula: '(144,000 ÷ 240,000) − 1', pct: '−40.0%' },
    { product: 'Lounge Seating ×12', list: '$140,000', sale: '$84,000',  formula: '(84,000 ÷ 140,000) − 1',  pct: '−40.0%' },
    { product: 'Filing Units ×6',    list: '$12,600',  sale: '$7,560',   formula: '(7,560 ÷ 12,600) − 1',    pct: '−40.0%' },
]

const PANEL_DRAFT = `Hi Robert,

The Panel System (custom config, $4,200) is not included in the CoNY contract catalog and cannot be quoted on this order.

Please provide a substitute item from the approved product list for DOE-2847.

— Lauren DeMarco, CoNY Account Lead · BFI Furniture`

export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase]                 = useState<Phase>('email')
    const [revealedCount, setRevealedCount] = useState(0)
    const [noticeSent, setNoticeSent]       = useState(false)
    const [showNoticeModal, setShowNoticeModal] = useState(false)
    const [contractType, setContractType]   = useState<'city' | 'state'>('city')
    const [applied, setApplied]             = useState(false)
    const [ocr, setOcr]                     = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    // OCR animation when entering email phase
    useEffect(() => {
        if (phase !== 'email') return
        const t = setTimeout(() => setOcr(true), 800)
        return () => clearTimeout(t)
    }, [phase])

    // Progressive reveal in validating phase
    useEffect(() => {
        if (phase !== 'validating') return
        if (revealedCount >= VALIDATION_LINES.length) return
        const t = setTimeout(pauseAware(() => setRevealedCount(c => c + 1)), 450)
        return () => clearTimeout(t)
    }, [phase, revealedCount, pauseAware])

    const handleApply = () => {
        setApplied(true)
        setTimeout(pauseAware(() => {
            onApply?.()
            nextStep()
        }), 400)
    }

    const allRevealed      = revealedCount >= VALIDATION_LINES.length
    const canContinue      = allRevealed && noticeSent

    // ── Phase: email ──────────────────────────────────────────────────────────
    if (phase === 'email') {
        return (
            <div className="space-y-4">
                {/* Context banner */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">Quote Request · DOE-2847 · NYC Dept. of Education</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            Email received from Miller Knoll designer — SIF file and specification PDF attached. Strata parsed both documents via OCR.
                        </div>
                    </div>
                </div>

                {/* Incoming email */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · Miller Knoll</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">May 6 · 8:14 AM</span>
                    </div>
                    <div className="p-3.5 space-y-2.5">
                        {[
                            { label: 'From',    value: 'Robert Chen · Miller Knoll Rep' },
                            { label: 'To',      value: 'Lauren DeMarco · BFI Furniture' },
                            { label: 'Subject', value: 'Quote request · DOE-2847 · NYC Dept. of Education' },
                        ].map(f => (
                            <div key={f.label} className="flex items-start gap-3 text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-muted-foreground w-14 shrink-0 pt-0.5">{f.label}:</span>
                                <span className="text-foreground font-medium">{f.value}</span>
                            </div>
                        ))}

                        {/* Attachments */}
                        <div className="space-y-2 pt-1">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Attachments</div>
                            <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-2.5 py-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-medium text-foreground">DOE-2847_specs.pdf</div>
                                    <div className="text-[10px] text-muted-foreground">Product specs · architectural drawings · 12 pages</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-2.5 py-2">
                                <FileText className="h-3.5 w-3.5 text-ai shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-medium text-foreground">DOE-2847_SIF_v1.xlsx</div>
                                    <div className="text-[10px] text-muted-foreground">Product codes · list prices · 4 line items</div>
                                </div>
                                {ocr && (
                                    <span className="text-[9px] text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.5 rounded-full font-medium animate-in fade-in duration-300">
                                        OCR ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lauren CORE action */}
                {ocr && (
                    <div className="flex items-start gap-2.5 bg-muted/40 border border-border rounded-xl px-3 py-2.5 animate-in fade-in duration-300">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Lauren creates quote <span className="font-medium text-foreground">Q-2026-0089</span> and order <span className="font-medium text-foreground">DOE-2847</span> in CORE · replies to Robert confirming, including the order number in the email subject.
                        </p>
                    </div>
                )}

                {/* Before Strata */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-[10px] text-muted-foreground">
                    Before Strata: Lauren opened each file manually, cross-referenced against OVNIQ — ~45 min per SIF. No system to track the acknowledgement loop.
                </div>

                <button
                    onClick={() => setPhase('validating')}
                    disabled={!ocr}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                    <Sparkles className="h-4 w-4" />
                    Run SIF validation →
                </button>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
            </div>
        )
    }

    // ── Phase: validating ─────────────────────────────────────────────────────
    if (phase === 'validating') {
        return (
            <div className="space-y-4">
                {/* Context banner */}
                <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs flex-1">
                        <div className="font-bold text-foreground">OVNIQ Validation · DOE-2847 · Q-2026-0089</div>
                        <div className="text-muted-foreground mt-0.5">
                            Strata is validating the SIF against the CoNY contract via OVNIQ — comparing list prices, applying T-code rates, flagging restrictions.
                        </div>
                    </div>
                </div>

                {/* Validation table */}
                <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="col-span-2">Product</span>
                        <span>SIF</span>
                        <span className="text-right">Contract</span>
                    </div>
                    {VALIDATION_LINES.slice(0, revealedCount).map((line) => (
                        <div
                            key={line.product}
                            className="border-t border-border animate-in fade-in slide-in-from-left-1 duration-300"
                        >
                            <div className="grid grid-cols-4 gap-0 px-3.5 py-2.5 text-xs items-center">
                                <span className="col-span-2 font-medium text-foreground">{line.product}</span>
                                <span className={`tabular-nums ${line.status === 'restricted' ? 'text-destructive line-through' : 'text-muted-foreground'}`}>
                                    {line.sif}
                                </span>
                                <span className={`text-right font-bold tabular-nums ${
                                    line.status === 'ok'         ? 'text-success'
                                    : line.status === 'corrected' ? 'text-warning'
                                    : 'text-destructive'
                                }`}>
                                    {line.status === 'ok'         && <span className="flex items-center justify-end gap-1"><CheckCircle2 className="h-3 w-3" /> {line.contract}</span>}
                                    {line.status === 'corrected'  && <span className="flex items-center justify-end gap-1"><AlertTriangle className="h-3 w-3" /> {line.contract}</span>}
                                    {line.status === 'restricted' && <span className="flex items-center justify-end gap-1"><X className="h-3 w-3" /> Restricted</span>}
                                </span>
                            </div>

                            {line.status === 'corrected' && (
                                <div className="px-3.5 pb-2 text-[10px] text-warning">
                                    Corrected $8,100 → $7,560 · CoNY contract price applied by OVNIQ
                                </div>
                            )}

                            {line.status === 'restricted' && (
                                <div className="mx-3.5 mb-3 border border-destructive/30 bg-destructive/5 rounded-xl overflow-hidden animate-in fade-in duration-300">
                                    <div className="px-3 py-2 border-b border-destructive/20">
                                        <span className="text-[10px] font-bold text-destructive uppercase tracking-wide">Not in CoNY catalog — notice pre-drafted</span>
                                    </div>
                                    <div className="p-3 space-y-2.5">
                                        <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{PANEL_DRAFT}</pre>
                                        {!noticeSent ? (
                                            <button
                                                onClick={() => setShowNoticeModal(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all"
                                            >
                                                <Mail className="h-3 w-3" />
                                                Send notice to designer
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[11px] text-success font-medium">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Notice sent · Panel System removed pending designer response
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary — appears when all revealed + notice sent */}
                {canContinue && (
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <span className="text-xs font-bold text-foreground">3 lines validated · 1 corrected ($8,100→$7,560) · 1 restricted removed</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-6">
                            T-code 18% applied by OVNIQ — Expected fee: <span className="font-bold text-foreground">$41,040</span> (calculated automatically)
                        </div>
                        <div className="text-[11px] text-muted-foreground pl-6">
                            Corrected SIF uploaded to CORE · order DOE-2847 updated
                        </div>
                    </div>
                )}

                {canContinue && (
                    <button
                        onClick={() => setPhase('discount')}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300"
                    >
                        Calculate discount & continue →
                        <ChevronRight className="h-4 w-4" />
                    </button>
                )}

                {!canContinue && allRevealed && !noticeSent && (
                    <p className="text-[11px] text-muted-foreground text-center">
                        Send the restricted item notice to continue
                    </p>
                )}

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

                {/* Confirm send notice modal */}
                {showNoticeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 pl-[calc(320px+1.5rem)]">
                        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                                <div className="text-sm font-bold text-foreground">Send notice · Robert Chen · Miller Knoll</div>
                                <button onClick={() => setShowNoticeModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-5 space-y-3">
                                <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 border border-border rounded-xl p-3">{PANEL_DRAFT}</pre>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowNoticeModal(false)}
                                        className="flex-1 text-sm font-semibold text-muted-foreground py-2.5 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { setNoticeSent(true); setShowNoticeModal(false) }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-all"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // ── Phase: discount ───────────────────────────────────────────────────────
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Context banner */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Discount Calculation · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5">
                        City of NY requires Cost = Sale (no gross profit). Formula: (Sale ÷ List) − 1.
                    </div>
                </div>
            </div>

            {/* Contract type toggle */}
            <div className="border border-border rounded-xl p-3 bg-card space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Contract Type</div>
                <div className="flex gap-2 bg-muted/40 border border-border rounded-lg p-0.5">
                    <button
                        onClick={() => setContractType('city')}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                            contractType === 'city'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        ● City of New York
                    </button>
                    <button
                        onClick={() => setContractType('state')}
                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                            contractType === 'state'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        ○ State of New York
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Identified from contract number in PO header ·{' '}
                    {contractType === 'city'
                        ? 'CoNY: Cost = Sale (no gross profit)'
                        : 'State NY: different pricing structure applies'}
                </p>
            </div>

            {/* Discount table */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-1">Product</span>
                    <span className="text-right">List</span>
                    <span className="text-right">Sale</span>
                    <span className="text-right">Discount</span>
                </div>
                {DISCOUNT_LINES.map((line) => (
                    <div key={line.product} className="grid grid-cols-4 gap-0 px-3.5 py-2.5 text-xs border-t border-border items-start">
                        <span className="font-medium text-foreground text-[11px]">{line.product}</span>
                        <span className="text-right text-muted-foreground tabular-nums text-[11px]">{line.list}</span>
                        <span className="text-right text-muted-foreground tabular-nums text-[11px]">{line.sale}</span>
                        <span className="text-right font-bold text-destructive tabular-nums text-[11px]">{line.pct}</span>
                    </div>
                ))}
                <div className="px-3.5 py-2 border-t border-border bg-muted/20">
                    <p className="text-[10px] text-muted-foreground font-mono text-center">
                        Formula: (Sale ÷ List) − 1 = −40.0% · $0 gross profit · City of New York requirement
                    </p>
                </div>
            </div>

            {/* Agency fee summary */}
            <div className="flex items-start gap-2.5 bg-success/5 border border-success/30 rounded-xl px-3 py-2.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    OVNIQ applied T-code 18% · Expected agency fee:{' '}
                    <span className="font-bold text-foreground">$41,040</span>{' '}
                    across 2 product lines · Order entered as third-party invoice · Herman Miller as vendor
                </p>
            </div>

            {/* Labor coordination panel */}
            <div className="border border-border rounded-xl bg-muted/30 p-3 space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Labor Coordination · Workplace (Wick) — In Progress</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Michael Boyle reviewing labor quote: inside delivery · installation · OT differentials · truck charge · Carpenters.
                    Template loaded in CORE · Michael entering numbers.
                </p>
            </div>

            <button
                onClick={handleApply}
                disabled={applied}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                Apply discount &amp; continue
                <ChevronRight className="h-4 w-4" />
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
