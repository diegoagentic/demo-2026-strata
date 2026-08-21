/**
 * F84 · F1 p1.3 · Approve payment (Compliance releases ACH batch).
 * Story · "Compliance approves the Tue ACH batch · duplicate caught."
 * UI · PaymentApprovalModal over Transactions backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import PaymentApprovalModal from '../mvp-modals/PaymentApprovalModal'

export default function F1_p3_PaymentApproval() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
            <PaymentApprovalModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
            />
        </div>
    )
}
