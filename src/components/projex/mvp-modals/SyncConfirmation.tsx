/**
 * F84 · SyncConfirmation · staged reveal for post-action confirmations.
 * Used by F2 p2.3 (NetSuite sync) + F3 p3.3 (invoice sent).
 *
 * Prod shape reference: expert-hub PreflightSyncModal staged pattern ·
 * countdown of 3 lines with icons + Done state + Continue button.
 *
 * NOT a modal · renders inline as a full-height focus panel over the
 * page background. Simpler than a Dialog because it's a passive payoff.
 */

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'

interface SyncStep {
    label: string
    detail?: string
}

interface SyncConfirmationProps {
    title: string
    metaLine: string
    steps: SyncStep[]
    doneLabel: string
    doneDetail?: string
    continueLabel?: string
    onContinue: () => void
}

export default function SyncConfirmation({
    title,
    metaLine,
    steps,
    doneLabel,
    doneDetail,
    continueLabel = 'Continue',
    onContinue,
}: SyncConfirmationProps) {
    const [revealed, setRevealed] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        if (revealed < steps.length) {
            const timer = setTimeout(() => setRevealed(n => n + 1), 700)
            return () => clearTimeout(timer)
        }
        if (!done) {
            const timer = setTimeout(() => setDone(true), 400)
            return () => clearTimeout(timer)
        }
    }, [revealed, done, steps.length])

    return (
        {/* F84.30 · Diego 2026-08-21 · dropped `md:pl-[336px]` sidebar
             offset · the tour sidebar is a fixed overlay · scene content
             should center on the viewport, not double-offset for the
             sidebar (that only applied to overlay modals via F83.S). */}
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-sm p-6 space-y-5">
                {/* Header · icon + short title + status pill · muted meta */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                        <h2 className="text-base font-bold text-foreground">{title}</h2>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? 'bg-success/15 text-success' : 'bg-ai-light text-ai'}`}>
                            {done
                                ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Complete</>
                                : <><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Processing</>}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{metaLine}</div>
                </div>

                {/* Staged reveal · 3 sync steps */}
                <div className="space-y-2">
                    {steps.map((step, i) => {
                        const isRevealed = i < revealed
                        return (
                            <div
                                key={i}
                                className={`
                                    flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-all duration-300
                                    ${isRevealed ? 'bg-success/5 opacity-100' : 'bg-muted/20 opacity-40'}
                                `}
                            >
                                {isRevealed ? (
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                ) : (
                                    <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 animate-spin" aria-hidden="true" />
                                )}
                                <div className="flex-1 min-w-0 text-xs">
                                    <div className="text-foreground font-semibold">{step.label}</div>
                                    {step.detail && (
                                        <div className="text-muted-foreground mt-0.5">{step.detail}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Done payoff */}
                {done && (
                    <div className="rounded-lg border border-success/40 bg-success/5 px-3 py-3 flex items-start gap-3 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0 text-xs">
                            <div className="text-foreground font-semibold">{doneLabel}</div>
                            {doneDetail && (
                                <div className="text-muted-foreground mt-0.5">{doneDetail}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Continue */}
                {done && (
                    <button
                        onClick={onContinue}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                    >
                        {continueLabel}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    )
}
