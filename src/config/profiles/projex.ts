// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX INC. · Strata AI Multi-Flow Demo Profile · F74 (2026-08-14)
//
// CLIENT: Projex Inc. (Denver + Seattle · ~25 employees · 3 legal entities
//         Projex Inc / Projex Corp / Culture LLC · commercial furniture +
//         architectural walls dealership · NetSuite live since Jan 2026)
//
// SOURCE OF TRUTH: scratchpad/projex-notion/_SOT_projex.md (1029 líneas · 19
//         secciones) · built from ProjeX_strata_solution_internal_3.html +
//         Notion export (kickoff Jun 8 2026 · 4-week AI Readiness Assessment)
//
// DEMO PROCESS: 5 parallel flows mapped from internal_3.html capability paths
//   Flow 1 · AP intake & matching                (AP1 · AP2 · AP9)
//   Flow 2 · Vendor onboarding & compliance      (VS1 · VS2 · VS3)
//   Flow 3 · Progress billing & collections      (FC11 · FC12 · WC9 · AR3)
//   Flow 4 · Order entry & PO dispatch           (FC6 · WC2)
//   Flow 5 · Electronic ordering & ACK           (FC8 · FC9) · client-directed
//
// PROTAGONIST: Compliance (Director of Accounting) · owns Flows 1-3
//              backup Accounting (Senior Accountant) · runs day-to-day AP
// CO-PROTAGONIST: Coordinator (Furniture) (Furniture Coord Lead) · owns 3-5
//              built her own Claude tool for PO email parsing (grassroots AI)
// WALLS SIDE: Walls Director (Walls Director) · Walls PM (sole Walls
//              coordinator · NEVER interviewed · Coordinator secondhand)
// CEO GATE: CEO · payment-release approval · "75% AI + human touch"
//
// DEMO CLIENTS (anchor projects · fidelity ALTA per user 2026-08-14):
//   - NCBA (National Cattlemen's Beef Association) · single Teknion PO 291 lines
//   - MWH project · 300+ product lines · 26 S&H manual lines · 26 POs · 50/25/15/10 billing
//   - Fairport-style · standard 50/40/10 furniture project
//
// HARD CONSTRAINTS (SOT §12):
//   - Four Hands EXCLUDED (dedicated pain vendor · client direction)
//   - ACH workaround visible · NetSuite→bank ACH batch NEVER delivered
//   - Billing terms Net 10 + 1.5%/mo late fee (NOT Net 30)
//   - 50/40/10 furniture · 60/30/10 Walls (Walls cannot include install en deposit)
//   - Teknion Online SIF upload = 70% direct-bill · vendor tail = PDF-over-email
//   - Payment cadence Tue + Thu · ~50 ACH per run · manual entry en bank portal
//   - Phase 1 read-only against NetSuite (Compliance gates permissions)
//
// STRUCTURE (Phase 1 · 6 steps AP · 4 stubs otros flows):
//   Group 1 — AP intake & matching         p1.1 → p1.6         (Flow projex-ap · 6 steps)
//   Group 2 — Vendor onboarding            p2.1                (Flow projex-vendor-onboarding · stub)
//   Group 3 — Progress billing             p3.1                (Flow projex-billing · stub)
//   Group 4 — Order entry & PO dispatch    p4.1                (Flow projex-order-po · stub)
//   Group 5 — Electronic ordering & ACK    p5.1                (Flow projex-ack · stub)
//
// VOCABULARY RULES (Projex-real · F74 refinement 2026-08-14):
//   - "AP inbox" (NOT "AP mailbox" · NOT "morning queue")
//   - "vendor bill" (Compliance's dominant word) · "vendor invoice" (PDF from vendor)
//   - "match to the penny" · "line-item match" (NOT "reconcile" · reserved for BANK)
//   - "mismatch" / "held bill" (NOT "exception")
//   - "PM double-check email" (NOT "PM confirmation")
//   - "Tue payment run · dashboard review" (NOT "payment-release approval gate")
//   - "Bill record saved in NetSuite · PDF in Communications tab" (NOT "posted")
//   - "financial dashboard" (AR aging tab + AP payables tab · Tue meeting con CEO)
// ═══════════════════════════════════════════════════════════════════════════════

import type { DemoStep } from '../demoProfiles';
import type { StepBehavior } from '../../components/demo/DemoStepBanner';

// ─── STEPS ───────────────────────────────────────────────────────────────────

