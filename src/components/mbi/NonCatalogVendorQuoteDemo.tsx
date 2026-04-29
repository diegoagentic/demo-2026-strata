/**
 * COMPONENT: NonCatalogVendorQuoteDemo
 * PURPOSE: Simulates Strata reading an Allsteel vendor quote (PDF) for a
 *          flagged non-catalog item and generating a structured SIF entry —
 *          removing manual re-entry for the PC team.
 *
 *          State machine: idle → running → done → accepted
 *
 * PROPS: onResolved — called when PC accepts the generated SIF entry
 *
 * USED BY: QuoteValidationScene (inline, not in a sheet)
 */

import { useState } from 'react'
import { Play, Loader2, CheckCircle2, FileText, Sparkles, Check, AlertTriangle } from 'lucide-react'
import { usePauseAware } from '../../context/usePauseAware'
import { useEffect } from 'react'

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

interface Props {
    onResolved: () => void
}

export default function NonCatalogVendorQuoteDemo({ onResolved }: Props) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [stepsDone, setStepsDone] = useState(0)
    const { pauseAwareTimeout } = usePauseAware()

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
                        NC-004 · {GENERATED_ENTRY.qty} × ${GENERATED_ENTRY.unitPrice.toLocaleString()} · ${(GENERATED_ENTRY.qty * GENERATED_ENTRY.unitPrice).toLocaleString()} confirmed · no re-entry needed
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-3 space-y-3 animate-in fade-in duration-300">
            {/* Reading steps */}
            <div className={`rounded-xl border p-3 ${phase === 'done' ? 'bg-ai/5 dark:bg-ai/10 border-ai/30' : 'bg-ai/5 dark:bg-ai/10 border-ai/30'}`}>
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
                <div className="bg-card dark:bg-zinc-800 border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Generated SIF entry · PC review</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                        <SIFRow label="SKU" value={GENERATED_ENTRY.sku} mono />
                        <SIFRow label="Description" value={GENERATED_ENTRY.description} />
                        <SIFRow label="Qty" value={String(GENERATED_ENTRY.qty)} />
                        <SIFRow label="Unit price" value={`$${GENERATED_ENTRY.unitPrice.toLocaleString()}`} highlight />
                        <SIFRow label="Line total" value={`$${(GENERATED_ENTRY.qty * GENERATED_ENTRY.unitPrice).toLocaleString()}`} highlight />
                        <SIFRow label="Lead time" value={`${GENERATED_ENTRY.leadWeeks} weeks · MOQ ${GENERATED_ENTRY.moq}`} />
                        <div className="col-span-2 pt-1 border-t border-border mt-1">
                            <span className="text-[10px] text-muted-foreground italic">{GENERATED_ENTRY.source}</span>
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
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-foreground bg-background dark:bg-zinc-900 border border-border rounded-lg hover:border-muted-foreground/50 transition-colors">
                            Adjust
                        </button>
                        <span className="text-[10px] text-muted-foreground ml-auto">Confidence 94%</span>
                    </div>
                </div>
            )}
        </div>
    )
}

function SIFRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground w-20 shrink-0">{label}</span>
            <span className={`font-semibold truncate ${highlight ? 'text-success' : 'text-foreground'} ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
        </div>
    )
}
