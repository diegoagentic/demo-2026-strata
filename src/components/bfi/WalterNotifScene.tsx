/**
 * COMPONENT: WalterNotifScene
 * PURPOSE: Flow 2 · Scene 6 — Walter (CoNY PM, client side) receives a
 *          Strata notification on his phone before the paper work order arrives.
 *          Rendered inside MobileDeviceFrame on a bg-zinc-950 background.
 *
 *          States: 'locked' → tap → 'app' → confirm
 *
 *          Order: PMO-2026-0412 · NYC Dept. of Education
 *          34/35 cartons confirmed · Carton #34 claim OM-2026-0412 filed
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Calendar, Package, ChevronDown, ChevronUp, Bell } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

interface WalterNotifSceneProps {
    onConfirm?: () => void
    onRoleChange?: (role: string) => void
}

type WalterState = 'locked' | 'app'

export default function WalterNotifScene({ onConfirm, onRoleChange }: WalterNotifSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [walterState, setWalterState] = useState<WalterState>('locked')
    const [confirmed, setConfirmed]     = useState(false)
    const [claimExpanded, setClaimExpanded] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleUnlock = () => setWalterState('app')

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 800)
    }

    // ── Lock screen ───────────────────────────────────────────────────────────
    if (walterState === 'locked') {
        return (
            <div
                className="flex flex-col h-full bg-gradient-to-b from-zinc-800 to-zinc-900 cursor-pointer select-none"
                onClick={handleUnlock}
            >
                {/* Time + date */}
                <div className="flex flex-col items-center pt-10 pb-6">
                    <div className="text-5xl font-thin text-white tracking-tight">9:04</div>
                    <div className="text-sm text-zinc-400 mt-1">Tuesday, May 6</div>
                </div>

                {/* Notification banner */}
                <div className="mx-3 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-zinc-700/80 backdrop-blur rounded-2xl px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                                <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                            <span className="text-[11px] font-bold text-white">Strata</span>
                            <span className="text-[10px] text-zinc-400 ml-auto">now</span>
                        </div>
                        <div className="text-xs font-semibold text-white">PMO-2026-0412 · 34 of 35 cartons confirmed</div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed">
                            NYC Dept. of Education · Ready for scheduling · Carton #34 claim filed
                        </div>
                    </div>
                </div>

                {/* Swipe hint */}
                <div className="flex-1 flex flex-col items-center justify-end pb-10">
                    <div className="text-[11px] text-zinc-500 animate-pulse">Tap to view</div>
                </div>
            </div>
        )
    }

    // ── App state ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-background">
            {/* In-app header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                        <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Strata</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground">WC</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Walter C.</span>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Main notification */}
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">PMO-2026-0412 · 34 of 35 cartons confirmed at WIG</div>
                        <div className="text-muted-foreground mt-1 leading-relaxed italic text-[11px]">
                            "Physical work order in transit — pre-coordination can begin now."
                        </div>
                        <div className="text-muted-foreground mt-1 text-[10px]">3 minutes ago · via Strata</div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="border border-border rounded-xl p-3 space-y-2.5 bg-card">
                    <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                            <div className="text-[11px] font-bold text-foreground">NYC Dept. of Education</div>
                            <div className="text-[10px] text-muted-foreground">52 Chambers St, New York, NY 10007</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                            <div className="text-muted-foreground text-[10px]">Items confirmed</div>
                            <div className="font-medium text-foreground mt-0.5 text-[10px]">Workstations ×24<br />Lounge Seating ×12</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-[10px]">WIG status</div>
                            <div className="font-medium text-success mt-0.5 flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="h-2.5 w-2.5" /> 34/35 confirmed
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border pt-2">
                        <Calendar className="h-3 w-3 shrink-0" />
                        Delivery window: May 14 – May 21, 2026
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        8 storage days remaining — coordinate crew before May 14
                    </div>
                </div>

                {/* Short-ship claim — expandable */}
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <button
                        onClick={() => setClaimExpanded(v => !v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/40 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="text-[10px] font-bold text-foreground">Carton #34 · Short-ship claim filed</span>
                        </div>
                        {claimExpanded
                            ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        }
                    </button>
                    {claimExpanded && (
                        <div className="px-3 pb-3 space-y-1.5 border-t border-border animate-in fade-in duration-200">
                            <div className="pt-2 text-[10px] text-muted-foreground space-y-1">
                                <div>Item: Line 24 · Chair Frame Assembly ×1</div>
                                <div>Claim: Omni #OM-2026-0412 · filed May 11</div>
                                <div>POD request sent to Andy (Herman Miller) · May 11 · 8:06 AM</div>
                                <div className="text-amber-600 dark:text-amber-400 font-medium">Status: awaiting response · excluded from this delivery</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Before Strata */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-[10px] text-muted-foreground">
                    Before Strata: Walter only found out when Lauren brought him a printed copy in person — always after the fact.
                </div>
            </div>

            {/* Fixed bottom action */}
            <div className="border-t border-border p-3 bg-card">
                {!confirmed ? (
                    <button
                        onClick={handleConfirm}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm · scheduling installation crew
                    </button>
                ) : (
                    <div className="space-y-2 animate-in fade-in duration-300">
                        <div className="bg-success/5 border border-success/30 rounded-xl p-2.5 flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <div className="text-[11px]">
                                <div className="font-bold text-foreground">Crew confirmed · May 14–16</div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                    "Crew available May 14–16. Confirmed with NYC DOE agency."
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                    May 6 · 9:45 AM · loop closed without a phone call
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
