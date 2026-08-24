// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · DataSource catalog extension · F74 Phase 1 (2026-08-14)
// Extiende el DS `SOURCES` catalog con connectors Acme Dealer-specific:
// NetSuite (PO / Bill / GL) · SharePoint (accounting private) · Bills inbox ·
// Teknion Online · Bank portal · Strata AI orchestrator
// Shape matches DataSource interface en `mbi/DataSourcesBar.tsx`
// ═══════════════════════════════════════════════════════════════════════════════

import type { DataSource, SourceType } from '../../../components/mbi/DataSourcesBar'

export const ACME_DEALER_SOURCES = {
    // ─── NetSuite (Acme Dealer ERP · v2024) ───
    NETSUITE_PO: {
        name: 'NetSuite · POs',
        type: 'erp' as SourceType,
        note: 'Purchase orders live in NetSuite. Strata reads open POs and matches every incoming vendor bill line against them.',
    },
    NETSUITE_BILL: {
        name: 'NetSuite · Bills',
        type: 'erp' as SourceType,
        note: 'Vendor Bill records in NetSuite. Strata saves matched bills here via the NetSuite Bill button.',
    },
    NETSUITE_GL: {
        name: 'NetSuite · GL',
        type: 'erp' as SourceType,
        note: 'General Ledger in NetSuite. Bill records post to the ledger once Matt approves the payment run.',
    },
    NETSUITE_VENDOR: {
        name: 'NetSuite · Vendors',
        type: 'erp' as SourceType,
        note: '733 vendor records · 389 actively paid last 12mo · W-9 + ACH + 1099 flags stored per record.',
    },

    // ─── Bills intake surface (Jacob verbatim: "bills@acme-dealer.com") ───
    AP_INBOX_PJX: {
        name: 'Bills inbox · Acme Dealer',
        type: 'communication' as SourceType,
        note: 'bills@acme-dealer.com · vendor invoices arrive as PDF attachments overnight. Strata sweeps every ~5 min.',
    },

    // ─── SharePoint (private accounting) ───
    SHAREPOINT_ACCT_PRIVATE: {
        name: 'SharePoint · Accounting (private)',
        type: 'file' as SourceType,
        note: 'Accounting-only folder. Strata drops a copy of every processed vendor PDF here, filename: date_vendor_invoice#_amount_PO#.pdf',
    },
    SHAREPOINT_PROJECTS: {
        name: 'SharePoint · Projects',
        type: 'file' as SourceType,
        note: 'Per-project folder tree. Coordinator artifacts (PIF, SIF, PMO, ACK) land here — bills reference project name.',
    },

    // ─── Vendor portals ───
    TEKNION_ONLINE: {
        name: 'Teknion Online',
        type: 'external' as SourceType,
        note: 'Teknion order portal · ~70% of Acme Dealer order volume · SIF upload + ACK download.',
    },
    VENDOR_PORTAL_HBF: {
        name: 'HBF portal',
        type: 'external' as SourceType,
        note: 'HBF (Hickory Business Furniture) order portal · order status + invoice retrieval.',
    },

    // ─── Payment infrastructure ───
    BANK_PORTAL: {
        name: 'Bank portal',
        type: 'external' as SourceType,
        note: 'Daily bank activity download for reconciliation. Payment runs (Tue big batch · Thu one-off) initiate ACH here.',
    },

    // ─── Strata AI layer ───
    STRATA_AI_PJX: {
        name: 'Strata AI',
        type: 'ai' as SourceType,
        note: 'Orchestrates OCR + PO matching + mismatch classification + PM double-check email drafts + payment-run dashboard.',
    },
    STRATA_OCR_PJX: {
        name: 'Document AI',
        type: 'ai' as SourceType,
        note: 'Reads vendor invoice PDFs · 92-100% confidence · handles 291-line Teknion POs to the penny.',
    },
    STRATA_MATCHER: {
        name: 'PO Matcher',
        type: 'ai' as SourceType,
        note: 'Line-item match agent · exact-to-the-penny · flags mismatches with cause taxonomy (tax rate · out of stock · substitution · penny rounding · partial ship).',
    },
    STRATA_COMPOSER: {
        name: 'Email Composer',
        type: 'ai' as SourceType,
        note: 'Drafts PM double-check emails ("Which PO does this bill match?") for install-vendor bills without PO #.',
    },

    // ─── Compliance / operational ───
    W9_REGISTRY: {
        name: 'W-9 registry',
        type: 'file' as SourceType,
        note: 'Signed W-9 PDFs per vendor · expiration tracked · 1099 flag for individual contractors.',
    },
    FINANCIAL_DASHBOARD: {
        name: 'Financial dashboard',
        type: 'external' as SourceType,
        note: 'Excel deck reviewed Tuesday · AR aging tab + Bills payables tab · CEO + accounting review together.',
    },
} satisfies Record<string, DataSource>
