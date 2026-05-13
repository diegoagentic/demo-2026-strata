/**
 * COMPONENT: DesignerResponseScene  (a1.2b)
 * PURPOSE: Agency Fee step 2b — Robert Chen (Miller Knoll Rep) views order
 *          confirmation Q-2026-0089 in Strata desktop platform.
 *          Desktop view: spec confirmation + document viewer (PDF + SIF) + acknowledge CTA.
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { Sparkles, CheckCircle2, Package, ArrowRight, ClipboardList, Truck, Wrench, User, FileText } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface DesignerResponseSceneProps {
    onAcknowledge?: () => void
}

const NEXT_STEPS = [
    { icon: ClipboardList, label: 'PO issuance',   desc: 'City of New York issues PO · BFI confirms ship date once received' },
    { icon: Truck,         label: 'Delivery',       desc: 'WIG warehouse · May 14–21 delivery window · 8 days free storage' },
    { icon: Wrench,        label: 'Installation',   desc: 'Walter Carey (CoNY PM) coordinating installation crew · May 14–16' },
]

const PDF_SPECS = [
    { code: 'HMI-WS-2400', name: 'Locale Open-Plan Workstation', qty: '×24', finish: 'White/Silver', unitPrice: '$2,840.00', listPrice: '$4,200.00' },
    { code: 'HMI-LS-500',  name: 'Brody WorkLounge',             qty: '×12', finish: 'Fog fabric',   unitPrice: '$1,960.00', listPrice: '$2,900.00' },
    { code: 'HMI-FU-300',  name: 'Lateral Filing Unit 3-Drawer', qty: '×6',  finish: 'Platinum',     unitPrice: '$740.00',   listPrice: '$1,100.00' },
]

const SIF_ROWS = [
    { code: 'HMI-WS-2400', desc: 'Locale Workstation 24W',  qty: 24, list: '$4,200.00', net: '$2,840.00', af: '4.0%' },
    { code: 'HMI-LS-500',  desc: 'Brody WorkLounge Fog',    qty: 12, list: '$2,900.00', net: '$1,960.00', af: '3.9%' },
    { code: 'HMI-FU-300',  desc: 'Lateral Filing 3-Drawer', qty: 6,  list: '$1,100.00', net: '$740.00',   af: '2.9%' },
]

export default function DesignerResponseScene({ onAcknowledge }: DesignerResponseSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [acknowledged, setAcknowledged] = useState(false)
    const [activeDocTab, setActiveDocTab] = useState<'pdf' | 'sif'>('pdf')

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

            {/* Document viewer — always expanded */}
            <div className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex-1">
                        Attached Documents · specs.pdf + sif.csv
                    </span>
                    <span className="text-[9px] text-muted-foreground">View only</span>
                </div>

                <div className="border-t border-border">
                        {/* Tab bar */}
                        <div className="flex border-b border-border bg-muted/20">
                            {(['pdf', 'sif'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveDocTab(tab)}
                                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                                        activeDocTab === tab
                                            ? 'text-foreground border-foreground'
                                            : 'text-muted-foreground border-transparent hover:text-foreground'
                                    }`}
                                >
                                    {tab === 'pdf' ? 'specs.pdf' : 'sif.csv'}
                                </button>
                            ))}
                        </div>

                        {/* PDF tab */}
                        {activeDocTab === 'pdf' && (
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-900">
                                {/* PDF paper */}
                                <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 p-3 space-y-2 text-[10px] font-mono">
                                    <div className="text-[8px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                        Miller Knoll · Quote Specification Sheet
                                    </div>
                                    <div className="font-bold text-zinc-800 dark:text-zinc-100 text-[11px]">
                                        DOE-2847 · NYC Dept. of Education · 52 Chambers St
                                    </div>
                                    <div className="text-zinc-500 dark:text-zinc-400 text-[9px]">
                                        Prepared by: Robert Chen · May 1, 2026 · Q-2026-0089
                                    </div>

                                    {/* Specs table */}
                                    <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
                                        <div className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                                            Product Specifications
                                        </div>
                                        <div className="space-y-1.5">
                                            {PDF_SPECS.map(item => (
                                                <div key={item.code} className="flex gap-2 items-start">
                                                    <div className="flex-1">
                                                        <div className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">
                                                            {item.code} · {item.name} {item.qty}
                                                        </div>
                                                        <div className="text-[9px] text-zinc-500 dark:text-zinc-400">
                                                            Finish: {item.finish}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">{item.unitPrice}</div>
                                                        <div className="text-[8px] text-zinc-400 dark:text-zinc-500">List {item.listPrice}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Floor plan */}
                                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 mt-1">
                                        <div className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                                            Architectural Layout · 52 Chambers St · Floor 12
                                        </div>
                                        <div
                                            className="relative border border-zinc-300 dark:border-zinc-600 rounded bg-zinc-50 dark:bg-zinc-800"
                                            style={{ height: '90px' }}
                                        >
                                            {/* Zone A — Workstations */}
                                            <div
                                                className="absolute border border-zinc-400 dark:border-zinc-500 rounded-sm bg-zinc-200/60 dark:bg-zinc-700/60 flex flex-col items-center justify-center gap-0.5"
                                                style={{ left: '2px', top: '2px', width: '52%', height: '85px' }}
                                            >
                                                <div className="text-[7px] font-bold text-zinc-600 dark:text-zinc-300">Zone A</div>
                                                <div className="text-[6px] text-zinc-500 dark:text-zinc-400">Workstations ×24</div>
                                                <div className="grid grid-cols-6 gap-0.5 mt-0.5">
                                                    {Array.from({ length: 12 }).map((_, i) => (
                                                        <div key={i} className="h-1.5 w-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-sm" />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Zone B — Lounge */}
                                            <div
                                                className="absolute border border-zinc-400 dark:border-zinc-500 rounded-sm bg-zinc-100/60 dark:bg-zinc-700/40 flex items-center justify-center"
                                                style={{ right: '2px', top: '2px', width: '45%', height: '40px' }}
                                            >
                                                <div className="text-[7px] font-bold text-zinc-600 dark:text-zinc-300">Zone B · Lounge ×12</div>
                                            </div>
                                            {/* Zone C — Filing */}
                                            <div
                                                className="absolute border border-zinc-400 dark:border-zinc-500 rounded-sm bg-zinc-100/60 dark:bg-zinc-700/40 flex items-center justify-center"
                                                style={{ right: '2px', bottom: '2px', width: '45%', height: '40px' }}
                                            >
                                                <div className="text-[7px] font-bold text-zinc-600 dark:text-zinc-300">Zone C · Filing ×6</div>
                                            </div>
                                        </div>
                                        <div className="text-[7px] text-zinc-400 dark:text-zinc-500 mt-1">
                                            NYC Dept. of Education · DOE-2847 · by Robert Chen · Miller Knoll
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[9px] text-muted-foreground mt-2 text-center">Read-only · Submitted by Robert Chen · Miller Knoll</div>
                            </div>
                        )}

                        {/* SIF tab */}
                        {activeDocTab === 'sif' && (
                            <div className="p-3 bg-zinc-100 dark:bg-zinc-900">
                                <div className="bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                                        <div className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                                            SIF · Standard Industry Format · DOE-2847
                                        </div>
                                        <div className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                            Validated by OVNIQ · May 3, 2026
                                        </div>
                                    </div>
                                    {/* Header row */}
                                    <div className="grid grid-cols-6 gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                                        {['Code', 'Description', 'Qty', 'List', 'Net', 'AF%'].map(h => (
                                            <div key={h} className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">{h}</div>
                                        ))}
                                    </div>
                                    {/* Data rows */}
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                        {SIF_ROWS.map(row => (
                                            <div key={row.code} className="grid grid-cols-6 gap-1 px-3 py-2">
                                                <div className="text-[9px] font-mono text-zinc-700 dark:text-zinc-300 col-span-1">{row.code}</div>
                                                <div className="text-[9px] text-zinc-600 dark:text-zinc-400 col-span-1">{row.desc}</div>
                                                <div className="text-[9px] text-zinc-700 dark:text-zinc-300">{row.qty}</div>
                                                <div className="text-[9px] text-zinc-500 dark:text-zinc-400">{row.list}</div>
                                                <div className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">{row.net}</div>
                                                <div className="text-[9px] text-zinc-500 dark:text-zinc-400">{row.af}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[9px] text-muted-foreground mt-2 text-center">Read-only · Validated by OVNIQ</div>
                            </div>
                        )}
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