export const PROJEX_STEPS: DemoStep[] = [

    // ═══════════════════════════════════════════
    // GROUP 1: AP intake & matching (Flow 1) · AP1 · AP2 · AP9 · 6 steps
    // ═══════════════════════════════════════════
    {
        id: 'p1.1',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'AP inbox sweep · 12 overnight matches ready for review',
        description: 'Accounting opens Strata for the AP day. Overnight, Strata swept 14 vendor bills from ap@projex-inc.com · 12 matched line-item exact-to-the-penny against NetSuite POs and landed into Ready-for-Review · 2 exceptions surface at the top (partial-ship variance + install-vendor without PO #). Baseline · 224 bills/mo · 287 Q4 peak · today Accounting keys ~20/hr easy vendors, 5/hr tough.',
        app: 'projex-ap',
        role: 'Senior Accountant',
        flowId: 'projex-ap',
    },
    {
        id: 'p1.2',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'Vendor bill in the AP inbox · Teknion 291-line PO (NCBA)',
        description: 'A Teknion vendor invoice llega al AP inbox · single PO for the NCBA (National Cattlemen\'s Beef Association) project · 291 lines. Strata OCR extracts vendor · invoice # · amount · PO # + all 291 line items. Agent pipeline visible: Email Intake → OCR → PO Matcher → NetSuite Bot. Confidence 97% · headers extracted first · line-items reveal staggered.',
        app: 'projex-ap',
        role: 'System',
        flowId: 'projex-ap',
    },
    {
        id: 'p1.3',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'Line-item match to the penny · partial bill + mismatch',
        description: 'Strata runs line-item comparison of the vendor bill vs the NetSuite PO · exact-to-the-penny rule (Compliance\'s hard rule). Of 15 sample lines representative of the 291-line total: 12 match · 2 qty mismatch (partial shipment · Teknion split-ship pattern) · 1 price mismatch (penny rounding). Accounting picks override reason from Compliance\'s cause taxonomy: tax rate changed · out of stock · substitution · penny rounding. Multi-Line Edit tool visible as Projex\'s current NetSuite workaround.',
        app: 'projex-ap',
        role: 'Senior Accountant',
        flowId: 'projex-ap',
    },
    {
        id: 'p1.4',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'Install-vendor bill without PO # · PM double-check email',
        description: 'A Warehouse by Design install-vendor invoice comes in with project name only (no PO #) · classic AP9 pattern (Clear Space Solutions and Digital Interior Group do the same). Strata drafts the PM double-check email to PM verbatim: "Which PO does this bill match? + confirm work complete + approved to pay?" · Accounting reviews the draft · one click sends · Strata queues bill as "Held · awaiting PM confirmation" until the PM responds.',
        app: 'projex-ap',
        role: 'Senior Accountant',
        flowId: 'projex-ap',
    },
    {
        id: 'p1.5',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'Tue payment run · dashboard review · CEO approves ACH batch',
        description: 'Tuesday payment run · 47 bills queued (Tue = big batch, Thu = one-offs). Compliance\'s twice-weekly financial dashboard (payables tab · AR aging tab) surfaces the batch to the CEO for approval. CEO clicks Approve · Strata prepares the ACH entries but does NOT release automatically · the ACH workaround stays visible (NetSuite→bank ACH batch upload never delivered · Compliance still manually enters remittance detail in the bank portal · Strata compares last remittance to prevent duplicate). CEO framing: "75% AI with the human touch on it".',
        app: 'projex-ap',
        role: 'CEO',
        flowId: 'projex-ap',
    },
    {
        id: 'p1.6',
        groupId: 1,
        groupTitle: 'AP intake & matching',
        title: 'Bill record saved in NetSuite · PDF dropped in Communications tab',
        description: 'Strata saves the bill record in NetSuite · drops the PDF in the Communications tab with the naming convention Compliance already uses: `date_vendor_invoice#_amount_PO#` · SharePoint mirror at Accounting Private → Invoices → year/month/company. Activity log records: extracted by OCR · matched by Strata · approved by CEO · saved by user (audit trail per legal entity). Data flow: AP_INBOX_PJX → OCR_AGENT → NETSUITE_BILL → SHAREPOINT_ACCT_PRIVATE.',
        app: 'projex-ap',
        role: 'System',
        flowId: 'projex-ap',
    },

    // ═══════════════════════════════════════════
    // GROUP 2: Vendor onboarding & compliance (Flow 2) · VS1 · VS2 · VS3 · 6 steps
    // ═══════════════════════════════════════════
    {
        id: 'p2.1',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Coordinator requests new vendor · structured intake · attach W-9',
        description: 'Coordinator needs to add Warehouse by Design (install vendor · AP9 pattern). Structured intake modal wizard replaces the free-text email a Accounting. Coordinator types vendor + reason + payment terms + attaches signed W-9. Ticket enters Accounting\'s queue with provenance.',
        app: 'projex-vendor-onboarding',
        role: 'Furniture Coordinator',
        flowId: 'projex-vendor-onboarding',
    },
    {
        id: 'p2.2',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'W-9 upload + OCR extraction · Accounting reviews 5 fields staggered',
        description: 'Accounting opens Coordinator\'s ticket · sees W-9 source PDF with bounding-box overlay. Strata OCR extracts TIN masked · Legal entity type (Sole prop/LLC/Corp) · EIN · Signed date · Address · with per-field confidence. Accounting validates fields with inline corrections when OCR conf <95%.',
        app: 'projex-vendor-onboarding',
        role: 'Senior Accountant',
        flowId: 'projex-vendor-onboarding',
    },
    {
        id: 'p2.3',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Compliance preflight · 4 checks (W-9 <12mo · 1099 · ACH · W-8 BEN-E)',
        description: 'Auto. Strata runs Projex compliance rules staged 5-check chain: W-9 signed date freshness (< 12 mo) · 1099-NEC flag for individuals · ACH bank routing verified · W-8 BEN-E N/A for US vendors · OFAC sanction check. Preflight left-rail siderail shows sections + counters. Popover on each row explains the rule. Fires when Accounting edits a field · re-runnable.',
        app: 'projex-vendor-onboarding',
        role: 'System',
        flowId: 'projex-vendor-onboarding',
    },
    {
        id: 'p2.4',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Compliance sign-off gate · release / reject with reason',
        description: 'Compliance opens the review modal · sees W-9 result + preflight result side-by-side. Binary decision · Release approves the vendor and sends to NetSuite master · Reject sends back to Accounting/Coordinator with reason capture (ACH details missing · TIN mismatch · needs W-8 BEN-E · other). Never auto-post. Human touch preserved (CEO\'s "75% AI + human touch" rule).',
        app: 'projex-vendor-onboarding',
        role: 'Director of Accounting',
        flowId: 'projex-vendor-onboarding',
    },
    {
        id: 'p2.5',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Vendor master registry · #734 populates NetSuite with expiration chip',
        description: 'Auto. NetSuite Vendor master receives the new vendor · row #734 highlighted animate-in-from-bottom into the registry grid. Data list shows 733 vendor rows + the new one. Expiration chip per row (W-9 age 30-day-out warning · fresh green · expired destructive). Filter by expiration bucket · search by MFG code or vendor name.',
        app: 'projex-vendor-onboarding',
        role: 'System',
        flowId: 'projex-vendor-onboarding',
    },
    {
        id: 'p2.6',
        groupId: 2,
        groupTitle: 'Vendor onboarding',
        title: 'Dealer readiness self-service · Coordinator sees vendor status per project',
        description: 'Coordinator opens Dealer view · sees vendor status per active project (Denver Financial · MWH · NCBA · Fairport). Warehouse by Design now appears "Ready for AP" with next payment run date. Expiration reminders 30-day-out surface in the Action Center · click opens pre-drafted "Request W-9 refresh" email (Friendlier/Firmer/Shorter toolbar) for the vendor · Coordinator reviews and sends.',
        app: 'projex-vendor-onboarding',
        role: 'Furniture Coordinator',
        flowId: 'projex-vendor-onboarding',
    },

    // ═══════════════════════════════════════════
    // GROUP 3: Progress billing & collections (Flow 3) · FC11 · FC12 · WC9 · AR3 · 6 steps
    // ═══════════════════════════════════════════
    {
        id: 'p3.1',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'Threshold alert · Fairport phase 2 crosses 50% ordered · Strata drafts proforma',
        description: 'Auto. Live billing forecast chart shows Fairport HQ phase 2 (Furniture 50/40/10) · ordered % crosses 50 en W32. Strata fires threshold trigger · animates chart · drafts proforma PJX-INV-3421 ($24,500 · 40% draw). Coordinator receives alert in Action Center. Was invisible until Coordinator spotted it in memory · now surfaces the moment PO/SO ratio crosses target.',
        app: 'projex-billing',
        role: 'System',
        flowId: 'projex-billing',
    },
    {
        id: 'p3.2',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'Coordinator proforma review · adjust line items + deposit deducted',
        description: 'Coordinator opens the drafted proforma modal · print-style replica with line items · design fee · surcharge · deposit already received deducted. Editable line table for adjustments before release. Human touch preserved · Coordinator keeps final say. Approve → routes to customer invoicing pipeline.',
        app: 'projex-billing',
        role: 'Furniture Coordinator',
        flowId: 'projex-billing',
    },
    {
        id: 'p3.3',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'Walls PM-review gate (WC9) · Director hands off to PM for installation-complete confirm',
        description: 'For Walls 60/30/10 projects · 30% draw needs Walls PM (Walls PM) confirmation that installation is complete before fires. Walls Director releases handoff · Walls PM receives ConfirmDialog · installation photos + punch list attached. WC9 is one of the 4 confirmed-High pain points · today Walls Director waits in Outlook for the Walls PM\'s reply · often delays draw fires.',
        app: 'projex-billing',
        role: 'Walls Director',
        flowId: 'projex-billing',
    },
    {
        id: 'p3.4',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'AR aging board · 4-column kanban by bucket (0-30 / 31-60 / 61-90 / 90+)',
        description: 'Shared AR aging board replaces the dead-tracker (AR3 · left with prior team member). 4 buckets kanban · one row per invoice card · notes-per-row · ownership assignment (Coordinator / Walls Director / Compliance). 10 records across MWH / Fairport / Denver Financial / NCBA · Net 10 + 1.5%/mo late fee (not Net 30). Filter by owner · click a row to open the hold-review modal.',
        app: 'projex-billing',
        role: 'Furniture Coordinator',
        flowId: 'projex-billing',
    },
    {
        id: 'p3.5',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'AI-drafted collection emails · shared queue (Furniture + Walls)',
        description: 'Strata drafts 5 collection emails staged by bucket · 3 friendly (31-60) · 1 firm (61-90) · 1 escalation (90+). Shared queue shows drafts from Coordinator + Walls Director juntos · FC12 fix (was personal Outlook tasks). AIEmailComposer with Friendlier/Firmer/Shorter tone polish toolbar · Coordinator reviews · edits inline · sends per-draft (never batch auto).',
        app: 'projex-billing',
        role: 'Furniture Coordinator',
        flowId: 'projex-billing',
    },
    {
        id: 'p3.6',
        groupId: 3,
        groupTitle: 'Progress billing & collections',
        title: 'Customer Invoice posted + NetSuite GL sync · Fairport 40% draw released',
        description: 'Auto. Proforma PJX-INV-3421 flips to Customer Invoice · NetSuite journal entry visible in the GL. Activity timeline log · state transition proforma → invoice → collections queue. 3-step post sequence (validating → creating → notifying) · saved-time moment surface. Coordinator can close out the milestone and move to next threshold monitoring.',
        app: 'projex-billing',
        role: 'System',
        flowId: 'projex-billing',
    },

    // ═══════════════════════════════════════════
    // GROUP 4: Order entry & PO dispatch (Flow 4) · FC6 · WC2 · 6 steps
    // ═══════════════════════════════════════════
    {
        id: 'p4.1',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Designer emails PIF + SIF · intake landing with drop-zone',
        description: 'Lead Designer (Lead Designer) emails the PIF workbook + SIF files. Email lands en Coordinator\'s inbox with attachment metadata visible. Drop-zone accept · Strata previews parse plan. Never auto-ingest · Coordinator clicks Ingest when they confirm scope.',
        app: 'projex-order-po',
        role: 'System',
        flowId: 'projex-order-po',
    },
    {
        id: 'p4.2',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'PIF-to-Order parse · Walls "AI lot line" + cost/margin/design-fee columns',
        description: 'MWH residential PIF · 300 lines vertical parser with cost/margin/design-fee/total-price columns. AI lot line convention for Walls (WC2 fix). Per-cell OCR confidence · Coordinator corrects fields <95%. Staged reveal · 24 sample lines of the 300.',
        app: 'projex-order-po',
        role: 'Furniture Coordinator',
        flowId: 'projex-order-po',
    },
    {
        id: 'p4.3',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Manual line editor · S&H + surcharge + design fee (26 entries)',
        description: 'Coordinator adds 26 shipping-and-handling manual entries · EditableLineTable with add-row affordance · freight per vendor (Alamir $19 flat rule · Nelson prepaid+add · Teknion consolidated). Design fee 8% of subtotal computed. Totals recompute live.',
        app: 'projex-order-po',
        role: 'Furniture Coordinator',
        flowId: 'projex-order-po',
    },
    {
        id: 'p4.4',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Batch PO drafts · 26 tiles multi-vendor · DiffViewer inline',
        description: '26 vendor POs drafted in the flat batch grid · 6 vendors visible (Teknion 3 POs · HBF 2 · Boss 2 · Alamir 2 · Nelson 1 · West Elm 1 + 14 batched). Per-card DiffViewer shows auto-draft vs prior human baseline · ConversionStatusBadge (draft/ready/needs-review). Never one-batch button (FC6 fix).',
        app: 'projex-order-po',
        role: 'Furniture Coordinator',
        flowId: 'projex-order-po',
    },
    {
        id: 'p4.5',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Per-vendor Send · release Teknion first · HBF hold',
        description: 'Coordinator opens SubmitPODialog per PO · sends Teknion (SIF upload) first to start the clock · HBF hold for tomorrow · Boss Design draft email reviewed before send. Banner "Never auto-send" visible. Each release is intentional · per-vendor control preserved (SOT §12b · Coordinator never trusts auto-send).',
        app: 'projex-order-po',
        role: 'Furniture Coordinator',
        flowId: 'projex-order-po',
    },
    {
        id: 'p4.6',
        groupId: 4,
        groupTitle: 'Order entry & PO dispatch',
        title: 'Coordinator release complete · SnapshotComparisonView tri-way match + audit trail',
        description: 'Post-release · SnapshotComparisonView shows three-way match (draft = sent = NetSuite record). ActivityTimeline audit trail per PO. Tracking chips per vendor delivery state. RevisionHistory + ArtifactDownloads available. Coordinator closes MWH cycle · monitor ACKs next.',
        app: 'projex-order-po',
        role: 'System',
        flowId: 'projex-order-po',
    },

    // ═══════════════════════════════════════════
    // GROUP 5: Electronic ordering & ACK processing (Flow 5) · FC8 · FC9 · 6 steps
    // ═══════════════════════════════════════════
    {
        id: 'p5.1',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'Teknion Online SIF upload · 70% of the volume + email tail 30%',
        description: 'PO-2026-4421 (NCBA) SIF uploaded to Teknion Online (~70% of Projex volume is Teknion direct-bill via SIF upload). Other vendors (30% tail · HBF · Boss · Alamir · Nelson · West Elm) via email PDF with SourceBadge visible. Split view mock Teknion Online browser panel + PO summary card + progress bar for the SIF upload.',
        app: 'projex-ack',
        role: 'System',
        flowId: 'projex-ack',
    },
    {
        id: 'p5.2',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'ACK received · per-vendor OCR confidence (FC9)',
        description: 'ACK PDFs return drip-drip per vendor. AcknowledgementUploadModal OCR extraction · per-vendor confidence variable (Teknion 98% excellent · HBF 91% good · Alamir 74% review-recommended). FC9 fix · confidence per vendor scored before committing effort · Coordinator prioritizes review when confidence <80%.',
        app: 'projex-ack',
        role: 'System',
        flowId: 'projex-ack',
    },
    {
        id: 'p5.3',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'ACK vs PMO comparison · 71 lines + 13 CRs · Teknion CR taxonomy',
        description: 'AckHeroMatchPanel UN-CUTTABLE hero. Split-pane ACK PDF left · PMO grid right · row-by-row diff. Teknion CR taxonomy real (leadtime · BIFMA advisory · width change · pricer comment) · 13 CRs visible · 5 warn (width changes + leadtimes with impact) + 8 info (BIFMA advisories · pricer notes). ThreeWayMatchView per line with status icons.',
        app: 'projex-ack',
        role: 'Furniture Coordinator',
        flowId: 'projex-ack',
    },
    {
        id: 'p5.4',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'Clear 10/10/2050 sentinel · update PMO line (Multi-Line Edit tool)',
        description: 'AckReviewSlideOver full max-w-6xl with PMO editable line editable. Watch each row\'s ESD transition from 10/10/2050 sentinel → real Teknion date (2026-09-10 · 09-15 · 09-24 · 10-02). EditableLineTable inline · Multi-Line Edit tool call-out (NetSuite artifact) · bulk update option. Coordinator confirms each CR-affected row.',
        app: 'projex-ack',
        role: 'Furniture Coordinator',
        flowId: 'projex-ack',
    },
    {
        id: 'p5.5',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'Designer chain assembly · Lead → Spec → PM (FC8 net-new)',
        description: 'Running chart FC8 net-new · designer chain auto-assembles vs Coordinator today builds manually in Excel. Lead Designer (Lead Designer) reviews CR-01 leadtime · Spec Designer (Spec Designer) confirms width changes CR-03/07/12 with client · PM Coordinator (PM Coordinator) signs off. Thread completo with attachments + replies + timestamps. CC affordance for additional stakeholders.',
        app: 'projex-ack',
        role: 'Furniture Coordinator',
        flowId: 'projex-ack',
    },
    {
        id: 'p5.6',
        groupId: 5,
        groupTitle: 'Electronic ordering & ACK',
        title: 'Daily ESD sweep + shipment tracking (Shipment Notification SN)',
        description: 'OrderTrackerScene grid daily · sweeps 20 PMO lines · Shipment Notification (SN) inbound events per vendor · TrackingModal per shipment. Daily "Daily Report — From POs_Projex Inc." saved-search style · Multi-Line-Edit tool bulk update for bulk PMO refresh. Coordinator closes MWH cycle · monitor deliveries.',
        app: 'projex-ack',
        role: 'Furniture Coordinator',
        flowId: 'projex-ack',
    },
];

