/**
 * COMPONENT: APLineItemMatchScene (Projex · p1.3)
 * PURPOSE: Strata runs line-item comparison of the vendor bill vs NetSuite PO ·
 *          exact-to-the-penny rule (Jacob's hard rule). 12 lines match · 2 qty
 *          mismatch (partial ship) · 1 price variance (penny rounding).
 *          Daniel picks override reason from Jacob's cause taxonomy: tax rate
 *          changed · out of stock · substitution · penny rounding · partial ship.
 *          Multi-Line Edit tool visible as Projex's current NetSuite workaround.
 *
 * DS TOKENS: bg-card · bg-success/10 + text-success · bg-warning/10 + text-warning ·
 *            border-border · left-border accent per row status · text-muted-foreground
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · Jacob's mismatch cause taxonomy
 * REUSE FROM: mbi/NonEDIReconcilerScene.tsx (row-by-row diff shape · override modal)
 */

import { useEffect, useMemo, useState } from 'react'
import {
    Sparkles, CheckCircle2, AlertTriangle, X, ArrowRight,
    Loader2, ScrollText, Wrench, Play, RefreshCw,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_BILLS_OVERNIGHT, type BillLineItem } from '../../../config/profiles/projex-data/bills'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

// Bill 8483 = the partial-ship mismatch (Teknion · NCBA · 15 sample lines)
const MISMATCH_BILL_ID = 'PJX-BILL-8483'

// Jacob's mismatch cause taxonomy (his own words · SOT §12a)
const CAUSES: { id: NonNullable<BillLineItem['mismatchCause']>; label: string; hint: string }[] = [
    { id: 'partial-ship',     label: 'Partial ship',       hint: 'Vendor split-shipped · backorder on the way' },
    { id: 'penny-rounding',   label: 'Penny rounding',     hint: 'Rounding delta · Jacob\'s common cause' },
    { id: 'tax-rate-change',  label: 'Tax rate changed',   hint: 'State/local rate updated since PO issue' },
    { id: 'out-of-stock',     label: 'Out of stock',       hint: 'Vendor OOS · reduce quantity' },
    { id: 'substitution',     label: 'Substitution',       hint: 'Vendor swapped color/material' },
]

// ─── Row (staged reveal · left-border accent per status) ──────────────────────

