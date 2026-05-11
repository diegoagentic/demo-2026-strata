/**
 * COMPONENT: DiscountCalcScene
 * PURPOSE: Flow 1 · Scene 3 — Auto discount calculation (sell÷list-1) + true-up line.
 *          Lauren applies discount to CORE with one click.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Calculator, Loader2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface DiscountCalcSceneProps {
    onApply?: () => void
}

const LINE_ITEMS = [
    { product: 'Workstations (×18)', list: '$120,000', sale: '$108,000', discount: '10.0%' },
    { product: 'Task Chairs (×18)',  list: '$36,000',  sale: '$32,400',  discount: '10.0%' },
    { product: 'Filing Units (×6)',  list: '$8,400',   sale: '$7,560',   discount: '10.0%' },
]

type SceneState = 'calculating' | 'ready'

export default function DiscountCalcScene({ onApply }: DiscountCalcSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('calculating')
    const [progress, setProgress] = useState(0)
    const [revealedDiscounts, setRevealedDiscounts] = useState(0)
    const [applied, setApplied] = useState(false)

    useEffect(() => {
        // Animate progress bar from 0 → 100 over 1200ms
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); return 100 }
                return p + 5
            })
        }, 60)
        // Reveal discount values sequentially
        const t1 = setTimeout(() => setRevealedDiscounts(1), 400)
        const t2 = setTimeout(() => setRevealedDiscounts(2), 700)
        const t3 = setTimeout(() => setRevealedDiscounts(3), 1000)
        const t4 = setTimeout(() => setSceneState('ready'), 1300)
        return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
    }, [])

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleApply = () => {
        setApplied(true)
        setTimeout(pauseAware(() => {
            onApply?.()
            nextStep()
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Discount Calculation · NYPD-0394</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        {sceneState === 'calculating'
                            ? 'Applying (Sale ÷ List) − 1 formula to 3 line items...'
                            : 'Strata applied (Sale ÷ List) − 1 per line and inserted the true-up to zero GP. Cost = Sale confirmed.'}
                    </div>
                    {sceneState === 'calculating' && (
                        <div className="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div className="h-1 bg-ai rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>
                {sceneState === 'calculating' && <Loader2 className="h-4 w-4 text-ai animate-spin shrink-0 mt-0.5" />}
            </div>

            {/* Line items */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="grid grid-cols-4 gap-2 px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide col-span-2">Product</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">List</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">Discount</div>
                </div>
                {LINE_ITEMS.map((item, i) => (
                    <div key={item.product} className="grid grid-cols-4 gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0 items-center">
                        <div className="col-span-2">
                            <div className="text-xs font-medium text-foreground">{item.product}</div>
                            <div className="text-[11px] text-muted-foreground">Sale: {item.sale}</div>
                        </div>
                        <div className="text-xs text-foreground text-right tabular-nums">{item.list}</div>
                        <div className={`text-xs font-bold text-right tabular-nums transition-all duration-300 ${i < revealedDiscounts ? 'text-success' : 'text-muted/30 opacity-0'}`}>{item.discount}</div>
                    </div>
                ))}
                {/* True-up row */}
                <div className="px-3.5 py-2.5 bg-success/5 border-t border-success/20 flex items-center justify-between">
                    <div className="text-[11px] font-medium text-success flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        True-up line · Cost = Sale confirmed
                    </div>
                    <div className="text-[11px] font-bold text-success tabular-nums">GP: $0</div>
                </div>
            </div>

            {/* Formula note */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Calculator className="h-3.5 w-3.5 shrink-0" />
                Formula: (Sale ÷ List) − 1 · Applied to all 3 lines
            </div>

            {/* Before Strata contrast */}
            {sceneState === 'ready' && (
                <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-1 animate-in fade-in duration-500">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Before Strata</div>
                    <div className="text-xs text-foreground leading-relaxed">
                        Lauren opened Excel, manually entered (Sale ÷ List) − 1 per line, recalculated the true-up to zero GP, and verified Cost = Sale.{' '}
                        <span className="font-medium">~20 minutes per order. One formula error meant a wrong GP post.</span>
                    </div>
                </div>
            )}

            {/* Action */}
            {!applied && sceneState === 'ready' ? (
                <div className="flex justify-end animate-in fade-in duration-300">
                    <button
                        onClick={handleApply}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Apply discount to CORE
                    </button>
                </div>
            ) : applied ? (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Discount applied · NYPD-0394 updated in CORE</div>
                </div>
            ) : null}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] },
            ]} />
        </div>
    )
}
