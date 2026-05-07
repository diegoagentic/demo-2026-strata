/**
 * COMPONENT: LaborQuoteParserScene
 * PURPOSE: Flow 1 · Scene 4 — WIG free-text labor quote → structured table.
 *          Role: Director of Strategic Accounts (Michael). Reviews parsed table,
 *          can edit lines, then approves and pushes to CORE.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, FileText, Edit3 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface LaborQuoteParserSceneProps {
    onApprove?: () => void
    onRoleChange?: (role: string) => void
}

const RAW_QUOTE = `Inside delivery 4 hrs / Teamsters Local 807 — 24 hrs reg, 0 OT / Carpenters 50 hrs reg, 8 hrs OT / Strike truck: N/A (480 cubes, under 600 limit)`

const LABOR_LINES = [
    { category: 'Inside Delivery', hours: '4h',  ot: '—',  rate: '$85',   total: '$340',  note: null                                           },
    { category: 'Teamsters',       hours: '24h', ot: '—',  rate: '$110',  total: '$2,640', note: null                                          },
    { category: 'Carpenters',      hours: '50h', ot: '8h', rate: '$125',  total: '$7,250', note: null                                          },
    { category: 'Strike Truck',    hours: 'N/A', ot: '—',  rate: '—',     total: '$0',     note: '480 cubes · under 600 threshold → N/A'       },
]

export default function LaborQuoteParserScene({ onApprove, onRoleChange }: LaborQuoteParserSceneProps) {
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
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Labor Quote Parser · DOE-2847</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata parsed the WIG free-text labor quote into a structured table by union category. Review and approve before CORE entry.
                    </div>
                </div>
            </div>

            {/* Raw quote */}
            <div className="border border-border rounded-xl p-3 bg-muted/30">
                <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">WIG Quote · Raw Text</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">{RAW_QUOTE}</p>
            </div>

            {/* Parsed table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="grid grid-cols-5 gap-2 px-3.5 py-2 border-b border-border bg-muted/40">
                    {['Category', 'Hours', 'OT', 'Rate', 'Total'].map(h => (
                        <div key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right first:text-left">{h}</div>
                    ))}
                </div>
                {LABOR_LINES.map((line) => (
                    <div key={line.category} className={`border-b border-border last:border-b-0 ${line.note ? 'bg-muted/20' : ''}`}>
                        <div className="grid grid-cols-5 gap-2 px-3.5 py-2.5 items-center">
                            <div className="text-xs font-medium text-foreground">{line.category}</div>
                            <div className={`text-xs text-right tabular-nums ${line.note ? 'text-muted-foreground' : 'text-foreground'}`}>{line.hours}</div>
                            <div className={`text-xs text-right tabular-nums ${line.note ? 'text-muted-foreground' : 'text-foreground'}`}>{line.ot}</div>
                            <div className="text-xs text-muted-foreground text-right tabular-nums">{line.rate}</div>
                            <div className={`text-xs font-bold text-right tabular-nums ${line.note ? 'text-muted-foreground' : 'text-foreground'}`}>{line.total}</div>
                        </div>
                        {line.note && (
                            <div className="px-3.5 pb-2 text-[10px] text-success font-medium flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-success inline-block" />
                                {line.note}
                            </div>
                        )}
                    </div>
                ))}
                <div className="px-3.5 py-2.5 border-t border-border bg-muted/20 flex justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground">Total Labor</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">$10,230</span>
                </div>
            </div>

            {/* Actions */}
            {!approved ? (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit line
                    </button>
                    <button
                        onClick={handleApprove}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve & push to CORE
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="text-xs font-bold text-foreground">Labor quote approved · DOE-2847 updated in CORE</div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] },
            ]} />
        </div>
    )
}
