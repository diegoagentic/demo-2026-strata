# CLC — Demo Plan (Iter 1)

## Iter 1 deliverable

**Foundation + 4 flows con profundidad media** · cobertura ancha, sin hero polish en ninguno · validar al stakeholder los 4 angles que pidió en discovery.

## 4 Flows (medium depth)

| Flow | Scenes | Hero interaction |
|---|---|---|
| **Calendar Sync** (clc1.0-3) | `CLCCalendarScene` + `CLCCapacityWarningPanel` + `WeekCalendarGrid` | Drag-drop install card → "Queued for IQ batch sync" · NY capacity warning |
| **SharePoint Seeding** (clc2.0-3) | `CLCSharePointScene` + `CLCAssetConsolidationModal` | Consolidate 5 IQ jobs · exclude 2 unrelated · publish folder URL |
| **Intake Validation** (clc3.0-2) | `CLCIntakeChannelDialog` + `CLCIntakeSurveyScene` + `CLCIntakeReconcileScene` | Channel picker (phishing warning) · 10-Q survey · diff vs IQ |
| **Data Lake Dashboard** (clc4.0) | `CLCDashboardScene` | 4 KPIs + 4 charts + at-risk Fairport |

## Shared/reused components

| Reused | New |
|---|---|
| `CapacityHeatmap.tsx` (accordion pattern → regional load) | `WeekCalendarGrid.tsx` (only net-new primitive) |
| `AckReconciliationModal.tsx` (multi-step diff pattern) | `CLCCapacityWarningPanel.tsx` (adapter) |
| `PDFPreviewModal.tsx` (inline preview, unchanged) | `CLCAssetConsolidationModal.tsx` |
| `ConversationalSurvey.tsx` (chat-style scene) | `CLCIntakeSurveyScene.tsx` (adapter) |
| `AckReviewScene.tsx` (two-column diff) | `CLCIntakeReconcileScene.tsx` (adapter) |
| `OfficeworksDashboardScene.tsx` (KPIs + charts) | `CLCDashboardScene.tsx` (adapter) |
| `OFFICEWORKS_STEP_NOTIFICATIONS` pattern | `CLC_STEP_NOTIFICATIONS` |

## Real data anchor

- **Customer**: Fairport Public Library (Fairport NY)
- **Architects**: Tappé · SWBR
- **Vendors**: TMC · KI · Smith System · Media Tech · Aurora
- **IQ jobs**: J-44021 → J-44025 (one per vendor)
- **Excluded IQ jobs**: J-43901 (Tappé punch order) · J-44510 (SWBR Q4 project)

## Hard constraints honored

- Strata never auto-sends · drafts only
- Strata never replaces IQ · QuickBooks · M365 · all read-only mocks with `(read-only mock)` labels
- Role labels only · no proper names
- IQ write-back is shown as "Queued for IQ batch sync" (no real write · matches API constraint)

## Next iterations

- **Iter 2**: deepen Flow 1 hero polish (more realistic drag-drop · 6-week paginated calendar · cross-region rebalancing suggestions)
- **Iter 3**: deepen Flow 2 (full asset gallery view · per-vendor ACK validation · iPad responsive view)
- **Iter 4**: deepen Flow 3 (real-time survey progress · multi-channel delivery · audit trail)
- **Iter 5**: deepen Flow 4 (predictive cycle-time model · what-if forecasting · drill-down per region/vendor)
