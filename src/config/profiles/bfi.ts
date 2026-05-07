// ═══════════════════════════════════════════════════════════════════════════════
// BFI — BFI Furniture Industries · Strata AI Demo Profile
//
// CLIENT: BFI Furniture (Elizabeth, NJ · ~50 employees · ~$25-30M · Women Owned
//         Government/Municipal furniture dealer · CoNY primary customer)
// PREPARED BY: Avanto
// DATE: May 2026
//
// DEMO NARRATIVE: 2 AI flows targeting the CoNY Account Lead role.
//   Agency Fee AI: eliminates manual OmniQuote cycle, CPR reconciliation,
//   and fee verification — Lauren's 3 daily pain points across every order.
//   Receiving AI: monitors WIG inventory, detects FedEx gaps, parses bingo
//   packing lists, and dispatches work orders — eliminating manual CORE entry.
//
// FLOW 1 — Agency Fee AI · 8 scenes (b1.x)
//   b1.1: CoNY Order Queue — AI triage of active orders
//   b1.2: Pricing Validation — SIF vs CoNY contract · auto discount calc
//   b1.3: Discount Calculation — sell÷list-1 · true-up line · 0% GP
//   b1.4: Labor Quote Parser — WIG free text → structured table · Michael approval
//   b1.5: Order Tracker — CORE + Omni + Excel unified tracker
//   b1.6: CPR Reconciliation — certified hours vs quoted · Lauren approves
//   b1.7: CPR Relay & Invoice — Michael → Nancy pre-drafted message
//   b1.8: Agency Fee Verify — expected fee vs MK Invoice Processor · Patricia closes
//
// FLOW 2 — Receiving AI · 8 scenes (b2.x)
//   b2.1: Receiving Dashboard — received%, Freight vs FedEx, storage countdown
//   b2.2: FedEx Gap Resolution — gap auto-detected · POD pre-filled · 1 click send
//   b2.3: WIG Doc & Bingo Parse — Receiving Report + Bingo Sheet → Lena approves
//   b2.4: 100% Receipt Alert — automatic alert when order hits 100%
//   b2.5: Work Order Print — work order generated with NYC signature requirement
//   b2.6: Walter Notification — Walter sees status before paper arrives
//   b2.7: 30-Day Storage Monitor — countdown per order · day-20 alert
//   b2.8: Receiving Close — order invoiceable · bridge to Agency Fee closure
//
// PRESENTATION DATE: May 14, 2026
// PRESENTERS: CEO (Strata) or Wendy (Avanto/Strata SME)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const BFI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Agency Fee AI
    // CoNY Account Lead · 8 scenes
    // ═══════════════════════════════════════════
    {
        id: 'b1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'CoNY Order Queue',
        description: 'Strata surfaces the CoNY Account Lead\'s active orders by priority — CPR discrepancies, pricing under review, and receiving gaps — so the most critical work surfaces first without manual triage.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'Pricing Validation',
        description: 'Strata validates the SIF received from the Miller Knoll designer against the CoNY contract and flags restricted items, grommet exceptions, and missing catalog numbers — eliminating the 65-minute OmniQuote cycle.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'Discount Calculation',
        description: 'Strata auto-calculates the discount for every line using sell ÷ list − 1, inserts the true-up line to zero GP, and confirms Cost = Sale before pushing to CORE — replacing 20 minutes of manual calculation.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'Labor Quote Parser',
        description: 'Strata parses the WIG labor quote from free-text email into a structured table by union category — Inside Delivery, Teamsters, Carpenters, OT, Strike Truck. Director of Strategic Accounts reviews and approves before CORE entry.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.5',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'Order Tracker',
        description: 'Strata consolidates the order across CORE, OmniQuote, and the R Drive tracking sheet into a single live view — PO received, EDI acknowledgment, delivery date, and receiving status — eliminating the three-system check.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.6',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'CPR Reconciliation',
        description: 'Strata compares certified payroll hours against quoted labor categories, surfaces discrepancies with dollar impact, and notifies the Director of Strategic Accounts automatically upon approval.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.7',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'CPR Relay & Invoice',
        description: 'Strata pre-drafts the labor revision message from the Director of Strategic Accounts to the Miller Knoll Invoice Processor, including adjusted hours and dollar impact per category — replacing the 1-3 day manual relay chain.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },
    {
        id: 'b1.8',
        groupId: 0,
        groupTitle: 'Flow 1: Agency Fee AI',
        title: 'Agency Fee Verify',
        description: 'Strata calculates the expected agency fee from CoNY contract T-codes and compares it to the MK Invoice Processor report — verifying every dollar before Finance closes the order. Patricia confirms with one click.',
        app: 'bfi-agency-fee',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Receiving AI
    // CoNY Account Lead · 8 scenes
    // ═══════════════════════════════════════════
    {
        id: 'b2.1',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'Receiving Dashboard',
        description: 'Strata monitors received% in CORE for each CoNY order at WIG, distinguishes Freight from FedEx small-parcel shipments, calculates storage countdown per order, and alerts the Account Lead before the 30-day window expires.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.2',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'FedEx Gap Resolution',
        description: 'Strata detects FedEx small-parcel items shipped without WIG confirmation by cross-referencing OmniQuote against the WIG receiving log — and pre-fills the POD request to the HM contact for one-click send.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.3',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'WIG Doc & Bingo Parse',
        description: 'Strata parses the WIG Receiving Report and HM Packing List — mapping each Bingo # to its CORE order line, detecting missing cartons, and flagging FedEx sub-paths. Receiving Coordinator Lena confirms with one click instead of re-entering in CORE.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.4',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: '100% Receipt Alert',
        description: 'Strata monitors CORE received% and fires an automatic alert the moment an order hits 100% — replacing the manual daily check Lauren performs across all active WIG orders.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.5',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'Work Order Print',
        description: 'Strata generates the work order for the 100%-received order, calls out the NYC physical ink signature requirement, and surfaces the delivery window and remaining storage days — ready for Account Lead sign-off.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.6',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'Walter Notification',
        description: 'Strata notifies the CoNY Project Manager (Walter) digitally before the paper work order arrives — giving him visibility into items, delivery window, and storage urgency so he can pre-coordinate the installation crew.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.7',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: '30-Day Storage Monitor',
        description: 'Strata tracks the 30-day storage window for every WIG order — alerting the Account Lead at day 20 and surfacing per-order countdown so no order silently crosses into billable storage territory.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
    {
        id: 'b2.8',
        groupId: 1,
        groupTitle: 'Flow 2: Receiving AI',
        title: 'Receiving Close',
        description: 'With 100% receipt confirmed and work order dispatched, Strata marks the order invoiceable in CORE and bridges back to the Agency Fee flow — CPR and fee verification are now unblocked.',
        app: 'bfi-receiving',
        role: 'Dealer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const BFI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'b1.1': { mode: 'interactive', userAction: 'Review the CoNY order queue — AI priority ranking · click into the order with the CPR discrepancy' },
    'b1.2': { mode: 'interactive', userAction: 'Review SIF validation results — check restricted items and contract alignment · apply and continue' },
    'b1.3': { mode: 'interactive', userAction: 'Review the auto-calculated discount per line and true-up · apply discount to CORE' },
    'b1.4': { mode: 'interactive', userAction: 'Review the parsed labor table — Inside Delivery, Teamsters, Carpenters, OT · approve as Director of Strategic Accounts' },
    'b1.5': { mode: 'interactive', userAction: 'Review the unified order tracker — CORE, OmniQuote, and R Drive in one view · confirm status' },
    'b1.6': { mode: 'interactive', userAction: 'Review CPR discrepancies line-by-line — certified hours vs quoted · approve or edit with reason' },
    'b1.7': { mode: 'interactive', userAction: 'Review the pre-drafted labor revision message to Nancy at MK · edit if needed and send' },
    'b1.8': { mode: 'interactive', userAction: 'Confirm the agency fee matches the CoNY contract · Patricia sends to Finance / AR' },
    'b2.1': { mode: 'interactive', userAction: 'Review receiving status per order — spot the FedEx gap alert and storage countdowns' },
    'b2.2': { mode: 'interactive', userAction: 'Review the pre-filled POD request for the FedEx gap items · send to HM contact with one click' },
    'b2.3': { mode: 'interactive', userAction: 'Review the parsed Receiving Report and Bingo Sheet — confirm receipt in CORE as Lena' },
    'b2.4': { mode: 'interactive', userAction: 'Review the 100% receipt alert for DOH-0671 · acknowledge and proceed to work order' },
    'b2.5': { mode: 'interactive', userAction: 'Review the generated work order — NYC signature requirement noted · approve for print' },
    'b2.6': { mode: 'interactive', userAction: 'Review the Walter notification — CoNY PM sees delivery window and items before paper arrives · confirm' },
    'b2.7': { mode: 'interactive', userAction: 'Review storage countdown per order — flag orders approaching day 20 · set alerts' },
    'b2.8': { mode: 'interactive', userAction: 'Confirm the order is invoiceable — receiving close complete · bridge to Agency Fee' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const BFI_STEP_MESSAGES: Record<string, string[]> = {
    'b1.1': [
        'Fetching active CoNY orders from CORE',
        'Scanning CPR packages for labor discrepancies',
        'Checking pricing SIFs against CoNY contract',
        'Orders ranked by urgency · CPR and pricing flags surfaced',
    ],
    'b1.2': [
        'Reading SIF from Miller Knoll designer',
        'Comparing line items against CoNY contract pricing',
        'Flagging restricted items and missing catalog numbers',
        'SIF validated · discrepancies surfaced · ready for correction',
    ],
    'b1.3': [
        'Reading corrected SIF line items',
        'Calculating discount: (Sale ÷ List) − 1 per line',
        'Inserting true-up line to zero gross profit',
        'Cost = Sale confirmed · discount applied · ready for CORE',
    ],
    'b1.4': [
        'Reading WIG labor quote email for DOE-2847',
        'Parsing union categories: Inside Delivery, Teamsters, Carpenters',
        'Calculating totals per category at contract rates',
        'Labor table structured · Director of Strategic Accounts notified for approval',
    ],
    'b1.5': [
        'Loading CORE order status for DOE-2847',
        'Pulling OmniQuote acknowledgment log',
        'Syncing R Drive tracking sheet entries',
        'Unified tracker ready · PO received · EDI acknowledged · delivery date confirmed',
    ],
    'b1.6': [
        'Loading CPR document for DOE-2847',
        'Extracting certified hours by labor category',
        'Comparing against quoted hours in the order SIF',
        'Discrepancies detected · Carpenters −5h · OT Carpenters −2h · impact: −$2,340',
    ],
    'b1.7': [
        'Loading CPR approval from Lauren · DOE-2847',
        'Drafting labor revision message to Nancy Bos at Miller Knoll',
        'Attaching adjusted hours and dollar impact per category',
        'Message ready · Director of Strategic Accounts review before send',
    ],
    'b1.8': [
        'Loading CoNY contract T-codes for DOE-2847',
        'Calculating expected fee per product line at 18%',
        'Fetching MK Invoice Processor report from Nancy Bos',
        'Fee verified · $41,040 matches contract · ready for Finance / AR',
    ],
    'b2.1': [
        'Fetching received% from CORE for all CoNY WIG orders',
        'Identifying Freight vs FedEx small-parcel shipments',
        'Cross-checking FedEx manifests vs WIG confirmations',
        '1 order at 100% ready to dispatch · 1 FedEx gap detected and tracked',
    ],
    'b2.2': [
        'Cross-referencing OmniQuote shipment records vs WIG receiving log',
        'Identifying FedEx small-parcel items without WIG confirmation',
        'Retrieving FO numbers and tracking IDs for gap items',
        'POD request pre-filled · ready for one-click send to HM contact',
    ],
    'b2.3': [
        'Parsing WIG Receiving Report RR-38821',
        'Extracting Bingo Sheet — mapping carton # to product line',
        'Cross-referencing Bingo #s against CORE order lines',
        '35/36 cartons confirmed · Bingo #36 unconfirmed → FedEx sub-path triggered',
    ],
    'b2.4': [
        'Monitoring CORE received% for active WIG orders',
        'DOH-0671 reached 100% received — threshold triggered',
        'Calculating remaining storage window: 8 days',
        'Alert generated · Account Lead notified · ready to dispatch',
    ],
    'b2.5': [
        'Loading DOH-0671 order details from CORE',
        'Generating work order with items and delivery window',
        'Flagging NYC physical ink signature requirement',
        'Work order ready · Account Lead approval required before print',
    ],
    'b2.6': [
        'Generating work order notification for Walter (CoNY PM)',
        'Attaching items, delivery window, and storage urgency',
        'Sending via Microsoft Graph to Walter\'s inbox',
        'Walter notified · coordination can begin before paper arrives',
    ],
    'b2.7': [
        'Loading storage entry dates for all WIG orders from CORE',
        'Calculating days remaining in 30-day window per order',
        'Identifying orders crossing day 20 threshold',
        'Storage monitor active · alerts set · no orders in billable territory',
    ],
    'b2.8': [
        'Confirming 100% receipt and work order dispatch for DOH-0671',
        'Updating order status to invoiceable in CORE',
        'Bridging to Agency Fee flow — CPR and fee verification unblocked',
        'Receiving close complete · DOH-0671 ready for invoice',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const BFI_SELF_INDICATED: string[] = [
    'b1.1', 'b1.2', 'b1.3', 'b1.4', 'b1.5', 'b1.6', 'b1.7', 'b1.8',
    'b2.1', 'b2.2', 'b2.3', 'b2.4', 'b2.5', 'b2.6', 'b2.7', 'b2.8',
];
