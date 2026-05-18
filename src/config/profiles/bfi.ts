// ═══════════════════════════════════════════════════════════════════════════════
// BFI — BFI Furniture Industries · Strata AI Demo Profile
//
// CLIENT: BFI Furniture (Elizabeth, NJ · ~50 employees · Women Owned
//         Government/Municipal furniture dealer · CoNY primary customer)
//
// DEMO STRUCTURE: 2 flows · 9 total steps · minimalista, un valor por paso
//
//   Dashboard — navbar tab permanente (no es un paso del demo)
//
//   FLOW 1 — Agency Fee (4 steps)
//     a1.1: CoNY Order Queue   — morning triage · DOE-2847 CPR flag
//     a1.2: Quote + Pricing    — form + discount calc + SIF timeline + order tracker
//     a1.3: CPR Reconciliation — per-line approval + relay to Michael/Nancy inline
//     a1.4: Agency Fee Verify  — Patricia verifies fee vs Nancy's report · closes
//
//   FLOW 2 — Product Receiving (5 steps)
//     r1.2: WIG Bingo Check    — comienza con dashboard overview + notif WIG · ready for AI analysis
//     r1.3: AI Analysis        — progress bar → bingo grid · #34 missing
//     r1.4: Alert & Claim      — notify Andy (HM) · open Omni claim
//     r1.5: Core Entry         — 34/35 confirmed · confirm in CORE
//     r1.6: Notify Walter      — CoNY PM sees status before paper arrives (mobile)
//
// PRESENTATION DATE: May 14, 2026
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const BFI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Agency Fee (4 steps · consolidated)
    // ═══════════════════════════════════════════
    {
        id: 'a1.0',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Request for Quote',
        description: 'The Miller Knoll rep sends a Request for Quote to the BFI account manager for DOE-2847 — a Herman Miller installation at 30 Court Street, Brooklyn, NY. The SIF, spec sheet, and floor plan arrive directly in Strata.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'CoNY Order Queue',
        description: 'The BFI account manager reviews active CoNY orders for the day. Strata surfaces what needs attention — DOE-2847 has a CPR flag that requires review.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Order Confirmation',
        description: 'The BFI account manager extracts and validates the SIF for DOE-2847. Strata reads the document, confirms the line items, and sends the Miller Knoll rep an order confirmation directly.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.2b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Quote Tool Validation',
        description: 'Strata uploads the SIF to Quote Tool, which corrects the Filing Unit price against the CoNY contract. Lauren reviews the Quote Comparison and Herman Miller\'s Estimated Service Fees (3.75%), then approves to request the labor quote from WIG.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'PO & Labor · CORE Entry',
        description: 'The Purchase Order from NYC Dept. of Education and the Workplace labor quote arrive together. The BFI account manager reviews both, confirms the delivery window, and sends the proposal to NYC DOE.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2d',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'WIG Bingo Check',
        description: 'The WIG Receiving Report arrives for DOE-2847. Strata captures it and runs an AI check against the bingo sheet to confirm what was received.',
        app: 'bfi-receiving',
        role: 'Receiving Coordinator',
    },
    {
        id: 'a1.2e',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Shortage Claim',
        description: 'The BFI account manager receives a missing-carton report from the receiving coordinator, reviews the order, attaches the receiving report as proof of shipment, and files a shortage claim with Herman Miller.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'a1.2f',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Work Order Ready',
        description: 'Herman Miller confirms the replacement shipment for carton #34. The BFI account manager reviews the updated work order and floor plan, then notifies the CoNY project manager to schedule the install.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'a1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'CPR Reconciliation',
        description: 'The BFI account manager reviews the CPR hours for DOE-2847. Strata flags the discrepancies and prepares the revision. She approves line by line and sends the update to the team.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.3b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Manager Review & Invoice Request',
        description: 'The BFI manager reviews the CPR approval and the final labor quote for DOE-2847. He sends the final quote to the Herman Miller invoice processor requesting the invoice.',
        app: 'bfi-agency-fee',
        role: 'BFI Manager',
    },
    {
        id: 'a1.3c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Invoice Upload & Fee Forward',
        description: 'The BFI account manager uploads the approved invoice to the CPR record. Strata identifies the document automatically and she forwards it to Finance/AR to complete the process.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Agency Fee Verify',
        description: 'The Finance/AR team reviews the final figures for DOE-2847 against the CoNY contract. Strata detects a discrepancy automatically and surfaces it for review.',
        app: 'bfi-agency-fee',
        role: 'Finance / AR',
    },

];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const BFI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'a1.0': { mode: 'interactive', userAction: 'The Miller Knoll rep sends the RFQ to BFI with SIF, spec sheet, and floor plan attached' },
    'a1.1': { mode: 'interactive', userAction: 'Review Lauren\'s morning queue — AI-prioritized orders · CPR flag on DOE-2847 · click to investigate' },
    'a1.2': { mode: 'interactive', userAction: 'See Robert Chen\'s email — order confirmation received · DOE-2847 · Q-2026-0089 · Robert acknowledges the update · loop closed' },
    'a1.2b': { mode: 'interactive', userAction: 'Review Quote Tool comparison · verify HMI-FU-300 correction $8,100 → $7,560 · verify service fee 3.75% (Grand Total $8,833.50) · approve to request labor quote from WIG' },
    'a1.2c': { mode: 'interactive', userAction: 'Review PO from NYC DoE + labor quote from Workplace · confirm 30-day delivery window · confirm in CORE · watch EDI transmit to OVNIQ' },
    'a1.2d': { mode: 'interactive', userAction: 'See WIG document notification · review Receiving Report + Bingo Sheet · click Run AI Analysis' },
    'a1.2e': { mode: 'interactive', userAction: 'Review Lena\'s missing-carton notification · expand order · attach proof of shipment · send shortage claim to Herman Miller' },
    'a1.2f': { mode: 'interactive', userAction: 'Receive claim-resolved notification · review floor plan + work order · download/print · notify Walter to approve scheduling' },
    'a1.3': { mode: 'interactive', userAction: 'Review CPR discrepancies line-by-line · approve · open CORE update + stakeholder notification dialog · send' },
    'a1.3b': { mode: 'interactive', userAction: 'The BFI manager reviews the CPR approval · sends the final labor quote to the Herman Miller invoice processor requesting the invoice' },
    'a1.3c': { mode: 'interactive', userAction: 'Upload the approved invoice · Strata AI detects the document · forward to Finance/AR to complete the process' },
    'a1.4': { mode: 'interactive', userAction: 'Patricia verifies the agency fee — toggle match/gap scenario · confirm or flag the $1,250 discrepancy' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const BFI_STEP_MESSAGES: Record<string, string[]> = {
    'a1.0': [
        'Request for Quote received · DOE-2847 · Miller Knoll',
        'Parsing attachments: SIF, spec sheet, floor plan',
        'Extracting line items and CPR package from SIF',
        'Documents queued in Strata intake · notifying Lauren DeMarco',
    ],
    'a1.1': [
        'Fetching active CoNY orders from CORE',
        'Scanning CPR packages for hour discrepancies',
        'Checking pricing SIFs against CoNY contract',
        'Orders ranked by urgency · DOE-2847 flagged · CPR discrepancy detected',
    ],
    'a1.2': [
        'Order Q-2026-0089 confirmed · notification sent to Robert Chen',
        'Robert Chen (Miller Knoll) received email confirmation',
        'Spec sheet NYC-DOE-2847-specs.pdf attached',
        'Order acknowledged · loop closed · BFI proceeds to OmniQuote validation',
    ],
    'a1.2b': [
        'Uploading SIF to Quote Tool · DOE-2847 · Q-2026-0089',
        'Comparing Requested vs Response against CoNY Contract ANT122',
        'HMI-FU-300 ×6 corrected — List Ext $8,100 → $7,560 (CoNY contract rate)',
        'Herman Miller service fees applied (3.75%) · Grand Total $8,833.50',
    ],
    'a1.2c': [
        'Purchase Order received from NYC Dept. of Education',
        'Workplace labor quote received — Michael\'s figures compiled',
        'Both documents captured — ready for review and CORE entry',
        'CORE entry confirmed · EDI transmission to OVNIQ initiated',
    ],
    'a1.3': [
        'Loading CPR document for DOE-2847',
        'Extracting certified hours by labor category',
        'Comparing against quoted hours · Carpenters −5h · OT −2h',
        'Drafting CORE update + stakeholder notification · Michael Chen + Nancy Rodriguez',
    ],
    'a1.3b': [
        'CPR approval received from Lauren DeMarco',
        'Compiling final labor quote: Teamsters 24h · Carpenters 45h · OT 6h',
        'Calculating total: $6,920 (−$2,340 from original quote)',
        'Drafting invoice request to Nancy Rodriguez · Herman Miller',
    ],
    'a1.3c': [
        'OmniQuote invoice received · invoice-OQ-DOE2847.pdf',
        'Scanning document · OCR extraction in progress',
        'Invoice type: OmniQuote · Status: APPROVED · Amount: $6,920',
        'Invoice matches CPR reconciliation · ready to forward to Patricia',
    ],
    'a1.4': [
        'Loading CoNY contract T-codes for DOE-2847',
        'Calculating expected agency fee at 18% per product line',
        'Fetching MK Invoice Processor report from Nancy Bos',
        'Comparison ready · discrepancy detected · $1,250 gap',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const BFI_SELF_INDICATED: string[] = [
    'a1.0', 'a1.1', 'a1.2', 'a1.2b', 'a1.2c', 'a1.2d', 'a1.2e', 'a1.2f', 'a1.3', 'a1.3b', 'a1.3c', 'a1.4',
];
