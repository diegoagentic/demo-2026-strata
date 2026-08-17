/**
 * COMPONENT: ProjexPage
 * PURPOSE: F74 Phase 0 · shell que rutea steps del demo Projex a su scene
 *          correspondiente. Pattern copiado de CLCPage + OfficeworksPage.
 *
 *          Phase 0 = placeholder scenes (una por flow · 5 total) para validar
 *          que el flow-switcher dropdown funciona y el step→page routing es
 *          correcto. Detail scenes vienen en Phase 1-5 (una fase por flow).
 *
 * DS TOKENS: bg-background · bg-card · text-foreground · text-muted-foreground
 *            · border-border · bg-primary · text-primary-foreground
 *
 * SOURCE OF TRUTH: scratchpad/projex-notion/_SOT_projex.md (§1-19)
 *
 * USED BY: App.tsx cases `projex-ap` · `projex-vendor-onboarding` ·
 *          `projex-billing` · `projex-order-po` · `projex-ack`
 */

import type { ReactNode } from 'react'
import { User, Mail, GitCompare, FileText, MessageSquare, Package, ClipboardList } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import ProjexExperienceShell, { type ProjexExperience, type ProjexTab } from './ProjexExperienceShell'
import ProjexArrivalStrip from './ProjexArrivalStrip'
import ProjexPlaceholderScene from './scenes/ProjexPlaceholderScene'
import APInboxSweepScene from './scenes/APInboxSweepScene'
import APBillIntakeScene from './scenes/APBillIntakeScene'
import APLineItemMatchScene from './scenes/APLineItemMatchScene'
import APInstallVendorExceptionScene from './scenes/APInstallVendorExceptionScene'
import APPaymentRunScene from './scenes/APPaymentRunScene'
import APBillPostedScene from './scenes/APBillPostedScene'
// F2 · 6 scenes (F74 Phase 1B.D)
import F2_p21_VendorIntakeScene from './scenes/F2_p21_VendorIntakeScene'
import F2_p22_W9OcrScene from './scenes/F2_p22_W9OcrScene'
import F2_p23_PreflightScene from './scenes/F2_p23_PreflightScene'
import F2_p24_JacobGateScene from './scenes/F2_p24_JacobGateScene'
import F2_p25_VendorRegistryScene from './scenes/F2_p25_VendorRegistryScene'
import F2_p26_DealerReadinessScene from './scenes/F2_p26_DealerReadinessScene'
// F3 · 6 scenes (F74 Phase 1B.B)
import F3_p31_ThresholdAlertScene from './scenes/F3_p31_ThresholdAlertScene'
import F3_p32_ProformaReviewScene from './scenes/F3_p32_ProformaReviewScene'
import F3_p33_WallsPMGateScene from './scenes/F3_p33_WallsPMGateScene'
import F3_p34_ARKanbanScene from './scenes/F3_p34_ARKanbanScene'
import F3_p35_CollectionDraftsScene from './scenes/F3_p35_CollectionDraftsScene'
import F3_p36_NetSuiteSyncScene from './scenes/F3_p36_NetSuiteSyncScene'
// F4 · 6 scenes (F74 Phase 1B.C)
import F4_p41_DesignerIntakeScene from './scenes/F4_p41_DesignerIntakeScene'
import F4_p42_PifParseScene from './scenes/F4_p42_PifParseScene'
import F4_p43_ManualLinesScene from './scenes/F4_p43_ManualLinesScene'
import F4_p44_POBatchGridScene from './scenes/F4_p44_POBatchGridScene'
import F4_p45_PerVendorSendScene from './scenes/F4_p45_PerVendorSendScene'
import F4_p46_SnapshotAuditScene from './scenes/F4_p46_SnapshotAuditScene'
// F5 · 6 scenes (F74 Phase 1B.E)
import F5_p51_SifUploadScene from './scenes/F5_p51_SifUploadScene'
import F5_p52_AckOcrScene from './scenes/F5_p52_AckOcrScene'
import F5_p53_AckPmoReviewScene from './scenes/F5_p53_AckPmoReviewScene'
import F5_p54_SentinelClearScene from './scenes/F5_p54_SentinelClearScene'
import F5_p55_DesignerChainScene from './scenes/F5_p55_DesignerChainScene'
import F5_p56_ShipmentTrackingScene from './scenes/F5_p56_ShipmentTrackingScene'

