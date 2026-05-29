// ═══════════════════════════════════════════════════════════════════════════════
// OFFICEWORKS — Officeworks Inc. · Strata AI Spec Check & Design Demo Profile
//
// CLIENT: Officeworks Inc. (Burlington MA · ~181 employees · 10 markets · $100M+
//         Teknion 30-year partner · GSA contract · 2022 Teknion Orion Award)
//
// DEMO PROCESS: Spec Check & Design (Furniture vertical · 30 designers · 3 mgrs)
// PROTAGONIST: Kimberly Tucker (Design Manager · PA/Pittsburgh/Ancillary)
// DEMO CLIENT: MANATT Phelps & Phillips LLP · DC market · price-protected SQ
//
// STRUCTURE: 17 steps mapped from BPMN (12 numbered tasks + 9 sub-steps +
//            13 gateways + 3 end events) in 5 swimlanes
//
//   Group 1 — Intake & Assignment       sc1.0, sc1.0b
//   Group 2 — Design & Validation       sc1.2 (CET+CAP), sc1.3 (valid+field), sc1.4
//   Group 3 — Teknion Order Preview     sc1.5, sc1.5b, sc1.5c
//   Group 4 — Spec Check  ⭐ HEROES     sc1.6 (SC2+SC3), sc1.7 (SC7)
//   Group 5 — Submission & Confirm      sc1.8, sc1.8b, sc1.9 ⭐ (Gemini)
//
// CEO TOP 4 PAIN POINTS (Chris Hanes confirmed):
//   #1 SC2 → sc1.6  |  #2 SC5 → Dashboard
//   #3 SC7 → sc1.7  |  #4 SC6 → Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const OFFICEWORKS_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // GROUP 1: Intake & Assignment
    // ═══════════════════════════════════════════
    {
        id: 'sc1.0',
        groupId: 1,
        groupTitle: 'Intake & Assignment',
        title: 'Form arrives · review & send clarification',
        description: 'Felicia (EVP Design & PM) opens the new MANATT intake. Caitlin Barolet (DC) submitted the Works form but the required CAD is missing and the SQ for the price-protected GSA client is blank. Strata drafted the clarifying email to Caitlin · Felicia reviews and sends it. Designer assignment is blocked until the reply arrives.',
        app: 'officeworks-intake',
        role: 'Design Manager',
    },
    {
        id: 'sc1.0b',
        groupId: 1,
        groupTitle: 'Intake & Assignment',
        title: 'Reply received · review form & assign designer',
        description: 'Caitlin replied to the clarification email with the missing CAD (manatt-4th-floor.dwg) attached and confirmed SQ #436533. Form is now complete · Felicia reviews the updated intake and assigns the designer. Strata recommends Kimberly Tucker (PA · 22h free this week / 40h available · prior MANATT · cross-market).',
        app: 'officeworks-intake',
        role: 'Design Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: Design & Validation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.2',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Design BOM · CET → CAP',
        description: 'Kimberly draws the furniture layout in CET while the live capacity ledger tracks committed hours from CET session events (PP2 · SC5). Optional Deep Discounting BOM (DDP) parallel toggle. When ready, BOM exports to CAP — 71 line items across 4 tags · Specifications + electrical embedded here, not standalone. AI Validator queues 426 attribute checks ahead of the self-audit hero step.',
        app: 'officeworks-design',
        role: 'Designer',
    },
    {
        id: 'sc1.3',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'Validation doc + field verification',
        description: 'The validation document compiles in Google Slides (2D/3D drawings, finishes, electrical specs) and goes to MANATT for approval — SLA timer auto-stamped on the client approval gate (PP4 · SC6). Once approved, pre-installation drawings hand off to Abigail\'s PM team for field verification — second SLA timer.',
        app: 'officeworks-submission',
        role: 'Designer',
    },
    {
        id: 'sc1.4',
        groupId: 2,
        groupTitle: 'Design & Validation',
        title: 'SQ / Price-protected check',
        description: 'MANATT is a price-protected GSA client (SQ #436533). Strata embeds the Teknion Create platform inline — no context switch — to verify SQ number and confirm the correct catalog effective date.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: Teknion Order Preview
    // ═══════════════════════════════════════════
    {
        id: 'sc1.5',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Submit Order Preview via Teknion portal',
        description: 'Felicia tracks the Teknion preview submission · Kimberly\'s BOM auto-filled in the portal. Tifani returns the preview number — typical turnaround 1-2 weeks. Gateway GW3 reveals the outcome: clean, specification gap, or timeline conflict.',
        app: 'officeworks-spec-check',
        role: 'Design Manager',
    },
    {
        id: 'sc1.5b',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Resolve specification gaps',
        description: 'Tifani flags a spec gap on a line. Strata suggests the fix · Kimberly accepts or edits · BOM revised · preview resubmitted.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },
    {
        id: 'sc1.5c',
        groupId: 3,
        groupTitle: 'Teknion Order Preview',
        title: 'Strategize order phasing',
        description: 'Teknion can\'t hit the date. 3-way huddle (Designer + PM + Salesperson) drafts the phasing plan. GW3A: does the revised plan require a new preview?',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },

    // ═══════════════════════════════════════════
    // GROUP 4: Spec Check ⭐ HERO FLOWS
    // ═══════════════════════════════════════════
    {
        id: 'sc1.6',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Self-audit BOM × 6 attributes',
        description: 'Today: printed BOMs + highlighters + pens, no laptop. With Strata: 5-step audit (Big Picture → Validation Doc → BOM & Drawing → CRs → One Last Check) across 71 lines, 13 CRs, 8 sub-categories. AI cross-references floor plan + validation doc + Create CR database. Estimated time saved: 6h → 25min.',
        app: 'officeworks-spec-check',
        role: 'Designer',
    },
    {
        id: 'sc1.7',
        groupId: 4,
        groupTitle: 'Spec Check',
        title: 'Peer review · second designer',
        description: 'Felicia opens the peer audit · Rebecca Warren reviews Kimberly\'s self-audit. Strata summarizes deltas to focus the review. Felicia drops her own tacit knowledge as rules ("I always check District inset glass — should be 6mm not CET default 10mm") — converting tacit to explicit knowledge base · CEO #3 priority (SC7).',
        app: 'officeworks-spec-check',
        role: 'Design Manager',
    },

    // ═══════════════════════════════════════════
    // GROUP 5: Submission & Confirmation
    // ═══════════════════════════════════════════
    {
        id: 'sc1.8',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'BOM submission email · PDF + SP4',
        description: 'Kimberly sends the BOM Submission email to Caitlin (and the Coordinator) — the BOM PDF and SP4 file attached. Strata pre-validates SP4 against NetSuite schema.',
        app: 'officeworks-submission',
        role: 'Designer',
    },
    {
        id: 'sc1.8b',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Coordinator uploads · Salesperson releases PO',
        description: 'Sales Coordinator uploads SP4 into NetSuite and applies the discount. Salesperson reviews and releases the PO to Teknion. Two distinct lanes, observed downstream.',
        app: 'officeworks-submission',
        role: 'Sales Coordinator',
    },
    {
        id: 'sc1.9',
        groupId: 5,
        groupTitle: 'Submission & Confirmation',
        title: 'Acknowledgment review · Gemini supercharge',
        description: 'Felicia opens the Teknion acknowledgment (real PO-DC-0009642) · the team\'s Gemini AI is already in use today for this exact cross-reference. Strata supercharges it. Diff scan across 71 lines + 13 CRs. Three terminal states: Acknowledged · Confirmed (post-resolve) · Held/Canceled.',
        app: 'officeworks-submission',
        role: 'Design Manager',
    },

];

// ─── STEP BEHAVIOR (presenter guide · action-forward) ────────────────────────

export const OFFICEWORKS_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'sc1.0':  { mode: 'interactive', userAction: 'Click the Strata notification → review the form (CAD missing · SQ blank) · open & send the clarification email to Caitlin' },
    'sc1.0b': { mode: 'interactive', userAction: 'Open the reply notification · review the completed form (CAD attached · SQ confirmed) · click Kimberly Tucker → Approve & Assign' },
    'sc1.2':  { mode: 'interactive', userAction: 'Watch the capacity ledger from CET events · optionally enable DDP parallel · drop the BOM file · review Strata\'s 3 findings on the real 149-line MANATT BOM' },
    'sc1.3':  { mode: 'interactive', userAction: 'Send the validation doc to MANATT (SLA timer arms) · once approved, send pre-install drawings to Abigail · both confirmations land before SQ check' },
    'sc1.4':  { mode: 'interactive', userAction: 'GW2C: SQ required (yes for MANATT) · open Create inline · verify SQ #436533 + 2025 catalog' },
    'sc1.5':  { mode: 'interactive', userAction: 'Submit Order Preview · wait for Tifani · pick GW3 outcome (clean / spec gap / timeline conflict)' },
    'sc1.5b': { mode: 'interactive', userAction: 'Accept Strata\'s spec gap fix · resubmit preview' },
    'sc1.5c': { mode: 'interactive', userAction: 'Open 3-way phasing card · review revised plan · GW3A: new preview or proceed' },
    'sc1.6':  { mode: 'interactive', userAction: 'Toggle Current State (paper) → Strata digital · run the 5-step audit · resolve issues · click any CR to lookup in Create inline · send to peer' },
    'sc1.7':  { mode: 'interactive', userAction: 'Read Rebecca\'s annotations · save Felicia\'s tacit knowledge as rules · approve · send BOM submission' },
    'sc1.8':  { mode: 'interactive', userAction: 'Review the BOM Submission email · send to Caitlin + Coordinator' },
    'sc1.8b': { mode: 'interactive', userAction: 'Watch NetSuite upload + discount · Salesperson releases PO to Teknion' },
    'sc1.9':  { mode: 'interactive', userAction: 'Open the real PO-DC-0009642 acknowledgment · run the diff · resolve any discrepancy with Teknion · pick terminal state (Confirmed / Held)' },
};

