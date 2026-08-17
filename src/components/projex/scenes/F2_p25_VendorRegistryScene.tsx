/**
 * COMPONENT: F2_p25_VendorRegistryScene (Projex · p2.5)
 * PURPOSE: Auto. NetSuite Vendor master registry populates · row #734 highlighted
 *          animate-in-from-bottom. Registry grid muestra 733 vendors + el nuevo ·
 *          expiration chip por row (fresh green · 30-day-out warning · expired
 *          destructive). Filter por bucket + search por MFG code.
 *
 *          Shape LOCK · data-list-table (F2 primary shape · net-new NOT kanban).
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-success/10 ·
 *            bg-warning/10 · bg-destructive/10 · border-border · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · vendor master registry · 733 vendors · expiration tracking
 * REUSE FROM: strata-ds DataListTable primitive + StatusBadge + FilterPills ·
 *             bfi/BFIProcessKanban row-arrival animation pattern
 *
 * NOTIF: dispatchea `projex:registry-populated` on complete → advance p2.6
 */

import { useEffect, useState } from 'react'
import {
    CheckCircle2, Search, Sparkles, Users, Filter,
    ArrowRight, Building2, MoreHorizontal,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_VENDOR_REGISTRY } from '../../../config/profiles/projex-data/w9Records'
import { PROJEX_VENDOR_TOTALS } from '../../../config/profiles/projex-data/vendors'

type BucketFilter = 'all' | 'fresh' | '30-day-out' | 'expired'

const BUCKET_STYLE: Record<'fresh' | '30-day-out' | 'expired', { cls: string; label: string }> = {
    'fresh':      { cls: 'bg-success/10 text-success border-success/20',     label: 'W-9 fresh' },
    '30-day-out': { cls: 'bg-warning/10 text-warning border-warning/30',     label: 'W-9 30-day-out' },
    'expired':    { cls: 'bg-destructive/10 text-destructive border-destructive/30', label: 'W-9 expired' },
}

