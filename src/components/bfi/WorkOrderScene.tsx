/**
 * COMPONENT: WorkOrderScene
 * PURPOSE: Flow 2 · Scene 5 — Work order generated for 100%-received order.
 *          NYC physical ink signature requirement prominently called out.
 *          Lauren approves for print.
 *
 * DS TOKENS: bg-card · bg-success/5 · border-border · text-amber-*
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Printer, Package } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WorkOrderSceneProps {
    onApprove?: () => void
}

export default function WorkOrderScene({ onApprove }: WorkOrderSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [approved, setApproved] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleApprove = () => {
        setApproved(true)
        setTimeout(pauseAware(() => {
            onApprove?.()
            nextStep()
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Work order card */}
            <div className="border border-border rounded-xl p-3.5 space-y-3 bg-card">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <div className="text-xs font-bold text-foreground">Work Order · DOH-0671</div>
                        <div className="text-[11px] text-muted-foreground">NYC Dept. of Health · 14 West 31st Street, NY 10001</div>
                    </div>
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                        <div className="text-muted-foreground">Items</div>
                        <div className="font-medium text-foreground mt-0.5">Lounge Seating ×8 · Work Tables ×12 · Storage ×4 · Side Chairs ×12</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Delivery window</div>
                        <div className="font-medium text-foreground mt-0.5">May 14 – May 21, 2026</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">WIG status</div>
                        <div className="flex items-center gap-1 font-medium text-success mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            100% received · 22 days in WIG
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Storage remaining</div>
                        <div className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                            <AlertTriangle className="h-3 w-3" />
                            8 days
                        </div>
                    </div>
                </div>

                {/* NYC signature requirement — prominently called out */}
                <div className="flex items-start gap-2 border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 rounded-lg px-3 py-2.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[11px]">
                        <div className="font-bold text-foreground">NYC requires physical ink signature</div>
                        <div className="text-muted-foreground mt-0.5">Print and deliver with installation drawings. Digital signatures not accepted.</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!approved ? (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Preview
                    </button>
                    <button
                        onClick={handleApprove}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Approve for print
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Work order approved · DOH-0671</div>
                        <div className="text-muted-foreground mt-0.5">Print queued · delivering to WIG with installation drawings</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.CORE_RPA, SOURCES.STRATA_AI] },
            ]} />
        </div>
    )
}
