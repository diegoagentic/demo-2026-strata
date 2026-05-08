/**
 * COMPONENT: WalterNotifScene
 * PURPOSE: Flow 2 · Scene 6 — Walter (CoNY Project Manager) receives digital
 *          notification before paper work order arrives. He can see items,
 *          delivery window, and storage urgency — pre-coordinating the crew.
 *          Walter confirms, then Lauren closes the loop.
 *
 * DS TOKENS: bg-card · bg-success/5 · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Calendar, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WalterNotifSceneProps {
    onConfirm?: () => void
    onRoleChange?: (role: string) => void
}

export default function WalterNotifScene({ onConfirm, onRoleChange }: WalterNotifSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [confirmed, setConfirmed]         = useState(false)
    const [claimExpanded, setClaimExpanded] = useState(false)

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
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Notification received */}
            <div className="bg-success/5 border border-success/30 rounded-xl p-3.5 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <div className="text-xs">
                    <div className="font-bold text-foreground">Notification from Strata · DOH-0671</div>
                    <div className="text-muted-foreground mt-1 leading-relaxed italic">
                        "DOH-0671 — NYC Dept. of Health — 100% received at WIG. Delivery available May 14–21. 8 storage days remaining. Physical work order in transit — pre-coordination can begin."
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px]">Received 3 minutes ago · via Microsoft Graph</div>
                </div>
            </div>

            {/* Order detail for Walter */}
            <div className="border border-border rounded-xl p-3.5 space-y-3 bg-card">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                        <div className="text-xs font-bold text-foreground">DOH-0671 · NYC Dept. of Health</div>
                        <div className="text-[11px] text-muted-foreground">14 West 31st Street, New York, NY 10001</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                        <div className="text-muted-foreground">Items</div>
                        <div className="font-medium text-foreground mt-0.5">Lounge ×8 · Tables ×12 · Storage ×4 · Chairs ×12</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">WIG status</div>
                        <div className="font-medium text-success mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> 100% received
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border pt-2.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Delivery window: May 14 – May 21, 2026
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    8 storage days remaining — coordinate crew before May 14
                </div>
            </div>

            {/* Second notification — FedEx claim in progress (DCAS-1182) */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <button
                    onClick={() => setClaimExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="text-[11px] font-bold text-foreground">Also notified · FedEx claim in progress · DCAS-1182</span>
                    </div>
                    {claimExpanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </button>
                {claimExpanded && (
                    <div className="px-3.5 pb-3.5 space-y-2 border-t border-border animate-in fade-in duration-200">
                        <div className="pt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                            <div><span className="text-muted-foreground">Items: </span><span className="text-foreground font-medium">FX284920 · FX284921 · FX284922</span></div>
                            <div><span className="text-muted-foreground">Product: </span><span className="text-foreground">Side Chair ×3</span></div>
                            <div><span className="text-muted-foreground">POD request: </span><span className="text-foreground">Sent to Andy (HM) · May 6 · 8:06 AM</span></div>
                            <div><span className="text-muted-foreground">Status: </span><span className="text-amber-600 dark:text-amber-400 font-medium">Awaiting response · 1–2 days</span></div>
                        </div>
                        <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5">
                            You requested visibility on claims — this order has an open FedEx gap
                        </div>
                    </div>
                )}
            </div>

            {/* Before Strata contrast */}
            <div className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-[11px] text-muted-foreground">
                Before Strata: Lauren called Walter → Walter called the agency → Lauren called Walter back · no digital record
            </div>

            {/* Action */}
            {!confirmed ? (
                <div className="flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm · scheduling installation crew
                    </button>
                </div>
            ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Walter confirmed · crew scheduling in progress</div>
                            <div className="text-muted-foreground mt-0.5">DOH-0671 · pre-paper coordination · 8 days ahead of storage deadline</div>
                        </div>
                    </div>

                    {/* Digital record of the loop */}
                    <div className="border border-border rounded-xl p-3.5 bg-card space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Loop closed digitally</div>
                        <div className="text-[11px] text-muted-foreground italic leading-relaxed">
                            "Crew available May 14–16. Confirmed with NYC DOH agency."
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            Walter replied · May 6 · 9:45 AM · Lauren received · loop closed without a phone call
                        </div>
                        <div className="text-[10px] text-muted-foreground border-t border-border pt-2 mt-1">
                            Before Strata: Lauren called Walter → Walter called the agency → Lauren called Walter back
                        </div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