// F75 · Experience mapping per HTML §04
function experienceFor(app: string | undefined): ProjexExperience {
    if (app === 'projex-vendor-onboarding' || app === 'projex-billing') return 'dealer'
    return 'expert-hub' // F1 (ap) · F4 (order-po) · F5 (ack)
}

// F75 · Active platform tab per flow (visual-only in shell)
function activeTabFor(app: string | undefined): ProjexTab {
    if (app === 'projex-ap')                return 'transactions'
    if (app === 'projex-order-po')          return 'transactions'
    if (app === 'projex-ack')               return 'comparisons'
    if (app === 'projex-vendor-onboarding') return 'mac'
    if (app === 'projex-billing')           return 'dashboard'
    return 'transactions'
}

// F75 · Per-step arrival context · fixes "loose screens" flagged by user 2026-08-17
// Maps each loose scene to a breadcrumb + focus signal shown ABOVE the scene body
// via ProjexArrivalStrip. Scenes NOT in this map render without a strip (they are
// already landings: p1.1 · p1.4 · p1.5 · p2.1 (inline) · p2.5 · p2.6 · p3.4 · p3.5 · p4.4 · p4.5 · p5.2 · p5.6).
type ArrivalContext = { breadcrumb: string[]; focus?: { label: string; icon?: ReactNode; tone?: 'primary' | 'ai' | 'info' | 'warning' | 'muted' }; hint?: string }

