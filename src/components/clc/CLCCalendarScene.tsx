import { useEffect, useMemo, useRef, useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import { Database, RefreshCw, Clock, Sparkles, ArrowRight, Send, Users, X } from 'lucide-react'
import WeekCalendarGrid from './shared/WeekCalendarGrid'
import CLCCapacityWarningPanel from './shared/CLCCapacityWarningPanel'
import CLCViewToggle, { type ViewMode } from './shared/CLCViewToggle'
import CLCFilterBar from './shared/CLCFilterBar'
import CLCSummaryChipsBar, { type SummaryChip } from './shared/CLCSummaryChipsBar'
import CLCFunnelView from './shared/CLCFunnelView'
import CLCJobListView from './shared/CLCJobListView'
import CLCPublishModal from './shared/CLCPublishModal'
import {
    INITIAL_JOBS, INBOUND_JOB, WEEKS, REGION_BADGE, REGION_LABEL, CAPACITY_BY_REGION,
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
 *   clc1.1 → list view · all chips visible · no drag · no auto-open
 *   clc1.2 → list → calendar autoswap @1500ms · calendar chip pulses · no drag
 *   clc1.3 → calendar · drag enabled · queued chip pulses on each drop
 *   clc1.4 → calendar · alert chip pulses red + auto-opens capacity popover
 */
export default function CLCCalendarScene() {
    const { currentStep, nextStep } = useDemo()
    const stepId = currentStep?.id

    // Job state (drag-drop reschedules these via WeekCalendarGrid)
    const [jobs, setJobs] = useState<InstallJob[]>(INITIAL_JOBS)
    const [queuedJobIds, setQueuedJobIds] = useState<Set<string>>(new Set())

    // Narrative interaction state (Phase C)
    const [inboundDelivered, setInboundDelivered] = useState(false)
    const [publishedJobIds, setPublishedJobIds] = useState<Set<string>>(new Set())
    const [skippedJobIds, setSkippedJobIds] = useState<Set<string>>(new Set())
    const [viewPanelJobId, setViewPanelJobId] = useState<string | null>(null)
    // Set by the Action Center notification CTA in step 1.1 · forces calendar
    // mode, highlights the inbound job, and pulses its View button so the
    // user has a clear next gesture (click View → opens the install detail
    // panel). Cleared when the user clicks View (or step changes).
    const [inboundReviewJobId, setInboundReviewJobId] = useState<string | null>(null)
    const userClickedPublishAllRef = useRef(false)

    // Bulk-publish modal · the Publish all to Outlook button opens this
    // instead of advancing directly · the user reviews & selects what to send.
    const [publishModalOpen, setPublishModalOpen] = useState(false)

    // Resync animation · the IQ pull is read-only but the operator still
    // needs to refresh on demand. State drives the spinner + the pill label.
    const [isResyncing, setIsResyncing] = useState(false)
    const [syncLabel, setSyncLabel] = useState('Synced from IQ · 2 min ago')

    // View mode (step-aware default + user override)
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [pulseMode, setPulseMode] = useState<ViewMode | null>(null)
    // Use a ref (not state) so toggling inside a step does NOT re-trigger
    // the per-step useEffect — which would race with the autoswap timer
    // and cause Step 1.1 to never switch to Calendar.
    const userToggledRef = useRef(false)
    // Track the last stepId we ran setup for, so re-renders that don't
    // actually change the step don't re-run the per-step logic (and don't
    // cancel the in-flight autoswap timer).
    const lastStepRef = useRef<string | null>(null)

    // Filter state
    const [statuses, setStatuses] = useState<string[]>([])
    const [customerQuery, setCustomerQuery] = useState('')
    const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
    const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)

    // ─── Per-step wiring ──────────────────────────────────────────────────
    // Idempotent setup per step entry. The lastStepRef gate ensures unrelated
    // re-renders (e.g. from filter state) do NOT re-run the per-step block ·
    // crucial because the autoswap setTimeout would otherwise be re-scheduled
    // or cancelled by every re-render.
    useEffect(() => {
        if (!stepId) return
        if (lastStepRef.current === stepId) return   // already handled this step
        lastStepRef.current = stepId
        userToggledRef.current = false
        // Always reset the review-target on step transitions · it's a 1.1-only
        // affordance and would leak into 1.2+ otherwise.
        setInboundReviewJobId(null)

        // eslint-disable-next-line no-console
        console.log('[CLC] enter step', stepId)

        if (stepId === 'clc1.1') {
            setViewMode('list')
            setPulseMode(null)
            // Narrative: a new job arrives from IQ 1500ms after entering.
            setInboundDelivered(false)
            const inboundT = setTimeout(() => setInboundDelivered(true), 1500)
            return () => clearTimeout(inboundT)
        }
        if (stepId === 'clc1.2') {
            // Two paths:
            //   A) User used the Publish modal in 1.1 → fastPath · the modal
            //      already applied the explicit selection · just swap views,
            //      do NOT override the user's choice with a bulk-mark.
            //   B) User advanced via the sidebar Next button without using
            //      the modal → existing 1500ms autoswap + bulk-mark fallback
            //      so the demo state still reads "everything sent".
            const fastPath = userClickedPublishAllRef.current
            setViewMode('list')
            setPulseMode('calendar')
            const delay = fastPath ? 500 : 1500
            setTimeout(() => {
                if (userToggledRef.current) return
                setViewMode('calendar')
                setPulseMode(null)
                if (!fastPath) {
                    setPublishedJobIds(prev => {
                        const next = new Set(prev)
                        for (const j of jobs) {
                            if (!skippedJobIds.has(j.id)) next.add(j.id)
                        }
                        if (inboundDelivered && !skippedJobIds.has(INBOUND_JOB.id)) {
                            next.add(INBOUND_JOB.id)
                        }
                        return next
                    })
                }
            }, delay)
            return
        }
        if (stepId === 'clc1.3') {
            setViewMode('calendar')
            setPulseMode(null)
            return
        }
        if (stepId === 'clc1.4') {
            setViewMode('calendar')
            setPulseMode(null)
            return
        }
        // Any other step · cleanup the inbound flag so it doesn't leak.
        setInboundDelivered(false)
    }, [stepId])  // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewChange = (m: ViewMode) => {
        setViewMode(m)
        userToggledRef.current = true
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

    // ─── Per-card quick actions ───────────────────────────────────────────
    const handlePublish = (jobId: string) =>
        setPublishedJobIds(prev => new Set(prev).add(jobId))
    const handleSkip = (jobId: string) =>
        setSkippedJobIds(prev => new Set(prev).add(jobId))
    const handleView = (jobId: string) => {
        setViewPanelJobId(jobId)
        // Clicking the pulsing View action completes the guided redirect ·
        // stop pulsing so it doesn't compete with the open modal.
        setInboundReviewJobId(prev => (prev === jobId ? null : prev))
    }
    const handlePublishAll = () => {
        // Opens the bulk-publish modal · the actual publish + step advance
        // happens in handlePublishSelected once the user confirms.
        setPublishModalOpen(true)
    }
    const handlePublishSelected = (selectedIds: Set<string>) => {
        userClickedPublishAllRef.current = true
        setPublishedJobIds(prev => {
            const next = new Set(prev)
            for (const id of selectedIds) next.add(id)
            return next
        })
        setPublishModalOpen(false)
        nextStep()
    }
    const handleResync = () => {
        if (isResyncing) return
        setIsResyncing(true)
        setSyncLabel('Pulling from IQ…')
        // Read-only re-pull · IQ has no write-back, but the operator can
        // refresh the source data on demand. Short animation feels like a
        // real round-trip without faking heavy network work.
        setTimeout(() => {
            setIsResyncing(false)
            setSyncLabel('Synced from IQ · just now')
        }, 1200)
    }

    // Listen for the Action Center notification CTA · instead of opening the
    // modal directly, run a 3-step guided redirect:
    //   1. force calendar mode so the user sees their schedule context
    //   2. make sure the inbound job has been delivered to the display set
    //   3. flag the inbound job so the View button on its card pulses
    // The user closes the loop by clicking View · that opens the modal and
    // handleView() above clears the pulse.
    useEffect(() => {
        const handler = () => {
            setViewMode('calendar')
            userToggledRef.current = true   // prevent any in-flight autoswap from overriding
            setInboundDelivered(true)        // safety · if the CTA fires before the delivery timer
            setInboundReviewJobId('job-troy')
        }
        window.addEventListener('clc:inbound-job-open', handler)
        return () => window.removeEventListener('clc:inbound-job-open', handler)
    }, [])

    // ─── Display pipeline ─────────────────────────────────────────────────
    // Inject INBOUND_JOB only during clc1.1 (after delivery). Apply
    // per-job state flags so views render published/skipped/just-arrived.
    const displayedJobs = useMemo(() => {
        const arr: InstallJob[] = [...jobs]
        if (stepId === 'clc1.1' && inboundDelivered) {
            arr.push({ ...INBOUND_JOB, justArrived: true })
        }
        return arr.map(j => ({
            ...j,
            publishedToOutlook: publishedJobIds.has(j.id),
            skipped: skippedJobIds.has(j.id),
        }))
    }, [jobs, stepId, inboundDelivered, publishedJobIds, skippedJobIds])

    // ─── Filter pipeline ──────────────────────────────────────────────────
    const filteredJobs = useMemo(() => {
        return displayedJobs.filter(j => {
            if (statuses.length > 0 && !statuses.includes(j.status)) return false
            if (regionFilter !== 'all' && j.region !== regionFilter) return false
            if (customerQuery && !j.customer.toLowerCase().includes(customerQuery.toLowerCase())) return false
            if (dateRange) {
                if (j.startDate < dateRange.from) return false
                if (j.startDate > dateRange.to) return false
            }
            return true
        })
    }, [displayedJobs, statuses, regionFilter, customerQuery, dateRange])

    // ─── Summary chips ────────────────────────────────────────────────────
    const alertCount = CAPACITY_BY_REGION.filter(r => r.status === 'red').length
    const regionCounts = useMemo(() => {
        const c: Record<Region, number> = { ny: 0, nj: 0, pa: 0 }
        for (const j of filteredJobs) c[j.region]++
        return c
    }, [filteredJobs])

    const autoOpenChipId = stepId === 'clc1.4' ? 'alert' : null

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
            pulse: stepId === 'clc1.4',
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
            pulse: queuedJobIds.size > 0 && stepId === 'clc1.3',
            panelTitle: 'Queued for IQ batch sync',
            panel: <QueuedJobsList queuedJobIds={queuedJobIds} jobs={displayedJobs} />,
        },
    ]

    const allowDragDrop = stepId === 'clc1.3' && viewMode === 'calendar'
    const highlightFairport = stepId === 'clc1.4' ? 'job-fairport' : null
    // When the user clicked the notification CTA, the inbound job also gets
    // the highlight ring on the calendar card · same visual language as the
    // capacity-alert highlight in 1.4.
    const highlightedJobId = inboundReviewJobId ?? highlightFairport
    const showPublishAll = stepId === 'clc1.1' || stepId === 'clc1.2'
    // Disable when in 1.2 (already published) OR when there's literally
    // nothing left to send (everything's already published or skipped).
    const publishableCount = useMemo(
        () => displayedJobs.filter(j => !j.publishedToOutlook && !j.skipped).length,
        [displayedJobs],
    )
    const publishAllDisabled = publishableCount === 0 || stepId === 'clc1.2'
    const viewedJob = viewPanelJobId ? displayedJobs.find(j => j.id === viewPanelJobId) ?? null : null

    return (
        <div className="flex flex-col h-full bg-muted/5">
            {/* Header — title + subtitle only · sync/publish moved next to the view toggle */}
            <header className="flex items-start gap-4 px-5 pt-5 pb-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Install Schedule</h1>
                    <p className="text-sm text-muted-foreground">6-week view · Mon Jun 1 → Fri Jul 10 · {displayedJobs.length} jobs across NY/NJ/PA</p>
                </div>
            </header>

            {/* Summary chips */}
            <CLCSummaryChipsBar chips={chips} autoOpenChipId={autoOpenChipId} />

            {/* Filter bar · stays clean · filters only */}
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

            {/* Toolbar row · jobs count on the left · view toggle + data actions on the right */}
            <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2 flex-wrap">
                <div className="text-[11px] text-muted-foreground">
                    {filteredJobs.length === jobs.length ? `${jobs.length} jobs` : `${filteredJobs.length} of ${jobs.length} jobs`}
                </div>
                <div className="inline-flex items-center gap-2 flex-wrap">
                    <CLCViewToggle value={viewMode} onChange={handleViewChange} pulse={pulseMode} />
                    {/* Divider · view-mode cluster on the left of it · data actions on the right */}
                    <span className="h-5 w-px bg-border mx-1 hidden sm:inline-block" aria-hidden />
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted">
                        {isResyncing ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-foreground" />
                        ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        )}
                        {syncLabel}
                    </span>
                    <button
                        onClick={handleResync}
                        disabled={isResyncing}
                        title="Re-pull install jobs from IQ"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-wait"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                        {isResyncing ? 'Syncing…' : 'Resync'}
                    </button>
                    {showPublishAll && (
                        <button
                            onClick={handlePublishAll}
                            disabled={publishAllDisabled}
                            title="Publish every queued install to the Outlook calendar and advance the flow"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-background bg-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Publish all to Outlook
                        </button>
                    )}
                </div>
            </div>

            {/* Body — one view at a time */}
            <section className="flex-1 overflow-y-auto px-5 pb-5">
                {viewMode === 'funnel' && (
                    <CLCFunnelView
                        jobs={filteredJobs}
                        queuedJobIds={queuedJobIds}
                        highlightedJobId={highlightedJobId}
                        pulseViewActionForJobId={inboundReviewJobId}
                        onPublish={handlePublish}
                        onView={handleView}
                        onSkip={handleSkip}
                    />
                )}
                {viewMode === 'list' && (
                    <CLCJobListView
                        jobs={filteredJobs}
                        queuedJobIds={queuedJobIds}
                        highlightedJobId={highlightedJobId}
                        pulseViewActionForJobId={inboundReviewJobId}
                        onPublish={handlePublish}
                        onView={handleView}
                        onSkip={handleSkip}
                    />
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
                            highlightedJobId={highlightedJobId}
                            pulseViewActionForJobId={inboundReviewJobId}
                            onJobDrop={allowDragDrop ? handleJobDrop : undefined}
                            queuedJobIds={queuedJobIds}
                            onPublish={handlePublish}
                            onView={handleView}
                            onSkip={handleSkip}
                            showQuickActions={!allowDragDrop}
                        />
                    </>
                )}
            </section>

            {/* Per-step hint */}
            <StepHint stepId={stepId} />

            {/* View panel · opened via per-card View action or Action Center CTA */}
            {viewedJob && (
                <ViewJobPanel
                    job={viewedJob}
                    onClose={() => setViewPanelJobId(null)}
                    onPublish={() => { handlePublish(viewedJob.id); setViewPanelJobId(null) }}
                />
            )}

            {/* Bulk publish modal · opened by the Publish all to Outlook header button */}
            {publishModalOpen && (
                <CLCPublishModal
                    jobs={displayedJobs}
                    onClose={() => setPublishModalOpen(false)}
                    onPublish={handlePublishSelected}
                />
            )}
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
    if (stepId === 'clc1.1') hint = 'Bell pulses · open the Action Center, click the IQ install request, then View on the highlighted card to inspect Troy. Click Publish all to open the review modal and bridge to step 1.2.'
    else if (stepId === 'clc1.2') hint = 'Publishing… Sparkles mark jobs sent to Outlook. Drag-drop unlocks in step 1.3.'
    else if (stepId === 'clc1.3') hint = 'Try · drag the Fairport Public Library card to a different day. The change queues for IQ batch sync.'
    else if (stepId === 'clc1.4') hint = 'NY region capacity alert opened automatically · review the third-party installer suggestion.'
    if (!hint) return null
    return (
        <div className="px-5 py-2.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {hint}
                {stepId !== 'clc1.4' && <ArrowRight className="h-3 w-3 ml-1" />}
            </p>
        </div>
    )
}

