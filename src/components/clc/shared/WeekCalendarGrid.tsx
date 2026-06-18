import { useState, useMemo } from 'react'
import { Sparkles, Users } from 'lucide-react'
import type { InstallJob, WeekColumn, Region } from './installScheduleData'
import { REGION_BADGE, REGION_LABEL } from './installScheduleData'
import JobQuickActions from './JobQuickActions'

interface WeekCalendarGridProps {
    weeks: WeekColumn[]
    jobs: InstallJob[]
    /** Highlight a specific job (used by the capacity warning panel) */
    highlightedJobId?: string | null
    /** When set, drag-and-drop is enabled and onJobDrop fires on a successful drop */
    onJobDrop?: (jobId: string, newStartDate: string) => void
    /** When set, the user is informed that the row is "queued for IQ batch sync" */
    queuedJobIds?: Set<string>
    /** Phase D · per-card quick actions (compact variant) on hover */
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    /** When false (e.g. during clc1.3 drag-drop), the hover overlay is hidden
        so the actions don't fight with the drag affordance. */
    showQuickActions?: boolean
    /** When set, the View action of that specific job pulses to draw attention. */
    pulseViewActionForJobId?: string | null
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

/** Add N days to an ISO YYYY-MM-DD string (UTC-safe arithmetic). */
function addDays(iso: string, days: number): string {
    const [y, m, d] = iso.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    dt.setUTCDate(dt.getUTCDate() + days)
    return dt.toISOString().slice(0, 10)
}

/** Days between two ISO dates (b - a, in UTC days). */
function daysBetween(a: string, b: string): number {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    const ams = Date.UTC(ay, am - 1, ad)
    const bms = Date.UTC(by, bm - 1, bd)
    return Math.round((bms - ams) / 86400000)
}

/**
 * Outlook-style week × weekday grid with install job cards.
 * Net-new primitive · no calendar widget existed in the repo.
 *
 * Layout: rows = 1 per week (Mon-Fri columns), each job rendered as a card
 * positioned in the Mon-cell of its start day. Weekends collapsed (most installs
 * are weekday-only). HTML5 drag-and-drop with no dependency.
 */
export default function WeekCalendarGrid({ weeks, jobs, highlightedJobId, onJobDrop, queuedJobIds, onPublish, onView, onSkip, showQuickActions = true, pulseViewActionForJobId }: WeekCalendarGridProps) {
    const [dragJobId, setDragJobId] = useState<string | null>(null)
    const [dragOverCell, setDragOverCell] = useState<string | null>(null)

    // Index jobs by (weekMonday, dayIndex) cell for rendering.
    const jobsByCell = useMemo(() => {
        const idx: Record<string, InstallJob[]> = {}
        for (const job of jobs) {
            const wk = weeks.find(w => {
                const diff = daysBetween(w.monday, job.startDate)
                return diff >= 0 && diff <= 4 // Mon-Fri
            })
            if (!wk) continue
            const dayIdx = daysBetween(wk.monday, job.startDate)
            const key = `${wk.monday}::${dayIdx}`
            if (!idx[key]) idx[key] = []
            idx[key].push(job)
        }
        return idx
    }, [jobs, weeks])

    const handleDragStart = (e: React.DragEvent, jobId: string) => {
        if (!onJobDrop) return
        setDragJobId(jobId)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', jobId)
    }
    const handleDragEnd = () => {
        setDragJobId(null)
        setDragOverCell(null)
    }
    const handleDragOver = (e: React.DragEvent, cellKey: string) => {
        if (!onJobDrop || !dragJobId) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverCell !== cellKey) setDragOverCell(cellKey)
    }
    const handleDrop = (e: React.DragEvent, weekMonday: string, dayIdx: number) => {
        if (!onJobDrop || !dragJobId) return
        e.preventDefault()
        const newDate = addDays(weekMonday, dayIdx)
        onJobDrop(dragJobId, newDate)
        handleDragEnd()
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header — day labels */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] bg-muted/40 border-b border-border">
                <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border">
                    Week
                </div>
                {DAY_LABELS.map((label, i) => (
                    <div key={label} className={`px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider ${i < 4 ? 'border-r border-border' : ''}`}>
                        {label}
                    </div>
                ))}
            </div>

