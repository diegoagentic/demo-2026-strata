# CLC — Flow Beat Sheets

## Flow 1 · Calendar Sync (clc1.0 → clc1.3)

| Step | What the user sees | What Strata does | Event fired |
|---|---|---|---|
| `clc1.0` | Source list panel · 14 IQ jobs · region tallies | Pulls schedule data from IQ via report API · cross-checks ship vs install dates | (none) |
| `clc1.1` | Outlook-style 6-week grid · jobs by region · Sparkles on auto-scheduled jobs | Renders week view · color-codes by region · pre-flags 1 capacity conflict | (none) |
| `clc1.2` | Drag Fairport from Jun 2 → Jun 5 · row flippea a "Queued for IQ batch sync" | Stages change for nightly IQ batch sync (read-only API constraint) | `clc:calendar-writeback-queued` |
| `clc1.3` | NY region accordion expands · "3 jobs need third-party installer" banner · Albany Install Co. draft email | Surfaces capacity overload · suggests vetted third-party with prior history · drafts outreach | `clc:calendar-capacity-warning` |

## Flow 2 · SharePoint Asset Seeding (clc2.0 → clc2.3)

| Step | What the user sees | What Strata does | Event fired |
|---|---|---|---|
| `clc2.0` | SharePoint scene · Fairport row "Ready to seed" | Detects IQ status change to "Scheduled" · triggers folder workflow | `clc:sharepoint-trigger` |
| `clc2.1` | Consolidation modal · 5 IQ jobs IN · 2 IQ jobs OUT (with rationale) | Uses customer-tag linkage to bundle related jobs · excludes mismatched tags | `clc:sharepoint-consolidate-open` |
| `clc2.2` | Inline PDF preview of 15 staged assets · Sparkles on flagged ACK | Generates manifest · flags vendor short-ship on J-44022 ACK | `clc:sharepoint-review-open` |
| `clc2.3` | SharePoint URL pinned to row · installer notification email drafted | Publishes folder · sets permissions · drafts notification (operator sends) | `clc:sharepoint-folder-created` |

## Flow 3 · Intake Validation (clc3.0 → clc3.2)

| Step | What the user sees | What Strata does | Event fired |
|---|---|---|---|
| `clc3.0` | Channel selector dialog · email warning · Procore recommended | Flags phishing risk · recommends platform delivery based on customer's existing tools | `clc:intake-channel-pick` |
| `clc3.1` | Conversational survey · 10 questions · customer answers stream in | Delivers via picked channel · captures responses · flags ambiguity | `clc:intake-survey-open` |
| `clc3.2` | 10-field diff vs IQ · 5 match · 2 mismatch · 3 IQ-blank · Resolve action | Reconciles · queues approved corrections for IQ batch sync | `clc:intake-iq-writeback-queued` |

## Flow 4 · Data Lake Dashboard (clc4.0)

| Step | What the user sees | What Strata does | Event fired |
|---|---|---|---|
| `clc4.0` | 4 KPIs · 4 charts · at-risk summary · source chips on every panel | Computes KPIs from data lake (IQ + QB + M365) · surfaces predictions with Sparkles | (none) |

## Expected screenshots

For each flow, capture:
1. The default state when the step lands
2. The mid-interaction state (after the user takes the primary action)
3. The completion state (after Strata acknowledges the action)

Total: ~36 screenshots across all flows.
