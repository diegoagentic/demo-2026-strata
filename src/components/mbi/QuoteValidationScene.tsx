/**
 * COMPONENT: QuoteValidationScene
 * PURPOSE: Flow 3 · Scene 2 — AI pre-validation pass. Hero is the Audit Loop
 *          Collapse diagram (4→1+1 · MBI's #1 pain point reframed). Below it,
 *          the Non-Catalog validator is surfaced inline (highlighted) with a
 *          live vendor quote simulation for the flagged item. The full table
 *          is available via detail sheet.
 *
 * DS TOKENS: bg-card · ai / primary accents
 *
 * USED BY: MBIQuotesPage (wizard scene 2)
 */

import { useState } from 'react'
import { ArrowRight, Sparkles, RotateCcw } from 'lucide-react'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import SpecCheckReport from './SpecCheckReport'
import AISpecCheckSimulation, {
    SpecCheckDecisionsApplied,
    DEFAULT_DECISIONS,
    type SpecCheckDecisions,
} from './AISpecCheckSimulation'

export default function QuoteValidationScene() {
    const [decisions, setDecisions] = useState<SpecCheckDecisions | null>(null)
    const [liveDecisions, setLiveDecisions] = useState<SpecCheckDecisions>(DEFAULT_DECISIONS)

    return (
        <div className="space-y-4">
            {/* Intro */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">
                        Quote validation — 4 audit loops collapse to 1
                    </div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Today, PCs run 4 sequential checks by eye — and errors still reach manufacturers. Strata validates the assembled BOM automatically:
                        <strong className="text-foreground"> duplicates, non-catalog pricing, quantity consistency, SKU completeness</strong> — then a single human review signs off.
                    </div>
                </div>
            </div>

            {/* AI simulation OR decisions recap */}
            {decisions === null ? (
                <AISpecCheckSimulation
                    onComplete={(d) => { setDecisions(d); setLiveDecisions(d) }}
                    onDecisionChange={setLiveDecisions}
                />
            ) : (
                <SpecCheckDecisionsApplied
                    decisions={decisions}
                    onRerun={() => setDecisions(null)}
                />
            )}

            {/* Spec Check report */}
            <SpecCheckReport decisions={liveDecisions} />

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    AI pass complete · no blocking flags. Next: upload vendor quotes to resolve non-catalog pricing gaps.
                </span>
                {decisions !== null && (
                    <button
                        onClick={() => setDecisions(null)}
                        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                        title="Re-run the quote validation simulation from the top"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Re-run
                    </button>
                )}
            </div>

            <DataSourcesBar groups={[
                { sources: [SOURCES.MFR_BOOKS, SOURCES.SPEC_DB] },
                { sources: [SOURCES.STRATA_SPEC] },
            ]} />
        </div>
    )
}
