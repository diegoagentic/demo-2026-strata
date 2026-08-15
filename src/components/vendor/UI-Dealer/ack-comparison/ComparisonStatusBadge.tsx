import { clsx } from 'clsx'
import { CheckCircle2, AlertTriangle, XCircle, Unlink, Clock, Loader2 } from 'lucide-react'

export type ComparisonStatus =
    | 'MATCH'
    | 'PARTIAL_MATCH'
    | 'MISMATCH'
    | 'UNLINKED'
    | 'PENDING_SEMANTIC'
    | 'IN_PROGRESS'

interface ComparisonStatusBadgeProps {
    status: ComparisonStatus | undefined
    size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<ComparisonStatus, {
    label: string
    icon: typeof CheckCircle2
    ariaLabel: string
    colors: string
}> = {
    MATCH: {
        label: 'Confirmed',
        icon: CheckCircle2,
        ariaLabel: 'Comparison status: all fields match',
        colors: 'bg-success/10 text-success border-success/30',
    },
    PARTIAL_MATCH: {
        label: 'Partial Match',
        icon: AlertTriangle,
        ariaLabel: 'Comparison status: some fields differ',
        colors: 'bg-warning/10 text-warning border-warning/30',
    },
    MISMATCH: {
        label: 'Discrepancies Found',
        icon: XCircle,
        ariaLabel: 'Comparison status: discrepancies found',
        colors: 'bg-error/10 text-error border-error/30',
    },
    UNLINKED: {
        label: 'No PO Linked',
        icon: Unlink,
        ariaLabel: 'Comparison status: no purchase order linked',
        colors: 'bg-muted text-muted-foreground border-border',
    },
    PENDING_SEMANTIC: {
        label: 'Analysis Pending',
        icon: Clock,
        ariaLabel: 'Comparison status: semantic analysis pending',
        colors: 'bg-info/10 text-info border-info/30',
    },
    IN_PROGRESS: {
        label: 'Comparing...',
        icon: Loader2,
        ariaLabel: 'Comparison status: comparison in progress',
        colors: 'bg-info/10 text-info border-info/30',
    },
}

export default function ComparisonStatusBadge({ status, size = 'sm' }: ComparisonStatusBadgeProps) {
    if (!status) return null

    const config = STATUS_CONFIG[status]
    if (!config) return null

    const Icon = config.icon
    const isAnimated = status === 'IN_PROGRESS'

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border font-semibold',
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
                config.colors
            )}
            aria-label={config.ariaLabel}
            role="status"
        >
            <Icon className={clsx(
                size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
                isAnimated && 'animate-spin'
            )} />
            {config.label}
        </span>
    )
}
