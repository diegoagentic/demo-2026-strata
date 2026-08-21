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
                <div className="fixed top-32 right-6 z-40 w-[360px] bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                        <h3 className="text-sm font-bold text-foreground">AP path complete</h3>
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                        The Tuesday ACH batch is released and the vendor bills are posted to NetSuite. To continue the walkthrough, switch to another Flow in the sidebar.
                    </div>
                    <div className="pt-2 border-t border-border text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        Sidebar · Experiences · pick <span className="text-foreground font-semibold">Dealer</span> or another Expert Hub Flow.
                    </div>
                </div>
            )}
        </div>
    )
}
