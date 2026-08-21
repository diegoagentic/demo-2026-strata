/**
 * F84 · Projex ComparisonReport seeds for F1 p1.2 (PO ⇄ Bill) + F5 p5.2 (PMO ⇄ ACK).
 * Uses the ComparisonReport shape from
 * vendor/prod-imports/deps/comparison/comparisonTypes.ts · Projex-specific
 * narrative (NCBA · MWH · Teknion · Warehouse-by-Design).
 */

import type { ComparisonReport } from '../../../vendor/prod-imports/deps/comparison/comparisonTypes'

// ─── F1 · Vendor bill intake · PO PO-2026-4421 ⇄ Bill PJX-BILL-8483 ─────
export const PROJEX_F1_PO_BILL_REPORT: ComparisonReport = {
    report_id: 84001,
    po_number: 'PO-2026-4421',
    ack_id: 'PJX-BILL-8483',
    vendor: 'Teknion · NCBA project',
    derived_status: 'REQUIRES_REVIEW',
    overall_similarity_score: 0.937,
    total_fields_compared: 15,
    run_number: 1,
    is_latest: true,
    created_at: '2026-08-21T08:14:00Z',
    summary: {
        what_changed_summary:
            'Teknion invoice matches the PO on 12 of 15 lines exactly to the penny. Three lines need Accounting eyes: 2 partial-ship quantity variances + 1 penny rounding on a finish sample.',
        business_impact: {
            estimated_cost_impact: '-$2,120.04 (-8.0%)',
            timeline_impact: 'Ready to pay in Tue ACH batch if variances accepted',
            risk_level: 'MEDIUM',
        },
        recommended_actions: [
            { action: 'Accept 2 qty variances (partial ship · Teknion pattern)', priority: 1, rationale: 'Split-ship confirmed with vendor · main delivery unaffected' },
            { action: 'Override penny rounding on Line 15 (finish sample)', priority: 2, rationale: 'Tax rate updated Aug 1 · $0.04 delta within tolerance' },
            { action: 'Queue for Compliance approval in Tue payment run', priority: 3, rationale: '9-bill ACH batch · CEO releases with human touch' },
        ],
    },
    discrepancies: [
        {
            id: 'p84-1',
            field_path: 'lineItems.13.quantity',
            field_label: 'Line 13 · Qty (Executive chair · Aeron-equiv)',
            category: 'line_item',
            po_value: 6,
            ack_value: 4,
            business_severity: 'MEDIUM',
            llm_analysis:
                'Teknion split-shipped this line · 4 chairs invoiced now, 2 chairs backordered for ETA +10 days. Standard Teknion partial-ship pattern for the NCBA build.',
            what_changed: '2 of 6 chairs backordered · partial invoice',
            why_it_matters: [
                'Split-ship pattern is standard for Teknion NCBA builds',
                'Backorder 2 units ETA +10 days per vendor',
                'Install date unaffected · chairs staged separately',
            ],
            recommendation: 'Accept partial ship · 4 of 6',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 94,
        },
        {
            id: 'p84-2',
            field_path: 'lineItems.14.quantity',
            field_label: 'Line 14 · Qty (Vertical storage tower · 5-shelf)',
            category: 'line_item',
            po_value: 8,
            ack_value: 6,
            business_severity: 'MEDIUM',
            llm_analysis:
                '2 of 8 storage towers on allocation · vendor estimates remaining units in 2 weeks. Partial acceptance keeps the primary install on schedule.',
            what_changed: '2 of 8 towers on allocation',
            why_it_matters: [
                'Remaining 2 ETA +2 weeks per Teknion',
                'Primary install has enough storage without the 2 backordered',
                'Common Q3 supply pattern · not a vendor error',
            ],
            recommendation: 'Accept partial · 6 of 8',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 91,
        },
        {
            id: 'p84-3',
            field_path: 'lineItems.15.unitPrice',
            field_label: 'Line 15 · Unit $ (Finish · stain sample kit)',
            category: 'pricing',
            po_value: 87.55,
            ack_value: 87.53,
            business_severity: 'LOW',
            llm_analysis:
                'Two-cent variance on a finish sample kit · Teknion tax rate updated Aug 1 · within Compliance penny-rounding tolerance. Override allowed.',
            what_changed: 'Unit price $87.55 → $87.53 · penny rounding',
            why_it_matters: [
                'Teknion tax rate updated 2026-08-01',
                'Delta $0.04 total · within Compliance tolerance',
                'Documented in Compliance override taxonomy',
            ],
            recommendation: 'Override with reason "penny rounding · tax rate change"',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 98,
        },
    ],
    routing: {
        routing_decision: 'SUGGESTED_REVIEW',
        confidence_score: 91,
        rationale: '12/15 lines match to the penny · 3 low-severity exceptions with clear resolution paths in Compliance taxonomy. AI suggests Accept batch.',
        suggested_action: 'ACCEPT',
    },
}

