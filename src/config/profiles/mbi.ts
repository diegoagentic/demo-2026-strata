// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Modern Business Interiors · Strata AI Demo Profile
//
// CLIENT: Modern Business Interiors (St. Charles, MO + Lenexa, KS · ~42 employees
//         · ~$17M · 30+ manufacturer partners · Allsteel dealer)
// PREPARED BY: Avanto
// DATE: April 2026 · revised Apr 27 2026
//
// DEMO NARRATIVE: 3 AI modules · Phase 1 = Accounting AI (Mark's pick).
//                 Budget Builder removed from the Thursday demo per Apr 23
//                 stakeholder direction (Carlos). The MBIBudgetPage component +
//                 m1.x history live in git in case priorities shift.
//
// FLOW 1 — Accounting AI (Phase 2, Controller · Phase 1 Pilot) · 5 scenes / 5 beats
//   m2.1: Bill queue — 3-column kanban (pending · in-progress · done)
//   m2.2: HealthTrust exception — GPO rebate · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR aging review — live status taxonomy + analytics (Apr 23 split)
//   m2.5: Collection drafts + close — review/edit/send + handoff to Flow 2
//
// FLOW 2 — Quotes AI (Phase 4, PM bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from the Account Manager → PM queue
//   m3.2: GP review + CORE Quote — PC sets GP per vendor · Strata creates CORE Quote
//   m3.3: AI validation — audit loops collapse into 1 AI + 1 human review
//   m3.4: Send proposal — closes the active tour (Design AI is Phase 4
//         directional context · available via Design AI tab outside the tour)
//
// DESIGN AI (Phase 4, early-adopter Designer · 3 scenes) — REMOVED FROM TOUR
// per Apr 27 stakeholder direction (Matt: "primary and only necessary
// demonstration is accounting" + Phase 4 modules are directional only).
// MBIDesignPage stays navigable via the Design AI nav tab so anyone who
// asks about Spec Check (Q10 #1 priority) can still see it. The m4.x
// step definitions live in git history if the tour needs them back.
//
// HERO SCENARIO: Allsteel invoice · 3% GPO rebate · pre-flagged by AI
// (the $18K Allsteel worksurface story belonged to the Budget Builder flow that
// is no longer in this demo)
//
// Note on step IDs: m2.x / m3.x / m4.x are kept verbatim from the original
// 4-flow plan so per-page STEP_TO_WIZARD_INDEX maps and useDemo wiring keep
// working without per-component churn. Only the visible groupTitle ("Flow 1:",
// "Flow 2:", "Flow 3:") and groupId numbering reflect the 3-flow trim.
//
// Reference: strata-projects/mbi/MBI_DEMO_DEVELOPMENT_PLAN.md
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const MBI_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Accounting AI (Phase 1 · Mark's pick)
    // Controller · Phase 1 Pilot · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm2.1',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'AP · Pending Review',
        description: 'Strata processes vendor bills continuously throughout the day as they arrive. Kathy opens her queue and sees the current state: 5 recently auto-posted to CORE, 3 being worked by reconciliation agents, and 4 pending her decision — two flagged exceptions and two HealthTrust GPO bills awaiting review.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'HealthTrust exception — GPO contract review',
        description: 'A hospital bill hits the HealthTrust GPO contract. Strata recognizes the membership, matches the contract terms, and flags it for Controller review before posting to CORE. The Controller reviews the contract match, then approves to post, overrides with a reason, or escalates to the Director of Healthcare.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Non-EDI reconciliation — line-by-line',
        description: 'A non-EDI vendor sends a paper bill. Strata OCRs it and compares it line-by-line to the matching PO. The Controller sees the flagged variances surfaced inline — a short-shipped item and a missing freight line — and resolves each with an accept or an override and reason. Every override trains the vendor-specific matcher.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.4',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'AR aging — live board replaces the bi-weekly Excel',
        description: 'AP closed · now AR. Filter by category — emails sent, no response, escalated, on hold — to work only what matters. Strata protects two accounts from auto-collections: one with installation pending, one with an open punch list. Where a client replied with a follow-up date, Strata read the intent and scheduled the next contact automatically.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.5',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Collection drafts + wrap up',
        description: 'Strata auto-sent 6 standard follow-ups today and held back 2 accounts where the project isn\'t complete yet. For the two escalation cases, Strata drafted emails in each client\'s tone history — the Controller reviews, edits if needed, and sends. With AP posted and AR actioned, the queue closes.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Quotes AI (Phase 4)
    // Project Manager · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm3.3',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'Quote validation · BOM completeness check',
        description: "Strata validates the assembled quote: duplicate lines, non-catalog pricing against manufacturer price books, quantity consistency between SIF and quote, and SKU completeness. The four sequential checks the team used to run by eye collapse into one AI pass plus one human review. Vendor quotes for non-catalog items are read automatically — no manual re-entry.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.1',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'Incoming budget · handoff from the Account Manager',
        description: "The signed budget from the Account Manager lands in the Project Manager's queue. All four readiness checks pass — budget confirmed, contract identified, scope locked, design sign-off. For the first time the PM picks up a quote-ready project instead of chasing missing context across teams.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.2',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'GP review · PC sets margin · CORE Quote created',
        description: "Spec is clean. Strata reads the SIF in seconds — 24 fields extracted, contract matched. The PC reviews gross profit per vendor: contract lines auto-lock (HNI Corporate 55%), unlocked vendors need a GP entry. Strata calculates sell prices and creates CORE Quote QUOT-2026-003.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.4',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'Send proposal · close the tour',
        description: "One human review later, the PM sends the proposal. Orders auto-route: EDI manufacturers receive transmissions instantly, non-EDI vendors get drafted PO emails ready to send. Hours of manual routing happen in minutes — and that closes the active demo tour. Design AI (Spec Check, Phase 4) is available via its own tab if the audience asks.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // Design AI (m4.x) intentionally removed from MBI_STEPS · MBIDesignPage
    // remains navigable via the Design AI nav tab. See header comment.
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm2.1': { mode: 'interactive', userAction: 'Review the queue · bills processed as they arrived · exceptions flagged for human decision' },
    'm2.2': { mode: 'interactive', userAction: 'Review the GPO contract match · approve to post · override with a reason · or escalate to the Director of Healthcare' },
    'm2.3': { mode: 'interactive', userAction: 'Reconcile the non-EDI bill line-by-line · accept or override each variance' },
    'm2.4': { mode: 'interactive', userAction: 'Scan the AR status taxonomy · spot escalations · the forecast updates live as you read' },
    'm2.5': { mode: 'interactive', userAction: 'Review the AI-drafted collection emails · edit if needed · send · then wrap up the queue' },
    'm3.1': { mode: 'interactive', userAction: 'Review the signed budget handoff from the Account Manager · verify the readiness checks' },
    'm3.2': { mode: 'interactive', userAction: 'Run SIF extraction · enter GP per vendor · confirm to create CORE Quote QUOT-2026-003' },
    'm3.3': { mode: 'interactive', userAction: 'Review the BOM validation — duplicates, non-catalog pricing, qty consistency · then resolve any flagged items' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers · this closes the active tour' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm2.1': [
        'Fetching bill queue',
        'Document AI extracting fields from each vendor bill',
        'Matching bill lines to open POs in CORE',
        'Applying GPO contract logic to HealthTrust bills',
        'Clean bills auto-posted · agents reconciling non-EDI · exceptions surfaced',
    ],
    'm2.2': [
        'Detected HealthTrust GPO member on this bill',
        'Matching bill to GPO contract · verifying membership and terms',
        'Contract confirmed · staging bill for Controller review',
        'Awaiting Controller approval before posting to CORE',
    ],
    'm2.3': [
        'Vendor flagged as non-EDI · falling back to OCR',
        'Matching bill to its source PO line-by-line',
        'Surfacing variances inline · short-shipped item + missing freight line',
        'Training the vendor-specific matcher from each decision',
    ],
    'm2.4': [
        'Generating AR aging report (live, not bi-weekly)',
        'Routing accounts by status · paid · committed-to-pay · escalated',
        'Updating leadership billing forecast in real-time',
        'AR analytics ready · drafts queued for the next scene',
    ],
    'm2.5': [
        'Drafting collection emails by account tone + history',
        'Loading client past-conversation context per draft',
        'Awaiting Controller review · send · close',
        'Queue complete · ready for handoff to Quotes AI',
    ],
    'm3.1': [
        'Signed budget received from the Account Manager',
        'Checking readiness gate · budget, contract, scope, design sign-off',
        'All checks green · routing to the PM queue',
        'Project Manager picks it up · bottleneck avoided',
    ],
    'm3.2': [
        'Reading SIF · extracting 24 fields from CET export',
        'Contract matched · HNI Corporate 55% discount applied',
        'Staging for GP review · contract lines locked · unlocked vendors need PC input',
        'PC confirmed GP · sell prices calculated · CORE Quote QUOT-2026-003 created',
    ],
    'm3.3': [
        'Scanning BOM for duplicate line items',
        'Checking non-catalog pricing vs manufacturer price books',
        'Validating quantity consistency — SIF vs quote',
        'BOM validation complete · 1 flagged item · vendor quote read automatically',
    ],
    'm3.4': [
        'Project Manager signed off · proposal ready to send',
        'Transmitting EDI to manufacturers that support it',
        'Drafting non-EDI POs for the rest',
        'Account Manager pinged · tour complete',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm2.1', 'm2.2', 'm2.3', 'm2.4', 'm2.5',
    'm3.1', 'm3.2', 'm3.3', 'm3.4',
];
