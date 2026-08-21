/**
 * F84 · F4 p4.3 · Send POs via email template.
 * Story · "Isabella sends the per-vendor PO with a pre-drafted email
 * template · receives a send confirmation."
 * UI · EmailTemplateModal over PO grid backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import PODraftsListPage from '../../vendor/UI-Dealer/po-conversion/PODraftsListPage'
import EmailTemplateModal from '../mvp-modals/EmailTemplateModal'

export default function F4_p3_SendPos() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen bg-background">
            <PODraftsListPage />
            <EmailTemplateModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
                title="Send PO to Teknion · MWH batch"
                metaLine="First send of 26 · Teknion 4 POs bundled · draft-email dispatch"
                recipients={[
                    { name: 'Teknion Orders', email: 'orders@teknion.com', role: 'Vendor' },
                    { name: 'Isabella Bressler', email: 'ibressler@projex-inc.com', role: 'Coordinator · CC' },
                ]}
                subject="MWH residential · Teknion PO batch · 4 orders · $164,988"
                body={`Hi Teknion team,

Please find attached 4 purchase orders for the MWH residential project · lines detailed in each PO.

PO-2026-4501 · 84 lines · $62,450
PO-2026-4502 · 44 lines · $28,100
PO-2026-4508 · 24 lines · $14,200
PO-2026-4512 · 18 lines · $12,440

Please acknowledge with ESDs at your earliest convenience.

Thanks,
Isabella Bressler
Furniture Coordination Lead · Projex Inc.`}
                sendLabel="Send to Teknion"
                sentMessage="Sent · ACK expected"
            />
        </div>
    )
}
