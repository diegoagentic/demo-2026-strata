/**
 * COMPONENT: F5_p55_DesignerChainScene (Projex · p5.5)
 * PURPOSE: Designer chain FC8 net-new · auto-assembles Layne → Tate → Josh.
 *          Attachments + replies + timestamps · CC affordance. Replaces
 *          Isabella\'s manual Excel assembly.
 *
 * SHAPE · vertical chain con handoff arrows + attachment thumbnails (F5)
 * REUSE · bfi/DesignerResponseScene + mbi/FileManagementPanel
 * NOTIF · dispatchea `projex:chain-signed-off` on complete
 */

import { useEffect, useState } from 'react'
import {
    ArrowRight, ArrowDown, User, Paperclip, MessageSquare,
    CheckCircle2, Clock, Users,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { DESIGNER_CHAIN } from '../../../config/profiles/projex-data/teknionAck'

export default function F5_p55_DesignerChainScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const [revealed, setRevealed] = useState(0)

    useEffect(() => {
        if (revealed < DESIGNER_CHAIN.length) {
            const cancel = pauseAwareTimeout(() => setRevealed(n => n + 1), 900)
            return cancel
        }
    }, [revealed, pauseAwareTimeout])

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F5</span>
                    <span>Electronic ordering &amp; ACK · step 5</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Users className="h-3 w-3" aria-hidden="true" /> FC8 net-new
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Designer chain assembly · Layne → Tate → Josh (FC8 net-new)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Auto-assembled thread con attachments + replies + timestamps. Replaces Isabella\'s manual Excel assembly.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Designer thread · NCBA ACK review</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{revealed} / {DESIGNER_CHAIN.length} entries</span>
                </div>
                <div className="p-4 space-y-4">
                    {DESIGNER_CHAIN.slice(0, revealed).map((entry, i) => {
                        const isLast = i === DESIGNER_CHAIN.length - 1
                        return (
                            <div key={entry.id}>
                                <div className="animate-in fade-in slide-in-from-left-2 duration-400 flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-ai/15 text-ai flex items-center justify-center shrink-0 font-bold text-sm">
                                        {entry.designer[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-bold text-foreground">{entry.designer}</span>
                                            <span className="text-[11px] text-muted-foreground">· {entry.role}</span>
                                            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{entry.stamp}</span>
                                        </div>
                                        <div className="text-sm text-foreground mt-1">{entry.action}</div>
                                        {entry.attachments && entry.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {entry.attachments.map(a => (
                                                    <span key={a} className="inline-flex items-center gap-1 text-[10px] font-medium bg-muted rounded px-2 py-1 border border-border">
                                                        <Paperclip className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                                                        <span className="text-foreground">{a}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {entry.reply && (
                                            <div className="mt-2 rounded-lg bg-muted/40 border border-border px-3 py-2 text-[11px] text-foreground italic">
                                                &quot;{entry.reply}&quot;
                                            </div>
                                        )}
                                    </div>
                                    {isLast && revealed === DESIGNER_CHAIN.length && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-2 py-1 shrink-0">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            Sign-off
                                        </span>
                                    )}
                                </div>
                                {!isLast && (
                                    <div className="ml-5 my-2 flex items-center gap-1 text-muted-foreground">
                                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                                        <span className="text-[10px]">handoff</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {revealed < DESIGNER_CHAIN.length && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-13">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>Waiting for next designer response…</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Impact narrative */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">FC8 net-new · replaces Isabella\'s Excel</div>
                    <div className="text-muted-foreground mt-0.5">
                        Today Isabella manually threads emails between Layne · Tate · Josh en Excel · loses attachments · chases sign-offs. Strata auto-assembles chain con attachments preservados + timestamps + CC affordance.
                    </div>
                </div>
            </div>

            {revealed === DESIGNER_CHAIN.length && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">Chain signed off by Josh (PM)</span>
                        <span className="text-muted-foreground"> · CRs reviewed · PMO ready · shipment tracking begins en next step.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open shipment tracking
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Designer chain · Layne → Tate → Josh · FC8 net-new" />
        </div>
    )
}
