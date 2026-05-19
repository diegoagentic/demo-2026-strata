// ═══════════════════════════════════════════════════════════════════════════════
// BFI — BFI Furniture Industries · Strata AI Demo Profile
//
// CLIENT: BFI Furniture (Elizabeth, NJ · ~50 employees · Women Owned
//         Government/Municipal furniture dealer · CoNY primary customer)
//
// DEMO STRUCTURE: 1 flow · 13 steps (post-Wendy revisions May 2026)
//
//   Dashboard — navbar tab permanente (no es un paso del demo)
//
//   FLOW 1 — Agency Fee · pre-award sequence (a1.0 → a1.2c)
//     a1.0:   Request for Quote      — Miller Knoll designer sends SIF/specs/floor plan
//     a1.1:   CoNY Order Queue       — Lauren morning triage · DOE-2847 surfaced
//     a1.2:   Order Confirmation     — Lauren confirms receipt to Robert Chen
//     a1.2b:  Quote Tool Validation  — SIF → Quote Tool · price correction + fee 3.75%
//                                      · ends with LaborQuoteDialog: email to WIG → Michael Boyle compiles labor figures
//     a1.2b3: Send Proposal          — Dialog overlay on kanban · Lauren sends proposal (product + labor) to NYC DOE
//     a1.2c:  PO Received · CORE     — NYC DOE issues PO · Lauren confirms in CORE
//
//   FLOW 1 — Agency Fee · post-delivery sequence (a1.2d → a1.4)
//     a1.2d:  WIG Bingo Check        — receiving report ingested · AI vs bingo sheet
//     a1.2e:  Shortage Claim         — missing carton · file claim with Herman Miller
//     a1.2f:  Work Order Ready       — replacement confirmed · notify BFI PM Walter
//     a1.3:   CPR Reconciliation     — per-line approval · CORE update · notify Michael/Nancy
//     a1.3b:  Manager Review         — BFI manager sends final quote to HM invoice processor
//     a1.3c:  Invoice Upload         — Strata detects invoice · forward to Finance/AR
//     a1.4:   Agency Fee Verify      — Patricia reconciles fee vs Nancy's report · closes
//
// PRESENTATION DATE: May 14, 2026
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const BFI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Agency Fee (14 steps)
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
        description: 'The BFI account manager reviews active CoNY orders for the day. Strata surfaces what needs attention — DOE-2847 is flagged for follow-up.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Order Confirmation',
        description: 'Robert Chen (Miller Knoll) receives Lauren\'s order confirmation for DOE-2847 and acknowledges receipt. Quote Q-2026-0089 is confirmed — BFI will proceed to Quote Tool validation.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.2b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Quote Tool Validation',
        description: 'Strata uploads the SIF to Quote Tool, which corrects the Filing Unit price against the CoNY contract. Lauren reviews the Quote Comparison and Herman Miller\'s Estimated Service Fees (3.75%), then triggers the labor quote request to WIG — Michael Boyle (BFI Director of Strategic Accounts) reviews WIG\'s response and forwards the compiled figures, all within the same step.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2b3',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Send Proposal to Client',
        description: 'With product pricing from Quote Tool and the labor quote from WIG in hand, the BFI account manager generates the formal proposal and sends it to NYC Dept. of Education for review.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'PO Received · CORE Entry',
        description: 'NYC Dept. of Education reviews the proposal and issues the Purchase Order back to BFI. The account manager reviews the PO against the proposal and confirms the order in CORE to lock in the delivery window.',
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
        description: 'Herman Miller confirms the replacement shipment for carton #34. The BFI account manager reviews the updated work order and floor plan, then notifies the BFI project manager to schedule the install.',
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
    'a1.1': { mode: 'interactive', userAction: 'Review Lauren\'s morning queue — AI-prioritized orders · new SIF on DOE-2847 · click to investigate' },
    'a1.2': { mode: 'interactive', userAction: 'See Robert Chen\'s email — order confirmation received · DOE-2847 · Q-2026-0089 · Robert acknowledges receipt · BFI proceeds to validate pricing' },
    'a1.2b': { mode: 'interactive', userAction: 'Review Quote Tool comparison · verify HMI-FU-300 unit price correction $1,350 → $1,260 (Ext. Sell $7,560) · verify service fee 3.75% · approve to request labor quote from WIG → email dialog · Michael Boyle compiles WIG labor figures' },
    'a1.2b3': { mode: 'interactive', userAction: 'Review the formal proposal (product + labor) · send to NYC DoE procurement · await client review and PO issuance' },
    'a1.2c': { mode: 'interactive', userAction: 'PO arrives from NYC DoE · review PO against the proposal sent · confirm 30-day delivery window · confirm in CORE' },
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
        'Extracting line items from SIF · 3 product lines detected',
        'Documents queued in Strata intake · notifying Lauren DeMarco',
    ],
    'a1.1': [
        'Fetching active CoNY orders from CORE',
        'Parsing incoming SIFs and attachments',
        'Checking pricing SIFs against CoNY contract',
        'Orders ranked by urgency · DOE-2847 received · ready for intake review',
    ],
    'a1.2': [
        'Order Q-2026-0089 confirmed · notification sent to Robert Chen',
        'Robert Chen (Miller Knoll) received email confirmation',
        'Spec sheet NYC-DOE-2847-specs.pdf attached',
        'Receipt acknowledged · BFI proceeds to Quote Tool validation',
    ],
    'a1.2b': [
        'Uploading SIF to Quote Tool · DOE-2847 · Q-2026-0089',
        'Comparing Requested vs Response against CoNY Contract ANT122',
        'HMI-FU-300 unit price corrected — $1,350 → $1,260 (CoNY contract rate) · Ext. Sell $7,560',
        'Restricted Products Check (OCR’d from Quote Comparison Download) · 0 flagged',
        'Herman Miller service fees applied (3.75%) · Grand Total $8,833.50',
        'Labor quote request drafted to WIG · awaiting Michael Boyle (BFI) to compile figures',
        'Labor quote received · Teamsters 24h · Carpenters 50h · OT 8h',
    ],
    'a1.2b3': [
        'Compiling proposal · product pricing (Quote Tool) + labor (WIG)',
        'Drafting email to NYC DoE procurement · DOE-2847',
        'Attachments prepared · Updated SIF, Quote Tool, Labor Quote',
        'Proposal sent to NYC DOE · awaiting client review and PO',
    ],
    'a1.2c': [
        'Purchase Order received from NYC Dept. of Education',
        'PO matched against the proposal sent · pricing and labor align',
        'Delivery window confirmed · May 14–21, 2026',
        'CORE entry confirmed · EDI transmission to Quote Tool initiated',
    ],
    'a1.3': [
        'Loading CPR document for DOE-2847',
        'Extracting certified hours by labor category',
        'Comparing against quoted hours · Carpenters −5h · OT −2h',
        'Drafting CORE update + stakeholder notification · Michael Boyle + Nancy Bos',
    ],
    'a1.3b': [
        'CPR approval received from Lauren DeMarco',
        'Compiling final labor quote: Teamsters 24h · Carpenters 45h · OT 6h',
        'Calculating total: $6,920 (−$2,340 from original quote)',
        'Drafting invoice request to Nancy Bos · Herman Miller',
    ],
    'a1.3c': [
        'Quote Tool invoice received · invoice-QT-DOE2847.pdf',
        'Scanning document · OCR extraction in progress',
        'Invoice type: Quote Tool · Status: APPROVED · Amount: $6,920',
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
    'a1.0', 'a1.1', 'a1.2', 'a1.2b', 'a1.2b3', 'a1.2c', 'a1.2d', 'a1.2e', 'a1.2f', 'a1.3', 'a1.3b', 'a1.3c', 'a1.4',
];
