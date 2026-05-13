/**
 * COMPONENT: DesignerResponseScene  (a1.2b)
 * PURPOSE: Agency Fee step 2b — Robert Chen (Miller Knoll Rep) views order
 *          confirmation Q-2026-0089 in Strata desktop platform.
 *          Desktop view: spec confirmation + document viewer (PDF + SIF) + acknowledge CTA.
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { Sparkles, CheckCircle2, Package, ArrowRight, ClipboardList, Truck, Wrench, User, XCircle, AlertTriangle } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import SpecsDocViewer from './SpecsDocViewer'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

const NEXT_STEPS = [
    { icon: ClipboardList, label: 'PO issuance',   desc: 'City of New York issues PO · BFI confirms ship date once received' },
    { icon: Truck,         label: 'Delivery',       desc: 'WIG warehouse · May 14–21 delivery window · 8 days free storage' },
    { icon: Wrench,        label: 'Installation',   desc: 'Walter Carey (CoNY PM) coordinating installation crew · May 14–16' },
]

const QUICK_REASONS = ['Wrong finish', 'Qty mismatch', 'Pricing error', 'Delivery date conflict']


export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [acknowledged, setAcknowledged] = useState(false)
    const [action, setAction] = useState<'idle' | 'rejecting' | 'revisionSent'>('idle')
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [revisionNote, setRevisionNote] = useState("Spec discrepancy on Zone A workstations — finishes don't match the DOE spec sheet. Please confirm.")

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
        }), 800)
    }

    return (
        <div className="h-full overflow-y-auto bg-background">
        <div className="p-3 space-y-3">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Quote Q-2026-0089 Confirmed · DOE-2847 · NYC Dept. of Education</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Lauren DeMarco (BFI Furniture) confirmed the quote and validated all specs via OVNIQ. Robert Chen can now reference this order with his NYC DOE client contact.
                    </div>
                </div>
            </div>

            {/* Rep identity bar */}
            <div className="border border-border rounded-xl bg-card px-3.5 py-2.5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-foreground">Robert Chen · Miller Knoll Rep</div>
                    <div className="text-[10px] text-muted-foreground">Viewing order confirmation · May 6, 2026 · 9:22 AM</div>
                </div>
                <div className="text-[9px] font-bold bg-success/10 text-success border border-success/20 px-2 py-1 rounded-full uppercase tracking-wide">
                    Confirmed
                </div>
            </div>

            {/* Order summary */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                    <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Order Summary · DOE-2847</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Q-2026-0089</span>
                </div>
                <div className="divide-y divide-border/60">
                    {[
                        { label: 'Quote #',    value: 'Q-2026-0089' },
                        { label: 'Contract',   value: 'CoNY · City of New York' },
                        { label: 'Client',     value: 'NYC Dept. of Education · 52 Chambers St' },
                        { label: 'Dealer',     value: 'BFI Furniture · Lauren DeMarco' },
                        { label: 'SIF status', value: 'Validated by OVNIQ ✓' },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2">
                            <span className="text-[10px] text-muted-foreground">{r.label}</span>
                            <span className="text-[11px] font-semibold text-foreground">{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Document viewer — shared component */}
            <SpecsDocViewer />

            {/* Next steps */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 bg-muted/40 border-b border-border">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Next Steps · DOE-2847</div>
                </div>
                <div className="divide-y divide-border/60">
                    {NEXT_STEPS.map(step => (
                        <div key={step.label} className="flex items-start gap-3 px-3.5 py-2.5">
                            <step.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[11px] font-bold text-foreground">{step.label}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Before Strata */}
            {!acknowledged && action === 'idle' && (
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Before Strata:</span> Robert received a PDF by email with no confirmation system — he had no way to know if the order was approved or had spec discrepancies. Lauren had to remember to send the follow-up manually.
                    </p>
                </div>
            )}

            {/* CTA — three states: idle / rejecting / revisionSent / acknowledged */}
            {!acknowledged && action === 'idle' && (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => setAction('rejecting')}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold border border-warning/50 text-warning hover:bg-warning/5 transition-all"
                    >
                        <XCircle className="h-3.5 w-3.5" />
                        Request changes
                    </button>
                    <button
                        onClick={handleAcknowledge}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge receipt · Q-2026-0089
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {!acknowledged && action === 'rejecting' && (
                <div className="border border-warning/30 bg-warning/5 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-warning shrink-0" />
                        <span className="text-xs font-bold text-foreground">Request changes · Q-2026-0089</span>
                    </div>
                    {/* Quick reason chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {QUICK_REASONS.map(r => {
                            const active = selectedReasons.includes(r)
                            return (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setSelectedReasons(prev => {
                                            const next = active ? prev.filter(x => x !== r) : [...prev, r]
                                            if (!active) setRevisionNote(prev2 => prev2 ? `${prev2} [${r}]` : `[${r}]`)
                                            return next
                                        })
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                        active
                                            ? 'bg-warning/20 border-warning/50 text-warning'
                                            : 'border-border text-muted-foreground hover:border-warning/40 hover:text-warning'
                                    }`}
                                >
                                    {r}
                                </button>
                            )
                        })}
                    </div>
                    {/* Textarea */}
                    <textarea
                        rows={3}
                        value={revisionNote}
                        onChange={e => setRevisionNote(e.target.value)}
                        className="w-full text-[11px] bg-card border border-border rounded-lg px-3 py-2 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-warning/40"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <button
                            onClick={() => setAction('idle')}
                            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setAction('revisionSent')}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold bg-warning text-zinc-900 hover:opacity-90 transition-all"
                        >
                            Send to BFI
                            <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            )}

            {!acknowledged && action === 'revisionSent' && (
                <div className="bg-warning/5 border border-warning/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Revision requested · Q-2026-0089 · May 6 · 9:25 AM</div>
                        <div className="text-muted-foreground mt-0.5">Message sent to BFI · Lauren DeMarco · Pending response</div>
                    </div>
                </div>
            )}

            {acknowledged && (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">Receipt acknowledged · Q-2026-0089 · May 6 · 9:25 AM</div>
                        <div className="text-muted-foreground mt-0.5">Order referenced with NYC DOE client contact · loop closed in Strata</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
        </div>
    )
}
