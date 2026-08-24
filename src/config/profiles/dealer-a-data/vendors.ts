// ═══════════════════════════════════════════════════════════════════════════════
// PROJEX · Vendor list slice · F74 Phase 1 (2026-08-14)
// SOT §12b · Isabella's vendor list is source of truth · 200 furniture vendors
// total · 15-vendor visible slice para demo (Four Hands EXCLUDED per client)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Vendor {
    id: string
    name: string
    mfgCode: string
    portal?: string           // Portal login URL (Teknion Online, etc.)
    orderEntryEmail: string
    discount: string          // "48% + 5% VIP"
    freightTerms: string      // "Under $150 = $19 flat" (Alamir example)
    w9?: {
        onFile: boolean
        signedDate: string    // ISO
    }
    ach?: {
        onFile: boolean
        lastVerified: string  // ISO
    }
    is1099: boolean
    vendorType: 'furniture' | 'walls' | 'install' | 'ancillary'
    installVendor?: boolean   // true if usually sends bills sin PO # (AP9)
    reliability: 'excellent' | 'good' | 'fair' | 'problematic'
    notes?: string
    // Total historical stats
    billsLast12mo: number
    activelyPaid: boolean
}

export const DEALER_A_VENDORS: Vendor[] = [
    // ─── Furniture · direct product (Teknion is ~70% of volume) ───
    {
        id: 'teknion',
        name: 'Teknion',
        mfgCode: 'TEK',
        portal: 'Teknion Online (TDX)',
        orderEntryEmail: 'orders@teknion.com',
        discount: '52%',
        freightTerms: 'Direct bill · milestone',
        w9: { onFile: true, signedDate: '2025-11-04' },
        ach: { onFile: true, lastVerified: '2025-11-04' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'excellent',
        notes: '~70% of Dealer A product volume · SIF upload via Teknion Online · direct-bill NCBA + MWH projects',
        billsLast12mo: 187,
        activelyPaid: true,
    },
    {
        id: 'hbf',
        name: 'HBF (Hickory Business Furniture)',
        mfgCode: 'HBF',
        orderEntryEmail: 'customerservice@hbf.com',
        discount: '48%',
        freightTerms: 'Prepaid · added to invoice',
        w9: { onFile: true, signedDate: '2026-02-12' },
        ach: { onFile: true, lastVerified: '2026-02-12' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'good',
        billsLast12mo: 42,
        activelyPaid: true,
    },
    {
        id: 'boss-design',
        name: 'Boss Design',
        mfgCode: 'BDG',
        orderEntryEmail: 'orders@bossdesign.com',
        discount: '50%',
        freightTerms: 'Bundled with HBF (tag4 grouping)',
        w9: { onFile: true, signedDate: '2025-08-19' },
        ach: { onFile: true, lastVerified: '2025-08-19' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'good',
        billsLast12mo: 18,
        activelyPaid: true,
    },
    {
        id: 'alamir',
        name: 'Alamir',
        mfgCode: 'ALA',
        orderEntryEmail: 'sales@alamir.com',
        discount: '45%',
        freightTerms: 'Under $150 = $19 flat',
        w9: { onFile: true, signedDate: '2025-06-01' },
        ach: { onFile: true, lastVerified: '2025-06-01' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'excellent',
        notes: 'Freight rule verbatim from Isabella vendor list',
        billsLast12mo: 24,
        activelyPaid: true,
    },
    {
        id: 'nelson',
        name: 'Nelson and Company',
        mfgCode: 'NLC',
        orderEntryEmail: 'ap@nelsonandcompany.com',
        discount: '50%',
        freightTerms: 'Prepaid + add',
        w9: { onFile: true, signedDate: '2025-09-22' },
        ach: { onFile: true, lastVerified: '2025-09-22' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'good',
        billsLast12mo: 15,
        activelyPaid: true,
    },
    {
        id: 'west-elm',
        name: 'West Elm',
        mfgCode: 'WEL',
        orderEntryEmail: 'trade@westelm.com',
        discount: '30%',
        freightTerms: 'FOB origin',
        w9: { onFile: true, signedDate: '2026-03-01' },
        ach: { onFile: false, lastVerified: '2026-03-01' },
        is1099: false,
        vendorType: 'furniture',
        reliability: 'fair',
        notes: 'Warranty complexity (COORD:L1268 · umbrella pickup)',
        billsLast12mo: 8,
        activelyPaid: true,
    },

    // ─── Install / labor vendors · problematic AP9 pattern (no PO #) ───
    {
        id: 'warehouse-by-design',
        name: 'Warehouse by Design',
        mfgCode: 'WBD',
        orderEntryEmail: 'billing@warehousebydesign.com',
        discount: 'Labor · hourly',
        freightTerms: 'N/A (install)',
        w9: { onFile: true, signedDate: '2025-04-15' },
        ach: { onFile: true, lastVerified: '2025-04-15' },
        is1099: false,
        vendorType: 'install',
        installVendor: true,
        reliability: 'fair',
        notes: 'AP9 pattern · sends bills with project name only (no PO #) · Jacob names verbatim SOT §12a',
        billsLast12mo: 32,
        activelyPaid: true,
    },
    {
        id: 'clear-space',
        name: 'Clear Space Solutions',
        mfgCode: 'CSS',
        orderEntryEmail: 'invoices@clearspacesolutions.com',
        discount: 'Labor · hourly',
        freightTerms: 'N/A (install)',
        w9: { onFile: true, signedDate: '2025-05-20' },
        ach: { onFile: true, lastVerified: '2025-05-20' },
        is1099: false,
        vendorType: 'install',
        installVendor: true,
        reliability: 'fair',
        notes: 'AP9 pattern · same as Warehouse by Design',
        billsLast12mo: 22,
        activelyPaid: true,
    },
    {
        id: 'digital-interior',
        name: 'Digital Interior Group',
        mfgCode: 'DIG',
        orderEntryEmail: 'ar@digitalinteriorgroup.com',
        discount: 'AV install',
        freightTerms: 'N/A',
        w9: { onFile: true, signedDate: '2025-07-11' },
        ach: { onFile: false, lastVerified: '2025-07-11' },
        is1099: false,
        vendorType: 'install',
        installVendor: true,
        reliability: 'fair',
        notes: 'AP9 pattern · AV/tech install for corporate projects',
        billsLast12mo: 14,
        activelyPaid: true,
    },
    {
        id: 'ryans-carpentry',
        name: 'Ryan\'s Carpentry',
        mfgCode: 'RYC',
        orderEntryEmail: 'ryan@ryanscarpentry.com',
        discount: 'Labor · hourly',
        freightTerms: 'N/A',
        w9: { onFile: false, signedDate: '2023-11-05' },  // expired!
        ach: { onFile: true, lastVerified: '2023-11-05' },
        is1099: true,  // individual contractor
        vendorType: 'install',
        installVendor: true,
        reliability: 'good',
        notes: 'W-9 expired · 1099 required · payment run blocker pattern',
        billsLast12mo: 9,
        activelyPaid: true,
    },
]

// Vendor list total (for KPI display)
export const DEALER_A_VENDOR_TOTALS = {
    migrated: 733,
    activelyPaid: 389,
    furnitureList: 200,
    wallsList: 40,  // "mostly Teknion + few others" per WALLS:L649
    // Bill volume baseline
    billsPerMonthAvg: 224,
    billsPerMonthQ4Peak: 287,
    entities: {
        dealerAInc: 167,
        dealerACorp: 44,
        cultureLlc: 14,
    },
}

/** Fast lookup by id */
export function getVendor(id: string): Vendor | undefined {
    return DEALER_A_VENDORS.find(v => v.id === id)
}
