/**
 * F84 · F1 p1.3 · Approve payment (Compliance releases ACH batch).
 * Story · "Compliance approves the Tue ACH batch · duplicate caught."
 * UI · PaymentApprovalModal over Transactions backdrop.
 *
 * F84.5 · Diego 2026-08-21 · closing the modal after approval must NOT
 * auto-advance to F2 (Dealer flow). Cross-experience auto-jump loses the
 * stakeholder. Presenter closes → sees a static "Path complete · switch
 * to Dealer Experience via sidebar" state · advances manually via the
 * sidebar Experience tab.
 */

import { useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import PaymentApprovalModal from '../mvp-modals/PaymentApprovalModal'

export default function F1_p3_PaymentApproval() {
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
            <PaymentApprovalModal
                isOpen={open}
                onClose={() => setOpen(false)}
            />
            {/* F84.5 · post-modal · path-complete strip · reminds the
                presenter that F1 wrapped in Expert Hub and next paths live
                in Dealer Experience or the other Expert Hub tabs. Uses the
                sidebar to switch · zero auto-cross-experience jump. */}
            {!open && (
                <div className="fixed top-32 right-6 z-40 w-[380px] bg-card border-2 border-success/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-success/10 px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-success uppercase tracking-wider">Flow complete</h3>
                            <p className="text-xs text-foreground font-semibold mt-0.5">AP intake & matching · Tue payment run</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="text-xs text-foreground leading-relaxed">
                            The ACH batch is released · vendor bills posted to NetSuite · this flow is done.
                        </div>
                        <div className="pt-2 border-t border-border text-[11px] text-muted-foreground inline-flex items-start gap-1.5">
                            <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
                            <span>To continue, use the sidebar · Experiences → pick <span className="text-foreground font-semibold">Dealer</span> or another Expert Hub flow.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
