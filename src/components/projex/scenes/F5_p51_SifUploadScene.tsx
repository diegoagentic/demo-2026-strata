/**
 * COMPONENT: F5_p51_SifUploadScene (Projex · p5.1)
 * PURPOSE: Auto · SIF uploaded a Teknion Online (70% of the volume) + email tail
 *          30% with SourceBadge per vendor. Split view mock browser + PO summary.
 *
 * SHAPE · split view Teknion Online mock + PO summary card (F5 opening)
 * REUSE · simulations/AgentPipelineStrip (mini) · shared/StatusBadge
 * NOTIF · dispatchea `projex:sif-uploaded` on complete
 */

import { useEffect, useState } from 'react'
import {
    Upload, Globe, CheckCircle2, Loader2, ArrowRight, Mail,
    Building2, Sparkles, FileText,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { VENDOR_ACK_CONF } from '../../../config/profiles/projex-data/teknionAck'

const UPLOAD_PHASES = [
    { pct: 30, label: 'Connecting to Teknion Online portal…' },
    { pct: 65, label: 'Uploading MWH_PO-2026-4421.sif · 71 lines' },
    { pct: 100, label: 'Portal ACK · SIF received · queued for processing' },
]

export default function F5_p51_SifUploadScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const [phaseIdx, setPhaseIdx] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        if (phaseIdx < UPLOAD_PHASES.length) {
            const cancel = pauseAwareTimeout(() => setPhaseIdx(n => n + 1), 900)
            return cancel
        }
        if (!done) {
            const cancel = pauseAwareTimeout(() => {
                setDone(true)
                window.dispatchEvent(new CustomEvent('projex:sif-uploaded'))
            }, 500)
            return cancel
        }
    }, [phaseIdx, done, pauseAwareTimeout])

    const currentPct = phaseIdx > 0 ? UPLOAD_PHASES[Math.min(phaseIdx - 1, UPLOAD_PHASES.length - 1)].pct : 0
    const currentLabel = phaseIdx > 0 ? UPLOAD_PHASES[Math.min(phaseIdx - 1, UPLOAD_PHASES.length - 1)].label : 'Preparing…'

    const emailVendors = VENDOR_ACK_CONF.filter(v => v.vendorCode !== 'TEK')
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* F83.R · slim header · prod ComparisonReviewModal shape · row 1
                icon + short title + status pill · row 2 muted meta strip. */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h2 className="text-base font-bold text-foreground">SIF dispatch · NCBA · PO-2026-4421</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${done ? 'bg-success/15 text-success' : 'bg-ai-light text-ai'}`}>
                        {done
                            ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Uploaded · queued</>
                            : <><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Uploading · {currentPct}%</>}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Portal: <span className="font-mono text-foreground font-semibold">Teknion Online</span></span>
                    <span>·</span>
                    <span className="tabular-nums">71 lines · SIF v4.2</span>
                    <span>·</span>
                    <span>70% Teknion SIF path · 30% email PDF tail ({emailVendors.length} vendors)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
                {/* Teknion Online mock browser */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Teknion Online · portal</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">portal.teknion.com/orders/upload</span>
                    </div>
                    <div className="p-6 bg-muted/10 min-h-[280px]">
                        <div className="rounded-lg border border-border bg-background p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/25 flex items-center justify-center shrink-0">
                                    <Upload className="h-5 w-5 text-foreground" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-foreground">SIF Upload · PO-2026-4421</div>
                                    <div className="text-[11px] text-muted-foreground">NCBA · 71 lines · Teknion direct-bill</div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted/40 border border-border p-3 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-foreground shrink-0" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">MWH_PO-2026-4421.sif</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">2.4 MB · SIF v4.2</div>
                                </div>
                                {done && <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />}
                            </div>

                            {!done && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <Loader2 className="h-3 w-3 text-ai animate-spin" aria-hidden="true" />
                                        <span className="text-foreground">{currentLabel}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-ai rounded-full transition-all duration-700" style={{ width: `${currentPct}%` }} />
                                    </div>
                                </div>
                            )}
                            {done && (
                                <div className="animate-in fade-in duration-500 rounded-lg border border-success/40 bg-success/5 px-3 py-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                                    <span className="text-xs text-foreground">Portal confirmed · ACK expected en ~2-4 horas</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email tail 30% */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email tail · 30% of the volume</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {emailVendors.map(v => (
                            <div key={v.vendorCode} className="flex items-center gap-2 border-b border-border/40 pb-2 last:border-0">
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-bold text-muted-foreground">{v.vendorCode}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground truncate">{v.vendorName}</div>
                                    <div className="text-[10px] text-muted-foreground">Email PDF · portal fallback</div>
                                </div>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                    <Mail className="h-2.5 w-2.5" aria-hidden="true" />
                                    Email
                                </span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-border text-[11px] text-muted-foreground">
                            5 vendors via email · Strata monitors ap@projex-inc.com for ACK PDFs
                        </div>
                    </div>
                </div>
            </div>

            {done && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <Building2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">SIF dispatched · ACK monitoring active</span>
                        <span className="text-muted-foreground"> · Teknion portal ACK expected ~2-4h · email tail drip-drip per vendor.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open ACK OCR review
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

        </div>
    )
}
