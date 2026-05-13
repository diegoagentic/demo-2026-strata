/**
 * COMPONENT: DesignerResponseScene  (a1.2b)
 * PURPOSE: Agency Fee step 2b — Robert Chen (Miller Knoll Rep) views order
 *          confirmation Q-2026-0089 in Strata desktop platform.
 *          Desktop view: spec confirmation + next steps + acknowledge CTA.
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { Sparkles, CheckCircle2, Package, ArrowRight, ClipboardList, Truck, Wrench, User } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

const SPEC_ITEMS = [
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', finish: 'White/Silver', validated: true },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', finish: 'Fog fabric',   validated: true },
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  finish: 'Platinum',     validated: true },
]

const NEXT_STEPS = [
    { icon: ClipboardList, label: 'PO issuance',   desc: 'City of New York issues PO · BFI confirms ship date once received' },
    { icon: Truck,         label: 'Delivery',       desc: 'WIG warehouse · May 14–21 delivery window · 8 days free storage' },
    { icon: Wrench,        label: 'Installation',   desc: 'Walter Carey (CoNY PM) coordinating installation crew · May 14–16' },
]

export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
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
        }), 800)
    }

    return (
        <div className="space-y-4">
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

            {/* Spec confirmation — items with validation status */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 bg-muted/40 border-b border-border">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Spec Confirmation · SIF Validated</div>
                </div>
                <div className="divide-y divide-border/60">
                    {SPEC_ITEMS.map(item => (
                        <div key={item.code} className="flex items-center gap-3 px-3.5 py-2.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-medium text-foreground">{item.code} · {item.name} {item.qty}</div>
                                <div className="text-[10px] text-muted-foreground">Finish: {item.finish}</div>
                            </div>
                            <span className="text-[9px] bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 font-medium shrink-0">
                                Validated
                            </span>
                        </div>
                    ))}
                </div>
            </div>

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
            {!acknowledged && (
                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Before Strata:</span> Robert received a PDF by email with no confirmation system — he had no way to know if the order was approved or had spec discrepancies. Lauren had to remember to send the follow-up manually.
                    </p>
                </div>
            )}

            {/* CTA */}
            {!acknowledged ? (
                <div className="flex items-center justify-end">
                    <button
                        onClick={handleAcknowledge}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Acknowledge receipt · Q-2026-0089
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
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
    )
}
