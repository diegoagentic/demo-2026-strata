import { Sparkles, Users } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_BADGE, REGION_LABEL } from './installScheduleData'

interface CLCFunnelViewProps {
    jobs: InstallJob[]
    queuedJobIds: Set<string>
    highlightedJobId?: string | null
}

type FunnelStage = 'pulled' | 'reviewed' | 'scheduled' | 'in-flight' | 'complete'

const STAGE_META: { id: FunnelStage; label: string; accent: string }[] = [
    { id: 'pulled',    label: 'Pulled from IQ', accent: 'text-blue-700 dark:text-blue-300'   },
    { id: 'reviewed',  label: 'Reviewed',       accent: 'text-purple-700 dark:text-purple-300' },
    { id: 'scheduled', label: 'Scheduled',      accent: 'text-amber-700 dark:text-amber-300' },
    { id: 'in-flight', label: 'In-flight',      accent: 'text-emerald-700 dark:text-emerald-300' },
    { id: 'complete',  label: 'Complete',       accent: 'text-zinc-600 dark:text-zinc-400' },
]

/** Classify a job into a funnel stage. Pulled-only is "pending + not yet
    auto-scheduled"; once Strata assigns it a slot it counts as Reviewed. */
function jobStage(job: InstallJob): FunnelStage {
    if (job.status === 'complete')   return 'complete'
    if (job.status === 'in-flight')  return 'in-flight'
    if (job.status === 'scheduled')  return 'scheduled'
    if (job.status === 'pending' && job.aiScheduled) return 'reviewed'
    return 'pulled'
}

/**
 * 5-stage funnel view of install jobs by lifecycle status.
 * Pattern adapted from OfficeworksFunnel (5-column kanban scaffold).
 * Read-only — drag-drop happens in the Calendar view; here we just visualize.
 */
export default function CLCFunnelView({ jobs, queuedJobIds, highlightedJobId }: CLCFunnelViewProps) {
    const byStage: Record<FunnelStage, InstallJob[]> = {
        pulled:     [],
        reviewed:   [],
        scheduled:  [],
        'in-flight': [],
        complete:   [],
    }
    for (const job of jobs) byStage[jobStage(job)].push(job)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {STAGE_META.map(stage => {
                const stageJobs = byStage[stage.id]
                return (
                    <div key={stage.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                        <div className="px-3 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${stage.accent}`}>{stage.label}</span>
                            <span className="text-[11px] font-bold text-foreground tabular-nums px-1.5 py-0.5 rounded bg-muted">{stageJobs.length}</span>
                        </div>
                        <div className="p-2 space-y-1.5 min-h-[120px] flex-1">
                            {stageJobs.length === 0 ? (
                                <div className="h-full min-h-[100px] flex items-center justify-center rounded-md border-2 border-dashed border-border/60 text-[10px] text-muted-foreground">
                                    No jobs
                                </div>
                            ) : (
                                stageJobs.map(job => (
                                    <JobCardMini
                                        key={job.id}
                                        job={job}
                                        queued={queuedJobIds.has(job.id)}
                                        highlighted={highlightedJobId === job.id}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Job card (small format for funnel columns) ─────────────────────────────

function JobCardMini({ job, queued, highlighted }: { job: InstallJob; queued: boolean; highlighted: boolean }) {
    return (
        <div
            className={`rounded-md border bg-card p-2 transition-all ${
                highlighted ? 'border-red-300 ring-2 ring-red-200 dark:border-red-500/50 dark:ring-red-500/20' :
                queued ? 'border-yellow-300 dark:border-yellow-500/50' :
                'border-border hover:border-foreground/30'
            }`}
            title={`${job.customer} · ${job.crewSize} crew · ${job.iqJobIds.length} IQ job${job.iqJobIds.length > 1 ? 's' : ''}`}
        >
            <div className="flex items-start gap-1.5 mb-1">
                <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap ${REGION_BADGE[job.region as Region]}`}>
                    {REGION_LABEL[job.region as Region]}
                </span>
                {job.aiScheduled && <Sparkles className="h-3 w-3 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5" />}
                {job.isAnchor && (
                    <span className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 uppercase tracking-wider whitespace-nowrap">
                        Anchor
                    </span>
                )}
            </div>
            <div className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                {job.customer}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5">
                    <Users className="h-3 w-3" />
                    {job.crewSize}
                </span>
                <span className="font-mono">{job.iqJobIds.length} job{job.iqJobIds.length > 1 ? 's' : ''}</span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">{job.startDate.slice(5)}</span>
            </div>
            {queued && (
                <div className="mt-1 text-[9px] font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">
                    Queued · IQ batch
                </div>
            )}
        </div>
    )
}
