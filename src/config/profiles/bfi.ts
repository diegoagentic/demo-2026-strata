// ═══════════════════════════════════════════════════════════════════════════════
// BFI — BFI Furniture Industries · Strata AI Demo Profile
//
// CLIENT: BFI Furniture (Elizabeth, NJ · ~50 employees · Women Owned
//         Government/Municipal furniture dealer · CoNY primary customer)
//
// DEMO STRUCTURE: 1 flow · 13 steps (post-Wendy revisions May 2026)
//
//   Dashboard — permanent navbar tab (not a tour step)
//
//   FLOW 1 — Agency Fee · pre-award (a1.0 → a1.2c)
//     a1.0:   Quote request arrives    — Miller Knoll sends specs · auto-ingested
//     a1.1:   Morning queue            — Lauren opens · DOE-2847 surfaced
//     a1.2:   Confirm receipt          — Lauren replies · Miller Knoll acknowledges
//     a1.2b:  Quote · Credit · Labor   — unified step (3 actions in one modal):
//                                        1) review Quote Tool pricing
//                                        2) post credit line to CORE (fee becomes GP)
//                                        3) email WIG for labor · Michael compiles
//     a1.2b3: Send proposal            — Lauren emails NYC DOE the full proposal
//     a1.2c:  PO received              — Lauren confirms the PO in CORE
//
//   FLOW 1 — Agency Fee · post-delivery (a1.2d → a1.4)
//     a1.2d:  Receiving check          — Strata scans WIG report · finds missing carton
//     a1.2e:  Shortage claim           — Lauren files claim with Herman Miller
//     a1.2f:  Work order ready         — Replacement confirmed · notify Walter
//     a1.3:   CPR reconciliation       — Field hours vs quote · Lauren approves
//     a1.3b:  Manager review           — Michael sends invoice request to Nancy
//     a1.3c:  Invoice upload           — Lauren forwards approved invoice to Finance/AR
//     a1.4:   Fee verification         — Patricia compares Nancy's fee vs contract
//
// PRESENTATION DATE: May 14, 2026
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const BFI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Agency Fee · pre-award
    // ═══════════════════════════════════════════
    {
        id: 'a1.0',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Quote request arrives',
        description: 'Robert Chen (Miller Knoll) sends a quote request for a Herman Miller installation at 30 Court Street, Brooklyn. Specs, floor plan, and the pricing file land directly in Strata — no email tracking needed.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Morning queue',
        description: 'Lauren opens her morning queue. Strata ranks active CoNY orders by urgency and surfaces DOE-2847 at the top — ready for review.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Confirm receipt',
        description: 'Robert acknowledges the order — quote Q-2026-0089 is locked in. Lauren moves on to validate pricing.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.2b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Quote · Credit · Labor',
        description: 'Three actions in one step: ① validate pricing in Quote Tool, ② post the credit line to CORE (the fee becomes profit — no manual math), ③ email WIG for the labor quote.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2b3',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Send proposal',
        description: 'Product pricing and labor are both ready. Lauren reviews the full proposal and sends it to NYC DOE procurement.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'PO received',
        description: 'The Purchase Order comes back from NYC DOE. Lauren checks it against the proposal and locks in the 30-day delivery window in CORE.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },

    // ═══════════════════════════════════════════
    // FLOW 1: Agency Fee · post-delivery
    // ═══════════════════════════════════════════
    {
        id: 'a1.2d',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Receiving check',
        description: 'The receiving report arrives from WIG. Strata scans the bingo sheet against the order and flags what\'s missing — no manual carton counting.',
        app: 'bfi-receiving',
        role: 'Receiving Coordinator',
    },
    {
        id: 'a1.2e',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Shortage claim',
        description: 'Lena flags a missing carton. Lauren reviews the order, attaches the receiving report as proof, and files the claim with Herman Miller.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'a1.2f',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Work order ready',
        description: 'Herman Miller confirms the replacement shipment. Lauren reviews the updated work order and notifies Walter (project manager) to schedule the install crew.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'a1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'CPR reconciliation',
        description: 'Labor hours from the field don\'t match the original quote. Lauren reviews the gaps — Strata prepared the revision automatically — approves line by line, and notifies the team.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.3b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Manager review',
        description: 'Michael reviews Lauren\'s CPR approval and the final labor numbers, then sends the invoice request to Nancy at Herman Miller.',
        app: 'bfi-agency-fee',
        role: 'BFI Manager',
    },
    {
        id: 'a1.3c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Invoice upload',
        description: 'The invoice arrives. Lauren attaches it to the record — Strata identifies the document automatically — and forwards it to Finance/AR to close out the order.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Fee verification',
        description: 'Patricia compares Nancy\'s reported fee against the CoNY contract. Strata catches a $1,250 gap automatically — Patricia decides whether to confirm the match or flag the discrepancy.',
        app: 'bfi-agency-fee',
        role: 'Finance / AR',
    },

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const BFI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'a1.0': { mode: 'interactive', userAction: 'Watch Robert Chen send the request to Lauren · specs, floor plan and pricing file arrive in Strata' },
    'a1.1': { mode: 'interactive', userAction: 'Open the morning queue · DOE-2847 surfaces as priority · click to investigate' },
    'a1.2': { mode: 'interactive', userAction: 'Read Robert\'s acknowledgment · quote Q-2026-0089 confirmed · move on to validate pricing' },
    'a1.2b': { mode: 'interactive', userAction: '① Review Quote Tool: HMI-FU-300 corrected $1,350 → $1,260 · 3.75% service fee · approve to draft credit line · ② Edit credit line fields if needed (Amount, GL Account, Memo) · push to CORE → CL-2026-0089 posted · ③ Open the labor request email to WIG · send · wait for Michael\'s compiled response · continue to proposal' },
    'a1.2b3': { mode: 'interactive', userAction: 'Review the full proposal (product + labor) · send to NYC DOE procurement · wait for the PO' },
    'a1.2c': { mode: 'interactive', userAction: 'Open the PO from NYC DOE · check it against the proposal · confirm the 30-day delivery window in CORE' },
    'a1.2d': { mode: 'interactive', userAction: 'Open the WIG receiving notification · review the bingo sheet · run AI analysis to find the missing carton' },
    'a1.2e': { mode: 'interactive', userAction: 'Open Lena\'s missing-carton alert · expand the order · attach proof of shipment · send the claim to Herman Miller' },
    'a1.2f': { mode: 'interactive', userAction: 'Open the claim-resolved notification · review the work order + floor plan · notify Walter to schedule the crew' },
    'a1.3': { mode: 'interactive', userAction: 'Review CPR discrepancies line by line · approve · open the team notification · send the CORE update' },
    'a1.3b': { mode: 'interactive', userAction: 'Review Lauren\'s CPR approval · send the invoice request to Nancy at Herman Miller' },
    'a1.3c': { mode: 'interactive', userAction: 'Upload the approved invoice · Strata detects it automatically · forward to Patricia in Finance/AR' },
    'a1.4': { mode: 'interactive', userAction: 'Compare the agency fee — match or gap scenario · confirm the match or flag the $1,250 discrepancy' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const BFI_STEP_MESSAGES: Record<string, string[]> = {
    'a1.0': [
        'Quote request received · DOE-2847 · Miller Knoll',
        'Reading attachments: SIF, spec sheet, floor plan',
        'Extracted 3 product lines',
        'Documents in intake · alerting Lauren',
    ],
    'a1.1': [
        'Pulling active CoNY orders',
        'Scanning new SIFs and attachments',
        'Checking prices against the CoNY contract',
        'DOE-2847 ranked top · ready for review',
    ],
    'a1.2': [
        'Confirmation sent to Robert Chen',
        'Quote Q-2026-0089 logged',
        'Specs and floor plan attached',
        'Receipt acknowledged · moving to pricing validation',
    ],
    'a1.2b': [
        'Sending pricing file to Quote Tool',
        'Comparing prices vs CoNY Contract ANT122',
        'Corrected HMI-FU-300 · $1,350 → $1,260',
        'Restricted-product check · all clear',
        'Service fees applied · 3.75% · total $8,833.50',
        'Drafting credit line · GL 4200-Agency-Fees',
        'Credit line CL-2026-0089 posted to CORE · $8,833.50',
        'GP recognized · 3.75% on DOE-2847',
        'Opening labor quote request · scope auto-filled',
        'Sending request to WIG',
        'WIG response in · forwarded to Michael',
        'Michael compiled labor · Teamsters 24h · Carpenters 50h · OT 8h · Inside 4h',
        'Labor total $9,262 · ready for proposal',
    ],
    'a1.2b3': [
        'Compiling proposal · product + labor',
        'Drafting email to NYC DOE',
        'Attaching updated SIF, Quote Tool file, labor quote',
        'Proposal sent · awaiting PO',
    ],
    'a1.2c': [
        'Purchase Order in · from NYC DOE',
        'PO matched against the proposal · pricing aligns',
        'Delivery window locked · May 14–21, 2026',
        'Order confirmed in CORE',
    ],
    'a1.3': [
        'Loading CPR document',
        'Reading certified hours by labor category',
        'Found gaps · Carpenters −5h · OT −2h',
        'Drafting CORE update + team notification',
    ],
    'a1.3b': [
        'CPR approval received from Lauren',
        'Final labor · Teamsters 24h · Carpenters 45h · OT 6h',
        'New total $6,920 (−$2,340 from quote)',
        'Drafting invoice request to Nancy',
    ],
    'a1.3c': [
        'Invoice received · invoice-QT-DOE2847.pdf',
        'Reading document with OCR',
        'Invoice approved · $6,920',
        'Matches CPR · ready for Finance/AR',
    ],
    'a1.4': [
        'Loading contract codes for DOE-2847',
        'Calculating expected fee · 18% per line',
        'Pulling Nancy\'s report from Herman Miller',
        'Comparison ready · gap detected · $1,250',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const BFI_SELF_INDICATED: string[] = [
    'a1.0', 'a1.1', 'a1.2', 'a1.2b', 'a1.2b3', 'a1.2c', 'a1.2d', 'a1.2e', 'a1.2f', 'a1.3', 'a1.3b', 'a1.3c', 'a1.4',
];
