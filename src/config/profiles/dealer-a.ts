// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX INC. · Strata AI Multi-Flow Demo Profile · F84 MVP (2026-08-21)
//
// F84 (2026-08-21) · Radical MVP cutdown post-stakeholder feedback:
//   30 steps → 15 steps · 3 per path · one story per path · zero decoration.
//   Each screen = one clear action using prod-lifted UI · visual consistency
//   with expert-hub + quote-converter.
//
// CLIENT: Dealer A (Denver + Seattle · ~25 employees · 3 legal entities
//         Dealer A / Dealer A Corp / Culture LLC · commercial furniture +
//         architectural walls dealership · NetSuite live since Jan 2026)
//
// SOURCE OF TRUTH: internal_3.html Capability Paths bullets · client-text
//         mapped 1:1 to steps.
//
// 15 STEPS · 3 per path:
//   F1 · Bills intake & matching        p1.1 · p1.2 · p1.3
//   F2 · Vendor onboarding           p2.1 · p2.2 · p2.3
//   F3 · Progress billing            p3.1 · p3.2 · p3.3
//   F4 · Order/PO dispatch           p4.1 · p4.2 · p4.3
//   F5 · Electronic ACK processing   p5.1 · p5.2 · p5.3
//
// AC NOTIFICATIONS · 1 per path max · fires only at p*.1 · orients presenter.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS (15 · 3 per path) ─────────────────────────────────────────────────

