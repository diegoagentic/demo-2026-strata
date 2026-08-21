/**
 * COMPONENT: F5_p55_DesignerChainScene (Projex · p5.5)
 * PURPOSE: Designer chain FC8 net-new · auto-assembles Lead Designer → Spec Designer → PM Coordinator.
 *          Attachments + replies + timestamps · CC affordance. Replaces
 *          Coordinator\'s manual Excel assembly.
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
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* F83.T · slim header · prod ComparisonReviewModal shape */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h2 className="text-base font-bold text-foreground">Designer chain · NCBA ACK review</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${revealed >= DESIGNER_CHAIN.length ? 'bg-success/15 text-success' : 'bg-ai-light text-ai'}`}>
                        {revealed >= DESIGNER_CHAIN.length
                            ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Chain complete</>
                            : <><Clock className="h-3 w-3" aria-hidden="true" /> Assembling</>}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Lead Designer → Spec Designer → PM Coordinator</span>
                    <span>·</span>
                    <span className="tabular-nums">{revealed}/{DESIGNER_CHAIN.length} entries assembled</span>
                    <span>·</span>
                    <span>FC8 net-new · replaces manual Excel assembly</span>
                </div>
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
                    <div className="text-foreground font-semibold">FC8 net-new · replaces Coordinator\'s Excel</div>
                    <div className="text-muted-foreground mt-0.5">
                        Today Coordinator manually threads emails between Lead Designer · Spec Designer · PM Coordinator in Excel · loses attachments · chases sign-offs. Strata auto-assembles chain with attachments preservados + timestamps + CC affordance.
                    </div>
                </div>
            </div>

            {revealed === DESIGNER_CHAIN.length && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">Chain signed off by PM Coordinator (PM)</span>
                        <span className="text-muted-foreground"> · CRs reviewed · PMO ready · shipment tracking begins in the next step.</span>
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

        </div>
    )
}
