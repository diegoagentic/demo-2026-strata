/**
 * COMPONENT: CoreEntryScene  (r1.5)
 * PURPOSE: Product Receiving step 5 — Lauren confirms 34/35 cartons in CORE.
 *          Line 24 excluded pending Omni claim resolution.
 *
 * States: 'confirming' | 'confirmed'
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, Package, AlertTriangle, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoreEntrySceneProps {
    onConfirm?: () => void
}

const SUMMARY_ROWS = [
    { label: 'PMO Number',     value: 'PMO-2026-0412' },
    { label: 'Cartons received', value: '34/35' },
    { label: 'Short-shipped',  value: 'Carton #34 · Line 24' },
    { label: 'CORE status',    value: 'Line 24 excluded' },
    { label: 'Claim',          value: 'Omni #OM-2026-0412 filed' },
]

export default function CoreEntryScene({ onConfirm }: CoreEntrySceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [confirmed, setConfirmed] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => onConfirm?.()), 800)
    }

    return (
        <div className="space-y-4">
            <ReceivingProcessBar stepId="r1.5" />

            {/* Summary card */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40 flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">CORE Entry Summary</span>
                </div>
                <div className="divide-y divide-border">
                    {SUMMARY_ROWS.map(r => (
                        <div key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                            <span className="text-[11px] text-muted-foreground">{r.label}</span>
                            <span className="text-xs font-semibold text-foreground">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Short-ship note */}
            <div className="bg-warning/5 border border-warning/30 rounded-xl px-3.5 py-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Line 24 excluded from this entry</div>
                    <div className="text-muted-foreground mt-0.5">
                        Chair Frame Assembly ×1 — excluded until Omni claim #OM-2026-0412 resolves.
                        34 of 35 cartons confirmed received.
                    </div>
                </div>
            </div>

            {!confirmed ? (
                <button
                    onClick={handleConfirm}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Receiving in Core
                </button>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">34/35 cartons confirmed in CORE</div>
                            <div className="text-muted-foreground mt-0.5">
                                PMO-2026-0412 · Line 24 flagged short-shipped · claim #OM-2026-0412 attached
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {}}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl border border-border text-muted-foreground hover:bg-muted/30 transition-colors"
                    >
                        Notify Walter
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* AS-IS contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> CORE entry required manual line-by-line input. Excluding a short-shipped item meant a separate email to accounting and a manual note. Walter heard about delivery status via phone — after the paper arrived.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
