/**
 * SDB-1315 · FE-04 — SnapshotComparisonView
 *
 * Side-by-side comparison of the frozen quote snapshot vs the current
 * quote values. Highlights discrepancies by severity (LOW → CRITICAL)
 * and lets the user accept the snapshot or use the current value per
 * row. Matching fields are collapsed with a count.
 *
 * Depends on DiffViewer for the field-level diff rendering.
 */

import { useState } from 'react'
import { clsx } from 'clsx'
import {
    AlertTriangle,
    Check,
    CheckCircle2,
    ChevronDown,
    Eye,
    Lock,
    Shield,
} from 'lucide-react'
import type { SnapshotDiscrepancy, DiscrepancySeverity } from './types'
import DiffViewer from './DiffViewer'

interface SnapshotComparisonViewProps {
    discrepancies: SnapshotDiscrepancy[]
    matchingFieldCount?: number
    onResolve?: (index: number, choice: 'snapshot' | 'current') => void
}

const SEVERITY_STYLE: Record<
    DiscrepancySeverity,
    { bg: string; border: string; text: string; label: string }
> = {
    LOW: {
        bg: 'bg-muted/40',
        border: 'border-border',
        text: 'text-muted-foreground',
        label: 'Low',
    },
    MEDIUM: {
        bg: 'bg-amber-500/5 dark:bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-700 dark:text-amber-400',
        label: 'Medium',
    },
    HIGH: {
        bg: 'bg-red-500/5 dark:bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-700 dark:text-red-400',
        label: 'High',
    },
    CRITICAL: {
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        border: 'border-red-500/50',
        text: 'text-red-700 dark:text-red-400',
        label: 'Critical',
    },
}