// ─── View Job panel ─────────────────────────────────────────────────────────

function ViewJobPanel({ job, onClose, onPublish }: { job: InstallJob; onClose: () => void; onPublish: () => void }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                <header className="p-4 border-b border-border flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Install detail</div>
                        <h2 className="text-base font-bold text-foreground leading-tight">{job.customer}</h2>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{job.project}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </header>
                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Region</div>
                            <div className="text-sm font-semibold text-foreground">{REGION_LABEL[job.region]} · {job.region.toUpperCase()}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Crew</div>
                            <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Users className="h-3.5 w-3.5" />{job.crewSize}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Start</div>
                            <div className="text-sm font-mono text-foreground">{job.startDate}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</div>
                            <div className="text-sm font-semibold text-foreground">{job.durationDays} day{job.durationDays !== 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vendors</div>
                        <div className="flex flex-wrap gap-1">
                            {job.vendors.map(v => (
                                <span key={v} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border text-foreground">{v}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">IQ jobs</div>
                        <div className="flex flex-wrap gap-1">
                            {job.iqJobIds.map(id => (
                                <span key={id} className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground">{id}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="p-3 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        Close
                    </button>
                    {!job.publishedToOutlook && !job.skipped && (
                        <button onClick={onPublish} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity">
                            <Send className="h-3 w-3" />
                            Send to Outlook
                        </button>
                    )}
                </footer>
            </div>
        </div>
    )
}