// ─── STEP BEHAVIOR ───────────────────────────────────────────────────────────

export const PROJEX_STEP_BEHAVIOR: Record<string, StepBehavior> = {
    // Phase 1 · AP flow · mixed auto-play + interactive
    'p1.1': { mode: 'auto', duration: 6000, aiSummary: 'AP inbox sweep · 12/14 auto-matched overnight' },
    'p1.2': { mode: 'interactive', userAction: 'Watch OCR extract the Teknion 291-line PO' },
    'p1.3': { mode: 'interactive', userAction: 'Pick override reason for the 3 mismatches' },
    'p1.4': { mode: 'interactive', userAction: 'Review and send the PM double-check email' },
    'p1.5': { mode: 'interactive', userAction: 'CEO approves the Tue payment run batch' },
    'p1.6': { mode: 'auto', duration: 5000, aiSummary: 'Bill saved · PDF filed · audit trail complete' },
    // F2 · vendor onboarding · 6 steps (Coordinator → Accounting → Compliance → Registry → Coordinator)
    'p2.1': { mode: 'interactive', userAction: 'Coordinator types vendor + attaches W-9' },
    'p2.2': { mode: 'interactive', userAction: 'Accounting validates 5 W-9 fields · OCR conf per field' },
    'p2.3': { mode: 'auto', duration: 4500, aiSummary: 'Preflight running · 4 compliance checks staggered' },
    'p2.4': { mode: 'interactive', userAction: 'Compliance sign-off · Release or Reject with reason' },
    'p2.5': { mode: 'auto', duration: 3500, aiSummary: 'Vendor #734 saved · animated arrival in NetSuite registry' },
    'p2.6': { mode: 'interactive', userAction: 'Review expiration reminders + send refresh emails' },
    // F3 · progress billing · 6 steps
    'p3.1': { mode: 'auto', duration: 4500, aiSummary: 'Fairport crosses 50% threshold · proforma drafted' },
    'p3.2': { mode: 'interactive', userAction: 'Coordinator reviews proforma · adjusts lines · approve' },
    'p3.3': { mode: 'interactive', userAction: 'Walls handoff to PM · installation-complete confirm' },
    'p3.4': { mode: 'interactive', userAction: 'Explore AR kanban · buckets 0-30/31-60/61-90/90+' },
    'p3.5': { mode: 'interactive', userAction: 'Review 5 collection drafts · tone polish · send per draft' },
    'p3.6': { mode: 'auto', duration: 4000, aiSummary: 'Proforma posted to Customer Invoice · NetSuite GL sync' },
    // F4 · order/PO dispatch · 6 steps
    'p4.1': { mode: 'interactive', userAction: 'Coordinator opens PIF email · confirms ingest' },
    'p4.2': { mode: 'auto', duration: 5500, aiSummary: 'Parsing MWH PIF · 300 lines vertical with AI lot line' },
    'p4.3': { mode: 'interactive', userAction: 'Coordinator adds 26 S&H manual entries' },
    'p4.4': { mode: 'interactive', userAction: 'Explore 26 PO batch grid · click card for DiffViewer' },
    'p4.5': { mode: 'interactive', userAction: 'Per-vendor Send · Teknion first · never one-batch' },
    'p4.6': { mode: 'auto', duration: 4000, aiSummary: 'Snapshot tri-way match + audit trail · 26 POs sent' },
    // F5 · electronic ordering & ACK · 6 steps
    'p5.1': { mode: 'auto', duration: 4500, aiSummary: 'SIF uploaded to Teknion Online · 70% of the volume · email tail' },
    'p5.2': { mode: 'auto', duration: 5000, aiSummary: 'ACK OCR per-vendor · Teknion 98% · Alamir 74% review-recommended' },
    'p5.3': { mode: 'interactive', userAction: 'Explore split-pane · 71 lines + 13 CRs · Teknion CR taxonomy' },
    'p5.4': { mode: 'interactive', userAction: 'Clear 10/10/2050 sentinels · Multi-Line Edit tool bulk' },
    'p5.5': { mode: 'interactive', userAction: 'Review Lead → Spec → PM designer chain thread' },
    'p5.6': { mode: 'auto', duration: 4000, aiSummary: 'Daily ESD sweep + shipment tracking · 6 vendors monitored' },
};

