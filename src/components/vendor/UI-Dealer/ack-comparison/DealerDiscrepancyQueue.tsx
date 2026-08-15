import { useState, useMemo } from 'react'
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react'
import ComparisonStatusBadge, { type ComparisonStatus } from './ComparisonStatusBadge'

// ── Types ──
interface DiscrepancyAck {
    ackId: string
    poId: string
    vendor: string
    initials: string
    discrepancyCount: number
    highestSeverity: 'low' | 'medium' | 'high'
    comparisonStatus: ComparisonStatus
    comparedAt: string
}

interface DealerDiscrepancyQueueProps {
    onNavigateToAck?: (ackId: string) => void
}

// ── Mock Data ──
export const MOCK_DISCREPANCY_ACKS: DiscrepancyAck[] = [
    { ackId: 'ACK-3099', poId: '#ORD-2055', vendor: 'AIS Furniture', initials: 'AI', discrepancyCount: 3, highestSeverity: 'high', comparisonStatus: 'MISMATCH', comparedAt: 'Apr 10, 2026' },
    { ackId: 'ACK-3095', poId: '#ORD-2051', vendor: 'Steelcase', initials: 'SC', discrepancyCount: 5, highestSeverity: 'high', comparisonStatus: 'MISMATCH', comparedAt: 'Apr 09, 2026' },
    { ackId: 'ACK-3091', poId: '#ORD-2049', vendor: 'Herman Miller', initials: 'HM', discrepancyCount: 1, highestSeverity: 'medium', comparisonStatus: 'PARTIAL_MATCH', comparedAt: 'Apr 08, 2026' },
    { ackId: 'ACK-3088', poId: '#ORD-2047', vendor: 'Knoll', initials: 'KN', discrepancyCount: 2, highestSeverity: 'high', comparisonStatus: 'MISMATCH', comparedAt: 'Apr 07, 2026' },
    { ackId: 'ACK-3085', poId: '#ORD-2045', vendor: 'Haworth', initials: 'HW', discrepancyCount: 1, highestSeverity: 'low', comparisonStatus: 'PARTIAL_MATCH', comparedAt: 'Apr 06, 2026' },
    { ackId: 'ACK-3082', poId: '#ORD-2043', vendor: 'National Office', initials: 'NO', discrepancyCount: 4, highestSeverity: 'high', comparisonStatus: 'MISMATCH', comparedAt: 'Apr 05, 2026' },
    { ackId: 'ACK-3079', poId: '#ORD-2041', vendor: 'Kimball', initials: 'KI', discrepancyCount: 2, highestSeverity: 'medium', comparisonStatus: 'PARTIAL_MATCH', comparedAt: 'Apr 04, 2026' },
    { ackId: 'ACK-3076', poId: '#ORD-2039', vendor: 'Allsteel', initials: 'AS', discrepancyCount: 3, highestSeverity: 'high', comparisonStatus: 'MISMATCH', comparedAt: 'Apr 03, 2026' },
]

const SEVERITY_STYLES = {
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
}

const PAGE_SIZE = 20

export default function DealerDiscrepancyQueue({ onNavigateToAck }: DealerDiscrepancyQueueProps) {
    const [search, setSearch] = useState('')
    const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
    const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all')
    const [page, setPage] = useState(0)

    const filtered = useMemo(() => {
        const now = new Date('2026-04-22').getTime() // demo "today"
        const dayMs = 24 * 60 * 60 * 1000
        const cutoff = dateRange === '7d' ? now - 7 * dayMs
            : dateRange === '30d' ? now - 30 * dayMs
                : dateRange === '90d' ? now - 90 * dayMs
                    : null

        return MOCK_DISCREPANCY_ACKS.filter(ack => {
            if (severityFilter !== 'all' && ack.highestSeverity !== severityFilter) return false
            if (cutoff !== null) {
                const t = new Date(ack.comparedAt).getTime()
                if (Number.isFinite(t) && t < cutoff) return false
            }
            if (search && !ack.ackId.toLowerCase().includes(search.toLowerCase()) && !ack.vendor.toLowerCase().includes(search.toLowerCase()) && !ack.poId.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [search, severityFilter, dateRange])

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

    if (filtered.length === 0 && !search && severityFilter === 'all') {
        return (
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-foreground mb-1">No discrepancies</p>
                <p className="text-xs text-muted-foreground">All ACKs match your POs</p>
            </div>
        )
    }

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-foreground">ACKs Requiring Review</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                            {filtered.length}
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-[240px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search ACK, PO, vendor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:ring-1 ring-primary outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <select
                        value={severityFilter}
                        onChange={e => { setSeverityFilter(e.target.value as any); setPage(0); }}
                        className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:ring-1 ring-primary outline-none text-foreground"
                    >
                        <option value="all">All Severity</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select
                        value={dateRange}
                        onChange={e => { setDateRange(e.target.value as any); setPage(0); }}
                        className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:ring-1 ring-primary outline-none text-foreground"
                    >
                        <option value="all">All Dates</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-border">
                {paginated.map(ack => (
                    <div
                        key={ack.ackId}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => onNavigateToAck?.(ack.ackId)}
                    >
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {ack.initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-foreground">{ack.ackId}</span>
                                <span className="text-[10px] text-muted-foreground">↔ {ack.poId}</span>
                                <ComparisonStatusBadge status={ack.comparisonStatus} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{ack.vendor}</span>
                        </div>

                        {/* Discrepancy count + severity */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-foreground">{ack.discrepancyCount}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${SEVERITY_STYLES[ack.highestSeverity]}`}>
                                {ack.highestSeverity}
                            </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Calendar className="h-3 w-3" />
                            {ack.comparedAt}
                        </div>

                        {/* Arrow */}
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Empty filtered state */}
            {paginated.length === 0 && (
                <div className="p-8 text-center">
                    <p className="text-xs text-muted-foreground">No results match your filters</p>
                </div>
            )}
        </div>
    )
}
