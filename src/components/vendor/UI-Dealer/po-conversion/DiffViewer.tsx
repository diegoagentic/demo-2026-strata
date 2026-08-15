/**
 * SDB-1315 · FE-07 — DiffViewer
 *
 * Generic diff visualization for PO field changes. Accepts a `PODiff[]`
 * array and renders a unified diff view grouped by change type (added /
 * removed / changed). Consumed by SnapshotComparisonView and
 * RevisionHistory.
 *
 * Strata DS tokens:
 *   added   → green-500 (success)
 *   removed → red-500 (error)
 *   changed → amber-500 (warning)
 */

import { clsx } from 'clsx'
import { Minus, Plus, RefreshCw } from 'lucide-react'
import type { PODiff } from './types'

interface DiffViewerProps {
    diffs: PODiff[]
    /** Compact mode for inline use inside cards. Default false. */
    compact?: boolean
}

const TYPE_CONFIG: Record<
    PODiff['type'],
    { icon: typeof Plus; label: string; bg: string; text: string; iconColor: string }
> = {
    added: {
        icon: Plus,
        label: 'Added',
        bg: 'bg-green-500/10 dark:bg-green-500/15',
        text: 'text-green-700 dark:text-green-400',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    removed: {
        icon: Minus,
        label: 'Removed',
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        text: 'text-red-700 dark:text-red-400',
        iconColor: 'text-red-600 dark:text-red-400',
    },
    changed: {
        icon: RefreshCw,
        label: 'Changed',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
}

export default function DiffViewer({ diffs, compact = false }: DiffViewerProps) {
    if (diffs.length === 0) {
        return (
            <p className="text-xs text-muted-foreground italic py-3 text-center">
                No changes
            </p>
        )
    }

    // Group by type for visual clustering
    const grouped = {
        changed: diffs.filter((d) => d.type === 'changed'),
        added: diffs.filter((d) => d.type === 'added'),
        removed: diffs.filter((d) => d.type === 'removed'),
    }

    return (
        <div className={clsx('space-y-1', compact ? 'text-[10px]' : 'text-xs')}>
            {(['changed', 'added', 'removed'] as const).map((type) => {
                const items = grouped[type]
                if (items.length === 0) return null
                const config = TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                    <div key={type} className="space-y-0.5">
                        {/* Group header */}
                        <div className="flex items-center gap-1.5 py-1">
                            <Icon
                                className={clsx(
                                    'shrink-0',
                                    config.iconColor,
                                    compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
                                )}
                            />
                            <span
                                className={clsx(
                                    'font-bold uppercase tracking-wider',
                                    config.text,
                                    compact ? 'text-[8px]' : 'text-[9px]'
                                )}
                            >
                                {config.label} ({items.length})
                            </span>
                        </div>
                        {/* Diff rows */}
                        {items.map((diff, i) => (
                            <div
                                key={`${diff.field}-${i}`}
                                className={clsx(
                                    'flex items-baseline gap-3 rounded-lg border',
                                    config.bg,
                                    compact ? 'px-2 py-1' : 'px-3 py-1.5',
                                    type === 'changed'
                                        ? 'border-amber-500/20'
                                        : type === 'added'
                                          ? 'border-green-500/20'
                                          : 'border-red-500/20'
                                )}
                            >
                                <span
                                    className={clsx(
                                        'shrink-0 font-semibold text-foreground',
                                        compact ? 'w-24 truncate' : 'w-32 truncate'
                                    )}
                                >
                                    {diff.field}
                                </span>
                                {type === 'removed' || type === 'changed' ? (
                                    <span className="text-red-700 dark:text-red-400 line-through tabular-nums truncate">
                                        {diff.oldValue}
                                    </span>
                                ) : null}
                                {type === 'changed' && (
                                    <span className="text-muted-foreground shrink-0">→</span>
                                )}
                                {type === 'added' || type === 'changed' ? (
                                    <span className="text-green-700 dark:text-green-400 font-semibold tabular-nums truncate">
                                        {diff.newValue}
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
