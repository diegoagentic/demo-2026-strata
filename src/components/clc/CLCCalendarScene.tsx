import { useState, useMemo } from 'react'
import { useDemo } from '../../context/DemoContext'
import { Database, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react'
import WeekCalendarGrid from './shared/WeekCalendarGrid'
import CLCCapacityWarningPanel from './shared/CLCCapacityWarningPanel'
import { INITIAL_JOBS, WEEKS, REGION_BADGE, REGION_LABEL, type InstallJob, type Region } from './shared/installScheduleData'

/**
 * Flow 1 — Calendar Sync scene.
 *
 * Layout:
 *   Left rail (320px) · IQ source list + capacity panel
 *   Right (flex) · WeekCalendarGrid (Outlook chrome)
 *
 * Behavior per step:
 *   clc1.0 → grid hidden, source list shown with pulled jobs
 *   clc1.1 → grid renders all jobs · Sparkles on AI-scheduled
 *   clc1.2 → drag-and-drop enabled · drops queue for IQ batch sync
 *   clc1.3 → capacity panel auto-expands NY · third-party suggestion shown
 */
export default function CLCCalendarScene() {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id

    const [jobs, setJobs] = useState<InstallJob[]>(INITIAL_JOBS)
    const [queuedJobIds, setQueuedJobIds] = useState<Set<string>>(new Set())

    // Per-step UI state
    const showGrid = stepId !== 'clc1.0'  // hide grid on the source-list step
    const allowDragDrop = stepId === 'clc1.2'
    const highlightFairport = stepId === 'clc1.3'

    const handleJobDrop = (jobId: string, newStart: string) => {
        setJobs(prev => prev.map(j => {
            if (j.id !== jobId) return j
            // Compute new end date preserving original duration.
            const [oy, om, od] = newStart.split('-').map(Number)
            const startUTC = Date.UTC(oy, om - 1, od)
            const endUTC = startUTC + (j.durationDays - 1) * 86400000
            const endDate = new Date(endUTC).toISOString().slice(0, 10)
            return { ...j, startDate: newStart, endDate }
        }))
        setQueuedJobIds(prev => new Set(prev).add(jobId))
        // Mock event dispatch (consumed by ActionCenter if wired)
        window.dispatchEvent(new CustomEvent('clc:calendar-writeback-queued', { detail: { jobId, newStart } }))
    }

    const regionCounts = useMemo(() => {
        const counts: Record<Region, number> = { ny: 0, nj: 0, pa: 0 }
        for (const j of jobs) counts[j.region]++
        return counts
    }, [jobs])

    return (
        <div className="flex h-full">
            {/* Left rail — IQ source + capacity */}
            <aside className="w-[340px] shrink-0 border-r border-border overflow-y-auto p-4 space-y-4 bg-muted/10">
                <SourceListPanel
                    jobCount={jobs.length}
                    regionCounts={regionCounts}
                    queuedCount={queuedJobIds.size}
                />
                <CLCCapacityWarningPanel stepId={stepId} />
            </aside>

            {/* Right — calendar grid */}
            <section className="flex-1 overflow-y-auto p-5 bg-muted/5">
                <header className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Install Schedule</h1>
                        <p className="text-sm text-muted-foreground">
                            6-week view · Mon Jun 1 → Fri Jul 10 · 14 jobs across NY/NJ/PA
                        </p>
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

                {/* Outlook-style banner above the grid */}
                {showGrid && (
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
                )}

                {showGrid ? (
                    <WeekCalendarGrid
                        weeks={WEEKS}
                        jobs={jobs}
                        highlightedJobId={highlightFairport ? 'job-fairport' : null}
                        onJobDrop={allowDragDrop ? handleJobDrop : undefined}
                        queuedJobIds={queuedJobIds}
                    />
                ) : (
                    <SourceListGridFallback jobs={jobs} />
                )}

                {/* Per-step hint */}
                {stepId === 'clc1.2' && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Try · drag the <strong className="text-foreground">Fairport Public Library</strong> card from Jun 2 to a different day. The change queues for IQ batch sync.
                    </p>
                )}
                {stepId === 'clc1.3' && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        NY region capacity panel auto-expanded · review the third-party installer suggestion in the left rail.
                    </p>
                )}
            </section>
        </div>
    )
}

// ─── Source-list panel (left rail · always visible) ──────────────────────────

interface SourceListPanelProps {
    jobCount: number
    regionCounts: Record<Region, number>
    queuedCount: number
}

function SourceListPanel({ jobCount, regionCounts, queuedCount }: SourceListPanelProps) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">IQ source</h3>
                    <span className="text-[10px] font-semibold text-muted-foreground ml-auto uppercase tracking-wider">read-only</span>
                </div>
            </div>
            <div className="p-4 space-y-3">
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
                            <CheckCircle2 className="h-3.5 w-3.5 text-yellow-700 dark:text-yellow-300" />
                            <span className="text-[11px] font-bold text-foreground">{queuedCount} queued for IQ batch sync</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Next batch · 2am ET tonight. Operator can revert until then.
                        </p>
                    </div>
                )}
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Strata pulls ship & install dates from IQ's reporting API. Changes made here are <strong className="text-foreground">queued</strong> for the nightly batch · IQ has no write-back API.
                </div>
            </div>
        </div>
    )
}

// ─── Fallback grid for clc1.0 (no calendar yet, just a list) ────────────────

function SourceListGridFallback({ jobs }: { jobs: InstallJob[] }) {
    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/40 grid grid-cols-[1fr_70px_120px_60px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Project</span>
                <span>Region</span>
                <span>Start</span>
                <span className="text-right">IQ jobs</span>
            </div>
            <div className="divide-y divide-border">
                {jobs.map(job => (
                    <div key={job.id} className="grid grid-cols-[1fr_70px_120px_60px] gap-2 px-3 py-2 items-center text-sm">
                        <div className="min-w-0">
                            <div className="font-semibold text-foreground truncate">{job.customer}</div>
                            <div className="text-xs text-muted-foreground truncate">{job.project}</div>
                        </div>
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${REGION_BADGE[job.region]} w-fit`}>
                            {REGION_LABEL[job.region]}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{job.startDate}</span>
                        <span className="text-xs font-bold text-foreground text-right tabular-nums">{job.iqJobIds.length}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
