// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACES — Workscapes, Inc. · Strata AI Demo Profile
//
// CLIENT: Workscapes, Inc. (Tampa, FL · ~126 employees · ~$60.7M · Women Owned
//         MillerKnoll dealer · 5 Florida locations)
// PREPARED BY: Avanto
// DATE: May 2026
//
// DEMO NARRATIVE: 2 AI flows targeting the expense report management process.
//   Flow 1 — Expense Submission & Approval: replaces broken GlobalSearch
//   approval with mobile OCR submission, inline receipt viewing, and
//   one-click approval — eliminating email workarounds and blind approvals.
//   Flow 2 — AP Processing & Reporting: AI pre-fills GL codes, auto-posts
//   to CORE, and gives Mehmet/Tammy a company-wide spend dashboard for the
//   first time — eliminating Letza's 45-min manual batch entry.
//
// FLOW 1 — Expense Submission & Approval · 4 scenes (w1.x)
//   w1.1: Mobile Submit + OCR — camera capture · AI auto-fill · multi-receipt
//   w1.2: Approval Queue — manager queue · SLA aging · receipts visible
//   w1.3: Approve with Receipt — inline receipts · approve/reject · resubmit loop
//   w1.4: Expense Status — employee timeline · audit trail · avg payment time
//
// FLOW 2 — AP Processing & Reporting · 4 scenes (w2.x)
//   w2.1: AP Review Queue — approved expenses · GL pre-suggestion · aging
//   w2.2: GL + CORE Sync — GL confidence% · override · auto-post animation
//   w2.3: Admin Self-Service — manager list · categories · hierarchy
//   w2.4: CFO/CAO Dashboard — spend view · filters · trends · drill-down · export
//
// SOT: src/config/profiles/workspaces-data/workspaces-sot.md
// DESIGNER BRIEF: src/config/profiles/workspaces-data/Workscapes_Designer_Brief.html
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const WORKSPACES_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // FLOW 1: Expense Submission & Approval
    // Employee → Manager · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'w1.1',
        groupId: 0,
        groupTitle: 'Flow 1: Expense Submission & Approval',
        title: 'Mobile Submit + OCR',
        description: 'Strata captures a receipt photo and extracts vendor, date, amount, and category automatically — pre-populating the entire form. Employee selects a manager from the always-current dropdown and submits in seconds instead of navigating a desktop form.',
        app: 'workspaces-submit',
        role: 'Employee',
    },
    {
        id: 'w1.2',
        groupId: 0,
        groupTitle: 'Flow 1: Expense Submission & Approval',
        title: 'Approval Queue',
        description: 'Strata surfaces all pending expense reports with receipts visible inline — no login to GlobalSearch required. SLA aging alerts flag reports sitting more than 3 days so Tammy can act before they breach the approval window.',
        app: 'workspaces-approval',
        role: 'Operations Manager',
    },
    {
        id: 'w1.3',
        groupId: 0,
        groupTitle: 'Flow 1: Expense Submission & Approval',
        title: 'Approve with Receipt',
        description: 'Manager sees the receipt inline — not as an attachment, not in a separate system. One click to approve and route to AP automatically, or reject with a required note that triggers an employee resubmission loop with full audit trail.',
        app: 'workspaces-approval',
        role: 'Operations Manager',
    },
    {
        id: 'w1.4',
        groupId: 0,
        groupTitle: 'Flow 1: Expense Submission & Approval',
        title: 'Expense Status',
        description: 'Employee sees real-time status of every expense — Submitted, In Review, Approved, Posted, Paid — with timestamps and average payment time. No need to call AP to find out where an expense stands.',
        app: 'workspaces-submit',
        role: 'Employee',
    },

    // ═══════════════════════════════════════════
    // FLOW 2: AP Processing & Reporting
    // AP Coordinator → CFO/CAO · 4 scenes
    // ═══════════════════════════════════════════
    {
        id: 'w2.1',
        groupId: 1,
        groupTitle: 'Flow 2: AP Processing & Reporting',
        title: 'AP Review Queue',
        description: 'Strata routes manager-approved expenses to Letza\'s AP queue with GL codes already pre-suggested by the rules engine. Aging indicators surface SLA outliers. The batch that took 45 minutes now takes under 5.',
        app: 'workspaces-ap',
        role: 'AP Coordinator',
    },
    {
        id: 'w2.2',
        groupId: 1,
        groupTitle: 'Flow 2: AP Processing & Reporting',
        title: 'GL + CORE Sync',
        description: 'Strata pre-fills GL codes per expense line with confidence percentages from the category rules engine. Letza confirms or overrides inline, then approves — triggering an automatic post to CORE. Manual re-entry eliminated entirely.',
        app: 'workspaces-ap',
        role: 'AP Coordinator',
    },
    {
        id: 'w2.3',
        groupId: 1,
        groupTitle: 'Flow 2: AP Processing & Reporting',
        title: 'Admin Self-Service',
        description: 'Letza manages managers, expense categories, and the approval hierarchy herself — no IT ticket, no wait. Changes apply immediately to the submission form and GL rules engine. The manager dropdown is always current.',
        app: 'workspaces-ap',
        role: 'AP Coordinator',
    },
    {
        id: 'w2.4',
        groupId: 1,
        groupTitle: 'Flow 2: AP Processing & Reporting',
        title: 'CFO / CAO Dashboard',
        description: 'Mehmet sees the full company spend with multi-dimensional filters, category trend comparisons by month, and SLA aging alerts. Tammy sees her Ops & Procurement division rollup across all Florida locations. First time either has had this visibility.',
        app: 'workspaces-reporting',
        role: 'CFO',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const WORKSPACES_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    'w1.1': { mode: 'interactive', userAction: 'Snap the receipt — watch Strata auto-fill vendor, date, amount and category · select manager · submit' },
    'w1.2': { mode: 'interactive', userAction: 'Review the approval queue — notice receipts are visible inline and the SLA alert on Carlos Ruiz · click Review' },
    'w1.3': { mode: 'interactive', userAction: 'Review the expense with receipt inline · approve — or try the reject scenario to see the resubmit loop' },
    'w1.4': { mode: 'interactive', userAction: 'See the expense status timeline as the employee — timestamps, approval chain, and average payment time' },
    'w2.1': { mode: 'interactive', userAction: 'Review Letza\'s AP queue — all expenses have GL pre-suggested · aging outlier flagged · click Review GL' },
    'w2.2': { mode: 'interactive', userAction: 'Review GL codes with confidence percentages · override if needed · confirm and watch auto-post to CORE' },
    'w2.3': { mode: 'interactive', userAction: 'Add a manager to the dropdown · update a category · see the hierarchy — no IT ticket required' },
    'w2.4': { mode: 'interactive', userAction: 'Filter the dashboard · drill into a spend category · switch to Tammy\'s division view · export' },
};

