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
        id: 'a1.1',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'CoNY Order Queue',
        description: 'Lauren\'s morning starts with a prioritized view of active CoNY orders — CPR discrepancies, pricing flags, and receiving gaps surfaced by Strata. DOE-2847 has a critical CPR issue requiring immediate attention.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Quote + Pricing + Discount',
        description: 'Email arrives from Robert Chen (Miller Knoll Rep) with PDF specs and SIF file. Strata parses the SIF via OCR, validates it against the CoNY contract through OVNIQ — correcting one price on Filing Units ($8,100 → $7,560) — then calculates the discount automatically. What used to take 65 minutes takes seconds.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.2b',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Order Confirmation',
        description: 'Robert Chen (Miller Knoll designer) receives a Strata notification confirming order Q-2026-0089 for DOE-2847. Before Strata, he waited 1–2 business days for Lauren\'s manual email — with no system visibility. Now the loop closes in seconds.',
        app: 'bfi-agency-fee',
        role: 'Designer',
    },
    {
        id: 'a1.2c',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'PO & Labor · CORE Entry',
        description: 'The Purchase Order from NYC Dept. of Education arrives — Strata captures it digitally instead of a manual R-drive save. The Workplace labor quote arrives in the same place. Lauren reviews both, confirms the 30-day delivery window, enters in CORE and EDI transmits to OVNIQ automatically.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.3',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'CPR Reconciliation',
        description: 'Payment-critical — City of NY does not pay if CPR hours don\'t match. Strata detects the discrepancy (Carpenters −5h, OT −2h) and pre-drafts the revision message to Michael and Nancy. Lauren approves and sends without leaving the screen.',
        app: 'bfi-agency-fee',
        role: 'Account Manager',
    },
    {
        id: 'a1.4',
        groupId: 1,
        groupTitle: 'Flow 1: Agency Fee',
        title: 'Agency Fee Verify',
        description: 'Patricia verifies the expected agency fee from CoNY contract T-codes against the MK Invoice Processor report. Strata auto-detects a $1,250 discrepancy — the first time BFI has ever caught this automatically.',
        app: 'bfi-agency-fee',
        role: 'Finance / AR',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Product Receiving (5 steps)
    // ═══════════════════════════════════════════
    {
        id: 'r1.2',
        groupId: 2,
        groupTitle: 'Flow 2: Product Receiving',
        title: 'WIG Bingo Check',
        description: 'WIG sends the Receiving Report and Bingo Sheet as a Word document. Strata captures it digitally and prepares the AI analysis — eliminating the manual cross-reference that used to take Lena up to a week.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'r1.3',
        groupId: 2,
        groupTitle: 'Flow 2: Product Receiving',
        title: 'AI Analysis',
        description: 'Strata cross-references the packing list against the bingo sheet across 3 pages — carton by carton — and flags any discrepancy in under 10 seconds. Carton #34 is missing and pulsing red.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'r1.4',
        groupId: 2,
        groupTitle: 'Flow 2: Product Receiving',
        title: 'Alert & Claim',
        description: 'Strata auto-drafts the notification to Andy at Herman Miller and the Omni service claim — both pre-filled with the PMO, bingo number, line item, and item description. Lauren sends both with one click each.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'r1.5',
        groupId: 2,
        groupTitle: 'Flow 2: Product Receiving',
        title: 'Core Entry',
        description: 'With 34/35 cartons confirmed and carton #34 flagged as short-shipped, Lauren confirms receiving in CORE. Line 24 is excluded from the entry until the claim resolves.',
        app: 'bfi-receiving',
        role: 'Account Manager',
    },
    {
        id: 'r1.6',
        groupId: 2,
        groupTitle: 'Flow 2: Product Receiving',
        title: 'Notify Walter',
        description: 'Strata notifies Walter (CoNY Project Manager) digitally — before the paper work order arrives. He sees which items are ready, the delivery window, and the missing carton claim status.',
        app: 'bfi-receiving',
        role: 'Project Manager',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const BFI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'r1.2': { mode: 'interactive', userAction: 'Dashboard overview · WIG document notification slides in → click → review Receiving Report + Bingo Sheet · click Run AI Analysis' },
    'r1.3': { mode: 'interactive', userAction: 'Watch the AI cross-reference 35 cartons — progress bar runs → bingo grid reveals → carton #34 flags red' },
    'r1.4': { mode: 'interactive', userAction: 'Send POD request to Andy · wait for response · Andy confirms not shipped → open Omni claim · submit claim · proceed to CORE entry' },
    'r1.5': { mode: 'interactive', userAction: 'Review Strata pre-filled CORE entry (34/35, Line 24 excluded, claim linked) · confirm → watch CORE sync animation · Notify Walter to advance' },
    'r1.6': { mode: 'interactive', userAction: 'See Walter\'s phone — notification arrives before paper · Walter sees items · delivery window · claim status · confirms' },
    'a1.1': { mode: 'interactive', userAction: 'Review Lauren\'s morning queue — AI-prioritized orders · CPR flag on DOE-2847 · click to investigate' },
    'a1.2': { mode: 'interactive', userAction: 'Review email from Robert Chen · click Run SIF validation → watch OVNIQ validate 3 lines (1 price corrected) → accept correction → toggle City/State contract → apply discount & continue' },
    'a1.2b': { mode: 'interactive', userAction: 'See Robert Chen\'s phone — order confirmation arrives · DOE-2847 · Q-2026-0089 created · tap to open · Robert acknowledges · loop closed' },
    'a1.2c': { mode: 'interactive', userAction: 'Review PO from NYC DoE + labor quote from Workplace · confirm 30-day delivery window · confirm in CORE · watch EDI transmit to OVNIQ' },
    'a1.3': { mode: 'interactive', userAction: 'Review CPR discrepancies line-by-line · approve · see the pre-drafted message to Michael → send without leaving the screen' },
    'a1.4': { mode: 'interactive', userAction: 'Patricia verifies the agency fee — toggle match/gap scenario · confirm or flag the $1,250 discrepancy' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const BFI_STEP_MESSAGES: Record<string, string[]> = {
    'r1.2': [
        'WIG Receiving Report received via email',
        'Bingo Sheet attachment detected',
        'Document ready for AI analysis',
        'Waiting for analysis trigger',
    ],
    'r1.3': [
        'Parsing packing list PDF',
        'Reading bingo sheet — Page 1',
        'Reading line item sequence — Page 2',
        'Cross-referencing bingo numbers — Page 3',
        'Detecting discrepancies',
        '✓ Analysis complete — 1 issue found · Carton #34 missing',
    ],
    'r1.4': [
        'Identifying responsible contact at Herman Miller',
        'Pre-drafting notification with PMO, bingo#, and line item',
        'Pre-filling Omni claim form',
        'Both actions ready · awaiting Lauren\'s review and send',
    ],
    'r1.5': [
        'Preparing CORE entry for PMO-2026-0412',
        '34/35 cartons confirmed · Line 24 flagged short-shipped',
        'CORE entry excludes Line 24 pending claim resolution',
        'Ready for Lauren confirmation',
    ],
    'r1.6': [
        'Generating work order notification for Walter (CoNY PM)',
        'Attaching items, delivery window, and claim status',
        'Sending via push notification to Walter\'s device',
        'Walter notified · pre-coordination enabled before paper arrives',
    ],
    'a1.1': [
        'Fetching active CoNY orders from CORE',
        'Scanning CPR packages for hour discrepancies',
        'Checking pricing SIFs against CoNY contract',
        'Orders ranked by urgency · DOE-2847 flagged · CPR discrepancy detected',
    ],
    'a1.2': [
        'Reading SIF from Miller Knoll designer via OCR',
        'Validating SIF against CoNY contract through OVNIQ',
        'Filing Units ×6 corrected — $8,100 → $7,560 (T-code 18%)',
        'Calculating discount: (Sale ÷ List) − 1 = −37.50%',
    ],
    'a1.2b': [
        'Order Q-2026-0089 created in CORE for DOE-2847',
        'Confirmation sent to Robert Chen (Miller Knoll)',
        'Robert Chen received Strata notification',
        'Order acknowledged · loop closed · BFI can proceed to CPR reconciliation',
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
        'Drafting revision message to Michael Boyle and Nancy Bos',
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
    'r1.2', 'r1.3', 'r1.4', 'r1.5', 'r1.6',
    'a1.1', 'a1.2', 'a1.2b', 'a1.2c', 'a1.3', 'a1.4',
];
