/**
 * SDB-1315 · FE-08 — RevisionHistory + Compare Mode
 *
 * Collapsible list of PO revisions with inline DiffViewer per revision.
 * Supports comparing any two revisions side-by-side. Default: latest vs
 * previous (ticket FE-08 requirement).
 */

import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowRight, ChevronDown, GitCompare, History, User } from 'lucide-react'
import type { PORevision, PODiff } from './types'
import DiffViewer from './DiffViewer'

interface RevisionHistoryProps {
    revisions: PORevision[]
    loading?: boolean
}

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

export default function RevisionHistory({
    revisions,
    loading = false,
}: RevisionHistoryProps) {
    const [expandedRevs, setExpandedRevs] = useState<Set<number>>(new Set())
    // Compare mode: select two revisions to diff against each other
    const [compareMode, setCompareMode] = useState(false)
    const [compareA, setCompareA] = useState<number | null>(null)
    const [compareB, setCompareB] = useState<number | null>(null)

    const toggle = (rev: number) =>
        setExpandedRevs((prev) => {
            const next = new Set(prev)
            next.has(rev) ? next.delete(rev) : next.add(rev)
            return next
        })

    const handleCompareSelect = (revNum: number) => {
        if (compareA === null) {
            setCompareA(revNum)
        } else if (compareB === null && revNum !== compareA) {
            setCompareB(revNum)
        } else {
            // Reset and start over
            setCompareA(revNum)
            setCompareB(null)
        }
    }

    // Sort by revision number descending
    const sorted = useMemo(
        () => [...revisions].sort((a, b) => b.revisionNumber - a.revisionNumber),
        [revisions]
    )

    // Compute the diff between two selected revisions
    const comparisonDiffs = useMemo<PODiff[]>(() => {
        if (compareA === null || compareB === null) return []
        const revA = revisions.find((r) => r.revisionNumber === compareA)
        const revB = revisions.find((r) => r.revisionNumber === compareB)
        if (!revA || !revB) return []
        // Merge diffs from both — show all unique fields
        const allFields = new Set([
            ...revA.diffs.map((d) => d.field),
            ...revB.diffs.map((d) => d.field),
        ])
        const diffs: PODiff[] = []
        for (const field of allFields) {
            const dA = revA.diffs.find((d) => d.field === field)
            const dB = revB.diffs.find((d) => d.field === field)
            diffs.push({
                field,
                oldValue: dA?.newValue ?? dA?.oldValue ?? '—',
                newValue: dB?.newValue ?? dB?.oldValue ?? '—',
                type: 'changed',
            })
        }
        return diffs
    }, [compareA, compareB, revisions])

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
            </div>
        )
    }

    if (revisions.length === 0) {
        return (
            <div className="rounded-2xl bg-muted/20 border border-border p-6 text-center">
                <History className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No revisions yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Revisions are created when the PO is edited after finalization.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Compare toolbar */}
            {revisions.length >= 2 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => {
                            setCompareMode((c) => !c)
                            setCompareA(null)
                            setCompareB(null)
                        }}
                        className={clsx(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border',
                            compareMode
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                                : 'bg-card dark:bg-zinc-800 text-muted-foreground border-border hover:border-indigo-500/30'
                        )}
                    >
                        <GitCompare className="w-3.5 h-3.5" />
                        {compareMode ? 'Exit compare' : 'Compare revisions'}
                    </button>
                    {compareMode && (
                        <p className="text-[10px] text-muted-foreground">
                            {compareA === null
                                ? 'Select the first revision'
                                : compareB === null
                                  ? 'Now select the second revision'
                                  : `Comparing R${Math.min(compareA, compareB)} → R${Math.max(compareA, compareB)}`}
                        </p>
                    )}
                </div>
            )}

            {/* Comparison result */}
            {compareMode && compareA !== null && compareB !== null && (
                <div className="rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/30 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-indigo-500/20">
                        <GitCompare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-foreground">
                            R{Math.min(compareA, compareB)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">
                            R{Math.max(compareA, compareB)}
                        </span>
                        <span className="text-[9px] text-muted-foreground ml-auto">
                            {comparisonDiffs.length} field{comparisonDiffs.length !== 1 ? 's' : ''} differ
                        </span>
                    </div>
                    <div className="p-4">
                        <DiffViewer diffs={comparisonDiffs} />
                    </div>
                </div>
            )}

            {/* Revision list */}
            {sorted.map((rev) => {
                const expanded = expandedRevs.has(rev.revisionNumber)
                const isSelectedA = compareA === rev.revisionNumber
                const isSelectedB = compareB === rev.revisionNumber
                const isSelected = isSelectedA || isSelectedB
                return (
                    <div
                        key={rev.revisionNumber}
                        className={clsx(
                            'rounded-xl bg-card dark:bg-zinc-800 border overflow-hidden transition-all',
                            isSelected
                                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20'
                                : 'border-border'
                        )}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                compareMode
                                    ? handleCompareSelect(rev.revisionNumber)
                                    : toggle(rev.revisionNumber)
                            }
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                        >
                            {compareMode && (
                                <div
                                    className={clsx(
                                        'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                        isSelected
                                            ? 'border-indigo-500 bg-indigo-500'
                                            : 'border-border'
                                    )}
                                >
                                    {isSelected && (
                                        <span className="text-[8px] font-black text-white">
                                            {isSelectedA ? 'A' : 'B'}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 tabular-nums">
                                    R{rev.revisionNumber}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {rev.changeSummary}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <User className="w-2.5 h-2.5 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">
                                        {rev.actor} · {fmtDate(rev.timestamp)}
                                    </span>
                                </div>
                            </div>
                            <span className="shrink-0 text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/50 border border-border tabular-nums">
                                {rev.diffs.length} change{rev.diffs.length !== 1 ? 's' : ''}
                            </span>
                            {!compareMode && (
                                <ChevronDown
                                    className={clsx(
                                        'w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0',
                                        expanded && 'rotate-180'
                                    )}
                                />
                            )}
                        </button>

                        {!compareMode && expanded && (
                            <div className="px-4 pb-4 border-t border-border pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <DiffViewer diffs={rev.diffs} />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
