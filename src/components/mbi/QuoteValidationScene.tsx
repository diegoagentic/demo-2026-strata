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
import {
    Search, Package, ArrowRight, Sparkles, ChevronRight, RotateCcw, AlertTriangle,
} from 'lucide-react'
import AuditLoopDiagram from './AuditLoopDiagram'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import SpecCheckReport from './SpecCheckReport'
import NonCatalogValidatorTable from './NonCatalogValidatorTable'
import NonCatalogVendorQuoteDemo from './NonCatalogVendorQuoteDemo'
import MBIDetailSheet from './MBIDetailSheet'
import AISpecCheckSimulation, {
    SpecCheckDecisionsApplied,
    type SpecCheckDecisions,
} from './AISpecCheckSimulation'

export default function QuoteValidationScene() {
    const [nonCatalogOpen, setNonCatalogOpen] = useState(false)
    const [decisions, setDecisions] = useState<SpecCheckDecisions | null>(null)
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())

    const handleResolved = () => {
        setResolvedIds(prev => new Set([...prev, 'NC-004']))
    }

    const flaggedCount = resolvedIds.has('NC-004') ? 0 : 1

    return (
        <div className="space-y-4">
            {/* Intro */}
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

            {/* AI simulation OR decisions recap */}
            {decisions === null ? (
                <AISpecCheckSimulation onComplete={setDecisions} />
            ) : (
                <SpecCheckDecisionsApplied
                    decisions={decisions}
                    onRerun={() => setDecisions(null)}
                />
            )}

            {/* Hero — audit loop collapse diagram */}
            <AuditLoopDiagram />

            {/* Spec Check report */}
            <SpecCheckReport />

            {/* ── Non-Catalog inline highlight card ── */}
            <div className={`
                rounded-2xl border overflow-hidden transition-colors
                ${flaggedCount > 0
                    ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5'
                    : 'border-success/30 bg-success/5 dark:bg-success/10'
                }
            `}>
                {/* Card header */}
                <div className="px-4 py-3 border-b border-inherit flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${flaggedCount > 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-success/15 text-success'}`}>
                        <Search className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">Non-catalog validator</span>
                            {flaggedCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    1 item needs resolution
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success uppercase tracking-wider">
                                    All resolved
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                            80–90% of MBI spec sheets have manual items · Strata cross-checks against mfg price books
                        </div>
                    </div>
                    <button
                        onClick={() => setNonCatalogOpen(true)}
                        className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        View all 5
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Flagged item row */}
                <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground">NC-004 · Acoustic panel · oak veneer 48×24</span>
                                <span className="text-[10px] font-mono text-muted-foreground">Allsteel · Qty 16</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[11px] text-muted-foreground">Quoted <strong className="text-foreground">$180/u</strong></span>
                                <span className="text-muted-foreground/40">→</span>
                                <span className="text-[11px] text-muted-foreground">Price book <strong className="text-foreground">$215/u</strong></span>
                                {flaggedCount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        −$35/u · vendor quote needed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vendor quote simulation */}
                    {flaggedCount > 0 && (
                        <NonCatalogVendorQuoteDemo onResolved={handleResolved} />
                    )}

                    {/* Resolved state */}
                    {flaggedCount === 0 && (
                        <div className="mt-2 text-[11px] text-success font-semibold">
                            Vendor quote accepted · $215/u confirmed · SIF entry updated · $3,440 total
                        </div>
                    )}
                </div>
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    AI pass complete · no blocking flags. Next: PC reviews GP per vendor and Strata creates CORE Quote QUOT-2026-003 — then the proposal goes to the client.
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

            {/* Detail sheet — full table */}
            <MBIDetailSheet
                isOpen={nonCatalogOpen}
                onClose={() => setNonCatalogOpen(false)}
                title="Non-catalog item validator"
                subtitle="Strata cross-checks manual items against manufacturer price books + historical projects"
                icon={<Package className="h-4 w-4" />}
                width="lg"
            >
                <NonCatalogValidatorTable resolvedIds={resolvedIds} />
            </MBIDetailSheet>

            <DataSourcesBar groups={[
                { sources: [SOURCES.MFR_BOOKS, SOURCES.SPEC_DB] },
                { sources: [SOURCES.STRATA_SPEC] },
            ]} />
        </div>
    )
}