export default function F2_p25_VendorRegistryScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    const [arrived, setArrived] = useState(false)
    const [bucketFilter, setBucketFilter] = useState<BucketFilter>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Choreography · row #734 arrives after 900ms + notif at 2200ms
    useEffect(() => {
        const c1 = pauseAwareTimeout(() => setArrived(true), 900)
        const c2 = pauseAwareTimeout(() => {
            window.dispatchEvent(new CustomEvent('projex:registry-populated'))
        }, 2200)
        return () => { c1(); c2() }
    }, [pauseAwareTimeout])

    const filteredRows = PROJEX_VENDOR_REGISTRY.filter(r => {
        if (bucketFilter !== 'all' && r.w9Age !== bucketFilter) return false
        if (searchQuery && !r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !r.mfgCode.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const bucketCounts = {
        all:          PROJEX_VENDOR_TOTALS.migrated + (arrived ? 1 : 0),
        fresh:        PROJEX_VENDOR_REGISTRY.filter(r => r.w9Age === 'fresh').length + (arrived ? 0 : -1),
        '30-day-out': PROJEX_VENDOR_REGISTRY.filter(r => r.w9Age === '30-day-out').length,
        expired:      PROJEX_VENDOR_REGISTRY.filter(r => r.w9Age === 'expired').length,
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.STRATA_AI_PJX] },
        { sources: [PROJEX_SOURCES.NETSUITE_VENDOR] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_ACCT_PRIVATE] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                        <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                        <span>Vendor onboarding · step 5</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success font-semibold rounded-md px-1.5 py-0.5">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Auto · registry populate
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        NetSuite Vendor master · #734 lands with expiration tracking
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Warehouse by Design animate-in-from-bottom con W-9 fresh chip. Filter por bucket · search por MFG code.
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total records</div>
                    <div className="text-sm font-semibold text-foreground tabular-nums">
                        {arrived ? PROJEX_VENDOR_TOTALS.migrated + 1 : PROJEX_VENDOR_TOTALS.migrated} vendors
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        {PROJEX_VENDOR_TOTALS.activelyPaid} actively paid last 12mo
                    </div>
                </div>
            </div>

            {/* Registry card · DataListTable shape */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Header · title + filter tabs + search */}
                <div className="px-5 py-4 border-b border-border">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">Vendor master registry</h3>
                            <div className="hidden sm:block w-px h-5 bg-border" />

                            {/* Filter tabs */}
                            <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                                <button
                                    onClick={() => setBucketFilter('all')}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                        bucketFilter === 'all'
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                    }`}
                                >
                                    All
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                                        bucketFilter === 'all'
                                            ? 'bg-primary-foreground/15 text-primary-foreground'
                                            : 'bg-background text-muted-foreground'
                                    }`}>{bucketCounts.all}</span>
                                </button>
                                {(['fresh', '30-day-out', 'expired'] as const).map(b => (
                                    <button
                                        key={b}
                                        onClick={() => setBucketFilter(b)}
                                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                            bucketFilter === b
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                        }`}
                                    >
                                        {BUCKET_STYLE[b].label}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                                            bucketFilter === b
                                                ? 'bg-primary-foreground/15 text-primary-foreground'
                                                : 'bg-background text-muted-foreground'
                                        }`}>{bucketCounts[b]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search + filter icon */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search vendor name or MFG code…"
                                    className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                                />
                            </div>
                            <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/40 transition-colors" aria-label="More filters">
                                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="divide-y divide-border">
                    <div className="grid grid-cols-[24px_1fr_100px_120px_140px_100px_100px_32px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>#</span>
                        <span>Vendor · MFG</span>
                        <span>Type</span>
                        <span>W-9 signed</span>
                        <span className="text-right">Status</span>
                        <span className="text-right">ACH</span>
                        <span className="text-right">Projects</span>
                        <span></span>
                    </div>
                    {filteredRows.map((r) => {
                        const bucketStyle = BUCKET_STYLE[r.w9Age]
                        const isNew = r.id === 734 && arrived
                        return (
                            <div
                                key={r.id}
                                className={`
                                    grid grid-cols-[24px_1fr_100px_120px_140px_100px_100px_32px] px-4 py-2 text-xs items-center transition-colors
                                    ${isNew ? 'animate-in fade-in slide-in-from-bottom-2 duration-700 bg-primary/5' : 'hover:bg-muted/30'}
                                `}
                            >
                                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">#{r.id}</span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground font-semibold truncate">{r.vendorName}</span>
                                        {isNew && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full px-2 py-0.5 shrink-0">
                                                Just added
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono truncate">{r.mfgCode}</span>
                                </div>
                                <span className="text-foreground text-[11px] truncate">{r.entityType}</span>
                                <span className="text-foreground text-[11px] tabular-nums">{r.w9SignedDate}</span>
                                <span className="text-right">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full border px-2 py-0.5 ${bucketStyle.cls}`}>
                                        {bucketStyle.label}
                                    </span>
                                </span>
                                <span className={`text-right text-[10px] font-semibold ${r.achOnFile ? 'text-success' : 'text-warning'}`}>
                                    {r.achOnFile ? 'On file' : 'Missing'}
                                </span>
                                <span className="text-right text-foreground tabular-nums font-semibold">{r.activeProjects}</span>
                                <button className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors" aria-label="Row options">
                                    <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Footer summary */}
                <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="text-foreground">
                        Showing <span className="tabular-nums font-semibold">{filteredRows.length}</span> of {bucketCounts.all} vendors
                    </span>
                    <span className="text-muted-foreground">· {bucketCounts.expired > 0 && <span className="text-destructive font-semibold">{bucketCounts.expired} expired need attention</span>}</span>
                </div>
            </div>

            {/* Success + advance CTA */}
            {arrived && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">Vendor #734 Warehouse by Design</span>
                        <span className="text-muted-foreground"> · ready for AP · next payment run Tue Aug 19 · appears in Coordinator&apos;s dealer view.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open Dealer view
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Context · what removing VS3 gap means */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Why the expiration chip matters (VS2)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Today W-9s live undated en SharePoint · vendors get paid con W-9s años viejos. Expiration tracker + 30-day-out warning surface avoids the weekly payment-run block (VS3) · Coordinator proactively requests W-9 refresh (next step).
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Vendor master · NetSuite → SharePoint mirror" />
        </div>
    )
}
