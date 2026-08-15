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

import { useDemo } from '../../context/DemoContext'
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
    return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
