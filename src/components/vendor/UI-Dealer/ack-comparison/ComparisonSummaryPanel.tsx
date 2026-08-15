import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import ComparisonStatusBadge, { type ComparisonStatus } from './ComparisonStatusBadge'

// ── Types (aligned with AckReconciliationModal ComparisonField) ──
export interface ComparisonField {
    field: string
    category: 'header' | 'line-item' | 'pricing' | 'logistics' | 'terms'
    poValue: string
    ackValue: string
    status: 'match' | 'mismatch' | 'partial'
    autoFixSuggestion?: string
    confidence?: number
    severity?: 'low' | 'medium' | 'high'
}

export interface AckComparisonReport {
    ackId: string
    poId: string
    vendor: string
    comparisonStatus: ComparisonStatus
    fields: ComparisonField[]
    comparedAt: string
}

interface ComparisonSummaryPanelProps {
    report: AckComparisonReport | null
    loading?: boolean
}

function PanelSkeleton() {
    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
                <div className="h-16 bg-muted rounded-xl" />
            </div>
        </div>
    )
}

function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
    const styles = {
        high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
        medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        low: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    }
    return (
        <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase', styles[severity])}>
            {severity}
        </span>
    )
}

export default function ComparisonSummaryPanel({ report, loading }: ComparisonSummaryPanelProps) {
    // View-only on UI-Dealer: the dealer reviews discrepancies and escalates to
    // Expert Hub. Resolution (Accept ACK / Keep PO) happens in the expert
    // platform, not here.
    const shouldAutoExpand = report?.comparisonStatus === 'MISMATCH' || report?.comparisonStatus === 'PARTIAL_MATCH'
    const [expanded, setExpanded] = useState(shouldAutoExpand)
    const [showFullReport, setShowFullReport] = useState(false)

    if (loading) return <PanelSkeleton />

    if (!report) {
        return (
            <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-5">
                <p className="text-sm text-muted-foreground text-center py-4">No comparison available</p>
            </div>
        )
    }

    const matchCount = report.fields.filter(f => f.status === 'match').length
    const mismatchCount = report.fields.filter(f => f.status === 'mismatch').length
    const partialCount = report.fields.filter(f => f.status === 'partial').length
    const criticalFields = report.fields.filter(f => f.severity === 'high' && f.status !== 'match')
    const allDiscrepancies = report.fields.filter(f => f.status !== 'match')
    const totalFields = report.fields.length

    return (
        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">PO vs ACK Comparison</h3>
                    <ComparisonStatusBadge status={report.comparisonStatus} size="md" />
                    {mismatchCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {mismatchCount} discrepanc{mismatchCount === 1 ? 'y' : 'ies'}
                        </span>
                    )}
                </div>
                {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expanded && (
                <div className="border-t border-border">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-px bg-border">
                        <div className="bg-card dark:bg-zinc-800 p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xl font-bold text-foreground">{matchCount}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">Matched</span>
                        </div>
                        <div className="bg-card dark:bg-zinc-800 p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="text-xl font-bold text-foreground">{partialCount}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">Partial</span>
                        </div>
                        <div className="bg-card dark:bg-zinc-800 p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xl font-bold text-foreground">{mismatchCount}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">Mismatch</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-5 pt-4 pb-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
                            <span>{matchCount}/{totalFields} fields confirmed</span>
                            <span>{Math.round((matchCount / totalFields) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                            <div className="bg-green-500 h-full" style={{ width: `${(matchCount / totalFields) * 100}%` }} />
                            <div className="bg-amber-500 h-full" style={{ width: `${(partialCount / totalFields) * 100}%` }} />
                            <div className="bg-red-500 h-full" style={{ width: `${(mismatchCount / totalFields) * 100}%` }} />
                        </div>
                    </div>

                    {/* Discrepancies List — Critical by default, full report shows all */}
                    {(showFullReport ? allDiscrepancies : criticalFields).length > 0 && (
                        <div className="px-5 pb-4 pt-2">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                {showFullReport ? `All Discrepancies (${allDiscrepancies.length})` : 'Critical Discrepancies'}
                            </h4>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-micro">
                                {(showFullReport ? allDiscrepancies : criticalFields).map((field, i) => (
                                    <div key={i} className={clsx(
                                        "p-3 rounded-xl border",
                                        field.status === 'mismatch'
                                            ? "border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5"
                                            : "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5"
                                    )}>
                                        <div className="flex items-start gap-3">
                                            {field.status === 'mismatch'
                                                ? <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-semibold text-foreground">{field.field}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {field.confidence && <span className="text-[9px] font-medium text-ai">{field.confidence}%</span>}
                                                        {field.severity && <SeverityBadge severity={field.severity} />}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-[11px]">
                                                    <span className="text-muted-foreground">PO: <span className="font-medium text-foreground">{field.poValue}</span></span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className={clsx("font-medium", field.status === 'mismatch' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')}>
                                                        ACK: {field.ackValue}
                                                    </span>
                                                </div>
                                                {field.autoFixSuggestion && (
                                                    <div className="flex items-start gap-1.5 mt-2 text-[10px]">
                                                        <Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-ai" />
                                                        <span className="text-muted-foreground">{field.autoFixSuggestion}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer — read-only on UI-Dealer; resolution is performed in Expert Hub */}
                    <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                            Compared: {report.comparedAt} · {report.ackId} ↔ {report.poId}
                        </span>
                        {allDiscrepancies.length > 0 && (
                            <button
                                onClick={() => setShowFullReport(!showFullReport)}
                                className="text-[10px] font-semibold text-primary hover:underline transition-colors"
                            >
                                {showFullReport ? '← Critical Only' : `View Full Report (${allDiscrepancies.length}) →`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