const ARRIVAL_MAP: Record<string, ArrivalContext> = {
    // F1 · Expert Hub · AP intake flow
    'p1.2': { breadcrumb: ['Expert Hub', 'Transactions', 'AP inbox', 'Teknion TEK-2026-0847'], focus: { label: 'Daniel clicked row · overnight sweep', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: 'OCR pipeline · 291 lines' },
    'p1.3': { breadcrumb: ['Expert Hub', 'Transactions', 'AP inbox', 'TEK-2026-0847 · line-item match'], focus: { label: 'Daniel reconciling 291 lines to PO', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: 'Match to the penny' },
    'p1.6': { breadcrumb: ['Expert Hub', 'Transactions', 'AP inbox', 'TEK-2026-0847 · posted'], focus: { label: 'Auto · consequence of Matt approval', tone: 'muted' }, hint: 'NetSuite + SharePoint sync' },

    // F2 · Dealer Experience · vendor onboarding flow
    'p2.2': { breadcrumb: ['Dealer Experience', 'MAC & Requests', 'Onboarding queue', 'WBD ticket'], focus: { label: "Daniel opened Kelly's WBD ticket", icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: 'W-9 OCR extraction' },
    'p2.3': { breadcrumb: ['Dealer Experience', 'MAC & Requests', 'Onboarding queue', 'WBD ticket'], focus: { label: 'Compliance preflight · 4 checks', icon: <GitCompare className="h-3 w-3" aria-hidden="true" />, tone: 'ai' }, hint: 'W-9 <12mo · 1099 · ACH · W-8 BEN-E' },
    'p2.4': { breadcrumb: ['Dealer Experience', 'MAC & Requests', 'Onboarding queue', 'WBD ticket'], focus: { label: 'Jacob compliance sign-off gate', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'warning' }, hint: 'Human decision · release or reject' },

    // F3 · Dealer Experience · progress billing flow
    'p3.1': { breadcrumb: ['Dealer Experience', 'Dashboard', 'Billing forecast'], focus: { label: 'Fairport crossing 50% threshold', icon: <FileText className="h-3 w-3" aria-hidden="true" />, tone: 'warning' }, hint: '5 active projects watched' },
    'p3.2': { breadcrumb: ['Dealer Experience', 'Dashboard', 'Billing forecast', 'Fairport'], focus: { label: 'Isabella reviewing proforma draft', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: '40% tranche · $58,240' },
    'p3.3': { breadcrumb: ['Dealer Experience', 'Dashboard', 'Billing forecast', 'MWH Walls'], focus: { label: 'WC9 Walls PM gate · Alec → Stacy', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'warning' }, hint: 'Install-complete confirmation required' },
    'p3.6': { breadcrumb: ['Dealer Experience', 'Dashboard', 'Billing forecast', 'Fairport'], focus: { label: 'Auto · consequence of proforma approval', tone: 'muted' }, hint: 'Invoice posted → NetSuite journal' },

    // F4 · Expert Hub · PIF → PO dispatch flow
    'p4.1': { breadcrumb: ['Expert Hub', 'Transactions', 'PIF inbox', 'MWH residential'], focus: { label: 'Layne emailed PIF · attachments 2', icon: <Mail className="h-3 w-3" aria-hidden="true" />, tone: 'info' }, hint: 'Isabella receiving order request' },
    'p4.2': { breadcrumb: ['Expert Hub', 'Transactions', 'PIF inbox', 'MWH PIF · parsing'], focus: { label: 'Strata parsing 300-line PIF', icon: <GitCompare className="h-3 w-3" aria-hidden="true" />, tone: 'ai' }, hint: 'Cost / margin / design fee columns' },
    'p4.3': { breadcrumb: ['Expert Hub', 'Transactions', 'PIF inbox', 'MWH PIF · manual lines'], focus: { label: 'Isabella adding S&H manual rows', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: '26 S&H rows · surcharge · design fee' },
    'p4.6': { breadcrumb: ['Expert Hub', 'Transactions', 'PIF inbox', 'MWH PIF · snapshot'], focus: { label: 'Auto · consequence of vendor sends', tone: 'muted' }, hint: 'Tri-way match · activity trail' },

    // F5 · Expert Hub · electronic ordering + ACK flow
    'p5.1': { breadcrumb: ['Expert Hub', 'Comparisons', 'Dispatch board', 'MWH PO'], focus: { label: 'PO awaiting Teknion Online upload', icon: <Package className="h-3 w-3" aria-hidden="true" />, tone: 'info' }, hint: 'Isabella dispatching · SIF file' },
    'p5.3': { breadcrumb: ['Expert Hub', 'Comparisons', 'ACK review', 'Teknion PO-DC-0009642'], focus: { label: 'Isabella comparing ACK vs PMO', icon: <GitCompare className="h-3 w-3" aria-hidden="true" />, tone: 'ai' }, hint: '71 lines · 13 CRs' },
    'p5.4': { breadcrumb: ['Expert Hub', 'Comparisons', 'ACK review', 'PO-DC-0009642 · sentinel clear'], focus: { label: 'Multi-Line Edit bulk sentinel clear', icon: <User className="h-3 w-3" aria-hidden="true" />, tone: 'warning' }, hint: '10/10/2050 → real Teknion dates' },
    'p5.5': { breadcrumb: ['Expert Hub', 'Comparisons', 'ACK review', 'Designer chain'], focus: { label: 'Chain · Layne → Tate → Josh', icon: <MessageSquare className="h-3 w-3" aria-hidden="true" />, tone: 'primary' }, hint: 'Isabella assembling ACK chain to designer' },
}

export default function ProjexPage() {
    const { currentStep } = useDemo()
    const id = currentStep?.id
    const app = currentStep?.app

    // Phase 1 · AP flow · 6 dedicated scenes (p1.1 → p1.6)
    if (id === 'p1.1') return <Shell><APInboxSweepScene /></Shell>
    if (id === 'p1.2') return <Shell><APBillIntakeScene /></Shell>
    if (id === 'p1.3') return <Shell><APLineItemMatchScene /></Shell>
    if (id === 'p1.4') return <Shell><APInstallVendorExceptionScene /></Shell>
    if (id === 'p1.5') return <Shell><APPaymentRunScene /></Shell>
    if (id === 'p1.6') return <Shell><APBillPostedScene /></Shell>

    // F2 · Phase 1B.D · 6 dedicated scenes (p2.1 → p2.6)
    if (id === 'p2.1') return <Shell><F2_p21_VendorIntakeScene /></Shell>
    if (id === 'p2.2') return <Shell><F2_p22_W9OcrScene /></Shell>
    if (id === 'p2.3') return <Shell><F2_p23_PreflightScene /></Shell>
    if (id === 'p2.4') return <Shell><F2_p24_JacobGateScene /></Shell>
    if (id === 'p2.5') return <Shell><F2_p25_VendorRegistryScene /></Shell>
    if (id === 'p2.6') return <Shell><F2_p26_DealerReadinessScene /></Shell>

    // F2 fallback (unknown p2.* step or app-only navigation)
    if (id?.startsWith('p2.') || app === 'projex-vendor-onboarding') {
        return <Shell><F2_p21_VendorIntakeScene /></Shell>
    }

    // F3 · Phase 1B.B · 6 dedicated scenes (p3.1 → p3.6)
    if (id === 'p3.1') return <Shell><F3_p31_ThresholdAlertScene /></Shell>
    if (id === 'p3.2') return <Shell><F3_p32_ProformaReviewScene /></Shell>
    if (id === 'p3.3') return <Shell><F3_p33_WallsPMGateScene /></Shell>
    if (id === 'p3.4') return <Shell><F3_p34_ARKanbanScene /></Shell>
    if (id === 'p3.5') return <Shell><F3_p35_CollectionDraftsScene /></Shell>
    if (id === 'p3.6') return <Shell><F3_p36_NetSuiteSyncScene /></Shell>

    // F3 fallback
    if (id?.startsWith('p3.') || app === 'projex-billing') {
        return <Shell><F3_p31_ThresholdAlertScene /></Shell>
    }

    // F4 · Phase 1B.C · 6 dedicated scenes (p4.1 → p4.6)
    if (id === 'p4.1') return <Shell><F4_p41_DesignerIntakeScene /></Shell>
    if (id === 'p4.2') return <Shell><F4_p42_PifParseScene /></Shell>
    if (id === 'p4.3') return <Shell><F4_p43_ManualLinesScene /></Shell>
    if (id === 'p4.4') return <Shell><F4_p44_POBatchGridScene /></Shell>
    if (id === 'p4.5') return <Shell><F4_p45_PerVendorSendScene /></Shell>
    if (id === 'p4.6') return <Shell><F4_p46_SnapshotAuditScene /></Shell>

    // F4 fallback
    if (id?.startsWith('p4.') || app === 'projex-order-po') {
        return <Shell><F4_p41_DesignerIntakeScene /></Shell>
    }

    // F5 · Phase 1B.E · 6 dedicated scenes (p5.1 → p5.6)
    if (id === 'p5.1') return <Shell><F5_p51_SifUploadScene /></Shell>
    if (id === 'p5.2') return <Shell><F5_p52_AckOcrScene /></Shell>
    if (id === 'p5.3') return <Shell><F5_p53_AckPmoReviewScene /></Shell>
    if (id === 'p5.4') return <Shell><F5_p54_SentinelClearScene /></Shell>
    if (id === 'p5.5') return <Shell><F5_p55_DesignerChainScene /></Shell>
    if (id === 'p5.6') return <Shell><F5_p56_ShipmentTrackingScene /></Shell>

    // F5 fallback
    if (id?.startsWith('p5.') || app === 'projex-ack') {
        return <Shell><F5_p51_SifUploadScene /></Shell>
    }

    // AP flow fallback (unknown p1.* step or app-only navigation)
    if (id?.startsWith('p1.') || app === 'projex-ap') {
        return <Shell><APInboxSweepScene /></Shell>
    }

    // Final fallback · shouldn't hit but keeps placeholder available para future
    return <Shell><ProjexPlaceholderScene scene="ap" /></Shell>
}

function Shell({ children }: { children: React.ReactNode }) {
    const { currentStep } = useDemo()
    const app = currentStep?.app
    const stepId = currentStep?.id ?? ''
    const arrival = ARRIVAL_MAP[stepId]
    return (
        <ProjexExperienceShell experience={experienceFor(app)} activeTab={activeTabFor(app)}>
            {arrival && (
                <ProjexArrivalStrip
                    breadcrumb={arrival.breadcrumb}
                    focus={arrival.focus}
                    hint={arrival.hint}
                />
            )}
            {children}
        </ProjexExperienceShell>
    )
}
