/**
 * COMPONENT: dealerASceneRegistry (F81.B · 2026-08-21)
 * PURPOSE: Single source of truth for stepId → scene component mapping.
 *          Both DealerAPage (guided tour · driven by currentStep) and
 *          DealerAPathLanding (playlist model · hero scene inline · click
 *          tile to jump to that scene) consume this registry.
 *
 *          Extracted from the 30-case switch that lived in DealerAPage.tsx ·
 *          having a registry Map makes both consumers reuse the same
 *          scene-rendering logic without duplication.
 *
 * SHAPE · Record<stepId, () => ReactNode> · lazy render function per step ·
 *         allows caller to instantiate the scene on-demand without importing
 *         each individually.
 */

import type { ReactNode } from 'react'

// F1 · Bills intake & matching · 6 scenes (p1.1 → p1.6)
import APInboxSweepScene from './scenes/APInboxSweepScene'
import APBillIntakeScene from './scenes/APBillIntakeScene'
import APLineItemMatchScene from './scenes/APLineItemMatchScene'
import APInstallVendorExceptionScene from './scenes/APInstallVendorExceptionScene'
import APPaymentRunScene from './scenes/APPaymentRunScene'
import APBillPostedScene from './scenes/APBillPostedScene'

// F2 · Vendor onboarding · 6 scenes (p2.1 → p2.6)
import F2_p21_VendorIntakeScene from './scenes/F2_p21_VendorIntakeScene'
import F2_p22_W9OcrScene from './scenes/F2_p22_W9OcrScene'
import F2_p23_PreflightScene from './scenes/F2_p23_PreflightScene'
import F2_p24_JacobGateScene from './scenes/F2_p24_JacobGateScene'
import F2_p25_VendorRegistryScene from './scenes/F2_p25_VendorRegistryScene'
import F2_p26_DealerReadinessScene from './scenes/F2_p26_DealerReadinessScene'

// F3 · Progress billing · 6 scenes (p3.1 → p3.6)
import F3_p31_ThresholdAlertScene from './scenes/F3_p31_ThresholdAlertScene'
import F3_p32_ProformaReviewScene from './scenes/F3_p32_ProformaReviewScene'
import F3_p33_WallsPMGateScene from './scenes/F3_p33_WallsPMGateScene'
import F3_p34_ARKanbanScene from './scenes/F3_p34_ARKanbanScene'
import F3_p35_CollectionDraftsScene from './scenes/F3_p35_CollectionDraftsScene'
import F3_p36_NetSuiteSyncScene from './scenes/F3_p36_NetSuiteSyncScene'

// F4 · Order/PO dispatch · 6 scenes (p4.1 → p4.6)
import F4_p41_DesignerIntakeScene from './scenes/F4_p41_DesignerIntakeScene'
import F4_p42_PifParseScene from './scenes/F4_p42_PifParseScene'
import F4_p43_ManualLinesScene from './scenes/F4_p43_ManualLinesScene'
import F4_p44_POBatchGridScene from './scenes/F4_p44_POBatchGridScene'
import F4_p45_PerVendorSendScene from './scenes/F4_p45_PerVendorSendScene'
import F4_p46_SnapshotAuditScene from './scenes/F4_p46_SnapshotAuditScene'

// F5 · Electronic ACK · 6 scenes (p5.1 → p5.6)
import F5_p51_SifUploadScene from './scenes/F5_p51_SifUploadScene'
import F5_p52_AckOcrScene from './scenes/F5_p52_AckOcrScene'
import F5_p53_AckPmoReviewScene from './scenes/F5_p53_AckPmoReviewScene'
import F5_p54_SentinelClearScene from './scenes/F5_p54_SentinelClearScene'
import F5_p55_DesignerChainScene from './scenes/F5_p55_DesignerChainScene'
import F5_p56_ShipmentTrackingScene from './scenes/F5_p56_ShipmentTrackingScene'

/** Map stepId → factory that renders the scene. Factory used vs direct
 *  component to allow lazy instantiation and to keep this file JSX-free
 *  above the registry itself. */
export const DEALER_A_SCENE_REGISTRY: Record<string, () => ReactNode> = {
    // F1 · AP
    'p1.1': () => <APInboxSweepScene />,
    'p1.2': () => <APBillIntakeScene />,
    'p1.3': () => <APLineItemMatchScene />,
    'p1.4': () => <APInstallVendorExceptionScene />,
    'p1.5': () => <APPaymentRunScene />,
    'p1.6': () => <APBillPostedScene />,

    // F2 · Vendor onboarding
    'p2.1': () => <F2_p21_VendorIntakeScene />,
    'p2.2': () => <F2_p22_W9OcrScene />,
    'p2.3': () => <F2_p23_PreflightScene />,
    'p2.4': () => <F2_p24_JacobGateScene />,
    'p2.5': () => <F2_p25_VendorRegistryScene />,
    'p2.6': () => <F2_p26_DealerReadinessScene />,

    // F3 · Progress billing
    'p3.1': () => <F3_p31_ThresholdAlertScene />,
    'p3.2': () => <F3_p32_ProformaReviewScene />,
    'p3.3': () => <F3_p33_WallsPMGateScene />,
    'p3.4': () => <F3_p34_ARKanbanScene />,
    'p3.5': () => <F3_p35_CollectionDraftsScene />,
    'p3.6': () => <F3_p36_NetSuiteSyncScene />,

    // F4 · Order/PO dispatch
    'p4.1': () => <F4_p41_DesignerIntakeScene />,
    'p4.2': () => <F4_p42_PifParseScene />,
    'p4.3': () => <F4_p43_ManualLinesScene />,
    'p4.4': () => <F4_p44_POBatchGridScene />,
    'p4.5': () => <F4_p45_PerVendorSendScene />,
    'p4.6': () => <F4_p46_SnapshotAuditScene />,

    // F5 · Electronic ACK
    'p5.1': () => <F5_p51_SifUploadScene />,
    'p5.2': () => <F5_p52_AckOcrScene />,
    'p5.3': () => <F5_p53_AckPmoReviewScene />,
    'p5.4': () => <F5_p54_SentinelClearScene />,
    'p5.5': () => <F5_p55_DesignerChainScene />,
    'p5.6': () => <F5_p56_ShipmentTrackingScene />,
}

/** Render the scene for a given stepId · returns null if unknown. */
export function renderDealerAScene(stepId: string): ReactNode | null {
    const factory = DEALER_A_SCENE_REGISTRY[stepId]
    return factory ? factory() : null
}
