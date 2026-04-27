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
//   m2.2: HealthTrust exception — GPO royalty · approve / override / escalate
//   m2.3: Non-EDI reconciliation — PO vs invoice line-by-line diff
//   m2.4: AR aging review — live status taxonomy + analytics (Apr 23 split)
//   m2.5: Collection drafts + close — review/edit/send + handoff to Flow 2
//
// FLOW 2 — Quotes AI (Phase 4, PM bottleneck resolution) · 4 scenes / 4 beats
//   m3.1: Incoming budget — signed handoff from the Account Manager → PM queue
//   m3.2: SIF → CORE auto-import — field-for-field, zero keystrokes
//   m3.3: AI validation — audit loops collapse into 1 AI + 1 human review
//   m3.4: Send proposal + handoff to Flow 3 (Design AI, upstream)
//
// FLOW 3 — Design AI (Phase 4, early-adopter Designer) · 3 scenes / 3 beats
//   m4.1: Pick project — Designer selects an ICU project · Phase 1 Pilot context
//   m4.2: Spec Check scan — four AI checks across the BOM
//   m4.3: Findings review + demo recap — one swap catches "all blue except this"
//
// HERO SCENARIO: HealthTrust Mercy invoice · 3% GPO royalty · pre-flagged by AI
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
        title: 'Morning queue — overnight processing complete',
        description: 'The Controller opens Strata to find the overnight queue laid out in three columns: 5 invoices auto-posted to CORE, 3 still being worked by reconciliation agents, and 4 that need her eyes — two clean exceptions plus two HealthTrust GPO royalty approvals.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.2',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'HealthTrust exception — GPO royalty',
        description: 'A hospital invoice hits the HealthTrust GPO contract. Strata recognizes the membership, calculates the royalty line, and stages it as a separate GL entry. The Controller reviews the calculation, then approves to post, overrides with a reason, or escalates to the Director of Healthcare via Teams.',
        app: 'mbi-accounting',
        role: 'Dealer',
    },
    {
        id: 'm2.3',
        groupId: 0,
        groupTitle: 'Flow 1: Accounting AI',
        title: 'Non-EDI reconciliation — line-by-line',
        description: 'A non-EDI vendor sends a paper invoice. Strata OCRs it and compares it line-by-line to the matching PO. The Controller sees the flagged variances surfaced inline — a short-shipped item and a finish upcharge — and resolves each with an accept or an override and reason. Every override trains the vendor-specific matcher.',
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
        title: 'Send proposal · route orders',
        description: "One human review later, the PM sends the proposal. Orders auto-route: EDI manufacturers receive transmissions instantly, non-EDI vendors get drafted PO emails ready to send, and Compass reconciliation queues for the manufacturers that require it. Hours of manual routing happen in minutes.",
        app: 'mbi-quotes',
        role: 'Project Manager',
    },

    // ═══════════════════════════════════════════
    // FLOW 3: Design AI (Phase 4)
    // Designer · early-adopter pilot · 3 scenes
    // ═══════════════════════════════════════════
    {
        id: 'm4.1',
        groupId: 2,
        groupTitle: 'Flow 3: Design AI',
        title: 'Pick project · pilot run',
        description: "The design team's AI trust is the lowest in the company, so the rollout starts with a single early-adopter Designer running Spec Check on one of her own projects — a hospital ICU expansion with a locked palette. The visible win on this run is what unlocks team-wide adoption.",
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.2',
        groupId: 2,
        groupTitle: 'Flow 3: Design AI',
        title: 'Spec check scan · four AI checks',
        description: 'Strata runs four AI checks against the BOM in sequence: dimensions match the CET footprint, finish consistency across upholstery and laminate, palette match against the project palette, and vendor availability against the install date. The full pass finishes faster than the team\'s manual line-by-line review — and catches what the eye misses.',
        app: 'mbi-design',
        role: 'Designer',
    },
    {
        id: 'm4.3',
        groupId: 2,
        groupTitle: 'Flow 3: Design AI',
        title: 'Findings review · "all blue except this"',
        description: 'One finding surfaces: a chair finish lands outside the project palette — exactly the class of mistake that historically reaches the client first ("everything is blue, this one is green"). The Designer accepts the AI-suggested swap in one click. Caught before delivery. The proof point unlocks team-wide rollout.',
        app: 'mbi-design',
        role: 'Designer',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const MBI_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'm2.1': { mode: 'interactive', userAction: 'Review the overnight queue · pre-processed invoices ready · exceptions flagged for human decision' },
    'm2.2': { mode: 'interactive', userAction: 'Approve the GPO royalty · override with a reason · or escalate to the Director of Healthcare' },
    'm2.3': { mode: 'interactive', userAction: 'Reconcile the non-EDI invoice line-by-line · accept or override each variance' },
    'm2.4': { mode: 'interactive', userAction: 'Scan the AR status taxonomy · spot escalations · the forecast updates live as you read' },
    'm2.5': { mode: 'interactive', userAction: 'Review the AI-drafted collection emails · edit if needed · send · then close the morning' },
    'm3.1': { mode: 'interactive', userAction: 'Review the signed budget handoff from the Account Manager · verify the readiness checks' },
    'm3.2': { mode: 'interactive', userAction: 'Watch the SIF flow into CORE · field-for-field · zero keystrokes' },
    'm3.3': { mode: 'interactive', userAction: 'Review Spec Check · audit loops collapse into one AI pass plus one human review' },
    'm3.4': { mode: 'interactive', userAction: 'Approve and send the proposal · orders route to manufacturers' },
    'm4.1': { mode: 'interactive', userAction: 'Confirm the early-adopter Designer as Phase 1 Pilot · select the ICU project for the spec scan' },
    'm4.2': { mode: 'interactive', userAction: 'Run Spec Check · watch the four AI checks run against the BOM' },
    'm4.3': { mode: 'interactive', userAction: 'Review the palette finding · accept the AI swap · close the demo arc' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const MBI_STEP_MESSAGES: Record<string, string[]> = {
    'm2.1': [
        'Fetching overnight invoice queue',
        'Document AI extracting fields from each vendor invoice',
        'Matching invoice lines to open POs in CORE',
        'Applying HealthTrust exception logic',
        'Clean invoices auto-posted · agents reconciling non-EDI · exceptions surfaced',
    ],
    'm2.2': [
        'Detected HealthTrust GPO member on this invoice',
        'Computing GPO royalty against the invoice subtotal',
        'Staging royalty line as a separate GL entry',
        'Awaiting Controller approval before posting to GPO payable',
    ],
    'm2.3': [
        'Vendor flagged as non-EDI · falling back to OCR',
        'Matching invoice to its source PO line-by-line',
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
        'Account Manager pinged · handoff complete',
    ],
    'm4.1': [
        'Loading the Designer\'s active projects',
        'ICU Expansion flagged as ready for Spec Check',
        'Project palette locked · BOM ready to scan',
        'Phase 1 Pilot mode · single early-adopter for now',
    ],
    'm4.2': [
        'Running AI check 1 · dimensions match the CET footprint',
        'Running AI check 2 · finish consistency across upholstery + laminate',
        'Running AI check 3 · palette match against the project palette',
        'Running AI check 4 · vendor availability against the install date',
        'Most checks clean · one finding to review',
    ],
    'm4.3': [
        'Finding · a chair finish lands outside the project palette',
        'Suggesting an in-palette swap',
        'Designer accepts · BOM palette fully clean',
        'Proof point logged · ready for team rollout',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const MBI_SELF_INDICATED: string[] = [
    'm2.1', 'm2.2', 'm2.3', 'm2.4', 'm2.5',
    'm3.1', 'm3.2', 'm3.3', 'm3.4',
    'm4.1', 'm4.2', 'm4.3',
];