function LineRow({ line, revealed, onFlag, resolved }: {
    line: BillLineItem
    revealed: boolean
    onFlag: () => void
    resolved: boolean
}) {
    const borderCls = {
        'exact':          'border-l-success/60',
        'qty-mismatch':   'border-l-warning',
        'price-mismatch': 'border-l-warning',
        'substitution':   'border-l-warning',
    }[line.match]

    const bgCls = line.match === 'exact' ? 'bg-card' : 'bg-warning/5'

    const rowClsFinal = resolved ? 'border-l-success/60 bg-success/5' : `${borderCls} ${bgCls}`

    return (
        <div
            className={`
                grid grid-cols-[36px_1fr_88px_100px_100px_120px] items-center gap-2 px-2 py-2 border-l-2 border-y border-r border-border rounded-r-md text-xs
                transition-all duration-300
                ${revealed ? 'opacity-100' : 'opacity-0'}
                ${rowClsFinal}
            `}
        >
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums text-right pr-1">
                {line.lineNumber}
            </span>
            <div className="min-w-0">
                <div className="text-foreground font-medium truncate">{line.description}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{line.itemCode}</div>
            </div>
            <div className="text-right tabular-nums">
                <div className="text-[10px] text-muted-foreground">PO</div>
                <div className="text-foreground">
                    {line.orderedQty} × ${line.orderedPrice.toFixed(2)}
                </div>
            </div>
            <div className="text-right tabular-nums">
                <div className="text-[10px] text-muted-foreground">Bill</div>
                <div className={line.match === 'exact' ? 'text-foreground' : 'text-warning font-semibold'}>
                    {line.billedQty} × ${line.billedPrice.toFixed(2)}
                </div>
            </div>
            <div className="text-right tabular-nums font-semibold text-foreground">
                ${(line.billedQty * line.billedPrice).toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1">
                {resolved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Resolved
                    </span>
                ) : line.match === 'exact' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Match
                    </span>
                ) : (
                    <button
                        onClick={onFlag}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 hover:bg-warning/20 rounded px-1.5 py-1 transition-colors"
                    >
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Pick cause
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Cause modal ──────────────────────────────────────────────────────────────

function CauseModal({ line, onCancel, onConfirm }: {
    line: BillLineItem
    onCancel: () => void
    onConfirm: (cause: NonNullable<BillLineItem['mismatchCause']>) => void
}) {
    const [selected, setSelected] = useState<NonNullable<BillLineItem['mismatchCause']> | null>(line.mismatchCause ?? null)

    return (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mismatch cause · Jacob's taxonomy</div>
                        <div className="text-sm font-semibold text-foreground mt-0.5">
                            Line {line.lineNumber} · {line.description}
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="px-5 py-3 bg-muted/20 border-b border-border text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span>PO · <span className="text-foreground tabular-nums">{line.orderedQty}</span> × ${line.orderedPrice.toFixed(2)}</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        <span>Bill · <span className="text-warning tabular-nums font-semibold">{line.billedQty}</span> × ${line.billedPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-5 space-y-2 max-h-[50vh] overflow-y-auto">
                    {CAUSES.map(c => {
                        const isSelected = selected === c.id
                        return (
                            <button
                                key={c.id}
                                onClick={() => setSelected(c.id)}
                                className={`
                                    w-full text-left rounded-lg border px-3 py-2.5 transition-colors
                                    ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/40'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`h-4 w-4 rounded-full border-2 shrink-0 ${isSelected ? 'border-primary bg-primary' : 'border-border'}`} />
                                    <span className="text-sm font-semibold text-foreground">{c.label}</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1 pl-6">{c.hint}</div>
                            </button>
                        )
                    })}
                </div>

                <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
                    <div className="text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Wrench className="h-3 w-3" aria-hidden="true" /> Uses Projex's Multi-Line Edit tool convention
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onCancel} className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => selected && onConfirm(selected)}
                            disabled={!selected}
                            className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        >
                            Save override
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export default function APLineItemMatchScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const bill = PROJEX_BILLS_OVERNIGHT.find(b => b.id === MISMATCH_BILL_ID)
    const lines = bill?.lineItems ?? []

    // Stagger reveal · one row every ~180ms
    const [revealedCount, setRevealedCount] = useState(0)
    useEffect(() => {
        if (revealedCount >= lines.length) return
        const cancel = pauseAwareTimeout(() => setRevealedCount(n => n + 1), 180)
        return cancel
    }, [revealedCount, lines.length, pauseAwareTimeout])

    // Track resolved (Daniel's overrides)
    const [resolvedLines, setResolvedLines] = useState<Set<number>>(new Set())
    const [openLine, setOpenLine] = useState<BillLineItem | null>(null)

    // Multi-Line Edit tool simulation · Jacob's real NetSuite workaround (SOT §12a)
    // Fires when Daniel confirms all resolved · applies overrides in staged reveal
    // before advancing to p1.4 (install-vendor exception).
    type ApplyState = 'idle' | 'applying' | 'applied'
    const [applyState, setApplyState] = useState<ApplyState>('idle')
    const [applyStep, setApplyStep] = useState(0)

    const mismatchLines = useMemo(
        () => lines.filter(l => l.match !== 'exact'),
        [lines]
    )

    const handleApplyOverrides = () => {
        if (applyState !== 'idle') return
        setApplyState('applying')
        setApplyStep(0)
        // Staged reveal · ~800ms per mismatch line + 600ms wrap
        mismatchLines.forEach((_, i) => {
            pauseAwareTimeout(() => setApplyStep(i + 1), 700 * (i + 1))
        })
        pauseAwareTimeout(
            () => setApplyState('applied'),
            700 * mismatchLines.length + 600
        )
    }

    const stats = useMemo(() => {
        const exact = lines.filter(l => l.match === 'exact').length
        const mismatchOpen = lines.filter(l => l.match !== 'exact' && !resolvedLines.has(l.lineNumber)).length
        const mismatchResolved = lines.filter(l => l.match !== 'exact' && resolvedLines.has(l.lineNumber)).length
        return { exact, mismatchOpen, mismatchResolved, total: lines.length }
    }, [lines, resolvedLines])

    const scanning = revealedCount < lines.length

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
        { sources: [PROJEX_SOURCES.STRATA_MATCHER] },
        { sources: [PROJEX_SOURCES.NETSUITE_BILL] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F1</span>
                    <span>AP intake &amp; matching · step 3</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Live match
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Line-item match to the penny · partial bill + mismatch
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Bill 8483 · Teknion · NCBA · 15 sample lines of the 291-line PO. Jacob's rule: <strong className="text-foreground">match to the penny</strong>. Daniel picks a cause when a line breaks the rule.
                </p>
            </div>

            {/* Stats hero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                            <ScrollText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stats.total}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Sample lines</div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stats.exact}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Match · to the penny</div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-warning/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stats.mismatchOpen}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Mismatch · pick cause</div>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-foreground" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stats.mismatchResolved}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">Overridden · Daniel</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                    {scanning ? (
                        <>
                            <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-ai">
                                Strata matching {revealedCount} / {lines.length}…
                            </span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                                Match complete · {stats.exact} to the penny · {stats.mismatchOpen} awaiting Daniel
                            </span>
                        </>
                    )}
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">PO-2026-4421 · NCBA</span>
                </div>
                <div className="p-3 space-y-1.5 max-h-[520px] overflow-y-auto">
                    {lines.map((line, i) => (
                        <LineRow
                            key={line.lineNumber}
                            line={line}
                            revealed={i < revealedCount}
                            resolved={resolvedLines.has(line.lineNumber)}
                            onFlag={() => setOpenLine(line)}
                        />
                    ))}
                </div>
                {stats.mismatchOpen === 0 && !scanning && applyState === 'idle' && (
                    <div className="px-4 py-3 border-t border-border bg-success/5 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        <span className="text-xs text-foreground">
                            All {mismatchLines.length} mismatches classified · ready to write overrides back to NetSuite.
                        </span>
                        <button
                            onClick={handleApplyOverrides}
                            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-1.5 px-3 hover:opacity-90 transition-opacity"
                        >
                            <Play className="h-3 w-3" aria-hidden="true" />
                            Apply overrides via Multi-Line Edit tool
                        </button>
                    </div>
                )}
            </div>

            {/* Multi-Line Edit tool · staged reveal (SOT §12a · Jacob's real NetSuite workaround) */}
            {applyState !== 'idle' && (
                <div className="rounded-2xl border border-ai/30 bg-ai/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-4 py-2.5 border-b border-ai/20 bg-ai-light/40 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ai">
                            Multi-Line Edit tool · applying to NetSuite PO-2026-4421
                        </span>
                        {applyState === 'applying' && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ai">
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                Live
                            </span>
                        )}
                        {applyState === 'applied' && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Done
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-muted">
                        <div
                            className="h-full bg-ai transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (applyStep / Math.max(1, mismatchLines.length)) * 100)}%`,
                            }}
                        />
                    </div>

                    {/* Line-by-line staged reveal */}
                    <div className="p-4 space-y-1.5">
                        {mismatchLines.map((ln, i) => {
                            const isDone = applyStep > i
                            const isActive = applyStep === i && applyState === 'applying'
                            const pending = applyStep < i && applyState === 'applying'
                            return (
                                <div
                                    key={ln.lineNumber}
                                    className={`
                                        flex items-center gap-2 text-xs transition-opacity duration-300
                                        ${pending ? 'opacity-40' : 'opacity-100'}
                                    `}
                                >
                                    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />}
                                    {isActive && <Loader2 className="h-3.5 w-3.5 text-ai animate-spin shrink-0" aria-hidden="true" />}
                                    {pending && <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" aria-hidden="true" />}
                                    <span className={isDone ? 'text-foreground' : isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                                        Line {ln.lineNumber} · {ln.itemCode} · override cause:{' '}
                                        <span className="font-mono text-[10px]">{ln.mismatchCause ?? 'partial-ship'}</span>
                                    </span>
                                    <span className="ml-auto tabular-nums text-muted-foreground text-[10px]">
                                        {ln.orderedQty} → {ln.billedQty} @ ${ln.billedPrice.toFixed(2)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Applied · summary + next CTA */}
                    {applyState === 'applied' && (
                        <div className="px-4 py-3 border-t border-ai/20 bg-success/5 flex items-center gap-2 animate-in fade-in duration-400">
                            <RefreshCw className="h-4 w-4 text-success" aria-hidden="true" />
                            <span className="text-xs text-foreground">
                                NetSuite PO-2026-4421 updated · bill total recomputed to <span className="tabular-nums font-semibold">$8,410.75</span> · install-vendor bill (WBD) still needs PM confirmation.
                            </span>
                            <button
                                onClick={nextStep}
                                className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-1.5 px-3 hover:opacity-80 transition-opacity"
                            >
                                Handle install-vendor exception
                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Match pipeline · Jacob's rule" />

            {openLine && (
                <CauseModal
                    line={openLine}
                    onCancel={() => setOpenLine(null)}
                    onConfirm={(cause) => {
                        // Persist as resolved (cause is captured in the taxonomy · demo only)
                        void cause
                        setResolvedLines(prev => new Set([...prev, openLine.lineNumber]))
                        setOpenLine(null)
                    }}
                />
            )}
        </div>
    )
}
