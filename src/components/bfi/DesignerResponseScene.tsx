/**
 * COMPONENT: DesignerResponseScene  (a1.2b)
 * PURPOSE: Agency Fee step 2b — Robert Chen (Miller Knoll designer) receives
 *          a Strata notification confirming order Q-2026-0089 for DOE-2847.
 *          Rendered inside MobileDeviceFrame on bg-zinc-950 (same pattern as r1.6).
 *
 * States: 'locked' → tap → 'app' → acknowledge
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, CheckCircle2, Package } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

type DesignerState = 'locked' | 'app'

const ORDER_ROWS = [
    { label: 'Quote #',      value: 'Q-2026-0089' },
    { label: 'Contract',     value: 'CoNY · City of New York' },
    { label: 'Status',       value: 'Processing' },
]

const ITEMS = [
    'Workstations ×24',
    'Lounge Seating ×12',
    'Filing Units ×6',
]

export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [designerState, setDesignerState] = useState<DesignerState>('locked')
    const [acknowledged, setAcknowledged] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleAcknowledge = () => {
        setAcknowledged(true)
        setTimeout(pauseAware(() => onAcknowledge?.()), 800)
    }

    // ── Lock screen ───────────────────────────────────────────────────────────
    if (designerState === 'locked') {
        return (
            <div
                className="flex flex-col h-full bg-gradient-to-b from-zinc-800 to-zinc-900 cursor-pointer select-none"
                onClick={() => setDesignerState('app')}
            >
                <div className="flex flex-col items-center pt-10 pb-6">
                    <div className="text-5xl font-thin text-white tracking-tight">9:22</div>
                    <div className="text-sm text-zinc-400 mt-1">Tuesday, May 6</div>
                </div>

                <div className="mx-3 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="bg-zinc-700/80 backdrop-blur rounded-2xl px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                                <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                            <span className="text-[11px] font-bold text-white">Strata</span>
                            <span className="text-[10px] text-zinc-400 ml-auto">now</span>
                        </div>
                        <div className="text-xs font-semibold text-white">Q-2026-0089 confirmed · DOE-2847 en proceso</div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed">
                            Lauren está procesando tu solicitud · BFI Furniture
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-end pb-10">
                    <div className="text-[11px] text-zinc-500 animate-pulse">Tap to view</div>
                </div>
            </div>
        )
    }

    // ── App state ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                        <Bell className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Strata</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground">RC</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Robert C. · Miller Knoll</span>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Main notification */}
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Order Q-2026-0089 confirmed · DOE-2847</div>
                        <div className="text-muted-foreground mt-0.5 leading-relaxed">
                            Lauren DeMarco has confirmed your order and is working on the proposal.
                        </div>
                        <div className="text-muted-foreground mt-1 text-[10px]">BFI Furniture · 3 minutes ago · via Strata</div>
                    </div>
                </div>

                {/* Order details */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                            <div className="text-[11px] font-bold text-foreground">DOE-2847 · NYC Dept. of Education</div>
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {ORDER_ROWS.map(r => (
                            <div key={r.label} className="flex items-center justify-between gap-3 px-3 py-2">
                                <span className="text-[10px] text-muted-foreground">{r.label}</span>
                                <span className="text-[11px] font-semibold text-foreground">{r.value}</span>
                            </div>
                        ))}
                        <div className="px-3 py-2">
                            <div className="text-[10px] text-muted-foreground mb-1">Items confirmed</div>
                            <div className="flex flex-wrap gap-1">
                                {ITEMS.map(item => (
                                    <span key={item} className="text-[10px] bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 font-medium">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next step */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Next step</div>
                    <div className="text-[11px] text-foreground">
                        Lauren will confirm ship date once the Purchase Order from the city is issued.
                    </div>
                </div>

                {/* Before Strata */}
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Robert waited 1–2 business days for Lauren's confirmation email — no order number, no system visibility. Lauren had to remember to send the follow-up manually.
                </div>
            </div>

            {/* Fixed bottom CTA */}
            <div className="border-t border-border p-3 bg-card">
                {!acknowledged ? (
                    <button
                        onClick={handleAcknowledge}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge &amp; close
                    </button>
                ) : (
                    <div className="bg-success/5 border border-success/30 rounded-xl p-2.5 flex items-start gap-2 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <div className="text-[11px]">
                            <div className="font-bold text-foreground">Acknowledged · Q-2026-0089 · May 6 · 9:25 AM</div>
                            <div className="text-muted-foreground text-[10px] mt-0.5">
                                Order referenced with NYC Dept. of Education client · loop closed
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