export const DEALER_A_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // F1 · Vendor bill intake & matching
    // Story: "Bills flow in overnight · AI matches to POs · Compliance approves"
    // ═══════════════════════════════════════════
    {
        id: 'p1.1',
        groupId: 1,
        groupTitle: 'Bills intake & matching',
        title: 'AI reads bills · OCR ingests the Bills mailbox',
        description: 'Strata OCR sweeps bills@dealer-a.com overnight and files 14 vendor bills in the queue. Teknion NCBA + Warehouse-by-Design flagged for review.',
        app: 'dealer-a-bills',
        role: 'Senior Accountant',
        flowId: 'dealer-a-bills',
    },
    {
        id: 'p1.2',
        groupId: 1,
        groupTitle: 'Bills intake & matching',
        title: 'Match PO ⇄ Bill · exact-to-the-penny · partial-aware',
        description: 'Strata compares Teknion invoice (PJX-BILL-8483) against PO-2026-4421 · 12 of 15 lines match to the penny · 3 exceptions surfaced (2 partial-ship qty + 1 penny variance).',
        app: 'dealer-a-bills',
        role: 'Senior Accountant',
        flowId: 'dealer-a-bills',
    },
    {
        id: 'p1.3',
        groupId: 1,
        groupTitle: 'Bills intake & matching',
        title: 'Approve payment · Compliance releases ACH batch',
        description: 'Expert Hub queues the Tuesday payment run · Compliance approves the 9-bill ACH batch ($91,951) · Strata catches 1 duplicate invoice before release.',
        app: 'dealer-a-bills',
        role: 'CEO',
        flowId: 'dealer-a-bills',
    },

    // ═══════════════════════════════════════════
    // F2 · Vendor onboarding & compliance
    // Story: "Upload W-9 · Strata reads it · file it in compliance registry"
    // ═══════════════════════════════════════════
    {
        id: 'p2.1',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Read W-9 · structured intake · first-class taxonomy transaction',
        description: 'Coordinator uploads Warehouse-by-Design W-9. Strata OCR extracts 5 fields (legal name · TIN · entity type · signed date · address) with confidence per field · reviewer edits if needed.',
        app: 'dealer-a-vendor-onboarding',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-vendor-onboarding',
    },
    {
        id: 'p2.2',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Register in OCR · date-indexed compliance registry',
        description: 'The W-9 lands in the OCR queue as a first-class transaction · date-indexed · expiration flag visible on the card · ready to sync to NetSuite.',
        app: 'dealer-a-vendor-onboarding',
        role: 'System',
        flowId: 'dealer-a-vendor-onboarding',
    },
    {
        id: 'p2.3',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Sync to NetSuite · expiration alert scheduled',
        description: 'Vendor #734 Warehouse-by-Design synced to NetSuite compliance registry. Expiration alert scheduled for 30 days before 2027-03-12 · vendor ready for POs.',
        app: 'dealer-a-vendor-onboarding',
        role: 'System',
        flowId: 'dealer-a-vendor-onboarding',
    },

    // ═══════════════════════════════════════════
    // F3 · Progress billing & collections
    // Story: "Deadline alert · review proforma · send + track"
    // ═══════════════════════════════════════════
    {
        id: 'p3.1',
        groupId: 3,
        groupTitle: 'Progress billing',
        title: 'Billing deadline alert · Fairport 50% ordered',
        description: 'Fairport HQ phase 2 crosses 50% ordered · deposit received · Strata flags proforma release deadline in the Transactions list.',
        app: 'dealer-a-billing',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-billing',
    },
    {
        id: 'p3.2',
        groupId: 3,
        groupTitle: 'Progress billing',
        title: 'Review proforma · Fairport 40% tranche',
        description: 'Isabella reviews the Fairport 40% proforma draft ($58,240) · line items with dates visible · confidence per field · approve for send.',
        app: 'dealer-a-billing',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-billing',
    },
    {
        id: 'p3.3',
        groupId: 3,
        groupTitle: 'Progress billing',
        title: 'Send + track · invoice in shared AR queue',
        description: 'Customer invoice PJX-INV-3421 sent · appears in the shared AR follow-up queue with notes field · Isabella and Alec see the same state.',
        app: 'dealer-a-billing',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-billing',
    },

    // ═══════════════════════════════════════════
    // F4 · Order entry & PO dispatch (F84.7 re-cut)
    // Story: "PIF lands in the OCR funnel · Coordinator reviews the
    // preliminary order lines · sends the PO batch by email"
    // ═══════════════════════════════════════════
    {
        id: 'p4.1',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'PIF arrives · OCR funnel · file type highlighted',
        description: 'A 300-line PIF workbook from the Lead Designer lands in the OCR queue. The Action Center notif announces "MWH PIF ready to review" · Coordinator sees the file type (XLSX · PIF spec) highlighted in the queue before opening.',
        app: 'dealer-a-order-po',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-order-po',
    },
    {
        id: 'p4.2',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Review line items · preliminary order lines from the PIF',
        description: 'Isabella opens the PIF in the same Document Review UI Compliance uses for bills · Header Fields + Line Items tabs · per-cell confidence. Saving closes the review and triggers batch PO generation for the 26 vendors.',
        app: 'dealer-a-order-po',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-order-po',
    },
    {
        id: 'p4.3',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Send PO batch · email template + confirmation (never auto-send)',
        description: 'Coordinator opens the pre-drafted email template for the 26 vendor POs · reviews · sends. Send confirmation returned. FC6 constraint · human control preserved. Modal closes back to Expert Hub Transactions view.',
        app: 'dealer-a-order-po',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-order-po',
    },

    // ═══════════════════════════════════════════
    // F5 · Electronic ACK processing
    // Story: "ACK arrives via OCR · compare vs PO · send approval chain"
    // ═══════════════════════════════════════════
    {
        id: 'p5.1',
        groupId: 5,
        groupTitle: 'Electronic ACK processing',
        title: 'Read ACK · vendor acknowledgement ingested by OCR',
        description: 'Teknion returns the ACK for the MWH residential PO. Strata OCR reads it and files it in the queue with per-vendor confidence badges (Teknion 98% · HBF 91% · Alamir 74%).',
        app: 'dealer-a-ack',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-ack',
    },
    {
        id: 'p5.2',
        groupId: 5,
        groupTitle: 'Electronic ACK processing',
        title: 'Compare PO ⇄ ACK · resolve CRs · update PMO',
        description: 'Strata matches Teknion ACK to PMO PO-DC-0009642 · 58 of 71 lines match · 13 change requests need Coordinator review (leadtime shifts · BIFMA advisory · width change · pricer comments). PMO placeholders updated on accept.',
        app: 'dealer-a-ack',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-ack',
    },
    {
        id: 'p5.3',
        groupId: 5,
        groupTitle: 'Electronic ACK processing',
        title: 'Send approval chain · designer sign-off',
        description: 'Coordinator triggers the approval chain email to the designers (Lead Designer → Spec Designer → PM Coordinator · Layne, Tate, Josh). Human sign-off preserved for BIFMA + width change.',
        app: 'dealer-a-ack',
        role: 'Furniture Coordinator',
        flowId: 'dealer-a-ack',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const DEALER_A_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // F1 · AP
    'p1.1': { mode: 'auto', duration: 6000, aiSummary: 'OCR sweeps Bills inbox · 14 bills filed overnight' },
    'p1.2': { mode: 'interactive', userAction: 'Review 3 PO⇄Bill exceptions · Accept or Override' },
    'p1.3': { mode: 'interactive', userAction: 'Compliance approves the ACH batch' },
    // F2 · Vendor onboarding
    'p2.1': { mode: 'interactive', userAction: 'Review W-9 fields · edit low-confidence ones · save' },
    'p2.2': { mode: 'auto', duration: 4000, aiSummary: 'W-9 filed in OCR registry · date-indexed' },
    'p2.3': { mode: 'auto', duration: 4500, aiSummary: 'Vendor #734 synced to NetSuite compliance registry' },
    // F3 · Billing
    'p3.1': { mode: 'auto', duration: 4500, aiSummary: 'Fairport crosses 50% · proforma deadline flagged' },
    'p3.2': { mode: 'interactive', userAction: 'Review proforma · adjust lines · approve for send' },
    'p3.3': { mode: 'auto', duration: 4000, aiSummary: 'Invoice sent · tracked in shared AR queue' },
    // F4 · Order/PO
    'p4.1': { mode: 'interactive', userAction: 'Preview PIF · click Generate batch POs' },
    'p4.2': { mode: 'auto', duration: 4000, aiSummary: '26 vendor POs generated · per-vendor grid' },
    'p4.3': { mode: 'interactive', userAction: 'Review email template · send per-vendor' },
    // F5 · ACK
    'p5.1': { mode: 'auto', duration: 4500, aiSummary: 'ACK ingested · per-vendor confidence badges' },
    'p5.2': { mode: 'interactive', userAction: 'Resolve 13 CRs · update PMO placeholders' },
    'p5.3': { mode: 'interactive', userAction: 'Send approval request to designer chain' },
};

