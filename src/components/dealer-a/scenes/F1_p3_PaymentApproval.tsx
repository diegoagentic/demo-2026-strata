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
 *
 * F86.25 · Diego 2026-08-27 · when the Approver routes untouched pending
 * bills to "Create a new draft batch" during Confirm release, this scene
 * lifts the release payload from the modal so we can surface the record.
 *
 * F86.25.2 · Diego 2026-08-27 · the new-draft-batch record is now injected
 * as a NATIVE kanban card at the head of the Received column (via the
 * additive `additionalOrders` prop on the vendor Transactions surface)
 * instead of a floating overlay that read as alien to the kanban. The
 * compliance-review branch keeps its own overlay since those bills leave
 * the kanban entirely (Compliance re-triage).
 */

import { useMemo, useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import PaymentApprovalModal, { type ReleasePayload } from '../mvp-modals/PaymentApprovalModal'

function fmtUsd(n: number) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function newDraftBatchId(): string {
    const stamp = Date.now().toString(36).slice(-4).toUpperCase()
    return `#PR-DRAFT-${stamp}`
}

export default function F1_p3_PaymentApproval() {
    const [open, setOpen] = useState(true)
    const [release, setRelease] = useState<ReleasePayload | null>(null)
    const [draftId] = useState(newDraftBatchId)

    // F86.25.2 · Build the native-shaped kanban entry for the injected
    // record. Uses the same field shape as the vendor's `recentOrders`.
    // F86.25.3 · both destinations now inject as native kanban cards:
    // - new-draft-batch  → status 'Received'       · deferred payment run
    // - compliance-review → status 'Pending Review' · Compliance re-triages,
    //   which is the Pending Review lane in this vendor pipeline
    //   (Received → Pending Review → In Review → Approved).
    const additionalOrders = useMemo(() => {
        if (!release || release.pendingCount === 0 || !release.pendingDestination) return undefined
        const common = {
            id: draftId,
            client: 'Dealer A',
            amount: fmtUsd(release.pendingTotal),
            date: 'Just now',
            location: 'System',
        }
        if (release.pendingDestination === 'new-draft-batch') {
            return [{
                ...common,
                customer: 'Payment run · draft',
                project: `Tue payment run · ${release.pendingCount} bill${release.pendingCount === 1 ? '' : 's'} deferred`,
                status: 'Received',
                initials: 'PR',
                statusColor: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
            }]
        }
        // compliance-review
        return [{
            ...common,
            customer: 'Payment run · Compliance re-triage',
            project: `Tue payment run · ${release.pendingCount} bill${release.pendingCount === 1 ? '' : 's'} back for review`,
            status: 'Pending Review',
            initials: 'CR',
            statusColor: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        }]
    }, [release, draftId])

    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper additionalOrders={additionalOrders} />
            <PaymentApprovalModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onApproved={(payload) => setRelease(payload)}
            />
            {/* F84.5 · post-modal · path-complete strip */}
            {!open && (
                <div className="fixed top-32 right-6 z-40 w-[380px] bg-card border-2 border-success/50 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-success/10 px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-success uppercase tracking-wider">Flow complete</h3>
                            <p className="text-xs text-foreground font-semibold mt-0.5">Bills intake & matching · Tue payment run</p>
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

            {/* F86.25.3 · Both destination branches now render as native
                kanban cards (see additionalOrders memo above) · no more
                floating overlays for either. Compliance-review lands in
                Pending Review, new-draft-batch in Received. */}
        </div>
    )
}
