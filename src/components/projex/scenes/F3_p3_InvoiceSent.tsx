/**
 * F84 · F3 p3.3 · Invoice sent + tracked in shared queue.
 * Story · "Invoice sent to customer · appears in AR follow-up queue with
 * notes field visible."
 * UI · SyncConfirmation staged reveal.
 */

import { useDemo } from '../../../context/DemoContext'
import SyncConfirmation from '../mvp-modals/SyncConfirmation'

export default function F3_p3_InvoiceSent() {
    const { nextStep } = useDemo()
    return (
        <SyncConfirmation
            title="Send invoice · file in shared AR queue"
            metaLine="Invoice · PJX-INV-3421 · Fairport 40% draw · $58,240"
            steps={[
                { label: 'Customer invoice generated', detail: 'PDF issued · NetSuite journal entry PJX-JE-2026-0842' },
                { label: 'Emailed to Fairport HQ AP', detail: 'ap@fairport-hq.com · attached PDF · due 2026-09-20' },
                { label: 'Added to shared AR follow-up queue', detail: 'Isabella + Alec see same state · notes field visible' },
            ]}
            doneLabel="Invoice sent · tracked in shared queue"
            doneDetail="Shared visibility across Coordinator + Walls Director · reminders scheduled at Net 10 + 30 days"
            continueLabel="Continue"
            onContinue={nextStep}
        />
    )
}
