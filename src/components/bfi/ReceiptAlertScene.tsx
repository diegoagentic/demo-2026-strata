/**
 * COMPONENT: ReceiptAlertScene
 * PURPOSE: Flow 2 · Scene 4 — 100% receipt alert auto-generated when DOH-0671
 *          hits full received% in CORE. Lauren acknowledges and proceeds.
 *
 * DS TOKENS: bg-card · bg-success/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface ReceiptAlertSceneProps {
    onAcknowledge?: () => void
}

export default function ReceiptAlertScene({ onAcknowledge }: ReceiptAlertSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [acknowledged, setAcknowledged] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleAcknowledge = () => {
        setAcknowledged(true)
        setTimeout(pauseAware(() => {
            onAcknowledge?.()
            nextStep()
        }), 700)
    }

    return (
        <div className="space-y-4">
            {/* Alert card */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-4 flex items-start gap-3">
                <div className="relative shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">100% received · DOH-0671</div>
                    <div className="text-xs text-muted-foreground mt-0.5">NYC Dept. of Health · 36 cartons confirmed at WIG · May 6, 2026</div>
                    <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Strata detected full receipt in CORE. Storage window: <span className="font-medium text-amber-600 dark:text-amber-400">8 days remaining</span>. Work order can now be generated.
                    </div>
                </div>
            </div>

            {/* Storage urgency */}
            <div className="border border-amber-200 dark:border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 bg-amber-50 dark:bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="text-xs">
                    <div className="font-bold text-foreground">Storage alert · 22 of 30 days used</div>
                    <div className="text-muted-foreground mt-0.5">8 days remaining before billable storage — urgent work order coordination required</div>
                </div>
            </div>

            {/* What happens next */}
            <div className="border border-border rounded-xl p-3.5 bg-card space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Next steps unlocked</div>
                <div className="space-y-1.5">
                    {[
                        'Generate work order with NYC signature requirement',
                        'Notify Walter (CoNY PM) before paper arrives',
                        'Monitor storage countdown — coordinate installation',
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <ArrowRight className="h-3 w-3 text-ai shrink-0" />
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action */}
            {!acknowledged ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleAcknowledge}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge · proceed to work order
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Alert acknowledged · generating work order</div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
