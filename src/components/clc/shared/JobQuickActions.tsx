import { Send, Eye, SkipForward, Sparkles, Check } from 'lucide-react'
import type { InstallJob } from './installScheduleData'

interface JobQuickActionsProps {
    job: InstallJob
    /** Layout variant per host view:
        - 'card'    · Funnel · 3 horizontal pill buttons below the divider
        - 'row'     · List · 3 icon-only buttons in the Sync column
        - 'compact' · Calendar · hover overlay (3 small icon buttons) */
    variant: 'card' | 'row' | 'compact'
    onPublish: (jobId: string) => void
    onView: (jobId: string) => void
    onSkip: (jobId: string) => void
    /** When true, hides the action set entirely (used by Calendar variant
        in steps where drag-drop owns the card). */
    disabled?: boolean
}

/**
 * Per-card quick actions for Flow 1. Three actions:
 *   Send to Outlook · publishes individually (sparkles + Published pill)
 *   View            · opens floating panel with job context
 *   Skip            · marks job as deferred (grayscale, removed from calendar)
 *
 * Handlers each stopPropagation() to avoid interfering with drag-drop
 * (Calendar variant) and row navigation (List variant).
 *
 * Once a job has `publishedToOutlook` or `skipped`, the action set renders
 * a terminal pill instead of the buttons so the user doesn't re-trigger.
 */
export default function JobQuickActions({
    job, variant, onPublish, onView, onSkip, disabled,
}: JobQuickActionsProps) {
    if (disabled) return null

    const stop = (e: React.MouseEvent | React.PointerEvent) => {
        e.stopPropagation()
    }

    // ── Terminal states · once acted on, swap to a static pill ──────────
    if (job.publishedToOutlook) {
        return <PublishedPill variant={variant} />
    }
    if (job.skipped) {
        return <SkippedPill variant={variant} />
    }

    const handlePublish = (e: React.MouseEvent) => { stop(e); onPublish(job.id) }
    const handleView    = (e: React.MouseEvent) => { stop(e); onView(job.id) }
    const handleSkip    = (e: React.MouseEvent) => { stop(e); onSkip(job.id) }

    // ── Variant: card (Funnel) ─────────────────────────────────────────
    if (variant === 'card') {
        return (
            <div className="flex items-center gap-1.5" onPointerDown={stop}>
                <button
                    onClick={handlePublish}
                    title="Send to Outlook · publish this job individually"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                    <Send className="h-3 w-3" />
                    Send
                </button>
                <button
                    onClick={handleView}
                    title="View job details"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                >
                    <Eye className="h-3 w-3" />
                    View
                </button>
                <button
                    onClick={handleSkip}
                    title="Skip · defer this job out of the calendar"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                >
                    <SkipForward className="h-3 w-3" />
                    Skip
                </button>
            </div>
        )
    }

    // ── Variant: row (List) ────────────────────────────────────────────
    if (variant === 'row') {
        return (
            <div className="inline-flex items-center gap-0.5" onPointerDown={stop}>
                <button
                    onClick={handlePublish}
                    title="Send to Outlook"
                    aria-label="Send to Outlook"
                    className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                    <Send className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleView}
                    title="View details"
                    aria-label="View details"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleSkip}
                    title="Skip · defer"
                    aria-label="Skip"
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <SkipForward className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    // ── Variant: compact (Calendar hover overlay) ──────────────────────
    return (
        <div
            className="absolute top-1 right-1 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-md shadow-sm p-0.5"
            onPointerDown={stop}
        >
            <button
                onClick={handlePublish}
                title="Send to Outlook"
                aria-label="Send to Outlook"
                className="p-1 rounded text-foreground hover:bg-muted transition-colors"
            >
                <Send className="h-3 w-3" />
            </button>
            <button
                onClick={handleView}
                title="View details"
                aria-label="View details"
                className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
                <Eye className="h-3 w-3" />
            </button>
            <button
                onClick={handleSkip}
                title="Skip"
                aria-label="Skip"
                className="p-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
                <SkipForward className="h-3 w-3" />
            </button>
        </div>
    )
}

// ── Terminal pills ──────────────────────────────────────────────────────

function PublishedPill({ variant }: { variant: 'card' | 'row' | 'compact' }) {
    if (variant === 'compact') {
        return (
            <div className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-success/15 text-success">
                <Sparkles className="h-2.5 w-2.5" />
                Sent
            </div>
        )
    }
    if (variant === 'row') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-success/15 text-success uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Published
            </span>
        )
    }
    return (
        <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-success/15 text-success">
                <Sparkles className="h-3 w-3" />
                Published to Outlook
            </span>
        </div>
    )
}

function SkippedPill({ variant }: { variant: 'card' | 'row' | 'compact' }) {
    if (variant === 'compact') {
        return (
            <div className="absolute top-1 right-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-muted text-muted-foreground">
                <Check className="h-2.5 w-2.5" />
                Skipped
            </div>
        )
    }
    if (variant === 'row') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                <Check className="h-3 w-3" />
                Skipped
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            <Check className="h-3 w-3" />
            Skipped
        </span>
    )
}
