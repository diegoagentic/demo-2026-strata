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
//   m2.1: Morning queue — 3-column kanban (pending · in-progress · done)
//   m2.2: HealthTrust exception — GPO rebate · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR aging review — live status taxonomy + analytics (Apr 23 split)
//   m2.5: Collection drafts + close — review/edit/send + handoff to Flow 2
//
// FLOW 2 — Quotes AI (Phase 4, PM bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from the Account Manager → PM queue
//   m3.2: SIF → CORE auto-import — field-for-field, zero keystrokes
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
        title: 'Bill queue — continuous · recent &amp; pending',
        description: 'Strata processes vendor bills continuously throughout the day as they arrive. Kathy opens her queue and sees the current state: 5 recently auto-posted to CORE, 3 being worked by reconciliation agents, and 4 pending her decision — two clean exceptions plus two HealthTrust GPO rebate approvals.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'HealthTrust exception — GPO rebate',
        description: 'A hospital bill hits the HealthTrust GPO contract. Strata recognizes the membership, calculates the rebate line, and stages it as a separate GL entry. The Controller reviews the calculation, then approves to post, overrides with a reason, or escalates to the Director of Healthcare via Teams.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Non-EDI reconciliation — line-by-line',
        description: 'A non-EDI vendor sends a paper bill. Strata OCRs it and compares it line-by-line to the matching PO. The Controller sees the flagged variances surfaced inline — a short-shipped item and a finish upcharge — and resolves each with an accept or an override and reason. Every override trains the vendor-specific matcher.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.4',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'AR aging — live board replaces the bi-weekly Excel',
        description: 'AP closed · now AR. The taxonomy shows every open account by state — paid, committed-to-pay, escalated. The live billing forecast replaces the bi-weekly Excel so leadership reads real-time numbers instead of stale snapshots.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.5',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Collection drafts + close the morning',
        description: 'Strata pre-drafted a follow-up for every open account using each client\'s tone history. The Controller reviews, edits if needed, sends. With AP posted, AR collected, and the forecast live, the morning closes — and the next signed budget queues up the PC team.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: Quotes AI (Phase 4)
    // Project Manager · 4 scenes
    // ═══════════════════════════════════════════
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
        title: 'SIF → CORE auto-import',
        description: "The single largest bottleneck — manually re-entering the SIF into CORE — disappears. Strata auto-imports the structured data field-for-field. Zero keystrokes, zero typos. The PM team shifts from builders to reviewers.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.3',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'AI validation · audit loops collapse',
        description: "Spec Check runs against the assembled BOM. The four sequential audit loops the team used to run by eye — internal, vendor, manager, client — collapse into one AI pass plus one human review. Non-catalog items get cross-checked against manufacturer price books and the COM fabric workflow is formalized so spec gaps stop slipping through.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },
    {
        id: 'm3.4',
        groupId: 1,
        groupTitle: 'Flow 2: Quotes AI',
        title: 'Send proposal · close the tour',
        description: "One human review later, the PM sends the proposal. Orders auto-route: EDI manufacturers receive transmissions instantly, non-EDI vendors get drafted PO emails ready to send, and Compass reconciliation queues for the manufacturers that require it. Hours of manual routing happen in minutes — and that closes the active demo tour. Design AI (Spec Check, Phase 4) is available via its own tab if the audience asks.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // Design AI (m4.x) intentionally removed from MBI_STEPS · MBIDesignPage
    // remains navigable via the Design AI nav tab. See header comment.
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm2.1': { mode: 'interactive', userAction: 'Review the queue · bills processed as they arrived · exceptions flagged for human decision' },
    'm2.2': { mode: 'interactive', userAction: 'Approve the GPO rebate · override with a reason · or escalate to the Director of Healthcare' },
    'm2.3': { mode: 'interactive', userAction: 'Reconcile the non-EDI bill line-by-line · accept or override each variance' },
    'm2.4': { mode: 'interactive', userAction: 'Scan the AR status taxonomy · spot escalations · the forecast updates live as you read' },
    'm2.5': { mode: 'interactive', userAction: 'Review the AI-drafted collection emails · edit if needed · send · then close the morning' },
    'm3.1': { mode: 'interactive', userAction: 'Review the signed budget handoff from the Account Manager · verify the readiness checks' },
    'm3.2': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE · field-for-field · zero keystrokes' },
    'm3.3': { mode: 'interactive', userAction: 'Review Spec Check · audit loops collapse into one AI pass plus one human review' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers · this closes the active tour' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm2.1': [
        'Fetching bill queue',
        'Document AI extracting fields from each vendor bill',
        'Matching bill lines to open POs in CORE',
        'Applying HealthTrust exception logic',
        'Clean bills auto-posted · agents reconciling non-EDI · exceptions surfaced',
    ],
    'm2.2': [
        'Detected HealthTrust GPO member on this bill',
        'Computing GPO rebate against the bill subtotal',
        'Staging rebate line as a separate GL entry',
        'Awaiting Controller approval before posting to GPO payable',
    ],
    'm2.3': [
        'Vendor flagged as non-EDI · falling back to OCR',
        'Matching bill to its source PO line-by-line',
        'Surfacing variances inline · short-shipped item + finish upcharge',
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
        'Morning complete · ready for handoff to Quotes AI',
    ],
    'm3.1': [
        'Signed budget received from the Account Manager',
        'Checking readiness gate · budget, contract, scope, design sign-off',
        'All checks green · routing to the PM queue',
        'Project Manager picks it up · bottleneck avoided',
    ],
    'm3.2': [
        'Reading the signed SIF · structured fields detected',
        'Applying the matched contract discount',
        'Freight + install recalculated (no manual touching)',
        'Building the CORE proposal draft',
        'Auto-import complete · zero keystrokes',
    ],
    'm3.3': [
        'Running Spec Check — dimensions, finish, palette, availability',
        'Cross-checking non-catalog items vs manufacturer price books',
        'COM workflow · fabric approvals traced',
        'Audit loops collapsed into one AI pass + one human review',
    ],
    'm3.4': [
        'Project Manager signed off · proposal ready to send',
        'Transmitting EDI to manufacturers that support it',
        'Drafting non-EDI POs for the rest',
        'Compass reconciliation queued where required',
        'Account Manager pinged · tour complete',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm2.1', 'm2.2', 'm2.3', 'm2.4', 'm2.5',
    'm3.1', 'm3.2', 'm3.3', 'm3.4',
];
