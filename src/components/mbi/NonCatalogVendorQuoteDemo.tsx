/**
 * COMPONENT: NonCatalogVendorQuoteDemo
 * PURPOSE: Simulates Strata reading an Allsteel vendor quote (PDF) for a
 *          flagged non-catalog item and generating a structured SIF entry —
 *          removing manual re-entry for the PC team.
 *
 *          Layout when running/done: two-column — left = processing steps +
 *          SIF entry card, right = vendor quote PDF mockup (zones highlight
 *          as extraction progresses, mirroring PoExtractionPreview pattern).
 *
 *          State machine: idle → running → done → accepted
 *
 * PROPS: onResolved — called when PC accepts the generated SIF entry
 *
 * USED BY: QuoteValidationScene (inline, not in a sheet)
 */

import { useState, useEffect } from 'react'
import { Play, Loader2, CheckCircle2, FileText, Sparkles, Check, Pencil, X, Save } from 'lucide-react'
import { usePauseAware } from '../../context/usePauseAware'
import MBIDetailSheet from './MBIDetailSheet'

const QUOTE_STEPS = [
    'Allsteel vendor quote received · PDF attachment detected via Teams',
    'AI reading quote · extracting SKU · unit price · lead time · MOQ',
    'SIF entry generated · qty 16 · $215/unit · ready for PC review',
]

const GENERATED_ENTRY = {
    sku: 'AS-ACST-OAK-4824',
    description: 'Acoustic panel · oak veneer 48×24',
    qty: 16,
    unitPrice: 215,
    leadWeeks: 6,
    moq: 4,
    source: 'Allsteel vendor quote · received via Teams · Apr 29 2026',
}

type Phase = 'idle' | 'running' | 'done' | 'accepted'

interface SIFAdjust {
    qty: number
    unitPrice: number
    leadWeeks: number
}

interface Props {
    onResolved: () => void
}

