/**
 * COMPONENT: OrderTrackerScene
 * PURPOSE: Flow 1 · Scene 5 — Unified order tracker (CORE + OmniQuote + R Drive).
 *          Brief scene — shows consolidated status, Lauren confirms.
 *
 * DS TOKENS: bg-card · bg-success/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Clock, Package, FileCheck } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface OrderTrackerSceneProps {
    onConfirm?: () => void
}

const TRACKER_ROWS = [
    { system: 'CORE',       status: 'PO received · order entered', icon: 'check',   date: 'May 2, 2026'  },
    { system: 'OmniQuote',  status: 'EDI acknowledged · order confirmed', icon: 'check',   date: 'May 2, 2026'  },
    { system: 'R Drive',    status: 'Tracking sheet updated · delivery May 14', icon: 'check',   date: 'May 3, 2026'  },
    { system: 'WIG',        status: 'Order in transit · receiving not started', icon: 'clock',   date: 'Pending'      },
]

export default function OrderTrackerScene({ onConfirm }: OrderTrackerSceneProps) {
    const { nextStep, isPaused } = useDemo()
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
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 700)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Order Tracker · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata consolidated CORE, OmniQuote, and the R Drive tracking sheet into a single live view.
                    </div>
                </div>
            </div>

            {/* Order header */}
            <div className="border border-border rounded-xl p-3.5 bg-card">
                <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <div className="text-xs font-bold text-foreground">DOE-2847 · NYC Dept. of Education</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">PO 18082-27619 · Delivery May 14, 2026 · $48,200</div>
                    </div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2 py-0.5">
                        Receiving pending
                    </div>
                </div>
            </div>

            {/* System status rows */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {TRACKER_ROWS.map((row) => (
                    <div key={row.system} className="flex items-center gap-3 px-3.5 py-3 bg-card">
                        <div className="shrink-0">
                            {row.icon === 'check'
                                ? <CheckCircle2 className="h-4 w-4 text-success" />
                                : <Clock className="h-4 w-4 text-amber-500" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground">{row.system}</div>
                            <div className="text-[11px] text-muted-foreground">{row.status}</div>
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums shrink-0">{row.date}</div>
                    </div>
                ))}
            </div>

            {/* Action */}
            {!confirmed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <FileCheck className="h-3.5 w-3.5" />
                        Confirm order status
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Order status confirmed · DOE-2847 on track</div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_PO, SOURCES.CORE_AR] },
            ]} />
        </div>
    )
}