// ─── AI INDICATOR MESSAGES (bullets rotativos) ───────────────────────────────

export const DEALER_A_STEP_MESSAGES: Record<string, string[]> = {
    'p1.1': [
        'Email Capture watching bills@dealer-a.com · 14 bills ingested overnight',
        'Teknion NCBA + Warehouse-by-Design flagged for review',
        'Prod OCR queue shows the 4 status columns Compliance already uses',
        'Four Hands excluded by client direction',
    ],
    'p1.2': [
        'Line-item match to the penny · Compliance\'s hard rule',
        '12 of 15 sample lines match exact · 3 exceptions surfaced',
        '2 partial-ship qty variances (Teknion split-ship pattern)',
        '1 penny rounding · tax rate updated Aug 1',
    ],
    'p1.3': [
        'Tuesday payment run · 9 bills queued in ACH batch',
        'Duplicate-payment control catches Nelson NLC-99120 (matches last remittance)',
        '75% AI + human touch · Compliance stays the gatekeeper',
        'Strata prepares ACH entries · never auto-releases',
    ],
    'p2.1': [
        'Coordinator uploads WBD W-9 · signed 2026-03-12',
        'Strata OCR extracts 5 fields with confidence per field',
        'Reviewer can edit any field before save',
        'First-class taxonomy transaction · not a free-text email',
    ],
    'p2.2': [
        'W-9 lands in OCR queue as taxonomy transaction',
        'Date-indexed · expiration flag surfaces per card',
        'Ready to sync to NetSuite compliance registry',
        'Same shell Compliance already uses for bills',
    ],
    'p2.3': [
        'Vendor #734 created in NetSuite',
        'W-9 attached to compliance folder · SharePoint mirror',
        'Expiration alert scheduled 30 days before 2027-03-12',
        'Vendor available in NetSuite picker for POs',
    ],
    'p3.1': [
        'Fairport HQ phase 2 crosses 50% ordered in W32',
        'Deposit received · proforma release deadline flagged',
        'Live billing threshold · no more billing from memory',
        'Deadline visible in Transactions list',
    ],
    'p3.2': [
        'Fairport 40% tranche · $58,240',
        'Line items visible with dates · confidence per field',
        'Deposit deducted from tranche',
        'Coordinator adjusts inline before send',
    ],
    'p3.3': [
        'Invoice PJX-INV-3421 sent to Fairport HQ AP',
        'NetSuite journal entry PJX-JE-2026-0842',
        'Shared AR follow-up queue · Isabella + Alec same view',
        'Reminders scheduled at Net 10 + 30 days',
    ],
    'p4.1': [
        'MWH residential PIF (300 lines) landed in the OCR queue',
        'AC notif announces the PIF ready to review',
        'File type XLSX · PIF spec highlighted in the queue card',
        'Coordinator clicks Open to inspect the preliminary order lines',
    ],
    'p4.2': [
        'PIF opened in the same Document Review UI Compliance uses',
        'Header Fields + Line Items tabs · per-cell confidence',
        'Coordinator reviews the 300 preliminary order lines',
        'Save triggers batch PO generation for 26 vendors',
    ],
    'p4.3': [
        'Pre-drafted email template · 26 vendor POs · $487,320',
        'Teknion + HBF + Boss + Alamir + Nelson + West Elm + 11 more',
        'Human review · Coordinator sends · never auto-send (FC6)',
        'Send confirmation returned · modal closes back to Transactions',
    ],
    'p5.1': [
        'Teknion ACK arrives · MWH residential PO',
        'Prod OCR kanban shows per-vendor confidence badges',
        'Teknion 98% · HBF 91% · Alamir 74% review recommended',
        'Same shell as F1 Bills inbox · Coordinator familiar',
    ],
    'p5.2': [
        'PMO PO-DC-0009642 ⇄ ACK TEK-ACK-2026-08-14',
        '58 of 71 lines match · 13 CRs surface',
        'Leadtime shifts · BIFMA advisory · width change · pricer comments',
        '10/10/2050 placeholders → real Teknion ESDs on accept',
    ],
    'p5.3': [
        'Approval chain email to Lead → Spec → PM',
        'Layne Nishimura · Tate Ross · Josh Bordon',
        'BIFMA advisory + width change need designer sign-off',
        'Coordinator sends · confirmation returned',
    ],
};

