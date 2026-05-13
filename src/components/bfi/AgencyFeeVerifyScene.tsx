/**
 * COMPONENT: AgencyFeeVerifyScene
 * PURPOSE: Flow 1 · Scene 8 — Expected agency fee (from CoNY T-codes) vs
 *          MK Invoice Processor (Nancy Bos). Patricia closes in CORE.
 *
 * UX: Match scenario → Confirm & close (+ Request changes ghost).
 *     Gap scenario   → Flag & hold (+ Request changes ghost).
 *     Request changes → inline panel with chips + note → "Send revision request".
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, DollarSign, Flag, ChevronRight, RotateCcw, Send, XCircle } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface AgencyFeeVerifySceneProps {
    onComplete?: () => void
}

const FEE_LINES = [
    { product: 'Workstations (×24)',   sale: '$144,000', tcode: '4.0%', fee: '$5,760' },
    { product: 'Lounge Seating (×12)', sale: '$84,000',  tcode: '3.9%', fee: '$3,276' },
    { product: 'Filing Units (×6)',    sale: '$7,560',   tcode: '2.9%', fee: '$219'   },
]

const EXPECTED_FEE = '$9,255'
const NANCY_MATCH   = '$9,255'
const NANCY_GAP     = '$8,940'

const CHANGE_CHIPS = ['Invoice amount incorrect', 'T-code mismatch', 'Missing line item', 'Other']

export default function AgencyFeeVerifyScene({ onComplete }: AgencyFeeVerifySceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [revealedCount, setRevealedCount] = useState(0)
    const [scenario, setScenario]           = useState<'match' | 'gap'>('match')
    const [confirmed, setConfirmed]         = useState(false)
    const [flagged, setFlagged]             = useState(false)

    // Request changes flow
    const [requesting, setRequesting]       = useState(false)
    const [revisionSent, setRevisionSent]   = useState(false)
    const [selectedChips, setSelectedChips] = useState<string[]>([])
    const [revisionNote, setRevisionNote]   = useState('')

    const allRevealed = revealedCount >= FEE_LINES.length
    const isGap = scenario === 'gap'

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    useEffect(() => {
        if (revealedCount >= FEE_LINES.length) return
        const t = setTimeout(pauseAware(() => setRevealedCount(c => c + 1)), 400)
        return () => clearTimeout(t)
    }, [revealedCount, pauseAware])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => nextStep()), 700)
    }

    const handleFlag = () => {
        setFlagged(true)
        setTimeout(pauseAware(() => nextStep()), 900)
    }

    const actionDone = confirmed || flagged || revisionSent

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Agency Fee Verification · DOE-2847 · NYC Dept. of Education</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Patricia is verifying the expected agency fee from CoNY contract T-codes against the MK Invoice Processor report from Nancy Bos. T-codes vary by product type — OVNIQ auto-applied the correct rate for each line.
                    </div>
                </div>
            </div>

            {/* Connection bar */}
            <div className="border border-border rounded-xl bg-card px-3.5 py-3">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Data sources</div>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">CoNY Contract · T-codes</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">OVNIQ · auto-apply</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">Expected fee</span>
                    <span className="text-muted-foreground px-1">↕ compare</span>
                    <span className="bg-muted/60 border border-border rounded px-2 py-1 font-medium text-foreground">Nancy Bos · MK Invoice</span>
                </div>
            </div>

            {/* Fee calculation table */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 gap-0 bg-muted/40 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-2">Product</span>
                    <span>Net sale</span>
                    <span>T-code</span>
                    <span className="text-right">Expected fee</span>
                </div>
                {FEE_LINES.slice(0, revealedCount).map((line) => (
                    <div
                        key={line.product}
                        className="grid grid-cols-5 gap-0 px-3.5 py-2.5 text-xs border-t border-border animate-in fade-in slide-in-from-left-1 duration-300"
                    >
                        <span className="col-span-2 font-medium text-foreground">{line.product}</span>
                        <span className="text-muted-foreground tabular-nums">{line.sale}</span>
                        <span className="text-muted-foreground tabular-nums">{line.tcode}</span>
                        <span className="text-right font-bold text-foreground tabular-nums">{line.fee}</span>
                    </div>
                ))}
                {allRevealed && (
                    <div className="px-3.5 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-xs animate-in fade-in duration-300">
                        <span className="font-bold text-foreground">Total expected · variable T-codes per product</span>
                        <span className="font-bold text-foreground tabular-nums">{EXPECTED_FEE}</span>
                    </div>
                )}
            </div>

            {/* Comparison vs Nancy Bos */}
            {allRevealed && (
                <div className={`border rounded-xl overflow-hidden animate-in fade-in duration-300 ${
                    isGap ? 'border-amber-200 dark:border-amber-500/30' : 'border-success/30'
                }`}>
                    {/* Header with demo toggle */}
                    <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-b border-border bg-muted/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            MK Invoice Processor · Nancy Bos report
                        </span>
                        {!actionDone && (
                            <div className="flex gap-1 bg-background border border-border rounded-lg p-0.5">
                                <button
                                    onClick={() => { setScenario('match'); setRequesting(false) }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        !isGap ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    ✓ Match
                                </button>
                                <button
                                    onClick={() => { setScenario('gap'); setRequesting(false) }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                        isGap ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    ⚠ Gap
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Comparison grid */}
                    <div className={`grid grid-cols-3 gap-0 px-3.5 py-3 text-xs ${
                        isGap ? 'bg-amber-50 dark:bg-amber-500/5' : 'bg-success/5'
                    }`}>
                        <div className="text-center">
                            <div className="text-[10px] text-muted-foreground mb-1">Expected (T-codes)</div>
                            <div className="font-bold text-foreground tabular-nums">{EXPECTED_FEE}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-muted-foreground mb-1">Nancy Bos (MK)</div>
                            <div className={`font-bold tabular-nums ${isGap ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
                                {isGap ? NANCY_GAP : NANCY_MATCH}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-muted-foreground mb-1">Variance</div>
                            <div className={`font-bold tabular-nums flex items-center justify-center gap-1 ${
                                isGap ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                            }`}>
                                {isGap
                                    ? <><AlertTriangle className="h-3 w-3" /> −$315</>
                                    : <><CheckCircle2 className="h-3 w-3" /> $0</>
                                }
                            </div>
                        </div>
                    </div>

                    <div className={`px-3.5 py-2 text-[11px] border-t ${
                        isGap
                            ? 'border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 font-medium'
                            : 'border-success/20 text-success font-medium'
                    }`}>
                        {isGap
                            ? 'MK invoice is $315 below contract entitlement — previously undetectable without Strata'
                            : 'Fee confirmed · contract entitlement matches MK Invoice Processor report'
                        }
                    </div>
                </div>
            )}

            {/* CTAs — primary actions */}
            {allRevealed && !actionDone && !requesting && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <button
                        onClick={() => setRequesting(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Request changes
                    </button>

                    {!isGap ? (
                        <button
                            onClick={handleConfirm}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                        >
                            <DollarSign className="h-3.5 w-3.5" />
                            Confirm &amp; close DOE-2847
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleFlag}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-warning text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                        >
                            <Flag className="h-3.5 w-3.5" />
                            Flag &amp; hold for Finance review
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Request changes panel */}
            {allRevealed && requesting && !revisionSent && (
                <div className="border border-warning/30 bg-warning/5 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-warning shrink-0" />
                        <span className="text-xs font-bold text-foreground">Request changes · DOE-2847</span>
                        <button
                            onClick={() => setRequesting(false)}
                            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {CHANGE_CHIPS.map(chip => {
                            const active = selectedChips.includes(chip)
                            return (
                                <button
                                    key={chip}
                                    onClick={() => setSelectedChips(prev =>
                                        active ? prev.filter(c => c !== chip) : [...prev, chip]
                                    )}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        active
                                            ? 'bg-warning/20 border-warning/50 text-warning'
                                            : 'border-border text-muted-foreground hover:border-warning/40 hover:text-warning'
                                    }`}
                                >
                                    {chip}
                                </button>
                            )
                        })}
                    </div>
                    <textarea
                        rows={2}
                        value={revisionNote}
                        onChange={e => setRevisionNote(e.target.value)}
                        placeholder="Note to Nancy Bos / Lauren (optional)…"
                        className="w-full text-[11px] bg-card border border-border rounded-lg px-3 py-2 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-warning/40"
                    />
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => setRequesting(false)}
                            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { setRequesting(false); setRevisionSent(true) }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-warning text-zinc-900 hover:opacity-90 transition-all"
                        >
                            <Send className="h-3 w-3" />
                            Send revision request →
                        </button>
                    </div>
                </div>
            )}

            {/* Outcome states */}
            {confirmed && (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">DOE-2847 closed · Agency fee {EXPECTED_FEE} verified</div>
                        <div className="text-muted-foreground mt-0.5">Patricia notified to apply fee and close CORE · order invoiceable</div>
                    </div>
                </div>
            )}

            {flagged && (
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Gap flagged · DOE-2847 on hold</div>
                        <div className="text-muted-foreground mt-0.5">
                            Patricia and Michael notified · −$315 variance escalated to MK Invoice Processor · pending resolution before close
                        </div>
                    </div>
                </div>
            )}

            {revisionSent && (
                <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Revision requested · DOE-2847 · Nancy Bos notified</div>
                        <div className="text-muted-foreground mt-0.5">Pending correction from Miller Knoll · fee verification on hold</div>
                    </div>
                </div>
            )}

            {/* Before Strata — shown post-action */}
            {actionDone && (
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5 animate-in fade-in duration-300">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Before Strata:</span> No system compared expected fee vs what Nancy Bos reported. BFI was paid whatever Miller Knoll said — verification was impossible. "Lauren said there are never discrepancies" — because she could never check.
                    </p>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR, SOURCES.OVNIQ] }]} />
        </div>
    )
}
