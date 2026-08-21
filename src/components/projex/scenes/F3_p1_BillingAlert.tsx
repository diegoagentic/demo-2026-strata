/**
 * F84 · F3 p3.1 · Billing deadline alert.
 * Story · "Fairport crosses 50% ordered · deposit received · proforma
 * release flagged."
 * UI · prod Transactions backdrop · AC notif on mount announces the alert.
 */

import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'

export default function F3_p1_BillingAlert() {
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
        </div>
    )
}
