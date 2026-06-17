import { useEffect, useMemo, useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import { Database, RefreshCw, Clock, Sparkles, ArrowRight } from 'lucide-react'
import WeekCalendarGrid from './shared/WeekCalendarGrid'
import CLCCapacityWarningPanel from './shared/CLCCapacityWarningPanel'
import CLCViewToggle, { type ViewMode } from './shared/CLCViewToggle'
import CLCFilterBar from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'
import CLCFunnelView from './shared/CLCFunnelView'
import CLCJobListView from './shared/CLCJobListView'
import {
    INITIAL_JOBS, WEEKS, REGION_BADGE, REGION_LABEL, CAPACITY_BY_REGION,
    type InstallJob, type Region,
} from './shared/installScheduleData'

/**
 * Flow 1 · Calendar Sync (refactored to scene shell).
 *
 * Architecture:
 *   header (title + sync pill + Resync) — persistent
 *   summary chips bar — persistent · chips double as floating-panel triggers
 *   filter bar — persistent
 *   view toggle (Funnel · List · Calendar) — persistent
 *   body (1 of 3 views) — only this swaps per step
 *   step hint footer — varies per step
 *
 * Per-step behavior:
 *   clc1.0 → list view · all chips visible · no drag · no auto-open
 *   clc1.1 → list → calendar autoswap @1500ms · calendar chip pulses · no drag
 *   clc1.2 → calendar · drag enabled · queued chip pulses on each drop
 *   clc1.3 → calendar · alert chip pulses red + auto-opens capacity popover
 */
export default function CLCCalendarScene() {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id

    // Job state (drag-drop reschedules these via WeekCalendarGrid)
    const [jobs, setJobs] = useState<InstallJob[]>(INITIAL_JOBS)
    const [queuedJobIds, setQueuedJobIds] = useState<Set<string>>(new Set())

    // View mode (step-aware default + user override)
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [pulseMode, setPulseMode] = useState<ViewMode | null>(null)
    const [hasUserToggled, setHasUserToggled] = useState(false)

    // Filter state
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')
    const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
    const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)

    // ─── Per-step wiring ──────────────────────────────────────────────────
    useEffect(() => {
        if (!stepId) return
        if (stepId === 'clc1.0') {
            setViewMode('list')
            setPulseMode(null)
        } else if (stepId === 'clc1.1') {
            // List → Calendar autoswap @1500ms (the bridge mechanic)
            if (!hasUserToggled) {
                setViewMode('list')
                setPulseMode('calendar')
                const t = setTimeout(() => {
                    setViewMode('calendar')
                    setPulseMode(null)
                }, 1500)
                return () => clearTimeout(t)
            }
        } else if (stepId === 'clc1.2') {
            if (!hasUserToggled) setViewMode('calendar')
            setPulseMode(null)
        } else if (stepId === 'clc1.3') {
            if (!hasUserToggled) setViewMode('calendar')
            setPulseMode(null)
        }
    }, [stepId, hasUserToggled])

    // Reset the user-toggled flag when stepId changes so each step gets one
    // chance to set its default. Manual toggle within the step disables it.
    useEffect(() => {
        setHasUserToggled(false)
    }, [stepId])

    const handleViewChange = (m: ViewMode) => {
        setViewMode(m)
        setHasUserToggled(true)
        setPulseMode(null)
    }

    // ─── Drag-drop ────────────────────────────────────────────────────────
    const handleJobDrop = (jobId: string, newStart: string) => {
        setJobs(prev => prev.map(j => {
            if (j.id !== jobId) return j
            const [oy, om, od] = newStart.split('-').map(Number)
            const startUTC = Date.UTC(oy, om - 1, od)
            const endUTC = startUTC + (j.durationDays - 1) * 86400000
            const endDate = new Date(endUTC).toISOString().slice(0, 10)
            return { ...j, startDate: newStart, endDate }
        }))
        setQueuedJobIds(prev => new Set(prev).add(jobId))
        window.dispatchEvent(new CustomEvent('clc:calendar-writeback-queued', { detail: { jobId, newStart } }))
    }

    // ─── Filter pipeline ──────────────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            if (statuses.length > 0 && !statuses.includes(j.status)) return false
            if (regionFilter !== 'all' && j.region !== regionFilter) return false
            if (customerQuery && !j.customer.toLowerCase().includes(customerQuery.toLowerCase())) return false
            if (dateRange) {
                if (j.startDate < dateRange.from) return false
                if (j.startDate > dateRange.to) return false
            }
            return true
        })
    }, [jobs, statuses, regionFilter, customerQuery, dateRange])

    // ─── Summary chips ────────────────────────────────────────────────────
    const alertCount = CAPACITY_BY_REGION.filter(r => r.status === 'red').length
    const regionCounts = useMemo(() => {
        const c: Record<Region, number> = { ny: 0, nj: 0, pa: 0 }
        for (const j of filteredJobs) c[j.region]++
        return c
    }, [filteredJobs])

    const autoOpenChipId = stepId === 'clc1.3' ? 'alert' : null

    const chips: SummaryChip[] = [
        {
            id: 'jobs',
            label: `${filteredJobs.length} jobs`,
            count: filteredJobs.length,
            tone: 'neutral',
            panelTitle: 'IQ source · install jobs',
            panel: <SourceListPanelContent jobCount={filteredJobs.length} regionCounts={regionCounts} queuedCount={queuedJobIds.size} />,
        },
        {
            id: 'alert',
            label: `${alertCount} alert${alertCount === 1 ? '' : 's'}`,
            count: alertCount,
            tone: 'warning',
            pulse: stepId === 'clc1.3',
            panelTitle: 'Capacity alerts',
            panel: (
                <div className="p-2">
                    <CLCCapacityWarningPanel stepId={stepId} />
                </div>
            ),
        },
        {
            id: 'queued',
            label: `${queuedJobIds.size} queued`,
            count: queuedJobIds.size,
            tone: 'success',
            pulse: queuedJobIds.size > 0 && stepId === 'clc1.2',
            panelTitle: 'Queued for IQ batch sync',
            panel: <QueuedJobsList queuedJobIds={queuedJobIds} jobs={jobs} />,
        },
    ]

    const allowDragDrop = stepId === 'clc1.2' && viewMode === 'calendar'
    const highlightFairport = stepId === 'clc1.3' ? 'job-fairport' : null

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header */}
            <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Install Schedule</h1>
                    <p className="text-sm text-muted-foreground">6-week view · Mon Jun 1 → Fri Jul 10 · 14 jobs across NY/NJ/PA</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Synced from IQ · 2 min ago
                    </span>
                    <button
                        disabled
                        title="Read-only · IQ API has no write-back · changes queue for nightly batch"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground border border-border rounded-lg opacity-60 cursor-not-allowed"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Resync
                    </button>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} autoOpenChipId={autoOpenChipId} />

            {/* Filter bar */}
            <CLCFilterBar
                dateRange={dateRange}
                onDateRange={setDateRange}
                statuses={statuses}
                onStatuses={setStatuses}
                customerQuery={customerQuery}
                onCustomerQuery={setCustomerQuery}
                regionFilter={regionFilter}
                onRegionFilter={setRegionFilter}
            />

            {/* View toggle (right-aligned above body) */}
            <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
                <div className="text-[11px] text-muted-foreground">
                    {filteredJobs.length === jobs.length ? `${jobs.length} jobs` : `${filteredJobs.length} of ${jobs.length} jobs`}
                </div>
                <CLCViewToggle value={viewMode} onChange={handleViewChange} pulse={pulseMode} />
            </div>

            {/* Body — one view at a time */}
            <section className="flex-1 overflow-y-auto px-5 pb-5">
                {viewMode === 'funnel' && (
                    <CLCFunnelView jobs={filteredJobs} queuedJobIds={queuedJobIds} highlightedJobId={highlightFairport} />
                )}
                {viewMode === 'list' && (
                    <CLCJobListView jobs={filteredJobs} queuedJobIds={queuedJobIds} highlightedJobId={highlightFairport} />
                )}
                {viewMode === 'calendar' && (
                    <>
                        <div className="mb-3 flex items-center gap-3 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/40 dark:border-blue-500/30 dark:bg-blue-500/10">
                            <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                Outlook Calendar · Director of Operations · Mailbox view
                            </span>
                            <div className="ml-auto flex items-center gap-3 text-[11px] text-blue-900/80 dark:text-blue-200/80">
                                {(['ny','nj','pa'] as Region[]).map(r => (
                                    <span key={r} className="inline-flex items-center gap-1">
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${REGION_BADGE[r]}`}>
                                            {REGION_LABEL[r]}
                                        </span>
                                        {regionCounts[r]}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <WeekCalendarGrid
                            weeks={WEEKS}
                            jobs={filteredJobs}
                            highlightedJobId={highlightFairport}
                            onJobDrop={allowDragDrop ? handleJobDrop : undefined}
                            queuedJobIds={queuedJobIds}
                        />
                    </>
                )}
            </section>

            {/* Per-step hint */}
            <StepHint stepId={stepId} />
        </div>
    )
}

// ─── Floating-panel content ─────────────────────────────────────────────────

function SourceListPanelContent({ jobCount, regionCounts, queuedCount }: { jobCount: number; regionCounts: Record<Region, number>; queuedCount: number }) {
    return (
        <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">IQ source</h3>
                <span className="text-[10px] font-semibold text-muted-foreground ml-auto uppercase tracking-wider">read-only</span>
            </div>
            <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pulled jobs</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{jobCount}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                {(['ny','nj','pa'] as Region[]).map(r => (
                    <div key={r} className="rounded-md bg-muted/30 p-2">
                        <div className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${REGION_BADGE[r]}`}>
                            {REGION_LABEL[r]}
                        </div>
                        <div className="text-lg font-bold text-foreground tabular-nums mt-1">{regionCounts[r]}</div>
                    </div>
                ))}
            </div>
            {queuedCount > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50/60 dark:border-yellow-500/30 dark:bg-yellow-500/10 p-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock className="h-3.5 w-3.5 text-yellow-700 dark:text-yellow-300" />
                        <span className="text-[11px] font-bold text-foreground">{queuedCount} queued for IQ batch sync</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">Next batch · 2am ET tonight.</p>
                </div>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
                Strata pulls ship &amp; install dates from IQ's reporting API. Changes made here are <strong className="text-foreground">queued</strong> for the nightly batch · IQ has no write-back API.
            </p>
        </div>
    )
}

