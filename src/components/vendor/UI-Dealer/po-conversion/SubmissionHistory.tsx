/**
 * SDB-1315 · FE-08 — SubmissionHistory
 *
 * Vertical timeline of every vendor submission attempt for a PO.
 * Newest first. Each entry shows timestamp, adapter icon, status badge,
 * and message. Expandable rows reveal full response + error detail.
 *
 * Empty state includes a prompt to finalize the PO first.
 */

import { useState } from 'react'
import { clsx } from 'clsx'
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Globe,
    Loader2,
    Mail,
    MonitorSmartphone,
    Send,
} from 'lucide-react'
import type { POSubmissionAttempt, SubmissionAdapter, SubmissionStatus } from './types'

interface SubmissionHistoryProps {
    attempts: POSubmissionAttempt[]
    loading?: boolean
}

const ADAPTER_ICON: Record<SubmissionAdapter, typeof Send> = {
    edi: MonitorSmartphone,
    email: Mail,
    portal: Globe,
}

const STATUS_STYLE: Record<
    SubmissionStatus,
    { bg: string; text: string; icon: typeof CheckCircle2 }
> = {
    PENDING: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-700 dark:text-blue-400',
        icon: Clock,
    },
    SENT: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        icon: Send,
    },
    DELIVERED: {
        bg: 'bg-green-500/10',
        text: 'text-green-700 dark:text-green-400',
        icon: CheckCircle2,
    },
    FAILED: {
        bg: 'bg-red-500/10',
        text: 'text-red-700 dark:text-red-400',
        icon: AlertTriangle,
    },
}

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

export default function SubmissionHistory({
    attempts,
    loading = false,
}: SubmissionHistoryProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggle = (id: string) =>
        setExpandedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
                ))}
            </div>
        )
    }

    if (attempts.length === 0) {
        return (
            <div className="rounded-2xl bg-muted/20 border border-border p-6 text-center">
                <Send className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">
                    No submissions yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Finalize the PO to enable vendor submission.
                </p>
            </div>
        )
    }

    // Sort newest first
    const sorted = [...attempts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return (
        <div className="relative border-l-2 border-border ml-2 space-y-3 pl-5">
            {sorted.map((attempt) => {
                const style = STATUS_STYLE[attempt.status]
                const StatusIcon = style.icon
                const AdapterIcon = ADAPTER_ICON[attempt.adapter]
                const expanded = expandedIds.has(attempt.id)
                return (
                    <div key={attempt.id} className="relative">
                        {/* Timeline dot */}
                        <span
                            className={clsx(
                                'absolute -left-[1.65rem] top-3 w-3 h-3 rounded-full border-2 bg-card dark:bg-zinc-800',
                                attempt.status === 'DELIVERED'
                                    ? 'border-green-500'
                                    : attempt.status === 'FAILED'
                                      ? 'border-red-500'
                                      : 'border-border'
                            )}
                        />

                        <button
                            type="button"
                            onClick={() => toggle(attempt.id)}
                            className="w-full text-left rounded-xl bg-card dark:bg-zinc-800 border border-border hover:border-border/60 transition-colors overflow-hidden"
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div
                                    className={clsx(
                                        'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                                        style.bg
                                    )}
                                >
                                    <StatusIcon className={clsx('w-4 h-4', style.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-foreground">
                                            {attempt.status}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                            via
                                        </span>
                                        <AdapterIcon className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            {attempt.adapter}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                        {attempt.message || fmtDate(attempt.timestamp)}
                                    </p>
                                </div>
                                <span className="shrink-0 text-[9px] text-muted-foreground tabular-nums">
                                    {fmtDate(attempt.timestamp)}
                                </span>
                                <ChevronDown
                                    className={clsx(
                                        'w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0',
                                        expanded && 'rotate-180'
                                    )}
                                />
                            </div>
                        </button>

                        {/* Expanded detail */}
                        {expanded && (
                            <div className="mt-1 rounded-xl bg-muted/20 border border-border px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {attempt.responseCode && (
                                    <div className="flex items-baseline gap-2 text-[10px]">
                                        <span className="text-muted-foreground">Response code</span>
                                        <span className="font-mono font-semibold text-foreground">
                                            {attempt.responseCode}
                                        </span>
                                    </div>
                                )}
                                {attempt.message && (
                                    <div className="flex items-baseline gap-2 text-[10px]">
                                        <span className="text-muted-foreground">Message</span>
                                        <span className="text-foreground">{attempt.message}</span>
                                    </div>
                                )}
                                {attempt.errorDetail && (
                                    <div className="rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2 text-[10px] text-red-700 dark:text-red-400">
                                        {attempt.errorDetail}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
