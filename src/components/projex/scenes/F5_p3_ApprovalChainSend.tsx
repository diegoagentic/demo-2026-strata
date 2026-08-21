/**
 * F84 · F5 p5.3 · Trigger approval chain (send to designers).
 * Story · "After the ACK vs PO review · Coordinator sends approval request
 * to the designer chain (Lead → Spec → PM)."
 * UI · EmailTemplateModal over OCR backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
import EmailTemplateModal from '../mvp-modals/EmailTemplateModal'

export default function F5_p3_ApprovalChainSend() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <EmailTemplateModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
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
Furniture Coordination Lead · Projex Inc.`}
                sendLabel="Send approval request"
                sentMessage="Sent to chain"
            />
        </div>
    )
}