            {/* Body — week rows */}
            {weeks.map((week, wkIdx) => (
                <div
                    key={week.monday}
                    className={`grid grid-cols-[60px_repeat(5,1fr)] ${wkIdx < weeks.length - 1 ? 'border-b border-border' : ''}`}
                >
                    {/* Week label column */}
                    <div className="px-3 py-3 text-xs font-bold text-foreground bg-muted/20 border-r border-border flex items-center">
                        {week.label}
                    </div>
                    {/* 5 weekday cells */}
                    {DAY_LABELS.map((_, dayIdx) => {
                        const cellKey = `${week.monday}::${dayIdx}`
                        const cellJobs = jobsByCell[cellKey] ?? []
                        const isDropTarget = dragOverCell === cellKey
                        return (
                            <div
                                key={cellKey}
                                onDragOver={(e) => handleDragOver(e, cellKey)}
                                onDrop={(e) => handleDrop(e, week.monday, dayIdx)}
                                onDragLeave={() => dragOverCell === cellKey && setDragOverCell(null)}
                                className={`min-h-[88px] p-1.5 space-y-1 transition-colors ${
                                    dayIdx < 4 ? 'border-r border-border' : ''
                                } ${isDropTarget ? 'bg-ai/10' : 'hover:bg-muted/20'}`}
                            >
                                {cellJobs.map(job => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        highlighted={highlightedJobId === job.id}
                                        queued={queuedJobIds?.has(job.id) ?? false}
                                        draggable={!!onJobDrop && !job.publishedToOutlook && !job.skipped}
                                        onDragStart={(e) => handleDragStart(e, job.id)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={dragJobId === job.id}
                                        onPublish={onPublish}
                                        onView={onView}
                                        onSkip={onSkip}
                                        showQuickActions={showQuickActions}
                                        pulseView={pulseViewActionForJobId === job.id}
                                    />
                                ))}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

// ─── Job card ────────────────────────────────────────────────────────────────

interface JobCardProps {
    job: InstallJob
    highlighted: boolean
    queued: boolean
    draggable: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: () => void
    isDragging: boolean
    onPublish?: (jobId: string) => void
    onView?: (jobId: string) => void
    onSkip?: (jobId: string) => void
    showQuickActions: boolean
    pulseView: boolean
}

function JobCard({ job, highlighted, queued, draggable, onDragStart, onDragEnd, isDragging, onPublish, onView, onSkip, showQuickActions, pulseView }: JobCardProps) {
    const regionBadge = REGION_BADGE[job.region as Region]
    const hasActions = showQuickActions && !!(onPublish && onView && onSkip)
    return (
        <div
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`relative group rounded-md border bg-card p-2 transition-all ${
                draggable ? 'cursor-grab active:cursor-grabbing' : ''
            } ${
                isDragging ? 'opacity-40 scale-95' : ''
            } ${
                job.justArrived ? 'border-ai/40 ring-2 ring-ai/30' :
                highlighted    ? 'border-red-300 ring-2 ring-red-200 dark:border-red-500/50 dark:ring-red-500/20' :
                queued         ? 'border-yellow-300 dark:border-yellow-500/50' :
                                 'border-border hover:border-foreground/30'
            } ${job.skipped ? 'opacity-50 grayscale' : ''}`}
            title={`${job.customer} · ${job.crewSize} crew · ${job.iqJobIds.length} IQ job${job.iqJobIds.length > 1 ? 's' : ''}`}
        >
            <div className="flex items-start gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap ${regionBadge}`}>
                    {REGION_LABEL[job.region as Region]}
                </span>
                {(job.aiScheduled || job.publishedToOutlook) && (
                    <Sparkles className="h-3 w-3 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5" aria-label="Strata signal" />
                )}
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
            </div>
            {queued && (
                <div className="mt-1 text-[9px] font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">
                    Queued · IQ batch
                </div>
            )}
            {job.justArrived && (
                <div className="absolute -top-1.5 -right-1.5 text-[8px] font-bold uppercase tracking-wider bg-ai text-background px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                    New
                </div>
            )}
            {hasActions && (
                <JobQuickActions
                    job={job}
                    variant="compact"
                    pulseView={pulseView}
                    onPublish={onPublish!}
                    onView={onView!}
                    onSkip={onSkip!}
                />
            )}
        </div>
    )
}