// ─── SELF-INDICATED STEPS (badge "AI en vivo") ───────────────────────────────

export const DEALER_A_SELF_INDICATED: string[] = [
    'p1.1', // OCR ingest
    'p1.2', // AI comparison
    'p2.1', // W-9 OCR extraction
    'p3.1', // Threshold alert
    'p4.1', // PIF preview / generate
    'p5.1', // ACK OCR
    'p5.2', // Acknowledgement comparison
];

// ─── EXPERIENCE MAPPING ──────────────────────────────────────────────────────

export type DealerAExperience = 'expert-hub' | 'dealer';

export type DealerAFlowId =
    | 'dealer-a-bills'
    | 'dealer-a-vendor-onboarding'
    | 'dealer-a-billing'
    | 'dealer-a-order-po'
    | 'dealer-a-ack';

export const DEALER_A_EXPERIENCE_MAP: Record<DealerAFlowId, DealerAExperience> = {
    'dealer-a-bills':                'expert-hub',   // F1 · Bills intake & matching
    'dealer-a-vendor-onboarding': 'dealer',       // F2 · Vendor onboarding & compliance
    'dealer-a-billing':           'dealer',       // F3 · Progress billing & collections
    'dealer-a-order-po':          'expert-hub',   // F4 · Order entry & PO dispatch
    'dealer-a-ack':               'expert-hub',   // F5 · Electronic ordering & ACK processing
};

/** Returns 'expert-hub' | 'dealer' for a given flow id. */
export function experienceOf(app: string | undefined): DealerAExperience {
    if (!app) return 'expert-hub';
    return DEALER_A_EXPERIENCE_MAP[app as DealerAFlowId] ?? 'expert-hub';
}