// ─── STEP MESSAGES (AI agent progress · short, status-style) ─────────────────

export const OFFICEWORKS_STEP_MESSAGES: Record<string, string[]> = {
    'sc1.0': [
        'Form received · MANATT 4th Floor · DC market',
        'Scanning attachments · CAD file required: not found',
        'GSA client detected · SQ number required: not provided',
        'Drafting clarification email back to Caitlin Barolet',
        'Designer assignment blocked until reply with CAD + SQ',
    ],
    'sc1.0b': [
        'Reply received from Caitlin Barolet · 2026-04-17 11:08',
        'CAD attachment parsed · manatt-4th-floor.dwg · 4.8 MB',
        'SQ #436533 confirmed · GSA price-protected · catalog 2025',
        'Form completeness · all required fields satisfied',
        'Pulling designer capacity across 3 regions',
        'Cross-referencing prior MANATT assignments',
    ],
    'sc1.2': [
        'Designer building BOM externally in CET / CAP',
        'Capacity ledger · CET session opened · +6h committed to Kimberly',
        'BOM uploaded · parsing PDF · 149 line items · 15 pages · Teknion T25',
        '11 areas tagged · 22 Custom Requests flagged for spec-check',
        '1 finish inconsistency surfaced · Item 73 · XS vs area XG Very White',
        'Pricing parsed · $1,541,392 List · AI Validator queued · 894 checks',
    ],
    'sc1.3': [
        'Compiling Validation Document · Google Slides',
        '2D/3D drawings · finishes · electrical wiring · wire mgmt',
        'Sent to MANATT contact for approval · SLA timer armed · 5d',
        'GW2A: client approved · sending pre-install packet to Abigail (PM)',
        'Field verification scheduled · SLA timer · 2d',
        'Both gates cleared · proceed to SQ check',
    ],
    'sc1.4': [
        'GW2C: client = MANATT · GSA contract · SQ required',
        'Opening Create platform inline · NO context switch',
        'SQ #436533 confirmed · price-protected effective 2025',
        'PZ Description column verified vs current catalog',
    ],
    'sc1.5': [
        'Filling Teknion Order Preview form · auto-from BOM',
        'Submitting to Tifani · awaiting response (1-2 weeks)',
        'Order preview #OP-2025-0001605 returned',
        'GW3: timeline conflict detected on 40-day CRs',
    ],
    'sc1.5b': [
        'Highlighting spec gap on line · CR 2046138 leadtime',
        'Drafting fix · phasing recommendation',
        'BOM revised · resubmitting preview',
    ],
    'sc1.5c': [
        'Drafting 3-way phasing plan',
        'Notifying Caitlin (Salesperson) + Abigail (PM)',
        'GW3A: phasing changes order structure · new preview needed',
        'Proceed to self-audit · phased BOM',
    ],
    'sc1.6': [
        'AUDIT: assumption that errors WILL exist · find them!',
        'Step 1 Big Picture · DC market · OWDC electrical req',
        'Step 2 Validation Doc · 2D/3D match floor plan · finishes OK',
        'Step 3 BOM × 6 attrs across 71 lines · 8 sub-categories',
        'Step 4 CRs in Create · 13 CRs · CR 2075919 BIFMA advisory',
        'Step 5 final check · 0 $0-list · catalogs current · aisle code OK',
        'Self-audit complete · 3 issues resolved · ready for peer review',
    ],
    'sc1.7': [
        'Peer assigned: Rebecca Warren (MA/NY/NJ)',
        'Delta summary: focus on CRs + electrical layout',
        'Felicia tacit knowledge: District inset glass should be 6mm',
        'Felicia tacit: Leverage NO field cut metal fascia',
        '2 new rules saved to Officeworks knowledge base',
        'Peer audit complete · BOM approved · send submission',
    ],
    'sc1.8': [
        'Drafting BOM Submission email · standard template',
        'Attaching BOM PDF + SP4 file',
        'Pre-validating SP4 vs NetSuite schema',
        'Sent to Caitlin Barolet + Sales Coordinator',
    ],
    'sc1.8b': [
        'Coordinator: uploading SP4 to NetSuite · 4 min',
        'Coordinator: applying discount · 79% off list',
        'Salesperson Caitlin: reviewing PO',
        'PO released to Teknion · PO-DC-0009642 generated',
    ],
    'sc1.9': [
        'Acknowledgment received · Universal #2-10468963',
        'Loading real PO-DC-0009642.pdf · 11 pages',
        'Gemini cross-reference: 71 lines · 13 CRs',
        'Diff scan: line 6 part # variant · within spec',
        'GW6: 70/71 lines match · 1 discrepancy on shipping date',
        'Drafting Change Order to tekco1@teknion.com',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────

export const OFFICEWORKS_SELF_INDICATED: string[] = [
    'sc1.0', 'sc1.0b', 'sc1.2', 'sc1.3', 'sc1.4',
    'sc1.5', 'sc1.5b', 'sc1.5c', 'sc1.6', 'sc1.7', 'sc1.8', 'sc1.8b', 'sc1.9',
];