// ─── F5 · ACK vs PMO · PO PO-DC-0009642 ⇄ ACK TEK-ACK-2026-08-14 ─────
export const PROJEX_F5_ACK_PO_REPORT: ComparisonReport = {
    report_id: 84005,
    po_number: 'PO-DC-0009642',
    ack_id: 'TEK-ACK-2026-08-14',
    vendor: 'Teknion · MWH residential',
    derived_status: 'REQUIRES_REVIEW',
    overall_similarity_score: 0.817,
    total_fields_compared: 71,
    run_number: 1,
    is_latest: true,
    created_at: '2026-08-21T09:32:00Z',
    summary: {
        what_changed_summary:
            'Teknion returned the ACK for the MWH residential PO. Of 71 lines, 58 match exactly · 13 change requests need Coordinator review · leadtime shifts, one BIFMA advisory, a width change, and 10 pricer comments.',
        business_impact: {
            estimated_cost_impact: '$0 (no net price change)',
            timeline_impact: 'Ship date pushed +5 days on 4 lines · lounge units +12',
            risk_level: 'MEDIUM',
        },
        recommended_actions: [
            { action: 'Accept 10 pricer comments (informational · no price impact)', priority: 1, rationale: 'Vendor annotations · Coordinator acknowledges' },
            { action: 'Review 2 leadtime shifts against install schedule', priority: 2, rationale: 'Ship date +5 days · buffer available' },
            { action: 'Escalate BIFMA advisory + width change to designer chain', priority: 3, rationale: 'Layne (Lead) + Tate (Spec) need to approve substitution' },
        ],
    },
    discrepancies: [
        {
            id: 'p84-5-1',
            field_path: 'lineItems.7.esd',
            field_label: 'Line 7 · ESD (Wall panel · 60"×72")',
            category: 'logistics',
            po_value: '2026-09-24',
            ack_value: '2026-09-29',
            business_severity: 'MEDIUM',
            llm_analysis:
                'Teknion pushes ESD +5 days on 4 wall panel lines. Install schedule has a 10-day buffer · no impact on the Oct 15 install date if accepted now.',
            what_changed: 'ESD 9/24 → 9/29 · +5 days on 4 lines',
            why_it_matters: [
                'Standard leadtime slip · Q3 volume pattern',
                'Install buffer absorbs the shift',
                'No downstream impact on Oct 15 install',
            ],
            recommendation: 'Accept ESD shift · update PMO placeholders',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 93,
        },
        {
            id: 'p84-5-2',
            field_path: 'lineItems.22.compliance',
            field_label: 'Line 22 · BIFMA advisory (Lounge · 3-seat)',
            category: 'terms',
            po_value: 'BIFMA X5.4 compliant',
            ack_value: 'BIFMA X5.4 → substitute frame steel required',
            business_severity: 'HIGH',
            llm_analysis:
                'Teknion needs to substitute the frame steel to keep BIFMA X5.4 certification. Frame supplier out of stock · vendor proposes equivalent grade with same load rating. Layne (Lead Designer) needs to approve the substitution before Coordinator accepts.',
            what_changed: 'BIFMA X5.4 kept · frame steel substitution required',
            why_it_matters: [
                'Frame supplier out of stock · not a vendor error',
                'Substitution keeps BIFMA X5.4 compliance',
                'Designer chain must approve · Layne (Lead) → Tate (Spec) → Josh (PM)',
            ],
            recommendation: 'Escalate to designer chain for approval',
            recommended_action: 'REQUEST_REVIEW',
            analysis_status: 'COMPLETED',
            analysis_confidence: 88,
        },
        {
            id: 'p84-5-3',
            field_path: 'lineItems.34.dimensions',
            field_label: 'Line 34 · Width (Conference table · 96")',
            category: 'line_item',
            po_value: '96 in',
            ack_value: '94 in',
            business_severity: 'MEDIUM',
            llm_analysis:
                'Teknion cannot cut the walnut top at 96" · standard cut is 94". 2" delta needs Layne + Tate approval · install space accommodates 94" per Josh (PM).',
            what_changed: 'Width 96" → 94" · standard cut',
            why_it_matters: [
                'Walnut supply constraint · non-standard cut declined',
                'Install space clears at 94" per PM',
                'Requires designer chain sign-off',
            ],
            recommendation: 'Escalate to designer chain',
            recommended_action: 'REQUEST_REVIEW',
            analysis_status: 'COMPLETED',
            analysis_confidence: 90,
        },
    ],
    routing: {
        routing_decision: 'MANDATORY_REVIEW',
        confidence_score: 82,
        rationale: '58/71 lines match · 13 CRs with mixed severity · BIFMA advisory + width change require designer chain sign-off before PMO update.',
        suggested_action: 'REQUEST_REVIEW',
    },
}