// ─── STEP MESSAGES (AI Agent Progress) ───────────────────────────────────────

export const WORKSPACES_STEP_MESSAGES: Record<string, string[]> = {
    'w1.1': [
        'Analyzing receipt image',
        'Extracting vendor, date, and amount',
        'Matching category from expense rules',
        'Form pre-populated · receipt attached · ready to submit',
    ],
    'w1.2': [
        'Loading pending approval queue',
        'Attaching receipts to each approval card',
        'Checking SLA age for all pending reports',
        'Queue ready · 1 SLA alert · receipts visible inline',
    ],
    'w1.3': [
        'Loading expense detail for John Smith',
        'Verifying receipt attachments',
        'Preparing approval action',
        'Ready to approve · reject will trigger resubmit loop',
    ],
    'w1.4': [
        'Fetching expense status from platform',
        'Building status timeline with timestamps',
        'Calculating average payment time',
        'Status timeline ready · audit trail complete',
    ],
    'w2.1': [
        'Loading manager-approved expenses',
        'Running GL rules engine on each expense',
        'Pre-filling GL codes by category',
        'AP queue ready · GL pre-suggested · aging flags applied',
    ],
    'w2.2': [
        'Loading expense lines for GL review',
        'Calculating GL confidence by category match',
        'Verifying receipt attachments for AP',
        'GL codes ready · Letza can confirm or override · CORE post queued',
    ],
    'w2.3': [
        'Loading admin configuration',
        'Fetching current manager list',
        'Loading expense categories and hierarchy',
        'Admin panel ready · all sections editable',
    ],
    'w2.4': [
        'Aggregating expense data from CORE',
        'Building spend breakdown by category',
        'Calculating SLA compliance and aging',
        'Dashboard ready · company view + division rollup · export available',
    ],
};

// ─── SELF-INDICATED STEPS ────────────────────────────────────────────────────
// Steps that handle their own AI indicator (don't use DemoAIIndicator default)

export const WORKSPACES_SELF_INDICATED: string[] = [
    'w1.1', // OCR animation handles its own AI reveal
    'w1.2', // Notification card inside the scene replaces the banner
    'w1.3', // Approve/reject scenario toggle is self-indicating
    'w2.2', // CORE post animation handles its own AI reveal
];