/** Grouped view for the 2-tab segmented switcher. */
export const DEALER_A_EXPERIENCE_GROUPS: {
    id: DealerAExperience;
    label: string;
    flows: { id: DealerAFlowId; label: string; short: string }[];
}[] = [
    {
        id: 'expert-hub',
        label: 'Expert Hub',
        flows: [
            { id: 'dealer-a-bills',        label: 'Bills intake & matching',                short: 'F1 · AP' },
            { id: 'dealer-a-order-po',  label: 'Order entry & PO dispatch',           short: 'F4 · Order/PO' },
            { id: 'dealer-a-ack',       label: 'Electronic ordering & ACK',           short: 'F5 · ACK' },
        ],
    },
    {
        id: 'dealer',
        label: 'Dealer Experience',
        flows: [
            { id: 'dealer-a-vendor-onboarding', label: 'Vendor onboarding & compliance', short: 'F2 · Vendor onboarding' },
            { id: 'dealer-a-billing',           label: 'Progress billing & collections', short: 'F3 · Billing' },
        ],
    },
];

/** First flow id of a given experience. */
export function firstFlowOf(experience: DealerAExperience): DealerAFlowId {
    return DEALER_A_EXPERIENCE_GROUPS.find(g => g.id === experience)!.flows[0].id;
}

// ─── PATH LANDINGS (F84 MVP · 3 moments per path · all core) ─────────────────

export interface DealerAPathMoment {
    stepId: string;
    title: string;
    description: string;
    estTime: string;
    /** F84 · en el MVP TODOS los moments son core · el "+ N detail" toggle
     *  desaparece · el sidebar muestra 3 tiles por path directamente. */
    isCore?: boolean;
}

export interface DealerAPathLanding {
    tagline: string;
    valueChip: { label: string; tone: 'success' | 'ai' | 'warning' | 'info' };
    heroStepId: string;
    moments: DealerAPathMoment[];
    ctaGuided: string;
    ctaExplore: string;
}

