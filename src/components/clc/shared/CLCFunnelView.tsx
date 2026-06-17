import { MoreHorizontal, Sparkles } from 'lucide-react'
import type { InstallJob, Region } from './installScheduleData'
import { REGION_LABEL } from './installScheduleData'

interface CLCFunnelViewProps {
    jobs: InstallJob[]
    queuedJobIds: Set<string>
    highlightedJobId?: string | null
}

type FunnelStage = 'pulled' | 'reviewed' | 'scheduled' | 'in-flight' | 'complete'

/**
 * 5-stage funnel view of install jobs by lifecycle status.
 * Layout aligned with OfficeworksFunnel · semantic column tokens
 * (text-ai / text-info / text-warning / text-primary / text-success) ·
 * card structure: avatar + title/subtitle + description + divider + footer.
 */
const STAGES: { id: FunnelStage; label: string; color: string }[] = [
    { id: 'pulled',    label: 'Pulled from IQ', color: 'text-ai'      },
    { id: 'reviewed',  label: 'Reviewed',       color: 'text-info'    },
    { id: 'scheduled', label: 'Scheduled',      color: 'text-warning' },
    { id: 'in-flight', label: 'In-flight',      color: 'text-primary' },
    { id: 'complete',  label: 'Complete',       color: 'text-success' },
]

function jobStage(job: InstallJob): FunnelStage {
    if (job.status === 'complete')   return 'complete'
    if (job.status === 'in-flight')  return 'in-flight'
    if (job.status === 'scheduled')  return 'scheduled'
    if (job.status === 'pending' && job.aiScheduled) return 'reviewed'
    return 'pulled'
}

// Avatar tokens per region · mirrors the Officeworks avatar pattern
// (h-8 w-8 circle with bg-{color}/20 + text-{color} initials)
const REGION_AVATAR_BG: Record<Region, string> = {
    ny: 'bg-info/20',
    nj: 'bg-warning/20',
    pa: 'bg-success/20',
}
const REGION_AVATAR_TEXT: Record<Region, string> = {
    ny: 'text-info',
    nj: 'text-warning',
    pa: 'text-success',
}

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
            {STAGES.map(stage => {
                const cards = byStage[stage.id]
                return (
                    <div key={stage.id} className="space-y-3 min-h-[200px]">
                        {/* Column header — matches Officeworks pattern */}
                        <div className="flex items-center justify-between mb-1 px-1">
                            <h4 className={`font-medium text-sm flex items-center gap-2 ${stage.color}`}>
                                {stage.label}
                                <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums">{cards.length}</span>
                            </h4>
                            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Column options" aria-label="Column options">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {cards.length === 0 ? (
                            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                <p className="text-xs text-muted-foreground">No projects</p>
                            </div>
                        ) : (
                            cards.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    queued={queuedJobIds.has(job.id)}
                                    highlighted={highlightedJobId === job.id}
                                />
                            ))
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Card · aligned with Officeworks context card layout ────────────────────

function JobCard({ job, queued, highlighted }: { job: InstallJob; queued: boolean; highlighted: boolean }) {
    const avatarBg = REGION_AVATAR_BG[job.region as Region]
    const avatarText = REGION_AVATAR_TEXT[job.region as Region]
    const regionLabel = REGION_LABEL[job.region as Region]
    const vendorSummary = job.vendors.length === 1 ? job.vendors[0] : `${job.vendors[0]} +${job.vendors.length - 1}`

    return (
        <div
            className={`rounded-2xl border bg-card p-3.5 space-y-2.5 shadow-sm transition-shadow ${
                highlighted ? 'border-destructive/40 ring-2 ring-destructive/20' :
                queued      ? 'border-warning/40' :
                              'border-border hover:shadow-md'
            }`}
            title={`${job.customer} · ${job.crewSize} crew · ${job.iqJobIds.length} IQ job${job.iqJobIds.length > 1 ? 's' : ''}`}
        >
            <div className="flex items-center gap-2.5">
                <div className={`h-8 w-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-zinc-900`}>
                    <span className={`text-[10px] font-black ${avatarText}`}>{regionLabel}</span>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{job.customer}</span>
                        {job.aiScheduled && <Sparkles className="h-3 w-3 text-foreground shrink-0" aria-label="AI-scheduled" />}
                        {job.isAnchor && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                Anchor
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{job.project}</div>
                </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {vendorSummary} · {job.crewSize}-crew install · {job.iqJobIds.length} IQ job{job.iqJobIds.length > 1 ? 's' : ''}
            </p>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground truncate">{job.startDate}</span>
                <span className="font-semibold text-foreground tabular-nums">{queued ? 'Queued · IQ batch' : `${job.durationDays}d`}</span>
            </div>
        </div>
    )
}
