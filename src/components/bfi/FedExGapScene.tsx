/**
 * COMPONENT: FedExGapScene
 * PURPOSE: Flow 2 · Scene 2 — FedEx small-parcel gap auto-detection.
 *          Strata detects 3 items shipped via FedEx without WIG confirmation
 *          and pre-fills the POD request to Andy (HM contact).
 *          Lauren sends with one click.
 *
 * DS TOKENS: bg-card · bg-amber-50 · border-amber-* · text-amber-600
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface FedExGapSceneProps {
    onSend?: () => void
}

const GAP_ITEMS = [
    { tracking: 'FX284920', product: 'Side Chair ×1', weight: '18 lbs', status: 'No WIG confirmation' },
    { tracking: 'FX284921', product: 'Side Chair ×1', weight: '18 lbs', status: 'No WIG confirmation' },
    { tracking: 'FX284922', product: 'Side Chair ×1', weight: '18 lbs', status: 'No WIG confirmation' },
]

export default function FedExGapScene({ onSend }: FedExGapSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sent, setSent] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleSend = () => {
        setSent(true)
        setTimeout(pauseAware(() => {
            onSend?.()
            nextStep()
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">FedEx Gap Detection · DCAS-1182</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata detected 3 items shipped via FedEx small parcel without WIG confirmation — by cross-referencing OmniQuote against the WIG receiving log. POD request pre-filled.
                    </div>
                </div>
            </div>

            {/* Gap items */}
            <div className="border border-amber-200 dark:border-amber-500/30 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-500/5">
                <div className="flex items-center gap-2 px-3.5 py-2 border-b border-amber-200 dark:border-amber-500/30">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">3 items without WIG confirmation · DCAS-1182</span>
                </div>
                {GAP_ITEMS.map((item) => (
                    <div key={item.tracking} className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-amber-200/50 dark:border-amber-500/20 last:border-b-0">
                        <div>
                            <div className="text-xs font-bold text-foreground">{item.tracking}</div>
                            <div className="text-[11px] text-muted-foreground">{item.product} · {item.weight}</div>
                        </div>
                        <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{item.status}</div>
                    </div>
                ))}
            </div>

            {/* Pre-filled POD request */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">POD Request · pre-filled · to Andy (HM)</div>
                </div>
                <div className="px-3.5 py-3 space-y-1 text-[11px]">
                    <div className="text-muted-foreground">To: Andy [HMK Contact]</div>
                    <div className="text-muted-foreground">Re: POD Request — DCAS-1182</div>
                    <div className="text-muted-foreground">FO Numbers: FX284920, FX284921, FX284922</div>
                    <p className="mt-2 pt-2 border-t border-border text-foreground leading-relaxed">
                        "Please provide Proof of Delivery for the above shipments. Items expected at WIG but no receiving confirmation found."
                    </p>
                </div>
            </div>

            {/* Actions */}
            {!sent ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleSend}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send POD request
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">POD request sent · tracking 3 FedEx items</div>
                        <div className="text-muted-foreground mt-0.5">DCAS-1182 · response from HM pending</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
