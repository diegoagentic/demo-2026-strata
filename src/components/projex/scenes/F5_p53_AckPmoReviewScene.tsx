/**
 * COMPONENT: F5_p53_AckPmoReviewScene (Projex · p5.3)
 * PURPOSE: AckHeroMatchPanel UN-CUTTABLE hero. Split-pane ACK vs PMO ·
 *          71 lines + 13 CRs · Teknion CR taxonomy real.
 *
 * SHAPE LOCK · split-pane comparison (F5 primary shape · anti-collision con F1 row-diff)
 * REUSE · vendor/strata-experiences-demo/manufacturer/AckHeroMatchPanel (UN-CUTTABLE lift) ·
 *         officeworks/AckReviewScene shape · widgets/ThreeWayMatchView
 * NOTIF · dispatchea `projex:pmo-comparison-open` on advance
 */

import { useState } from 'react'
import {
    GitCompare, CheckCircle2, AlertTriangle, ArrowRight, FileText,
    Sparkles, Ruler, Zap, MessageCircle, User,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { NCBA_ACK_CRS, NCBA_ACK_LINES, type CRType } from '../../../config/profiles/projex-data/teknionAck'

const CR_TYPE_ICON: Record<CRType, React.ElementType> = {
    'leadtime':        Zap,
    'BIFMA advisory':  FileText,
    'width change':    Ruler,
    'pricer comment':  MessageCircle,
}

export default function F5_p53_AckPmoReviewScene() {
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella
    const [selectedCR, setSelectedCR] = useState<string | null>(null)

    const warnCRs = NCBA_ACK_CRS.filter(c => c.severity === 'warn')
    const infoCRs = NCBA_ACK_CRS.filter(c => c.severity === 'info')
    const activeCRDetail = selectedCR ? NCBA_ACK_CRS.find(c => c.id === selectedCR) : null

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.TEKNION_ONLINE] },
        { sources: [PROJEX_SOURCES.STRATA_MATCHER] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F5</span>
                    <span>Electronic ordering &amp; ACK · step 3</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> {isabella.role}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Hero moment
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    ACK vs PMO · 71 lines + 13 CRs · Teknion taxonomy real
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Split-pane comparison · leadtime · BIFMA advisory · width change · pricer comment. AckHeroMatchPanel replaces Coordinator\'s manual PDF-vs-Excel comparison.
                </p>
            </div>

            {/* KPI summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lines total</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums mt-1">71</div>
                </div>
                <div className="rounded-2xl border border-success/40 bg-success/5 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Match exact</div>
                    <div className="text-2xl font-bold text-success tabular-nums mt-1">58</div>
                </div>
                <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CRs warn</div>
                    <div className="text-2xl font-bold text-warning tabular-nums mt-1">{warnCRs.length}</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CRs info</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums mt-1">{infoCRs.length}</div>
                </div>
            </div>

            {/* Split-pane · ACK PDF (izq) + PMO grid (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">ACK PDF · Teknion</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">TEK-ACK-2026-08-14</span>
                    </div>
                    <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-[40px_1fr_50px_70px_100px] px-3 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span>Ln</span>
                            <span>Item</span>
                            <span className="text-right">Qty</span>
                            <span className="text-right">Price</span>
                            <span className="text-right">ESD</span>
                        </div>
                        {NCBA_ACK_LINES.map(l => (
                            <div key={l.lineNumber} className={`grid grid-cols-[40px_1fr_50px_70px_100px] px-3 py-2 text-xs items-center ${l.match === 'cr' ? 'bg-warning/5' : ''}`}>
                                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{l.lineNumber}</span>
                                <span className="text-foreground truncate">{l.description}</span>
                                <span className="text-right tabular-nums text-foreground">{l.ackQty}</span>
                                <span className="text-right tabular-nums text-foreground">${l.ackPrice}</span>
                                <span className="text-right text-[10px] tabular-nums text-foreground">{l.ackESD}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <GitCompare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">NetSuite PMO · PO-2026-4421</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">NCBA</span>
                    </div>
                    <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-[40px_1fr_50px_70px_100px] px-3 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span>Ln</span>
                            <span>Item</span>
                            <span className="text-right">Qty</span>
                            <span className="text-right">Price</span>
                            <span className="text-right">ESD (was)</span>
                        </div>
                        {NCBA_ACK_LINES.map(l => (
                            <div key={l.lineNumber} className={`grid grid-cols-[40px_1fr_50px_70px_100px] px-3 py-2 text-xs items-center ${l.match === 'cr' ? 'bg-warning/5' : ''}`}>
                                <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{l.lineNumber}</span>
                                <span className="text-foreground truncate">{l.description}</span>
                                <span className="text-right tabular-nums text-foreground">{l.poQty}</span>
                                <span className="text-right tabular-nums text-foreground">${l.poPrice}</span>
                                <span className="text-right text-[10px] font-mono tabular-nums text-warning">{l.poESD}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CR taxonomy grid */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">13 CRs · Teknion taxonomy</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {NCBA_ACK_CRS.map(cr => {
                        const Icon = CR_TYPE_ICON[cr.type]
                        const isSelected = selectedCR === cr.id
                        return (
                            <button
                                key={cr.id}
                                onClick={() => setSelectedCR(isSelected ? null : cr.id)}
                                className={`
                                    text-left rounded-lg border p-2 transition-all
                                    ${cr.severity === 'warn'
                                        ? isSelected ? 'border-warning bg-warning/10 ring-2 ring-warning/40' : 'border-warning/30 bg-warning/5 hover:border-warning/60'
                                        : isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/40' : 'border-border bg-card hover:border-primary/40'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-2">
                                    <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${cr.severity === 'warn' ? 'text-warning' : 'text-muted-foreground'}`} aria-hidden="true" />
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-mono text-muted-foreground">{cr.id}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{cr.type}</div>
                                        <div className="text-[11px] text-foreground truncate mt-0.5">L{cr.lineNumber}</div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {activeCRDetail && (
                    <div className="px-4 py-3 border-t border-border bg-muted/20 animate-in fade-in duration-300">
                        <div className="text-xs">
                            <div className="text-foreground font-semibold">{activeCRDetail.id} · Line {activeCRDetail.lineNumber} · {activeCRDetail.type}</div>
                            <div className="text-muted-foreground mt-0.5">{activeCRDetail.detail}</div>
                            {activeCRDetail.poField && activeCRDetail.ackField && (
                                <div className="mt-2 flex items-center gap-3 text-[11px]">
                                    <span className="text-muted-foreground">PO:</span>
                                    <span className="font-mono text-foreground">{activeCRDetail.poField}</span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                    <span className="text-muted-foreground">ACK:</span>
                                    <span className="font-mono text-warning">{activeCRDetail.ackField}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-foreground" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-sm">
                    <span className="text-foreground font-semibold">Comparison ready · 5 CRs need PMO update</span>
                    <span className="text-muted-foreground"> · sentinel 10/10/2050 clear + real ESDs available · Multi-Line Edit tool bulk update en next step.</span>
                </div>
                <button
                    onClick={nextStep}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                >
                    Clear sentinels
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

            <DataSourcesBar groups={dataGroups} label="ACK vs PMO · Teknion CR taxonomy · UN-CUTTABLE hero" />
        </div>
    )
}
