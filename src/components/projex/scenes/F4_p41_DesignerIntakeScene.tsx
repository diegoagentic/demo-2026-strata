/**
 * COMPONENT: F4_p41_DesignerIntakeScene (Projex · p4.1)
 * PURPOSE: Layne (designer) emails PIF + SIF · attachment metadata visible.
 *          Drop-zone accept · Isabella clicks Ingest cuando confirms scope.
 *
 * SHAPE · email intake + drop-zone (F4 primary shape start)
 * REUSE · bfi/PMOIntakeScene shape + mbi/EmailInboxDropZone
 * NOTIF · dispatchea `projex:pif-ingested` on ingest
 */

import { useState } from 'react'
import {
    Mail, Paperclip, FileText, Sparkles, CheckCircle2, Loader2,
    ArrowRight, Building2, Play,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_TOTALS } from '../../../config/profiles/projex-data/mwhPif'

export default function F4_p41_DesignerIntakeScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    const [state, setState] = useState<'landing' | 'ingesting' | 'ingested'>('landing')

    const handleIngest = () => {
        if (state !== 'landing') return
        setState('ingesting')
        pauseAwareTimeout(() => {
            setState('ingested')
            window.dispatchEvent(new CustomEvent('projex:pif-ingested'))
        }, 1200)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                    <span>Order &amp; PO dispatch · step 1</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Intake ready
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Designer emails PIF + SIF · Layne to Isabella · MWH residential
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Attachment metadata visible · drop-zone accept · Isabella confirms Ingest before parse starts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
                {/* Email + attachments card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inbound email · MWH kickoff</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">08:14 AM</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                        <div className="grid grid-cols-[70px_1fr] gap-y-1.5 gap-x-2 text-[12px]">
                            <span className="text-muted-foreground">From</span>
                            <span className="text-foreground font-medium">Layne · Lead Designer · layne@aspire-design.example</span>
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">Isabella Bressler · isabella@projex-inc.com</span>
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">MWH residential · PIF + SIF · 300 lines · 26 vendor split</span>
                        </div>
                        <div className="pt-3 border-t border-border text-[12px] text-foreground/80 leading-relaxed">
                            Hi Isabella · attaching PIF workbook con full BOM y SIF export from CET. Big project · 300 lines across Teknion + HBF + Boss + Alamir + Nelson + West Elm. Walls partitions include AI lot line for east wing.
                            Ready for you to parse and dispatch. Let me know si algo needs clarification.
                            — Layne
                        </div>
                        <div className="pt-3 border-t border-border space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Attachments</div>
                            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border border-border">
                                <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">MWH_PIF_2026-08-14.xlsx</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">
                                        4.2 MB · {MWH_TOTALS.productLines} product lines · {MWH_TOTALS.snhEntries} S&amp;H entries
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                                    Parse ready
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border border-border">
                                <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">MWH_CET_export.sif</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">1.8 MB · SIF v4.2 · Teknion-compatible</div>
                                </div>
                                <span className="text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                                    SIF ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingest confirmation panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ingest confirmation · {isabella.role}</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                            <div className="text-sm text-foreground font-semibold mt-0.5">MWH residential</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected output</div>
                            <div className="text-sm text-foreground mt-0.5 tabular-nums">
                                {MWH_TOTALS.productLines} product lines · {MWH_TOTALS.snhEntries} S&amp;H entries · {MWH_TOTALS.totalPOs} vendor POs
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. total value</div>
                            <div className="text-lg text-foreground font-bold tabular-nums mt-0.5">${MWH_TOTALS.grandTotal.toLocaleString()}</div>
                        </div>
                        <div className="pt-3 border-t border-border">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Reviewer</div>
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold">
                                    {isabella.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs text-foreground font-semibold">{isabella.fullName}</div>
                                    <div className="text-[10px] text-muted-foreground">Never auto-ingest · human confirm required</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border">
                        {state === 'landing' && (
                            <button
                                onClick={handleIngest}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                                Ingest PIF + SIF
                            </button>
                        )}
                        {state === 'ingesting' && (
                            <div className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-ai animate-pulse py-2.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Ingesting workbook…
                            </div>
                        )}
                        {state === 'ingested' && (
                            <button
                                onClick={nextStep}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Open PIF parser
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Why never auto-ingest</div>
                    <div className="text-muted-foreground mt-0.5">
                        Isabella escalates project scope changes con Layne before parse locks in. 300-line PIF has downstream implications (26 POs · 2.5h manual work if pattern breaks) · confirmation gate protects.
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Designer intake · email → drop-zone → Ingest" />
        </div>
    )
}