function QueuedJobsList({ queuedJobIds, jobs }: { queuedJobIds: Set<string>; jobs: InstallJob[] }) {
    const queued = jobs.filter(j => queuedJobIds.has(j.id))
    return (
        <div className="p-3 space-y-3">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                <h3 className="text-sm font-bold text-foreground">Queued for IQ batch sync</h3>
            </div>
            {queued.length === 0 ? (
                <p className="text-xs text-muted-foreground">No changes queued. Drag-drop a job on the calendar to queue an IQ batch update.</p>
            ) : (
                <>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Next batch · 2am ET tonight. Operator can revert until then.
                    </p>
                    <ul className="space-y-1.5">
                        {queued.map(j => (
                            <li key={j.id} className="rounded-md border border-yellow-200 bg-yellow-50/40 dark:border-yellow-500/30 dark:bg-yellow-500/10 px-2.5 py-2">
                                <div className="text-xs font-semibold text-foreground truncate">{j.customer}</div>
                                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    {j.iqJobIds.join(' · ')} · {j.startDate}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}

// ─── Per-step hint ──────────────────────────────────────────────────────────

function StepHint({ stepId }: { stepId: string | undefined }) {
    if (!stepId) return null
    let hint: string | null = null
    if (stepId === 'clc1.0') hint = 'Review the 14 pulled jobs · advance to publish them on the Outlook calendar.'
    else if (stepId === 'clc1.1') hint = 'Publishing to calendar… Sparkles mark jobs Strata pre-scheduled from IQ.'
    else if (stepId === 'clc1.2') hint = 'Try · drag the Fairport Public Library card to a different day. The change queues for IQ batch sync.'
    else if (stepId === 'clc1.3') hint = 'NY region capacity alert opened automatically · review the third-party installer suggestion.'
    if (!hint) return null
    return (
        <div className="px-5 py-2.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {hint}
                {stepId !== 'clc1.3' && <ArrowRight className="h-3 w-3 ml-1" />}
            </p>
        </div>
    )
}
