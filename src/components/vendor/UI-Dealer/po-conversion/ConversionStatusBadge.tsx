import { clsx } from 'clsx'
import { Loader2, CheckCircle2, FileText, XCircle } from 'lucide-react'
import type { POStatus } from './types'

interface ConversionStatusBadgeProps {
    status: POStatus
    poCount?: number
    size?: 'sm' | 'md'
    onClick?: () => void
}

const STATUS_CONFIG: Record<POStatus, {
    label: string
    icon: typeof CheckCircle2
    colors: string
    animated?: boolean
}> = {
    DRAFT: {
        label: 'Draft',
        icon: FileText,
        colors: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    FINALIZED: {
        label: 'Finalized',
        icon: CheckCircle2,
        colors: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    SUBMITTED: {
        label: 'Submitted',
        icon: CheckCircle2,
        colors: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    },
    FAILED: {
        label: 'Failed',
        icon: XCircle,
        colors: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    },
}

/**
 * FE-10 — Conversion Status Badge
 * Shows PO status on quote list/detail. Click navigates to PO page.
 */
export default function ConversionStatusBadge({ status, poCount, size = 'sm', onClick }: ConversionStatusBadgeProps) {
    if (!status) return null
    const config = STATUS_CONFIG[status]
    if (!config) return null
    const Icon = config.icon
    const Element = onClick ? 'button' : 'span'

    return (
        <Element
            onClick={onClick}
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors',
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
                config.colors,
                onClick && 'cursor-pointer hover:opacity-80'
            )}
        >
            <Icon className={clsx(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden="true" />
            {config.label}
            {poCount !== undefined && <span className="opacity-70">→ {poCount} PO{poCount !== 1 ? 's' : ''}</span>}
        </Element>
    )
}

/**
 * "Converting..." badge with spinner for in-progress conversions.
 */
export function ConvertingBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
    return (
        <span className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        )}>
            <Loader2 className={clsx('animate-spin', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
            Converting...
        </span>
    )
}
