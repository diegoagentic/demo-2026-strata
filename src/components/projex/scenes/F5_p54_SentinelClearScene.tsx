/**
 * COMPONENT: F5_p54_SentinelClearScene (Projex · p5.4)
 * PURPOSE: AckReviewSlideOver full con PMO line editable. Watch each row\'s ESD
 *          transition 10/10/2050 sentinel → real Teknion date. Multi-Line Edit
 *          tool call-out (NetSuite artifact) · bulk update option.
 *
 * SHAPE · slide-over PMO editable + Multi-Line Edit bulk (F5 sentinel scene)
 * REUSE · vendor/UI-Dealer/AckReviewSlideOver (lifted) · mbi/OrderExecutionPanel
 * NOTIF · dispatchea `projex:sentinels-cleared` on bulk update
 */

import { useState } from 'react'
import {
    CheckCircle2, Loader2, ArrowRight, Wrench, Calendar,
    Sparkles, Zap, ArrowUpRight, User,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { useHighlightOnAcClick } from '../hooks/useHighlightOnAcClick'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { NCBA_ACK_LINES } from '../../../config/profiles/projex-data/teknionAck'

export default function F5_p54_SentinelClearScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    const [cleared, setCleared] = useState<Set<number>>(new Set())
    const [applyState, setApplyState] = useState<'idle' | 'applying' | 'applied'>('idle')

    // F76 · AC click highlights Bulk-clear button (Multi-Line Edit call-out)
    const highlight = useHighlightOnAcClick('projex:sentinel-clear-open')

    const handleClearOne = (lineNumber: number) => {
        setCleared(prev => new Set([...prev, lineNumber]))
    }

    const handleBulkApply = () => {
        if (applyState !== 'idle') return
        setApplyState('applying')
        // Stagger clear cada ~200ms
        NCBA_ACK_LINES.forEach((l, i) => {
            pauseAwareTimeout(() => {
                setCleared(prev => new Set([...prev, l.lineNumber]))
            }, 200 * (i + 1))
        })
        pauseAwareTimeout(() => {
            setApplyState('applied')
            window.dispatchEvent(new CustomEvent('projex:sentinels-cleared'))
        }, 200 * NCBA_ACK_LINES.length + 500)
    }

    const clearedCount = cleared.size
    const totalLines = NCBA_ACK_LINES.length
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
            <h1 className="text-2xl font-bold text-foreground">
                    Clear 10/10/2050 sentinels · PMO update with real Teknion ESDs
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Watch each row\'s ESD transition · sentinel placeholder → real date. Multi-Line Edit tool bulk update disponible.
                </p>
            </div>

            {/* Multi-Line Edit callout */}
            <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-center gap-3">
                <Wrench className="h-5 w-5 text-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-sm">
                    <div className="text-foreground font-semibold">Multi-Line Edit tool · NetSuite artifact</div>
                    <div className="text-muted-foreground text-xs mt-0.5">
                        Coordinator typically clears sentinels one-by-one · Multi-Line Edit tool bulk-updates 71 lines in one click when the ACK ESDs are ready.
                    </div>
                </div>
                {applyState === 'idle' && (
                    <button
                        onClick={handleBulkApply}
                        data-ac-highlight
                        className={`shrink-0 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                    >
                        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                        Bulk-clear all sentinels
                    </button>
                )}
                {applyState === 'applying' && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Applying to {NCBA_ACK_LINES.length} lines…
                    </span>
                )}
                {applyState === 'applied' && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {NCBA_ACK_LINES.length} sentinels cleared
                    </span>
                )}
            </div>

            {/* PMO editable list · sentinel transitions */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        NetSuite PMO · line-by-line sentinel clear
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-foreground bg-primary/15 rounded px-1.5 py-0.5 tabular-nums">
                        {clearedCount} / {totalLines} cleared
                    </span>
                </div>
                <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                    <div className="grid grid-cols-[40px_1fr_100px_140px_100px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0">
                        <span>Ln</span>
                        <span>Item</span>
                        <span className="text-right">ESD (was)</span>
                        <span className="text-right">ESD (real)</span>
                        <span className="text-right">Status</span>
                    </div>
                    {NCBA_ACK_LINES.map(l => {
                        const isCleared = cleared.has(l.lineNumber)
                        return (
                            <div key={l.lineNumber} className={`grid grid-cols-[40px_1fr_100px_140px_100px] px-4 py-2 items-center text-xs transition-colors ${isCleared ? 'bg-success/5' : ''}`}>
                                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{l.lineNumber}</span>
                                <div className="min-w-0">
                                    <div className="text-foreground truncate">{l.description}</div>
                                    <span className="text-[10px] text-muted-foreground font-mono truncate">{l.itemCode}</span>
                                </div>
                                <span className={`text-right text-[11px] font-mono tabular-nums ${isCleared ? 'text-muted-foreground line-through' : 'text-warning'}`}>
                                    {l.poESD}
                                </span>
                                <span className={`text-right text-[11px] font-mono tabular-nums ${isCleared ? 'text-success font-bold' : 'text-muted-foreground'}`}>
                                    {isCleared && <ArrowUpRight className="h-3 w-3 inline mr-1" aria-hidden="true" />}
                                    {l.ackESD}
                                </span>
                                <div className="text-right">
                                    {isCleared ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                            <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                                            Cleared
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleClearOne(l.lineNumber)}
                                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted rounded px-1.5 py-0.5 hover:bg-muted/60 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {applyState === 'applied' && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <Sparkles className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">All sentinels cleared · PMO real ESDs</span>
                        <span className="text-muted-foreground"> · Coordinator confirmed CR-affected rows · designer chain assembly ready.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open designer chain
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

        </div>
    )
}
