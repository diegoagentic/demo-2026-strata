/**
 * COMPONENT: F4_p42_PifParseScene (Projex · p4.2)
 * PURPOSE: Auto · PIF parse vertical · 24 sample lines of the 300 · cost/margin/
 *          design-fee/total-price columns · AI lot line para Walls (WC2).
 *          Staged reveal · per-cell OCR confidence · Coordinator corrections.
 *
 * SHAPE · vertical line parser (F4 primary shape · anti-collision con F1 row-diff)
 * REUSE · UI-Dealer/pd-to-sif/PDtoSIF shape (lifted) · mbi/SIFParserPreview
 * NOTIF · dispatchea `projex:pif-parsed` on complete
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, FileText, Loader2, CheckCircle2, ArrowRight,
    Ruler, Zap, Percent, DollarSign,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_PIF_LINES, MWH_TOTALS } from '../../../config/profiles/projex-data/mwhPif'
// F83.N · Diego 2026-08-21 · header slim to prod ComparisonReviewModal
// shape (2 rows · icon + title + status pill · muted meta strip) + table
// styling closer to prod DocumentReviewModal Line Items tab (borderless
// header row + tabular-nums monetary alignment). Big h1 + long subtitle
// removed · same pattern established for F1_p1.3 (F83.I) and F1_p1.5 (F83.J).

export default function F4_p42_PifParseScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const [revealed, setRevealed] = useState(0)
    const [done, setDone] = useState(false)

    // Show first 14 product lines (skip S&H · those are step p4.3)
    const productLines = MWH_PIF_LINES.filter(l => !l.isSnH).slice(0, 14)

    useEffect(() => {
        if (revealed < productLines.length) {
            const cancel = pauseAwareTimeout(() => setRevealed(n => n + 1), 320)
            return cancel
        }
        if (!done) {
            const cancel = pauseAwareTimeout(() => {
                setDone(true)
                window.dispatchEvent(new CustomEvent('projex:pif-parsed'))
            }, 700)
            return cancel
        }
    }, [revealed, done, productLines.length, pauseAwareTimeout])

    const revealedLines = productLines.slice(0, revealed)
    const totalSoFar = revealedLines.reduce((s, l) => s + l.totalPrice, 0)
    const walllsCount = revealedLines.filter(l => l.isAiLotLine).length
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* F83.N · slim header · prod ComparisonReviewModal shape (row 1
                icon + short title + status pill · row 2 muted meta strip). */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h2 className="text-base font-bold text-foreground">PIF-to-Order parse · MWH residential</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? 'bg-success/15 text-success' : 'bg-ai-light text-ai'}`}>
                        {done
                            ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Parsed</>
                            : <><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Parsing</>}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Source: <span className="font-mono text-foreground font-semibold">MWH_PIF_2026-08-14.xlsx</span></span>
                    <span>·</span>
                    <span className="tabular-nums">{revealed}/{productLines.length} sample lines · 300 total</span>
                    <span>·</span>
                    <span className="tabular-nums">{walllsCount} AI lot lines (Walls WC2)</span>
                    <span>·</span>
                    <span className="tabular-nums">${totalSoFar.toLocaleString()} so far</span>
                </div>
            </div>

            {/* Vertical parser table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        MWH_PIF_2026-08-14.xlsx · vertical extraction
                    </span>
                    {done ? (
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                            <CheckCircle2 className="h-3 w-3 inline mr-0.5" aria-hidden="true" />
                            {productLines.length} sample lines · 300 total
                        </span>
                    ) : (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ai">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            Parsing…
                        </span>
                    )}
                </div>
                <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
                    <div className="grid grid-cols-[36px_1fr_80px_60px_80px_80px_80px_100px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0">
                        <span>#</span>
                        <span>Item · description</span>
                        <span>Vendor</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Cost</span>
                        <span className="text-right">Margin</span>
                        <span className="text-right">Design fee</span>
                        <span className="text-right">Total</span>
                    </div>
                    {revealedLines.map(l => (
                        <div
                            key={l.lineNumber}
                            className={`
                                grid grid-cols-[36px_1fr_80px_60px_80px_80px_80px_100px] px-4 py-2 text-xs items-center animate-in fade-in slide-in-from-left-1 duration-300
                                ${l.isAiLotLine ? 'bg-warning/5 border-l-2 border-l-warning' : ''}
                            `}
                        >
                            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{l.lineNumber}</span>
                            <div className="min-w-0">
                                <div className="text-foreground font-medium truncate">{l.description}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground font-mono truncate">{l.itemCode}</span>
                                    {l.isAiLotLine && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-warning/10 text-warning rounded px-1">
                                            AI lot line
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{l.vendorCode}</span>
                            <span className="text-right text-foreground tabular-nums">{l.qty}</span>
                            <span className="text-right text-foreground tabular-nums">${l.cost}</span>
                            <span className="text-right text-muted-foreground tabular-nums">{l.margin}%</span>
                            <span className="text-right text-muted-foreground tabular-nums">{l.designFee}%</span>
                            <div className="text-right">
                                <span className="text-foreground font-semibold tabular-nums">${l.totalPrice.toLocaleString()}</span>
                                {l.conf !== undefined && (
                                    <div className={`text-[9px] tabular-nums ${
                                        l.conf >= 95 ? 'text-success' : l.conf >= 90 ? 'text-warning' : 'text-destructive'
                                    }`}>
                                        {l.conf}%
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {done && (
                    <div className="px-4 py-3 border-t border-border bg-success/5 flex items-center gap-2 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        <span className="text-xs text-foreground flex-1">
                            Sample parsed · full 300 lines available en NetSuite draft order · next step S&amp;H manual entries.
                        </span>
                        <button
                            onClick={nextStep}
                            className="inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-1.5 px-3 hover:opacity-80 transition-opacity"
                        >
                            Add manual S&amp;H lines
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Percent className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">"AI lot line" · WC2 fix</div>
                    <div className="text-muted-foreground mt-0.5">
                        Walls partitions traditionally line-by-line in Excel · Strata groups panel-type A · type B · trim strips into AI lot lines. Reduces Coordinator\'s 300-line touch time significantly.
                    </div>
                </div>
            </div>

        </div>
    )
}