export default function NonCatalogVendorQuoteDemo({ onResolved }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [stepsDone, setStepsDone] = useState(0)
    const [adjustOpen, setAdjustOpen] = useState(false)
    const [overrides, setOverrides] = useState<Partial<SIFAdjust>>({})
    const { pauseAwareTimeout } = usePauseAware()

    const entry = {
        ...GENERATED_ENTRY,
        qty: overrides.qty ?? GENERATED_ENTRY.qty,
        unitPrice: overrides.unitPrice ?? GENERATED_ENTRY.unitPrice,
        leadWeeks: overrides.leadWeeks ?? GENERATED_ENTRY.leadWeeks,
    }

    const handleStart = () => {
        setPhase('running')
        setStepsDone(0)
    }

    useEffect(() => {
        if (phase !== 'running') return
        if (stepsDone < QUOTE_STEPS.length) {
            return pauseAwareTimeout(() => setStepsDone(s => s + 1), 900)
        } else {
            return pauseAwareTimeout(() => setPhase('done'), 400)
        }
    }, [phase, stepsDone, pauseAwareTimeout])

    const handleAccept = () => {
        setPhase('accepted')
        onResolved()
    }

    if (phase === 'idle') {
        return (
            <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-zinc-900 bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm mt-3"
            >
                <Play className="h-4 w-4" />
                Watch Strata process the vendor quote
            </button>
        )
    }

    if (phase === 'accepted') {
        return (
            <div className="mt-3 bg-success/10 dark:bg-success/15 border border-success/30 rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Vendor quote accepted · SIF entry updated</div>
                    <div className="text-muted-foreground mt-0.5">
                        NC-004 · {entry.qty} × ${entry.unitPrice.toLocaleString()} · ${(entry.qty * entry.unitPrice).toLocaleString()} confirmed · no re-entry needed
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                {/* Left — processing steps + SIF entry */}
                <div className="space-y-3">
                    <div className="rounded-xl border bg-ai/5 dark:bg-ai/10 border-ai/30 p-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                            {phase === 'done'
                                ? <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                                : <Loader2 className="h-3.5 w-3.5 text-ai shrink-0 animate-spin" />
                            }
                            <span className="text-[10px] font-bold text-ai uppercase tracking-wider">
                                {phase === 'done' ? 'Quote processed · SIF entry ready' : 'Processing vendor quote…'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            {QUOTE_STEPS.map((step, i) => {
                                const done = phase === 'done' || i < stepsDone
                                const running = phase === 'running' && i === stepsDone
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2 text-[11px] transition-opacity duration-200 ${done || running ? 'opacity-100' : 'opacity-20'}`}
                                    >
                                        {done
                                            ? <Check className="h-3 w-3 text-ai shrink-0" />
                                            : <Loader2 className="h-3 w-3 text-ai shrink-0 animate-spin" />
                                        }
                                        <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{step}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Generated SIF entry — revealed when done */}
                    {phase === 'done' && (
                        <>
                            <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Generated SIF entry · PC review</span>
                                    {Object.keys(overrides).length > 0 && (
                                        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai/15 text-ai uppercase tracking-wider">Adjusted</span>
                                    )}
                                </div>
                                <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                                    <SIFRow label="SKU" value={entry.sku} mono />
                                    <SIFRow label="Description" value={entry.description} />
                                    <SIFRow label="Qty" value={String(entry.qty)} />
                                    <SIFRow label="Unit price" value={`$${entry.unitPrice.toLocaleString()}`} highlight />
                                    <SIFRow label="Line total" value={`$${(entry.qty * entry.unitPrice).toLocaleString()}`} highlight />
                                    <SIFRow label="Lead time" value={`${entry.leadWeeks} weeks · MOQ ${entry.moq}`} />
                                    <div className="col-span-2 pt-1 border-t border-border mt-1">
                                        <span className="text-[10px] text-muted-foreground italic">{entry.source}</span>
                                    </div>
                                </div>
                                <div className="px-3 pb-3 flex items-center gap-2">
                                    <button
                                        onClick={handleAccept}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Accept SIF entry
                                    </button>
                                    <button
                                        onClick={() => setAdjustOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-background dark:bg-zinc-900 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        Adjust
                                    </button>
                                    <span className="text-[10px] text-muted-foreground ml-auto">Confidence 94%</span>
                                </div>
                            </div>
                            <SIFAdjustSheet
                                isOpen={adjustOpen}
                                current={entry}
                                onClose={() => setAdjustOpen(false)}
                                onSave={(adj) => { setOverrides(adj); setAdjustOpen(false) }}
                            />
                        </>
                    )}
                </div>

                {/* Right — vendor quote PDF mockup */}
                <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Vendor quote · PDF source
                    </div>
                    <VendorQuoteDocument stepsDone={stepsDone} phase={phase} />
                </div>
            </div>
        </div>
    )
}

// ─── Vendor Quote PDF mockup ──────────────────────────────────────────────────

type QuoteZone = 'header' | 'customer' | 'item' | 'pricing' | 'terms'

function VendorQuoteDocument({ stepsDone, phase }: { stepsDone: number; phase: Phase }) {
    const allDone = phase === 'done'

    const highlighted = (zone: QuoteZone) => {
        if (allDone) return true
        if (stepsDone === 0) return false
        if (zone === 'header' || zone === 'customer') return stepsDone >= 1
        if (zone === 'item') return stepsDone >= 2
        if (zone === 'pricing' || zone === 'terms') return stepsDone >= 2
        return false
    }

    const cls = (zone: QuoteZone) =>
        `px-1 py-0.5 rounded transition-all duration-300 ${highlighted(zone) ? 'ring-1 ring-ai/60 bg-ai/10' : ''}`

    return (
        <div className="bg-white dark:bg-zinc-100 text-zinc-900 rounded-xl p-3 text-[10px] font-mono shadow-sm border border-border leading-relaxed">
            {/* Header */}
            <div className={`flex justify-between mb-2 pb-2 border-b border-zinc-200 ${cls('header')}`}>
                <div className="font-bold text-[11px] text-zinc-900">ALLSTEEL</div>
                <div className="text-zinc-500 text-[9px]">VENDOR QUOTE</div>
            </div>

            {/* Quote ref + date */}
            <div className="grid grid-cols-2 gap-1 mb-2 text-[9px]">
                <div className={cls('header')}>
                    <div className="text-zinc-500">QUOTE #</div>
                    <div className="font-bold text-zinc-900">AS-Q-2026-0441</div>
                </div>
                <div className={cls('header')}>
                    <div className="text-zinc-500">DATE</div>
                    <div className="font-bold text-zinc-900">Apr 28 2026</div>
                </div>
            </div>

            {/* Customer */}
            <div className={`mb-2 ${cls('customer')}`}>
                <div className="text-zinc-500 text-[9px]">TO</div>
                <div className="text-zinc-900">Modern Business Interiors</div>
                <div className="text-zinc-500">St. Charles, MO · Attn: PC Team</div>
            </div>

            {/* Line items */}
            <div className="border-t border-zinc-200 pt-1.5 mb-2">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-1 text-[9px] text-zinc-500 font-bold mb-1 px-1">
                    <div>ITEM / SKU</div>
                    <div className="text-right">QTY</div>
                    <div className="text-right">UNIT</div>
                    <div className="text-right">TOTAL</div>
                </div>
                <div className={`grid grid-cols-[1fr_auto_auto_auto] gap-1 ${cls('item')}`}>
                    <div>
                        <div className="font-bold text-zinc-900">AS-ACST-OAK-4824</div>
                        <div className="text-zinc-500 text-[8px]">Acoustic panel · oak veneer 48×24</div>
                    </div>
                    <div className="text-right text-zinc-900">16</div>
                    <div className={`text-right font-bold ${highlighted('pricing') ? 'text-zinc-900' : 'text-zinc-700'}`}>$215</div>
                    <div className="text-right font-bold text-zinc-900">$3,440</div>
                </div>
            </div>

            {/* Terms */}
            <div className={`border-t border-zinc-200 pt-1.5 grid grid-cols-2 gap-1 text-[9px] mb-2 ${cls('terms')}`}>
                <div>
                    <div className="text-zinc-500">LEAD TIME</div>
                    <div className="font-bold text-zinc-900">6 weeks</div>
                </div>
                <div>
                    <div className="text-zinc-500">MOQ</div>
                    <div className="font-bold text-zinc-900">4 units</div>
                </div>
            </div>

            {/* Total */}
            <div className={`border-t border-zinc-200 pt-1 flex justify-between ${cls('pricing')}`}>
                <span className="text-zinc-500 font-bold">TOTAL</span>
                <span className="font-bold text-zinc-900">$3,440</span>
            </div>

            {/* Footer */}
            <div className="mt-2 pt-1 border-t border-zinc-200 text-[8px] text-zinc-400">
                Valid through May 28 2026 · Allsteel Inc. · Pricing subject to contract terms
            </div>
        </div>
    )
}

// ─── Supporting components ────────────────────────────────────────────────────

function SIFRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-20 shrink-0">{label}</span>
            <span className={`font-semibold truncate ${highlight ? 'text-success' : 'text-foreground'} ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
        </div>
    )
}

function SIFAdjustSheet({
    isOpen,
    current,
    onClose,
    onSave,
}: {
    isOpen: boolean
    current: typeof GENERATED_ENTRY & { qty: number; unitPrice: number; leadWeeks: number }
    onClose: () => void
    onSave: (adj: Partial<SIFAdjust>) => void
}) {
    const [qty, setQty] = useState(current.qty)
    const [unitPrice, setUnitPrice] = useState(current.unitPrice)
    const [leadWeeks, setLeadWeeks] = useState(current.leadWeeks)

    useEffect(() => {
        if (isOpen) {
            setQty(current.qty)
            setUnitPrice(current.unitPrice)
            setLeadWeeks(current.leadWeeks)
        }
    }, [isOpen, current.qty, current.unitPrice, current.leadWeeks])

    const lineTotal = qty * unitPrice
    const changed = qty !== current.qty || unitPrice !== current.unitPrice || leadWeeks !== current.leadWeeks

    return (
        <MBIDetailSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Adjust SIF entry"
            subtitle="Override the AI-extracted values · the original vendor quote is preserved"
            icon={<Pencil className="h-4 w-4" />}
            width="sm"
        >
            <div className="space-y-5">
                <div className="bg-muted/30 rounded-xl p-3 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">NC-004 · {current.sku}</span>
                    <span className="ml-2">{current.description}</span>
                </div>

                <div className="space-y-4">
                    <AdjustField label="Quantity" hint="Units on the SIF" value={qty} onChange={setQty} min={1} />
                    <AdjustField label="Unit price ($)" hint="From vendor quote" value={unitPrice} onChange={setUnitPrice} min={1} prefix="$" />
                    <AdjustField label="Lead time (weeks)" hint="Vendor quoted lead time" value={leadWeeks} onChange={setLeadWeeks} min={1} />
                </div>

                <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Revised line total</span>
                    <span className="text-sm font-bold text-success">${lineTotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-foreground bg-background dark:bg-zinc-800 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ qty, unitPrice, leadWeeks })}
                        disabled={!changed}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save adjustments
                    </button>
                </div>
            </div>
        </MBIDetailSheet>
    )
}

function AdjustField({
    label, hint, value, onChange, min, prefix,
}: {
    label: string; hint: string; value: number; onChange: (v: number) => void; min?: number; prefix?: string
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
            </div>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{prefix}</span>
                )}
                <input
                    type="number"
                    min={min}
                    value={value}
                    onChange={e => onChange(Math.max(min ?? 0, Number(e.target.value)))}
                    className={`w-full bg-background dark:bg-zinc-800 border border-border rounded-lg py-2 text-sm text-foreground focus:outline-none focus:border-primary ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
                />
            </div>
        </div>
    )
}
