/**
 * F84 · F5 p5.3 · Trigger approval chain (send to designers).
 * Story · "After the ACK vs PO review · Coordinator sends approval request
 * to the designer chain (Lead → Spec → PM)."
 *
 * F84.18 · Diego 2026-08-21 · after the email is sent, simulate the
 * chain approving sequentially · Coordinator sees the approval land in
 * real time (Layne signs → Tate signs → Josh signs → chain complete),
 * closing the ACK path with a clear payoff.
 */

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ArrowRight, Users, Mail, Bell } from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
import EmailTemplateModal from '../mvp-modals/EmailTemplateModal'

interface ChainMember {
    name: string
    role: string
    initials: string
    tone: string
}

const CHAIN: ChainMember[] = [
    { name: 'Layne Nishimura', role: 'Lead Designer',  initials: 'LN', tone: 'bg-ai/20 text-ai' },
    { name: 'Tate Ross',       role: 'Spec Designer',  initials: 'TR', tone: 'bg-info/20 text-info' },
    { name: 'Josh Bordon',     role: 'PM Coordinator', initials: 'JB', tone: 'bg-warning/20 text-warning' },
]

export default function F5_p3_ApprovalChainSend() {
    const [open, setOpen] = useState(true)
    const [sent, setSent] = useState(false)
    /** F84.18 · post-send chain reveal · one member every ~1.3s. */
    const [approved, setApproved] = useState(0)
    const [notifOpen, setNotifOpen] = useState(false)

    // When the modal closes AND was sent, kick off the chain reveal.
    useEffect(() => {
        if (open || !sent) return
        if (approved < CHAIN.length) {
            // First approval fires after a short delay to feel like the recipients
            // are reading + signing, subsequent ones cascade quickly.
            const delay = approved === 0 ? 1200 : 1300
            const t = setTimeout(() => setApproved(n => n + 1), delay)
            return () => clearTimeout(t)
        }
        // All 3 signed · surface the completion notif card.
        if (!notifOpen) {
            const t = setTimeout(() => setNotifOpen(true), 500)
            return () => clearTimeout(t)
        }
    }, [open, sent, approved, notifOpen])

    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <EmailTemplateModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onSent={() => setSent(true)}
                title="Send approval request to designer chain · MWH ACK"
                metaLine="ACK PO-DC-0009642 · Teknion · 13 CRs · Lead → Spec → PM"
                recipients={[
                    { name: 'Layne Nishimura', email: 'layne@aspire-design.example', role: 'Lead Designer' },
                    { name: 'Tate Ross',      email: 'tate@aspire-design.example',  role: 'Spec Designer' },
                    { name: 'Josh Bordon',    email: 'josh@aspire-design.example',  role: 'PM Coordinator' },
                ]}
                subject="MWH · Teknion ACK approval needed · 13 CRs · BIFMA + width change"
                body={`Hi Layne, Tate, Josh,

Teknion returned the ACK on the MWH residential PO (PO-DC-0009642) · 58 of 71 lines match exactly. The 13 change requests need your review before I update PMO:

· 4 lines · ESD +5 days (leadtime slip · install buffer covers it)
· 1 line · BIFMA advisory on Lounge 3-seat (frame steel substitution · same X5.4 grade)
· 1 line · Width 96" → 94" on the conference table (walnut supply · install space accommodates)
· 7 pricer comments (informational · no price impact)

Please approve or flag the BIFMA advisory + width change · I'll accept leadtime shifts + pricer comments unless you push back.

Full ACK attached · reply-all to keep the chain aligned.

Thanks,
Isabella Bressler
Furniture Coordination Lead · Dealer A Inc.`}
                sendLabel="Send approval request"
                sentMessage="Sent to chain"
            />

            {/* F84.18 · post-send approval chain reveal · staged sign-off
                per member with a live status chip · closes on notif card
                once all 3 approve. */}
            {!open && sent && (
                <div className="fixed top-32 right-6 z-40 w-[400px] bg-card border-2 border-ai/40 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-ai-light px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-ai/20 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-ai" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ai">
                                <Mail className="h-3 w-3" aria-hidden="true" />
                                Approval chain · live
                            </div>
                            <p className="text-xs text-foreground font-semibold mt-0.5">MWH ACK · PO-DC-0009642</p>
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-ai bg-background rounded-md px-1.5 py-0.5">
                            {approved}/{CHAIN.length}
                        </span>
                    </div>

                    <div className="p-4 space-y-2">
                        {CHAIN.map((m, i) => {
                            const isSigned = i < approved
                            const isCurrent = i === approved && approved < CHAIN.length
                            return (
                                <div
                                    key={m.name}
                                    className={`
                                        flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-300
                                        ${isSigned ? 'bg-success/5 border-success/40' : ''}
                                        ${isCurrent ? 'bg-ai-light border-ai/40' : ''}
                                        ${!isSigned && !isCurrent ? 'bg-muted/20 border-border opacity-50' : ''}
                                    `}
                                >
                                    <div className={`h-7 w-7 rounded-full ${m.tone} flex items-center justify-center shrink-0 text-[10px] font-bold`}>
                                        {m.initials}
                                    </div>
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-foreground font-semibold truncate">{m.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{m.role}</div>
                                    </div>
                                    <div className="shrink-0">
                                        {isSigned && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded-md px-1.5 py-0.5">
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                Approved
                                            </span>
                                        )}
                                        {isCurrent && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ai animate-pulse">
                                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                                Reviewing…
                                            </span>
                                        )}
                                        {!isSigned && !isCurrent && (
                                            <span className="text-[10px] text-muted-foreground">Waiting</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* F84.18 · chain complete · simulated notif · path complete */}
            {notifOpen && (
                <div className="fixed bottom-6 right-6 z-40 w-[400px] bg-card border-2 border-success/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-success/10 px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success">
                                <Bell className="h-3 w-3" aria-hidden="true" />
                                Approval received · chain complete
                            </div>
                            <p className="text-xs text-foreground font-semibold mt-0.5">All 3 designers signed off on the MWH ACK</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="text-xs text-foreground leading-relaxed">
                            Layne, Tate and Josh approved the ACK · BIFMA advisory + width change accepted · PMO is now cleared to update against the Teknion ESDs.
                        </div>
                        <div className="pt-2 border-t border-border text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
                            <span>Path 5 complete · switch to another Flow in the sidebar to continue the walkthrough.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
