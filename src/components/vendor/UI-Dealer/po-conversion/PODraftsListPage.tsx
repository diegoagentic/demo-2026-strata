/**
 * SOURCE: UI-Dealer/src/features/po-conversion/PODraftsListPage.tsx
 * LIFTED: 2026-08-14 · via F74 Phase 1B.PRE · ticket SDB-1315 FE-03
 * Do not edit in place · re-sync from source when prod evolves.
 * Adaptations belong in sibling wrappers/*.tsx files.
 */
import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Search, Filter, FileText, Building2, Package, DollarSign, ArrowRight, Plus } from 'lucide-react'
import { MOCK_PO_DRAFTS } from './mockData'
import type { PurchaseOrderCoreV2, POStatus } from './types'
import ConversionStatusBadge from './ConversionStatusBadge'

interface PODraftsListPageProps {
    onNavigateToDetail?: (poId: string) => void
}

const ALL_STATUSES: Array<POStatus | 'ALL'> = ['ALL', 'DRAFT', 'FINALIZED', 'SUBMITTED', 'FAILED']

const VENDOR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500']

function vendorInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

/**
 * FE-03 — PO Drafts List Page
 * Vendor-scoped PO cards with search, status/vendor filters, and summary bar.
 */
export default function PODraftsListPage({ onNavigateToDetail }: PODraftsListPageProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<POStatus | 'ALL'>('ALL')
    const [vendorFilter, setVendorFilter] = useState<string>('ALL')

    const vendors = useMemo(
        () => [...new Set(MOCK_PO_DRAFTS.map(po => po.vendor.vendorName))],
        [],
    )

    const filtered = useMemo(() => {
        return MOCK_PO_DRAFTS.filter(po => {
            if (statusFilter !== 'ALL' && po.orderStatus !== statusFilter) return false
            if (vendorFilter !== 'ALL' && po.vendor.vendorName !== vendorFilter) return false
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                return (
                    po.poNumber.toLowerCase().includes(q) ||
                    po.vendor.vendorName.toLowerCase().includes(q)
                )
            }
            return true
        })
    }, [searchQuery, statusFilter, vendorFilter])

    const totalValue = filtered.reduce((s, po) => s + po.financial.poTotalAmount, 0)

    const statusBreakdown = useMemo(() => {
        const counts: Partial<Record<POStatus, number>> = {}
        filtered.forEach(po => { counts[po.orderStatus] = (counts[po.orderStatus] ?? 0) + 1 })
        return counts
    }, [filtered])

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Purchase Order Drafts</h1>
                    <p className="mt-1 text-sm text-muted-foreground">From Quote QT-1025</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-brand-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:opacity-90 dark:bg-brand-500">
                    <Plus className="h-4 w-4" />
                    New PO
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by PO number or vendor..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-300/50 dark:bg-zinc-800"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as POStatus | 'ALL')}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground dark:bg-zinc-800"
                    >
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <select
                        value={vendorFilter}
                        onChange={e => setVendorFilter(e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground dark:bg-zinc-800"
                    >
                        <option value="ALL">All Vendors</option>
                        {vendors.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* PO Card Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filtered.map((po, idx) => (
                    <POCard
                        key={po.id}
                        po={po}
                        colorIndex={idx}
                        onViewDetails={() => onNavigateToDetail?.(po.id)}
                    />
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 text-muted-foreground dark:bg-zinc-800">
                        <FileText className="mb-2 h-8 w-8 opacity-40" />
                        <p className="text-sm">No purchase orders match your filters.</p>
                    </div>
                )}
            </div>

            {/* Summary Bar */}
            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm dark:bg-zinc-800">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total POs:</span>
                    <span className="text-sm font-semibold text-foreground">{filtered.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(totalValue)}</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {Object.entries(statusBreakdown).map(([status, count]) => (
                        <span key={status} className="flex items-center gap-1.5">
                            <ConversionStatusBadge status={status as POStatus} size="sm" />
                            <span className="text-xs font-medium text-muted-foreground">×{count}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ── PO Card ── */

function POCard({ po, colorIndex, onViewDetails }: { po: PurchaseOrderCoreV2; colorIndex: number; onViewDetails: () => void }) {
    const color = VENDOR_COLORS[colorIndex % VENDOR_COLORS.length]

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-800">
            {/* Top row: vendor + status */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white', color)}>
                        {vendorInitials(po.vendor.vendorName)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{po.vendor.vendorName}</p>
                        <p className="text-xs text-muted-foreground">{po.poNumber}</p>
                    </div>
                </div>
                <ConversionStatusBadge status={po.orderStatus} size="sm" />
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-5 border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {po.lineItems.length} item{po.lineItems.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(po.financial.poTotalAmount)}
                </div>
            </div>

            {/* Action */}
            <button
                onClick={onViewDetails}
                className="mt-1 inline-flex items-center gap-1.5 self-end text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
