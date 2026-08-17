/**
 * COMPONENT: F4_p43_ManualLinesScene (Projex · p4.3)
 * PURPOSE: Coordinator adds 26 S&H manual entries · EditableLineTable con add-row.
 *          Alamir $19 flat rule · Nelson prepaid+add · Teknion consolidated.
 *          Design fee 8% recomputed live.
 *
 * SHAPE · EditableLineTable con add-row affordance (F4 secondary)
 * REUSE · mbi/SIFToCOREPreview + FreightTariffPanel patterns
 */

import { useState } from 'react'
import {
    Truck, Plus, CheckCircle2, ArrowRight, Edit3, Trash2,
    Percent, DollarSign, Sparkles,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_PIF_LINES } from '../../../config/profiles/projex-data/mwhPif'

export default function F4_p43_ManualLinesScene() {
    const { nextStep } = useDemo()

    const snhLines = MWH_PIF_LINES.filter(l => l.isSnH)
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set(snhLines.map(l => l.lineNumber)))
    const [customLines, setCustomLines] = useState<{ id: string; description: string; amount: number }[]>([])

    const handleRemove = (lineNumber: number) => {
        setAddedIds(prev => {
            const next = new Set(prev)
            next.delete(lineNumber)
            return next
        })
    }

    const handleAddCustom = () => {
        const id = `CUS-${Date.now()}`
        setCustomLines(prev => [...prev, { id, description: 'New surcharge line', amount: 0 }])
    }

    const activeSnH = snhLines.filter(l => addedIds.has(l.lineNumber))
    const snhTotal = activeSnH.reduce((s, l) => s + l.totalPrice, 0) + customLines.reduce((s, l) => s + l.amount, 0)
    const productSubtotal = 82000
    const designFee = productSubtotal * 0.08
    const grandTotal = productSubtotal + snhTotal + designFee

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                    <span>Order &amp; PO dispatch · step 3</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <Truck className="h-3 w-3" aria-hidden="true" /> Manual entries
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    S&amp;H manual entries · freight per vendor + surcharges + design fee
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    26 shipping-and-handling lines · Alamir $19 flat · Nelson prepaid+add · Teknion consolidated. Design fee 8% recomputed live.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
                {/* Editable S&H table */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            S&amp;H editable table · Coordinator owns
                        </span>
                        <button
                            onClick={handleAddCustom}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold bg-primary/15 hover:bg-primary/25 text-foreground rounded-lg px-2 py-1 transition-colors"
                        >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                            Add custom line
                        </button>
                    </div>
                    <div className="divide-y divide-border">
                        <div className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span>#</span>
                            <span>Description</span>
                            <span>Vendor</span>
                            <span className="text-right">Amount</span>
                            <span className="text-right">Qty</span>
                            <span></span>
                        </div>
                        {activeSnH.map(l => (
                            <div key={l.lineNumber} className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 text-xs items-center">
                                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{l.lineNumber}</span>
                                <span className="text-foreground truncate">{l.description}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">{l.vendorCode}</span>
                                <span className="text-right text-foreground font-semibold tabular-nums">${l.totalPrice.toLocaleString()}</span>
                                <span className="text-right text-muted-foreground tabular-nums">{l.qty}</span>
                                <button
                                    onClick={() => handleRemove(l.lineNumber)}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                    aria-label="Remove line"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                        {customLines.map(l => (
                            <div key={l.id} className="grid grid-cols-[36px_1fr_60px_100px_60px_28px] px-4 py-2 text-xs items-center bg-primary/5 animate-in fade-in duration-300">
                                <Edit3 className="h-3 w-3 text-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    defaultValue={l.description}
                                    className="text-foreground bg-transparent border-b border-primary/40 focus:outline-none focus-visible:border-primary"
                                />
                                <span className="text-[10px] font-mono text-muted-foreground">—</span>
                                <input
                                    type="number"
                                    defaultValue={0}
                                    className="text-right tabular-nums bg-transparent border-b border-primary/40 focus:outline-none focus-visible:border-primary"
                                />
                                <span className="text-right text-muted-foreground tabular-nums">1</span>
                                <button
                                    onClick={() => setCustomLines(prev => prev.filter(x => x.id !== l.id))}
                                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground flex-1">
                            {activeSnH.length + customLines.length} of 26 S&amp;H entries active
                        </span>
                        <span className="text-xs text-foreground font-semibold tabular-nums">
                            S&amp;H subtotal ${snhTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Totals panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">MWH totals · live recompute</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Product subtotal (300 lines)</span>
                            <span className="text-foreground tabular-nums">${productSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">S&amp;H subtotal</span>
                            <span className="text-foreground tabular-nums">${snhTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Percent className="h-3 w-3" aria-hidden="true" />
                                Design fee (8% of product)
                            </span>
                            <span className="text-foreground tabular-nums">${designFee.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-foreground font-bold">Grand total</span>
                            <span className="text-foreground font-bold tabular-nums text-lg">${grandTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={nextStep}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Generate 26 PO drafts
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Freight rules · per vendor</div>
                    <div className="text-muted-foreground mt-0.5">
                        Alamir: $19 flat &lt;$150 · Nelson: prepaid+add · Teknion: consolidated · HBF: lift-gate. Coordinator overrides cuando promotion or exception. Never auto-set (FC6 · human control preserved).
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Manual lines · S&H per vendor → totals recompute" />
        </div>
    )
}