export const DEALER_A_PATH_LANDINGS: Record<DealerAFlowId, DealerAPathLanding> = {
    'dealer-a-bills': {
        tagline: 'Read bills · Match them to POs · Release the payment batch',
        valueChip: { label: 'Saves 4-6 hrs/week per accountant', tone: 'success' },
        heroStepId: 'p1.1',
        moments: [
            { stepId: 'p1.1', title: 'AI reads bills', description: 'OCR ingests the Bills mailbox · 14 bills filed overnight', estTime: '30 sec', isCore: true },
            { stepId: 'p1.2', title: 'Match PO ⇄ Bill', description: '12 to the penny · 3 exceptions surfaced with resolution paths', estTime: '60 sec', isCore: true },
            { stepId: 'p1.3', title: 'Approve payment', description: 'Compliance releases the 9-bill ACH batch · duplicate caught', estTime: '30 sec', isCore: true },
        ],
        ctaGuided: 'See the guided walkthrough',
        ctaExplore: 'Explore this experience freely',
    },
    'dealer-a-vendor-onboarding': {
        tagline: 'Read a W-9 · File it in the compliance queue · Sync the vendor to NetSuite',
        valueChip: { label: 'Cuts vendor onboarding from 2 weeks to 1 day', tone: 'ai' },
        heroStepId: 'p2.1',
        moments: [
            { stepId: 'p2.1', title: 'Read W-9', description: 'OCR extracts 5 fields with confidence · reviewer edits if needed', estTime: '45 sec', isCore: true },
            { stepId: 'p2.2', title: 'Register in OCR', description: 'W-9 lands in the queue as a first-class taxonomy transaction', estTime: '30 sec', isCore: true },
            { stepId: 'p2.3', title: 'Sync to NetSuite', description: 'Vendor #734 synced · expiration alert scheduled', estTime: '30 sec', isCore: true },
        ],
        ctaGuided: 'See the guided walkthrough',
        ctaExplore: 'Explore this experience freely',
    },
    'dealer-a-billing': {
        tagline: 'Catch billing deadlines · Review the proforma · Send the invoice to the customer',
        valueChip: { label: 'Catches 100% of billing milestones · no revenue leaks', tone: 'warning' },
        heroStepId: 'p3.1',
        moments: [
            { stepId: 'p3.1', title: 'Deadline alert', description: 'Fairport crosses 50% ordered · proforma release flagged', estTime: '30 sec', isCore: true },
            { stepId: 'p3.2', title: 'Review proforma', description: 'Fairport 40% tranche · $58,240 · line items with dates', estTime: '45 sec', isCore: true },
            { stepId: 'p3.3', title: 'Send + track', description: 'Invoice sent · appears in shared AR follow-up queue', estTime: '30 sec', isCore: true },
        ],
        ctaGuided: 'See the guided walkthrough',
        ctaExplore: 'Explore this experience freely',
    },
    'dealer-a-order-po': {
        tagline: 'Ingest the PIF · Review the preliminary order lines · Send the PO batch by email',
        valueChip: { label: 'Reduces PO dispatch from 3 days to 30 min per project', tone: 'info' },
        heroStepId: 'p4.1',
        moments: [
            { stepId: 'p4.1', title: 'PIF arrives · OCR funnel', description: 'Notification lands · file type highlighted in the queue', estTime: '30 sec', isCore: true },
            { stepId: 'p4.2', title: 'Review line items', description: 'Preliminary order lines from the PIF · Header + Line Items tabs', estTime: '60 sec', isCore: true },
            { stepId: 'p4.3', title: 'Send PO batch', description: 'Email template per vendor · human review · send confirmation', estTime: '45 sec', isCore: true },
        ],
        ctaGuided: 'See the guided walkthrough',
        ctaExplore: 'Explore this experience freely',
    },
    'dealer-a-ack': {
        tagline: 'Read a vendor ACK · Compare it against the PO · Trigger the approval chain',
        valueChip: { label: 'Cuts ACK review from 4 hrs to 20 min per PO', tone: 'ai' },
        heroStepId: 'p5.1',
        moments: [
            { stepId: 'p5.1', title: 'Read ACK', description: 'OCR files the Teknion ACK · per-vendor confidence badges', estTime: '30 sec', isCore: true },
            { stepId: 'p5.2', title: 'Compare PO ⇄ ACK', description: '71 lines · 13 CRs · PMO placeholders updated on accept', estTime: '90 sec', isCore: true },
            { stepId: 'p5.3', title: 'Trigger approval chain', description: 'Approval sent to Lead → Spec → PM (Layne · Tate · Josh)', estTime: '45 sec', isCore: true },
        ],
        ctaGuided: 'See the guided walkthrough',
        ctaExplore: 'Explore this experience freely',
    },
};

/** All 15 steps are core in the F84 MVP · the "+ N detail" toggle desaparece. */
export const DEALER_A_CORE_STEP_IDS: Set<string> = new Set(
    Object.values(DEALER_A_PATH_LANDINGS).flatMap(l =>
        l.moments.filter(m => m.isCore).map(m => m.stepId)
    )
);

export function isCoreStep(stepId: string): boolean {
    return DEALER_A_CORE_STEP_IDS.has(stepId);
}

// ─── PRESENTER NOTES (F84 · 15 steps · 30-sec script per screen) ─────────────

export interface DealerAPresenterNote {
    say: string;
    ask?: { q: string; a: string }[];
    next?: string;
    dontSay?: string[];
}