export default function SnapshotComparisonView({
    discrepancies,
    matchingFieldCount = 0,
    onResolve,
}: SnapshotComparisonViewProps) {
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())
    const [resolved, setResolved] = useState<Record<number, 'snapshot' | 'current'>>({})

    const toggleExpand = (i: number) =>
        setExpandedIndices((prev) => {
            const next = new Set(prev)
            next.has(i) ? next.delete(i) : next.add(i)
            return next
        })

    const handleResolve = (i: number, choice: 'snapshot' | 'current') => {
        setResolved((prev) => ({ ...prev, [i]: choice }))
        onResolve?.(i, choice)
    }

    if (discrepancies.length === 0) {
        return (
            <div className="rounded-2xl bg-green-500/5 dark:bg-green-500/10 border border-green-500/30 p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">
                    Snapshot matches current quote
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    No discrepancies detected between the frozen snapshot and the live
                    values.
                </p>
            </div>
        )
    }

    const resolvedCount = Object.keys(resolved).length
    const totalCount = discrepancies.length

    return (
        <div className="rounded-2xl bg-card dark:bg-zinc-800 border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                        Snapshot comparison
                    </p>
                    <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                        {totalCount} discrepanc{totalCount === 1 ? 'y' : 'ies'} detected
                    </p>
                </div>
                {matchingFieldCount > 0 && (
                    <span className="shrink-0 text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 rounded-full bg-muted/50 border border-border">
                        {matchingFieldCount} fields match
                    </span>
                )}
                <span className="shrink-0 text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                    {resolvedCount}/{totalCount} resolved
                </span>
            </div>

            {/* FE-17 Summary banner — counts by type */}
            <div className="flex items-center gap-2 flex-wrap px-5 py-3 bg-muted/20 border-b border-border">
                {(() => {
                    const counts = {
                        price_change: discrepancies.filter(d => d.type === 'price_change').length,
                        quantity_change: discrepancies.filter(d => d.type === 'quantity_change').length,
                        item_added: discrepancies.filter(d => d.type === 'item_added').length,
                        item_removed: discrepancies.filter(d => d.type === 'item_removed').length,
                    }
                    return (
                        <>
                            {counts.price_change > 0 && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                    {counts.price_change} price change{counts.price_change !== 1 ? 's' : ''}
                                </span>
                            )}
                            {counts.quantity_change > 0 && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                    {counts.quantity_change} qty change{counts.quantity_change !== 1 ? 's' : ''}
                                </span>
                            )}
                            {counts.item_added > 0 && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30">
                                    {counts.item_added} added
                                </span>
                            )}
                            {counts.item_removed > 0 && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30">
                                    {counts.item_removed} removed
                                </span>
                            )}
                        </>
                    )
                })()}
            </div>

            {/* Discrepancy rows */}
            <div className="divide-y divide-border">
                {discrepancies.map((d, i) => {
                    const style = SEVERITY_STYLE[d.severity]
                    const expanded = expandedIndices.has(i)
                    const choice = resolved[i]
                    return (
                        <div
                            key={`${d.fieldName}-${i}`}
                            className={clsx('transition-colors', style.bg)}
                        >
                            {/* Row header */}
                            <button
                                type="button"
                                onClick={() => toggleExpand(i)}
                                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/20 transition-colors"
                            >
                                {d.severity === 'CRITICAL' || d.severity === 'HIGH' ? (
                                    <AlertTriangle className={clsx('w-4 h-4 shrink-0', style.text)} />
                                ) : (
                                    <Shield className={clsx('w-4 h-4 shrink-0', style.text)} />
                                )}
                                <span className="flex-1 min-w-0 text-xs font-semibold text-foreground truncate">
                                    {d.fieldName}
                                </span>
                                <span className={clsx('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', style.text, style.border, 'border')}>
                                    {style.label}
                                </span>
                                {choice && (
                                    <span className="text-[9px] font-bold text-green-700 dark:text-green-400 flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                        {choice === 'snapshot' ? 'Snapshot' : 'Current'}
                                    </span>
                                )}
                                <ChevronDown
                                    className={clsx(
                                        'w-3.5 h-3.5 text-muted-foreground transition-transform',
                                        expanded && 'rotate-180'
                                    )}
                                />
                            </button>

                            {/* Expanded detail */}
                            {expanded && (
                                <div className="px-5 pb-4 space-y-3">
                                    {/* Visual diff */}
                                    <DiffViewer
                                        compact
                                        diffs={[
                                            {
                                                field: d.fieldName,
                                                oldValue: d.snapshotValue,
                                                newValue: d.currentValue,
                                                type: d.type === 'item_removed'
                                                    ? 'removed'
                                                    : d.type === 'item_added'
                                                      ? 'added'
                                                      : 'changed',
                                            },
                                        ]}
                                    />

                                    {/* Side-by-side values */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleResolve(i, 'snapshot')}
                                            className={clsx(
                                                'flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all',
                                                choice === 'snapshot'
                                                    ? 'bg-primary/10 border-primary/40 text-foreground ring-2 ring-primary/30'
                                                    : 'bg-card dark:bg-zinc-900 border-border text-muted-foreground hover:border-primary/30'
                                            )}
                                        >
                                            <Lock className="w-3 h-3 shrink-0" />
                                            <div className="text-left min-w-0">
                                                <p className="uppercase tracking-wider">Use snapshot</p>
                                                <p className="font-mono text-foreground truncate mt-0.5">
                                                    {d.snapshotValue}
                                                </p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleResolve(i, 'current')}
                                            className={clsx(
                                                'flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all',
                                                choice === 'current'
                                                    ? 'bg-primary/10 border-primary/40 text-foreground ring-2 ring-primary/30'
                                                    : 'bg-card dark:bg-zinc-900 border-border text-muted-foreground hover:border-primary/30'
                                            )}
                                        >
                                            <Eye className="w-3 h-3 shrink-0" />
                                            <div className="text-left min-w-0">
                                                <p className="uppercase tracking-wider">Use current</p>
                                                <p className="font-mono text-foreground truncate mt-0.5">
                                                    {d.currentValue}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
