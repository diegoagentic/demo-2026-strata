/**
 * F84 · F4 p4.3 · Send PO batch via email template.
 * Story · "Coordinator sends the per-vendor POs with a pre-drafted email
 * template · receives a send confirmation."
 * UI · EmailTemplateModal over ExpertHubTransactionsWrapper (F84.7 · Expert
 * Hub UI stays visible when the modal closes). After the modal closes,
 * a path-complete panel reminds the presenter to switch flows manually
 * via the sidebar (no auto cross-flow jump).
 */

import { useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import EmailTemplateModal from '../mvp-modals/EmailTemplateModal'

export default function F4_p3_SendPos() {
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
            <EmailTemplateModal
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Send PO batch · MWH residential"
                metaLine="26 vendor POs · Teknion 4 · HBF 2 · Boss 2 · Alamir 3 · Nelson 2 · West Elm 2 · rest split"
                recipients={[
                    { name: 'Teknion Orders',    email: 'orders@teknion.com', role: 'Primary vendor · Teknion (4 POs)' },
                    { name: 'Isabella Bressler', email: 'ibressler@acme-dealer.com', role: 'Coordinator · CC' },
                ]}
                suggestedRecipients={[
                    { name: 'HBF Orders',        email: 'orders@hbf.com',         role: 'Vendor · HBF (2 POs)' },
                    { name: 'Boss Design Sales', email: 'sales@bossdesign.com',   role: 'Vendor · Boss Design (2 POs)' },
                    { name: 'Alamir Orders',     email: 'orders@alamir.com',      role: 'Vendor · Alamir (3 POs)' },
                    { name: 'Nelson & Co',       email: 'ap@nelsonandco.com',     role: 'Vendor · Nelson (2 POs)' },
                    { name: 'West Elm Contract', email: 'contract@westelm.com',   role: 'Vendor · West Elm (2 POs)' },
                    { name: 'Layne Nishimura',   email: 'layne@aspire-design.example', role: 'Lead Designer · FYI' },
                    { name: 'Jacob Swearingen',  email: 'jacob@acme-dealer.com',   role: 'Compliance · CC' },
                ]}
                subject="MWH residential · PO batch · 26 orders · $487,320"
                body={`Hi team,

Please find attached the 26 vendor POs for the MWH residential project · lines detailed in each PO.

Teknion · 4 POs · $164,988
HBF · 2 POs · $28,940
Boss Design · 2 POs · $14,220
Alamir · 3 POs · $17,540
Nelson · 2 POs · $12,140
West Elm · 2 POs · $9,860
(+ 11 additional vendor POs attached)

Please acknowledge with ESDs at your earliest convenience.

Thanks,
Isabella Bressler
Furniture Coordination Lead · Acme Dealer Inc.`}
                sendLabel="Send PO batch"
                sentMessage="Sent · ACKs expected"
            />

            {/* F84.7 + F84.11 · post-modal path-complete panel · Diego
                2026-08-21 pidió icon success + mensaje más explícito de
                fin de flujo. Presenter switches flow manually via sidebar
                (no auto cross-flow jump). */}
            {!open && (
                <div className="fixed top-32 right-6 z-40 w-[380px] bg-card border-2 border-success/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-success/10 px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-success uppercase tracking-wider">Flow complete</h3>
                            <p className="text-xs text-foreground font-semibold mt-0.5">Order/PO dispatch · MWH residential</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="text-xs text-foreground leading-relaxed">
                            All 26 vendor POs dispatched from the MWH PIF · this flow is done.
                        </div>
                        <div className="pt-2 border-t border-border text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
                            <span>To continue, use the sidebar · Experiences → pick <span className="text-foreground font-semibold">Electronic ACK</span> for the next flow.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
