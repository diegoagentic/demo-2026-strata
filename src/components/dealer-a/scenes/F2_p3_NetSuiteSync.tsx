/**
 * F84 · F2 p2.3 · Sync to NetSuite (compliance registry entry + expiration).
 * Story · "Vendor #734 Warehouse by Design synced to NetSuite compliance
 * registry with expiration alert."
 * UI · SyncConfirmation staged reveal.
 */

import { useDemo } from '../../../context/DemoContext'
import SyncConfirmation from '../mvp-modals/SyncConfirmation'

export default function F2_p3_NetSuiteSync() {
    const { nextStep } = useDemo()
    return (
        <SyncConfirmation
            title="Sync vendor to NetSuite compliance registry"
            metaLine="Vendor · Warehouse by Design · TIN redacted · expiration 2027-03-12"
            steps={[
                { label: 'Vendor record created', detail: 'NetSuite Vendor #734 · legal entity Dealer A Inc.' },
                { label: 'W-9 attached to compliance folder', detail: 'SharePoint mirror · signed date indexed' },
                { label: 'Expiration alert scheduled', detail: 'Reminds Accounting 30 days before 2027-03-12' },
            ]}
            doneLabel="Vendor ready for use in POs"
            doneDetail="Warehouse by Design available in NetSuite vendor picker · compliance registry updated"
            continueLabel="Continue"
            onContinue={nextStep}
        />
    )
}