// ─── AI INDICATOR MESSAGES (bullets rotativos) ───────────────────────────────

export const PROJEX_STEP_MESSAGES: Record<string, string[]> = {
    'p1.1': [
        'Email Capture watching ap@projex-inc.com · 14 new bills overnight',
        '12 auto-matched line-item exact-to-the-penny against NetSuite POs',
        '2 exceptions surfaced · partial-ship variance + install-vendor without PO #',
        'Baseline · 224 bills/mo · 287 Q4 peak · Accounting keys ~20/hr easy · 5/hr tough',
    ],
    'p1.2': [
        'Teknion vendor invoice arriving at ap@projex-inc.com',
        'OCR extracting header · vendor · invoice # · amount · PO #',
        'Line-item extraction · 291 lines · confidence 97%',
        'Agent pipeline · Email Intake → OCR → PO Matcher → NetSuite Bot',
    ],
    'p1.3': [
        'Line-item match to the penny · Compliance\'s hard rule',
        '12 of 15 sample lines match exact · 2 qty mismatch · 1 price variance',
        'Cause taxonomy · tax rate · out of stock · substitution · penny rounding',
        'Multi-Line Edit tool visible · Projex\'s current NetSuite workaround',
    ],
    'p1.4': [
        'Warehouse by Design install invoice · project name only · no PO #',
        'Drafting PM double-check email to PM verbatim',
        '"Which PO does this bill match? + work complete? + approved to pay?"',
        'Bill held · awaiting PM confirmation · timer starts',
    ],
    'p1.5': [
        'Tuesday payment run · 47 bills queued (big batch · Thu = one-offs)',
        'Financial dashboard · payables tab · CEO reviews',
        'ACH workaround visible · NetSuite → bank never delivered · manual remittance',
        'Duplicate-payment control · comparing last remittance detail',
    ],
    'p1.6': [
        'Bill record saved in NetSuite · Bill button + Communications tab',
        'PDF naming · date_vendor_invoice#_amount_PO#',
        'SharePoint mirror · Accounting Private → Invoices → year/month/company',
        'Data flow · AP_INBOX_PJX → OCR → NETSUITE_BILL → SHAREPOINT',
    ],
    // F2 · vendor onboarding · 6 steps
    'p2.1': [
        'Coordinator opens structured intake modal · types Warehouse by Design',
        'Attaches signed W-9 · payment method ACH · Net 10 terms',
        'Free-text email to Accounting replaced by structured form',
        'Ticket enters Accounting\'s queue with provenance',
    ],
    'p2.2': [
        'Accounting opens Coordinator\'s ticket · W-9 source PDF with bounding-box overlay',
        'Strata OCR extracts TIN masked · entity type · EIN · signed date · address',
        'Per-field confidence % · Accounting corrects fields < 95%',
        'Save extracted → routes to compliance preflight',
    ],
    'p2.3': [
        'Auto · Strata runs 4-check compliance preflight',
        'W-9 signed <12mo · 1099-NEC flag · ACH verified · W-8 BEN-E N/A US',
        'OFAC sanction check · all clear',
        'Preflight ready for Compliance review',
    ],
    'p2.4': [
        'Compliance opens review modal · W-9 + preflight side-by-side',
        'Release approves vendor · Reject sends back with reason',
        'Never auto-post · human touch preserved (CEO\'s 75% rule)',
        'Release → NetSuite Vendor master',
    ],
    'p2.5': [
        'Auto · Vendor #734 saved to NetSuite master',
        'Row animate-in-from-bottom · highlighted in registry grid',
        'Expiration chip per row · 30-day W-9 warning surface',
        'Filter by bucket · search by MFG code',
    ],
    'p2.6': [
        'Coordinator opens Dealer view · vendor status per active project',
        'Warehouse by Design now "Ready for AP" with next payment run date',
        'Expiration reminders 30-day-out surface in the Action Center',
        'Pre-drafted "Request W-9 refresh" email · Coordinator reviews and sends',
    ],
    // F3 · progress billing · 6 steps
    'p3.1': [
        'Auto · Fairport phase 2 crosses 50% ordered en W32',
        'Strata drafts proforma PJX-INV-3421 · 40% draw $24,500',
        'Threshold trigger surface in the Action Center',
        'Coordinator receives alert · was invisible until spotted in memory',
    ],
    'p3.2': [
        'Coordinator opens proforma modal · print-style replica',
        'Editable line table · design fee · surcharge · deposit deducted',
        'Adjust before release · human touch preserved',
        'Approve → routes to customer invoicing pipeline',
    ],
    'p3.3': [
        'Walls 60/30/10 · 30% draw needs Walls PM confirmation',
        'Walls Director releases handoff · installation photos + punch list attached',
        'Walls PM receives ConfirmDialog · installation-complete gate (WC9)',
        'Today Walls Director waits in Outlook · often delays draw fires',
    ],
    'p3.4': [
        'AR aging kanban · 4 buckets 0-30/31-60/61-90/90+',
        'Shared board replaces dead-tracker (AR3 · prior team member left)',
        'Row-per-invoice cards · notes-per-row · ownership per record',
        'Net 10 + 1.5%/mo late fee · click a row to open the hold-review modal',
    ],
    'p3.5': [
        'Strata drafts 5 collection emails staged by bucket',
        'Shared queue · drafts from Coordinator + Walls Director juntos (FC12 fix)',
        'AIEmailComposer with Friendlier/Firmer/Shorter tone polish',
        'Coordinator reviews · edits inline · sends per-draft (never batch auto)',
    ],
    'p3.6': [
        'Proforma flips a Customer Invoice · NetSuite GL entry',
        '3-step post · validating → creating → notifying',
        'Activity timeline log · state transition visible',
        'Coordinator closes milestone · monitor next threshold',
    ],
    // F4 · order/PO dispatch · 6 steps
    'p4.1': [
        'Lead Designer (designer) emails PIF + SIF · attachment metadata visible',
        'Drop-zone accept · Strata previews parse plan',
        'Never auto-ingest · Coordinator clicks Ingest',
        'MWH residential · 300 lines · 26 POs expected',
    ],
    'p4.2': [
        'Auto · PIF parse with 300 lines vertical layout',
        'Cost/margin/design-fee/total-price columns',
        'Walls AI lot line convention (WC2 fix)',
        'Per-cell OCR confidence · corrections available',
    ],
    'p4.3': [
        'EditableLineTable · 26 S&H manual entries',
        'Alamir $19 flat rule · Nelson prepaid+add · Teknion consolidated',
        'Design fee 8% of subtotal · totals recompute live',
        'Coordinator owns manual line control',
    ],
    'p4.4': [
        '26 PO tiles multi-vendor batch grid',
        'DiffViewer inline · auto-draft vs prior baseline',
        'ConversionStatusBadge · draft/ready/needs-review',
        'Never one-batch button (FC6 fix)',
    ],
    'p4.5': [
        'SubmitPODialog per PO · never batch auto',
        'Coordinator sends Teknion first · HBF hold · Boss review',
        'Banner "Never auto-send" visible',
        'Per-vendor control preserved (Coordinator never trusts auto)',
    ],
    'p4.6': [
        'SnapshotComparisonView · tri-way match',
        'ActivityTimeline audit trail per PO',
        'Tracking chips per vendor delivery state',
        'Coordinator closes MWH cycle · monitor ACKs next (F5)',
    ],
    // F5 · electronic ordering & ACK · 6 steps
    'p5.1': [
        'PO-2026-4421 SIF uploaded to Teknion Online',
        '~70% of the volume is Teknion direct-bill',
        'Email tail 30% with SourceBadge per vendor',
        'Split view mock browser + PO summary + progress bar',
    ],
    'p5.2': [
        'ACK PDFs return drip-drip per vendor',
        'AcknowledgementUploadModal OCR extraction',
        'Per-vendor confidence · Teknion 98% · Alamir 74%',
        'FC9 fix · confidence scored before committing effort',
    ],
    'p5.3': [
        'AckHeroMatchPanel UN-CUTTABLE hero',
        'Split-pane ACK vs PMO · 71 lines + 13 CRs',
        'Teknion CR taxonomy · leadtime · BIFMA · width · pricer',
        '5 warn CRs (width + leadtime) + 8 info',
    ],
    'p5.4': [
        'AckReviewSlideOver max-w-6xl with PMO editable editable',
        'Watch 10/10/2050 sentinel → real Teknion dates',
        'Multi-Line Edit tool call-out · bulk update',
        'Coordinator confirms each CR-affected row',
    ],
    'p5.5': [
        'Designer chain FC8 net-new · auto-assembles',
        'Lead Designer (Lead) → Spec Designer (Spec) → PM Coordinator (PM)',
        'Attachments + replies + timestamps · CC affordance',
        'Replaces Coordinator\'s Excel manual assembly',
    ],
    'p5.6': [
        'OrderTrackerScene daily ESD sweep · 20 lines',
        'Shipment Notification (SN) inbound events',
        'TrackingModal per shipment · Multi-Line-Edit bulk',
        'Coordinator monitors deliveries · closes MWH cycle',
    ],
};

