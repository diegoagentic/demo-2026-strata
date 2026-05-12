/**
 * COMPONENT: QuoteIntakePricingScene  (a1.2)
 * PURPOSE: Agency Fee step 2 — Strata validates SIF vs CoNY contract,
 *          calculates discount automatically, tracks OmniQuote SIF cycle.
 *
 * Two-col layout:
 *   LEFT  — Quote form (pre-filled) + live discount calc
 *   RIGHT — OmniQuote SIF Status timeline + Order Tracker
 *
 * States: 'intake' | 'calculated'
 */

import { useState } from 'react'
import { Sparkles, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

const ORDER_TRACKER = [
    { id: 'Q-2026-0089', order: 'DOE-2847',  status: 'In Progress',        statusClass: 'text-ai bg-ai/10 border-ai/20' },
    { id: 'Q-2026-0078', order: 'NYPD-0394', status: 'CPR Pending',         statusClass: 'text-warning bg-warning/10 border-warning/30' },
    { id: 'Q-2026-0065', order: 'DCAS-1182', status: 'Closed',              statusClass: 'text-success bg-success/10 border-success/30' },
    { id: 'Q-2026-0051', order: 'DOH-0671',  status: 'Ack Discrepancy',     statusClass: 'text-muted-foreground bg-muted border-border' },
]

const SIF_STEPS = [
    { label: 'Upload SIF to OmniQuote',       done: true  },
    { label: 'Download corrected SIF',         done: true  },
    { label: 'Upload corrected SIF to CORE',  done: true  },
    { label: 'Labor quote pending from WIG',  done: false },
]

const SALE  = 12500
const LIST  = 20000
const DISCOUNT_PCT = ((SALE / LIST) - 1) * 100  // -37.50%

export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const [applied, setApplied] = useState(false)

    const handleApply = () => {
        setApplied(true)
        setTimeout(() => onApply?.(), 400)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 border border-ai/20 rounded-xl px-3 py-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Quote + Pricing · DOE-2847 · Q-2026-0089</div>
                    <div className="text-muted-foreground mt-0.5">
                        Strata validates the SIF against the CoNY contract and calculates the discount automatically.
                        What used to take 65 minutes in OmniQuote takes seconds.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* LEFT — Quote form + discount */}
                <div className="space-y-3">
                    {/* Quote form */}
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Quote Details · Pre-filled</span>
                        </div>
                        <div className="divide-y divide-border">
                            {[
                                { label: 'Quote #',       value: 'Q-2026-0089' },
                                { label: 'Client',        value: 'City of New York' },
                                { label: 'Contact',       value: 'Amanda Torres' },
                                { label: 'Sale Price',    value: `$${SALE.toLocaleString()}` },
                                { label: 'List Price',    value: `$${LIST.toLocaleString()}` },
                                { label: 'Agency Fee %',  value: '8%' },
                            ].map(f => (
                                <div key={f.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                    <span className="text-[11px] text-muted-foreground">{f.label}</span>
                                    <span className="text-xs font-semibold text-foreground">{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Discount calc */}
                    <div className="border border-border rounded-xl bg-card overflow-hidden">
                        <div className="px-3.5 py-2 border-b border-border bg-muted/40 flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-ai" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Discount — Auto-calculated</span>
                        </div>
                        <div className="px-3.5 py-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-mono">(Sale ÷ List) − 1</span>
                                <span className="font-mono text-foreground">({SALE.toLocaleString()} ÷ {LIST.toLocaleString()}) − 1</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Result</span>
                                <span className="text-lg font-black text-destructive tabular-nums">
                                    {DISCOUNT_PCT.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5">
                                Before Strata: ~20 min in Excel per order · one formula error = wrong GP post
                            </div>
                        </div>
                    </div>

                    {/* Contract note */}
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-success/5 border border-success/20 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">
                            SIF validated against CoNY contract — all line items within approved pricing bands
                        </p>
                    </div>
                </div>

                {/* RIGHT — SIF timeline + Order tracker */}
                <div className="space-y-3">
                    {/* SIF Status timeline */}
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">OmniQuote SIF Cycle · Q-2026-0089</span>
                        </div>
                        <div className="p-3.5 space-y-3">
                            {SIF_STEPS.map((step, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    {step.done
                                        ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                        : <Clock className="h-4 w-4 text-warning shrink-0" />
                                    }
                                    <span className={`text-xs ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.label}
                                    </span>
                                    {step.done && (
                                        <span className="ml-auto text-[9px] text-success font-bold">✓</span>
                                    )}
                                    {!step.done && (
                                        <span className="ml-auto text-[9px] text-warning font-medium">pending</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order tracker */}
                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Order Tracker · Active CoNY</span>
                        </div>
                        <div className="divide-y divide-border">
                            {ORDER_TRACKER.map(o => (
                                <div key={o.id} className="flex items-center gap-3 px-3.5 py-2.5">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-semibold text-foreground">{o.id}</div>
                                        <div className="text-[10px] text-muted-foreground">{o.order}</div>
                                    </div>
                                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${o.statusClass}`}>
                                        {o.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleApply}
                disabled={applied}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                Apply discount & continue
                <ChevronRight className="h-4 w-4" />
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
