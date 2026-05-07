/**
 * COMPONENT: CPRRelayScene
 * PURPOSE: Flow 1 · Scene 7 — Michael (Director of Strategic Accounts) reviews
 *          the pre-drafted labor revision message to Nancy Bos (MK Invoice
 *          Processor). Michael can edit, then sends with one click.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-foreground · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, Send, Edit3 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CPRRelaySceneProps {
    onSend?: () => void
    onRoleChange?: (role: string) => void
}

const ADJUSTMENTS = [
    { category: 'Carpenters',    change: '50h → 45h (−5h)',  impact: '−$1,800' },
    { category: 'OT Carpenters', change: '8h → 6h (−2h)',    impact: '−$540'   },
]

export default function CPRRelayScene({ onSend, onRoleChange }: CPRRelaySceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sent, setSent] = useState(false)
    const [editing, setEditing] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleSend = () => {
        setSent(true)
        setEditing(false)
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
                    <div className="font-bold text-foreground">CPR Relay · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata pre-drafted the labor revision message to Nancy Bos at Miller Knoll. Review and send — replacing the 1-3 day manual relay.
                    </div>
                </div>
            </div>

            {/* CPR diff summary */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Lauren's approved adjustments</div>
                </div>
                {ADJUSTMENTS.map((adj) => (
                    <div key={adj.category} className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0">
                        <div>
                            <div className="text-xs font-medium text-foreground">{adj.category}</div>
                            <div className="text-[11px] text-muted-foreground">{adj.change}</div>
                        </div>
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">{adj.impact}</div>
                    </div>
                ))}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border bg-muted/20">
                    <span className="text-[11px] font-bold text-muted-foreground">Total adjustment</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">−$2,340</span>
                </div>
            </div>

            {/* Pre-drafted message */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Draft message · to Nancy Bos (MK)</div>
                    {!sent && (
                        <button
                            onClick={() => setEditing(v => !v)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Edit3 className="h-3 w-3" />
                            {editing ? 'Done' : 'Edit'}
                        </button>
                    )}
                </div>
                <div className="px-3.5 py-3 space-y-2 text-[11px] text-foreground leading-relaxed">
                    <div className="text-muted-foreground">To: Nancy Bos [MK Invoice Processor]</div>
                    <div className="text-muted-foreground">Re: DOE-2847 — Labor Revision Required</div>
                    <div className="mt-2 pt-2 border-t border-border">
                        <p>Lauren has reconciled the CPR for order DOE-2847. Adjusted amounts:</p>
                        <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                            <li>• Carpenters: 50h → 45h (−5h, −$1,800)</li>
                            <li>• OT Carpenters: 8h → 6h (−2h, −$540)</li>
                            <li>• Total adjustment: −$2,340</li>
                        </ul>
                        <p className="mt-1.5">Please update the Miller Knoll invoice accordingly.</p>
                        <p className="mt-1.5 text-muted-foreground">— Michael Boyle, Director of Strategic Accounts</p>
                    </div>
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
                        Send to Nancy
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Message sent · Nancy Bos notified</div>
                        <div className="text-muted-foreground mt-0.5">Labor revision for DOE-2847 · MK invoice update in progress</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] },
            ]} />
        </div>
    )
}