// ─── SELF-INDICATED STEPS (badge "AI en vivo") ───────────────────────────────

export const PROJEX_SELF_INDICATED: string[] = [
    'p1.1', // AP sweep · AI matched 12/14
    'p1.2', // OCR extraction · AI reading Teknion PO
    'p1.3', // Line-item match · AI comparison
    'p1.4', // PM double-check email · AI-drafted
    // F2 · AI moments (p2.2 OCR extract · p2.3 preflight chain)
    'p2.2', // W-9 OCR · AI extracting 5 fields
    'p2.3', // Preflight chain · AI 4-check compliance
    'p2.6', // Pre-drafted email · AI composer
    // F3 · AI moments (p3.1 threshold · p3.5 drafts · p3.6 GL sync)
    'p3.1', // Threshold alert + proforma draft · AI live forecast
    'p3.5', // Collection drafts · AI composer
    'p3.6', // NetSuite sync · AI staged reveal
    // F4 · AI moments (p4.2 PIF parse · p4.6 snapshot audit)
    'p4.2', // PIF parse · AI vertical extraction
    'p4.6', // Tri-way match · AI audit
    // F5 · AI moments (p5.1 SIF upload · p5.2 OCR · p5.3 comparison · p5.6 sweep)
    'p5.1', // SIF upload · AI dispatch
    'p5.2', // ACK OCR per-vendor · AI extraction
    'p5.3', // 71 lines + 13 CRs · AI comparison
    'p5.6', // Daily ESD sweep · AI
];
