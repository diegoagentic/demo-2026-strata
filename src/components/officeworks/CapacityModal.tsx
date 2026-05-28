/**
 * COMPONENT: CapacityModal
 * PURPOSE: Browse Designer Capacity (forward planning) as a modal,
 *          decoupled from the funnel main view. Opened via "View capacity"
 *          button in OfficeworksFunnel header.
 *
 * P49 refinement:
 *   - Filter bar: region pills + status pills + sort dropdown + summary
 *   - CapacityHeatmap renders the filtered subset of designers
 *   - Card visuals use the new chip pattern (neutral cards + colored chips)
 *
 * Independent of the Review modal, which has its own embedded
 * CapacityHeatmap inside IntakeAssignPanel for in-context designer
 * assignment (now also benefits from the chip pattern).
 */

import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Users } from 'lucide-react'
import CapacityHeatmap, {
    DESIGNERS,
    REGION_LABELS,
    utilizationStatus,
    type Designer,
    type UtilizationStatus,
} from './shared/CapacityHeatmap'

interface CapacityModalProps {
    isOpen: boolean
    onClose: () => void
}

type RegionFilter = 'all' | 'dc' | 'ma' | 'pa'
type StatusFilter = 'all' | UtilizationStatus
type SortBy = 'available' | 'utilized' | 'name'

const REGION_PILLS: Array<{ value: RegionFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'dc', label: REGION_LABELS.dc.label },
    { value: 'ma', label: REGION_LABELS.ma.label },
    { value: 'pa', label: REGION_LABELS.pa.label },
]

const STATUS_PILLS: Array<{ value: StatusFilter; label: string; dot: string }> = [
    { value: 'all', label: 'All', dot: '' },
    { value: 'available', label: 'Available', dot: 'bg-success' },
    { value: 'limited', label: 'Limited', dot: 'bg-warning' },
    { value: 'at-capacity', label: 'At capacity', dot: 'bg-destructive' },
]

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
    { value: 'available', label: 'Most available first' },
    { value: 'utilized', label: 'Most utilized first' },
    { value: 'name', label: 'Name A–Z' },
]

export default function CapacityModal({ isOpen, onClose }: CapacityModalProps) {
    const [regionFilter, setRegionFilter] = useState<RegionFilter>('all')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortBy>('available')

    const filtered: Designer[] = useMemo(() => {
        const byRegion = regionFilter === 'all'
            ? DESIGNERS
            : DESIGNERS.filter(d => d.region === regionFilter)
        const byStatus = statusFilter === 'all'
            ? byRegion
            : byRegion.filter(d => utilizationStatus(d.utilization) === statusFilter)
        const sorted = [...byStatus]
        if (sortBy === 'available')      sorted.sort((a, b) => a.utilization - b.utilization)
        else if (sortBy === 'utilized')  sorted.sort((a, b) => b.utilization - a.utilization)
        else /* name */                  sorted.sort((a, b) => a.name.localeCompare(b.name))
        return sorted
    }, [regionFilter, statusFilter, sortBy])

    const hasFilters = regionFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'available'
    const resetFilters = () => { setRegionFilter('all'); setStatusFilter('all'); setSortBy('available') }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-4xl transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/15 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-info" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-foreground">Designer Capacity</div>
                                    <div className="text-[11px] text-muted-foreground">{DESIGNERS.length} designers · 3 regions · live utilization</div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    aria-label="Close"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Filter bar */}
                            <div className="px-5 py-3 border-b border-border bg-muted/15 shrink-0 space-y-2">
                                {/* Region pills */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Region</span>
                                    {REGION_PILLS.map(p => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setRegionFilter(p.value)}
                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                regionFilter === p.value
                                                    ? 'bg-foreground text-background border-foreground'
                                                    : 'bg-card text-foreground border-border hover:bg-muted/40'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Status pills */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Status</span>
                                    {STATUS_PILLS.map(p => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setStatusFilter(p.value)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                statusFilter === p.value
                                                    ? 'bg-foreground text-background border-foreground'
                                                    : 'bg-card text-foreground border-border hover:bg-muted/40'
                                            }`}
                                        >
                                            {p.dot && <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />}
                                            {p.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort + summary + reset */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-14 shrink-0">Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value as SortBy)}
                                        className="text-[11px] font-semibold bg-card border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    >
                                        {SORT_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <span className="text-[11px] text-muted-foreground ml-auto">
                                        Showing <strong className="text-foreground tabular-nums">{filtered.length}</strong> of {DESIGNERS.length}
                                    </span>
                                    {hasFilters && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="text-[11px] font-semibold text-primary hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable body — filtered heatmap */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-muted-foreground">
                                        No designers match the current filters.
                                        <button onClick={resetFilters} className="block mx-auto mt-2 text-primary font-semibold hover:underline">
                                            Reset filters
                                        </button>
                                    </div>
                                ) : (
                                    <CapacityHeatmap designers={filtered} />
                                )}
                            </div>

                            {/* Footer · close action */}
                            <div className="px-5 py-3.5 border-t border-border bg-card shrink-0 flex items-center justify-between gap-3">
                                <p className="text-[11px] text-muted-foreground">
                                    Click a designer card in the assignment flow to assign them to a project.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