export const DEALER_A_PRESENTER_NOTES: Record<string, DealerAPresenterNote> = {
    // F1 · Bills intake & matching
    'p1.1': {
        say: 'This is what Strata does overnight. It reads every vendor bill from your Bills mailbox and files them here · the same OCR queue Compliance already uses. 14 bills tonight · Teknion NCBA and Warehouse-by-Design flagged for review.',
        next: 'Next · Strata compares the Teknion bill against the PO to the penny.',
    },
    'p1.2': {
        say: 'Strata matches the Teknion invoice against PO-2026-4421 to the penny. 12 of 15 lines match exactly · 3 exceptions surfaced with clear resolution paths · partial shipment quantities plus one penny rounding from a tax rate change.',
        next: 'Next · Compliance approves the payment batch.',
    },
    'p1.3': {
        say: 'Tuesday payment run. Compliance sees the 9-bill ACH batch queued for approval. Strata catches a duplicate invoice from Nelson · same amount, same PO, same date · flagged before release. Human sign-off stays the gatekeeper.',
        next: 'End of Bills path. Switch paths in the sidebar.',
    },

    // F2 · Vendor onboarding & compliance
    'p2.1': {
        say: 'Kelly uploads a W-9 for Warehouse-by-Design · Strata OCR reads 5 fields with confidence per field · legal name, TIN, entity type, signed date, address. Reviewer edits anything the AI flagged as low confidence.',
        next: 'Next · the W-9 lands in the OCR queue as a first-class transaction.',
    },
    'p2.2': {
        say: 'The W-9 shows up in the same OCR queue Compliance uses for bills · but now it\'s a first-class taxonomy transaction · date-indexed · expiration flag visible per card. Ready to sync to NetSuite.',
        next: 'Next · Strata syncs the vendor to the NetSuite compliance registry.',
    },
    'p2.3': {
        say: 'Vendor #734 Warehouse-by-Design is now in NetSuite · W-9 attached to the compliance folder · expiration alert scheduled 30 days before the W-9 expires. Available for POs immediately.',
        next: 'End of Vendor onboarding path.',
    },

    // F3 · Progress billing & collections
    'p3.1': {
        say: 'Fairport HQ phase 2 just crossed 50% ordered. Deposit already received. Strata flags the proforma release deadline in the Transactions list · same shell Isabella already uses. No more billing from memory.',
        next: 'Next · Isabella reviews the proforma draft.',
    },
    'p3.2': {
        say: 'Fairport 40% tranche · $58,240. Isabella reviews the proforma draft · line items with dates visible · confidence per field · adjusts anything before send.',
        next: 'Next · invoice sent, tracked in the shared AR queue.',
    },
    'p3.3': {
        say: 'Invoice PJX-INV-3421 sent to Fairport HQ AP. Now it lives in the shared AR follow-up queue with notes · Isabella and Alec see the same state · reminders scheduled at Net 10 + 30 days.',
        next: 'End of Progress billing path.',
    },

    // F4 · Order entry & PO dispatch (F84.7 · funnel → review → send)
    'p4.1': {
        say: 'A 300-line PIF from the Lead Designer just landed in the OCR queue · same shell Compliance uses for bills. The Action Center announces it and the file type shows XLSX · PIF spec · so Isabella knows what she\'s about to open.',
        next: 'Click the AC notif to open the PIF for line-item review.',
    },
    'p4.2': {
        say: 'The PIF opens in the same Document Review UI she already knows · Header Fields plus Line Items with per-cell confidence. Isabella scans the 300 preliminary order lines · saving triggers batch PO generation across the 26 vendors.',
        next: 'Click Save · next · sending the PO batch by email.',
    },
    'p4.3': {
        say: 'Pre-drafted email template · 26 vendor POs bundled · $487,320. Isabella reviews the message, sends, gets a confirmation. Never auto-send · that\'s the FC6 rule. When she closes the modal the Expert Hub Transactions view stays visible.',
        next: 'End of Order/PO path. Switch flows in the sidebar.',
    },

    // F5 · Electronic ACK processing
    'p5.1': {
        say: 'Teknion returned the ACK for the MWH PO. Strata OCR reads it and files it in the same queue with per-vendor confidence badges · Teknion at 98%, HBF at 91%, Alamir at 74% flagged for review.',
        next: 'Next · Strata compares the ACK against the PO.',
    },
    'p5.2': {
        say: 'PMO PO-DC-0009642 versus ACK · 58 of 71 lines match exactly · 13 change requests surface · leadtime shifts, one BIFMA advisory, a width change, and pricer comments. Isabella resolves them here and PMO placeholders update instantly.',
        next: 'Next · Isabella sends the approval chain to the designers.',
    },
    'p5.3': {
        say: 'The BIFMA advisory and width change need designer sign-off. Isabella sends an approval chain email to Lead Designer, Spec Designer, PM Coordinator · Layne, Tate, Josh · pre-drafted template · human review, send, confirmation.',
        next: 'End of ACK path. End of demo.',
    },
};
