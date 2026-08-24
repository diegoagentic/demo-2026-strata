/**
 * COMPONENT: AcmeDealerPage · F84 MVP (2026-08-21)
 * PURPOSE: Route the 15 Acme Dealer demo steps to their scene component.
 *          One story per path · 3 screens (initial → process → final) ·
 *          all prod-lifted UI · zero decoration.
 *
 * USED BY: App.tsx cases `acme-dealer-bills` · `acme-dealer-vendor-onboarding` ·
 *          `acme-dealer-billing` · `acme-dealer-order-po` · `acme-dealer-ack`.
 */

import { useEffect } from 'react'
import { useDemo } from '../../context/DemoContext'
import AcmeDealerExperienceShell, { type AcmeDealerTab } from './AcmeDealerExperienceShell'
import { experienceOf } from '../../config/profiles/acme-dealer'

// F84 · 15 new scenes (3 per path)
import F1_p1_OcrIngest        from './scenes/F1_p1_OcrIngest'
import F1_p2_PoBillCompare    from './scenes/F1_p2_PoBillCompare'
import F1_p3_PaymentApproval  from './scenes/F1_p3_PaymentApproval'
import F2_p1_W9Intake         from './scenes/F2_p1_W9Intake'
import F2_p2_W9Registry       from './scenes/F2_p2_W9Registry'
import F2_p3_NetSuiteSync     from './scenes/F2_p3_NetSuiteSync'
import F3_p1_BillingAlert     from './scenes/F3_p1_BillingAlert'
import F3_p2_ProformaReview   from './scenes/F3_p2_ProformaReview'
import F3_p3_InvoiceSent      from './scenes/F3_p3_InvoiceSent'
import F4_p1_PifPreview       from './scenes/F4_p1_PifPreview'
import F4_p2_BatchPoGrid      from './scenes/F4_p2_BatchPoGrid'
import F4_p3_SendPos          from './scenes/F4_p3_SendPos'
import F5_p1_AckIngest        from './scenes/F5_p1_AckIngest'
import F5_p2_AckPoCompare     from './scenes/F5_p2_AckPoCompare'
import F5_p3_ApprovalChainSend from './scenes/F5_p3_ApprovalChainSend'

/** F80.5 · Active platform tab per flow (visual-only in shell). */
function activeTabFor(app: string | undefined): AcmeDealerTab {
    if (app === 'acme-dealer-bills')                return 'transactions'
    if (app === 'acme-dealer-order-po')          return 'transactions'
    if (app === 'acme-dealer-ack')               return 'comparisons'
    if (app === 'acme-dealer-vendor-onboarding') return 'ocr'
    if (app === 'acme-dealer-billing')           return 'transactions'
    return 'transactions'
}

export default function AcmeDealerPage() {
    const { currentStep } = useDemo()
    const id = currentStep?.id
    const app = currentStep?.app

    // F1 · Bills intake & matching
    if (id === 'p1.1') return <Shell><F1_p1_OcrIngest /></Shell>
    if (id === 'p1.2') return <Shell><F1_p2_PoBillCompare /></Shell>
    if (id === 'p1.3') return <Shell><F1_p3_PaymentApproval /></Shell>
    if (id?.startsWith('p1.') || app === 'acme-dealer-bills') return <Shell><F1_p1_OcrIngest /></Shell>

    // F2 · Vendor onboarding
    if (id === 'p2.1') return <Shell><F2_p1_W9Intake /></Shell>
    if (id === 'p2.2') return <Shell><F2_p2_W9Registry /></Shell>
    if (id === 'p2.3') return <Shell><F2_p3_NetSuiteSync /></Shell>
    if (id?.startsWith('p2.') || app === 'acme-dealer-vendor-onboarding') return <Shell><F2_p1_W9Intake /></Shell>

    // F3 · Progress billing
    if (id === 'p3.1') return <Shell><F3_p1_BillingAlert /></Shell>
    if (id === 'p3.2') return <Shell><F3_p2_ProformaReview /></Shell>
    if (id === 'p3.3') return <Shell><F3_p3_InvoiceSent /></Shell>
    if (id?.startsWith('p3.') || app === 'acme-dealer-billing') return <Shell><F3_p1_BillingAlert /></Shell>

    // F4 · Order/PO dispatch
    if (id === 'p4.1') return <Shell><F4_p1_PifPreview /></Shell>
    if (id === 'p4.2') return <Shell><F4_p2_BatchPoGrid /></Shell>
    if (id === 'p4.3') return <Shell><F4_p3_SendPos /></Shell>
    if (id?.startsWith('p4.') || app === 'acme-dealer-order-po') return <Shell><F4_p1_PifPreview /></Shell>

    // F5 · Electronic ACK
    if (id === 'p5.1') return <Shell><F5_p1_AckIngest /></Shell>
    if (id === 'p5.2') return <Shell><F5_p2_AckPoCompare /></Shell>
    if (id === 'p5.3') return <Shell><F5_p3_ApprovalChainSend /></Shell>
    if (id?.startsWith('p5.') || app === 'acme-dealer-ack') return <Shell><F5_p1_AckIngest /></Shell>

    // Default fallback · start at F1 p1.1
    return <Shell><F1_p1_OcrIngest /></Shell>
}

/** F84 · Each path arrival step fires exactly one AC event · scene listens
 *  and does NOT auto-advance (scenes control their own advance via
 *  modal onClose → nextStep). */
const STEP_TO_AC_EVENT: Record<string, string> = {
    'p1.1': 'acme-dealer:bills-open',
    'p2.1': 'acme-dealer:w9-open',
    'p2.2': 'acme-dealer:w9-registered', // F84.16 · replaces custom overlay in F2_p2
    'p3.1': 'acme-dealer:billing-open',
    'p4.1': 'acme-dealer:pif-open',
    'p5.1': 'acme-dealer:ack-open',
}

/** F84.12 · Events the scene handles directly (opens a modal instead of
 *  auto-advancing). Shell skips its own listener for these · avoids
 *  double-firing when the scene needs the notif click to reveal a modal
 *  in the SAME step (advance happens on modal close). */
const SCENE_HANDLED_EVENTS = new Set<string>([
    'acme-dealer:w9-open',   // F2 p2.1 · OCR list → notif → DocumentReviewModal opens in-place
])

function Shell({ children }: { children: React.ReactNode }) {
    const { currentStep, nextStep } = useDemo()
    const app = currentStep?.app
    const stepId = currentStep?.id ?? ''

    /** F84 · If the current step's AC event fires (from clicking the notif),
     *  advance the demo. Scenes that need custom behavior register their
     *  event in SCENE_HANDLED_EVENTS above · we skip the Shell listener
     *  for those so the scene can open a modal without racing. */
    useEffect(() => {
        const evt = STEP_TO_AC_EVENT[stepId]
        if (!evt) return
        if (SCENE_HANDLED_EVENTS.has(evt)) return
        const advance = () => nextStep()
        window.addEventListener(evt, advance)
        return () => window.removeEventListener(evt, advance)
    }, [nextStep, stepId])

    return (
        <AcmeDealerExperienceShell experience={experienceOf(app)} activeTab={activeTabFor(app)}>
            {children}
        </AcmeDealerExperienceShell>
    )
}
