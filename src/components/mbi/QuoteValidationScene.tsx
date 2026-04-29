/**
 * COMPONENT: QuoteValidationScene
 * PURPOSE: Flow 3 · Scene 2 — AI pre-validation pass. Hero is the Audit Loop
 *          Collapse diagram (4→1+1 · MBI's #1 pain point reframed). Below it,
 *          the Spec Check report summary with two deep-dives (Non-Catalog
 *          validator + COM workflow) gated behind detail sheets so the scene
 *          stays focused on the loop-collapse story.
 *
 *          Layout: simulation runs as a TOP SECTION (not a gate). The audit
 *          loop + report are always visible below. Once the simulation
 *          completes the top section flips to a decisions-applied recap.
 *
 * DS TOKENS: bg-card · ai / primary accents
 *
 * USED BY: MBIQuotesPage (wizard scene 2)
 */

import { useState } from 'react'
import {
    Search, Package, ArrowRight, Sparkles, ChevronRight, RotateCcw,
} from 'lucide-react'
import AuditLoopDiagram from './AuditLoopDiagram'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import SpecCheckReport from './SpecCheckReport'
import NonCatalogValidatorTable from './NonCatalogValidatorTable'
import MBIDetailSheet from './MBIDetailSheet'
import AISpecCheckSimulation, {
    SpecCheckDecisionsApplied,
    type SpecCheckDecisions,
} from './AISpecCheckSimulation'

export default function QuoteValidationScene() {
    const [nonCatalogOpen, setNonCatalogOpen] = useState(false)
    // null = simulation running · set = decisions applied, recap shown
    const [decisions, setDecisions] = useState<SpecCheckDecisions | null>(null)

    return (
        <div className="space-y-4">
            {/* Intro — why this scene exists */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">
                        Q10 #1 priority at MBI: spec check
                    </div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Marked <strong className="text-foreground">9.08/10</strong> in the AI readiness assessment.
                        Today, PCs run 4 sequential audit loops by eye. Strata's Spec Check engine collapses them into
                        <strong className="text-foreground"> 1 AI pass + 1 human review</strong> — without losing oversight.
                    </div>
                </div>
            </div>

            {/* AI simulation OR decisions recap — top section, always present */}
            {decisions === null ? (
                <AISpecCheckSimulation onComplete={setDecisions} />
            ) : (
                <SpecCheckDecisionsApplied
                    decisions={decisions}
                    onRerun={() => setDecisions(null)}
                />
            )}

            {/* ── Original step 2.3 content — always visible ── */}

            {/* Hero — audit loop collapse diagram */}
            <AuditLoopDiagram />

            {/* Spec Check report */}
            <SpecCheckReport />

            {/* Deep-dive: Non-Catalog validator */}
            <button
                onClick={() => setNonCatalogOpen(true)}
                className="w-full bg-card dark:bg-zinc-800 border border-border rounded-xl p-3 hover:border-primary/40 transition-colors text-left flex items-center gap-3"
            >
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-zinc-900 dark:text-primary flex items-center justify-center shrink-0">
                    <Search className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">Non-catalog validator</div>
                    <div className="text-[10px] text-muted-foreground">
                        80-90% of MBI spec sheets have manual items · 8 validated, 1 flagged
                    </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    AI pass complete · no blocking flags. One human review left, then the proposal goes to the client and orders route to vendors.
                </span>
                {decisions !== null && (
                    <button
                        onClick={() => setDecisions(null)}
                        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                        title="Re-run the Spec Check simulation from the top"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Re-run
                    </button>
                )}
            </div>

            {/* Deep-dive sheets */}
            <MBIDetailSheet
                isOpen={nonCatalogOpen}
                onClose={() => setNonCatalogOpen(false)}
                title="Non-catalog item validator"
                subtitle="Strata cross-checks manual items against manufacturer price books + historical projects"
                icon={<Package className="h-4 w-4" />}
                width="lg"
            >
                <NonCatalogValidatorTable />
            </MBIDetailSheet>

            <DataSourcesBar groups={[
                { sources: [SOURCES.MFR_BOOKS, SOURCES.SPEC_DB] },
                { sources: [SOURCES.STRATA_SPEC] },
            ]} />
        </div>
    )
}
