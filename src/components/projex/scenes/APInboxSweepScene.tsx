/**
 * COMPONENT: APInboxSweepScene (Projex · p1.1)
 * PURPOSE: Daniel opens Strata para su AP day. Overnight sweep de 14 bills:
 *          12 auto-matched exact-to-the-penny · 2 exceptions surface at the top.
 *          KPI hero counters animate with tabular-nums · kanban shows
 *          Just-Arrived → In Review → Ready to Save → Held.
 *
 *          Kanban visual match a los otros funnels DS (BFIProcessKanban /
 *          Recent-Orders-style · rounded-2xl cards · avatar initials ·
 *          Amount+PO# rows · status pill abajo · MoreHorizontal en col header).
 *
 *          NOTIFICATIONS · el "12/14 matched" banner + CTA vive en el Action
 *          Center vía `PROJEX_STEP_NOTIFICATIONS['p1.1']` en ActionCenter.tsx.
 *          Esta scene solo escucha el CustomEvent `projex:ap-open-teknion`
 *          para avanzar al p1.2 · nunca monta toasts custom (MEMORY rule ·
 *          feedback-notifications-action-center).
 *
 * DS TOKENS: bg-card · bg-primary · bg-ai-light + text-ai · bg-success/10 + text-success ·
 *            border-border · text-muted-foreground · tabular-nums
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · Jacob's vocab · "AP inbox" · "match to the penny"
 * REUSE FROM: bfi/BFIProcessKanban.tsx (card shape · column header) ·
 *             notifications/ActionCenter.tsx (notif catalog · Projex block)
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, Mail, Loader2, CheckCircle2, AlertTriangle,
    Building2, Clock, DollarSign, Percent, ShieldAlert, MoreHorizontal,
    Search, ArrowRight,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_BILLS_OVERNIGHT, PROJEX_MORNING_SUMMARY, type Bill } from '../../../config/profiles/projex-data/bills'
import { PROJEX_VENDORS, PROJEX_VENDOR_TOTALS } from '../../../config/profiles/projex-data/vendors'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

// ─── Column layout ─────────────────────────────────────────────────────────────

type ColumnId = 'just-arrived' | 'in-review' | 'ready-to-save' | 'held'

const COLUMNS: { id: ColumnId; label: string; description: string }[] = [
    { id: 'just-arrived',  label: 'Just arrived',   description: 'Overnight sweep' },
    { id: 'in-review',     label: 'Strata matching', description: 'Line-item · to the penny' },
    { id: 'ready-to-save', label: 'Ready to save',   description: 'Daniel to confirm' },
    { id: 'held',          label: 'Held bills',      description: 'Needs eyes' },
]

function classifyForKanban(bill: Bill): ColumnId {
    if (bill.status === 'held-no-po') return 'held'
    if (bill.status === 'mismatch') return 'in-review'
    if (bill.status === 'auto-matched') return 'ready-to-save'
    return 'just-arrived'
}

// Avatar color mapping · one hue per vendor (semantic-neutral · stable identity)
const VENDOR_AVATAR: Record<string, { bg: string; text: string }> = {
    'teknion':              { bg: 'bg-primary/25',     text: 'text-foreground' },
    'hbf':                  { bg: 'bg-info/15',        text: 'text-info' },
    'boss-design':          { bg: 'bg-ai/15',          text: 'text-ai' },
    'alamir':               { bg: 'bg-success/15',     text: 'text-success' },
    'nelson':               { bg: 'bg-warning/15',     text: 'text-warning' },
    'west-elm':             { bg: 'bg-muted',          text: 'text-muted-foreground' },
    'warehouse-by-design':  { bg: 'bg-destructive/15', text: 'text-destructive' },
    'clear-space':          { bg: 'bg-destructive/15', text: 'text-destructive' },
    'digital-interior':     { bg: 'bg-destructive/15', text: 'text-destructive' },
    'ryans-carpentry':      { bg: 'bg-muted',          text: 'text-muted-foreground' },
}

function vendorInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(w => w.length > 0 && !['and', '&', 'by', 'of', 'the'].includes(w.toLowerCase()))
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('') || '??'
}

// ─── KPI hero counter (tabular-nums · animate up from 0 to target) ────────────

function useCountUp(target: number, durationMs = 900) {
    const { pausedRef } = usePauseAware()
    const [value, setValue] = useState(0)
    useEffect(() => {
        let raf = 0
        const startedAt = performance.now()
        const tick = (now: number) => {
            if (pausedRef.current) {
                raf = requestAnimationFrame(tick)
                return
            }
            const t = Math.min(1, (now - startedAt) / durationMs)
            setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, durationMs, pausedRef])
    return value
}

function KpiCard({ icon: Icon, label, value, suffix, tone = 'default' }: {
    icon: React.ElementType
    label: string
    value: number
    suffix?: string
    tone?: 'default' | 'success' | 'warning' | 'ai'
}) {
    const animated = useCountUp(value)
    const iconTone = {
        default: 'bg-muted text-muted-foreground',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        ai: 'bg-ai-light text-ai',
    }[tone]
    return (
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${iconTone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold text-foreground tabular-nums leading-none">
                    {animated.toLocaleString()}{suffix}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
            </div>
        </div>
    )
}

// ─── Bill card · BFI/Recent-Orders shape ──────────────────────────────────────

function BillCard({ bill, isJustArrived, isHighlighted, onReview }: {
    bill: Bill
    isJustArrived?: boolean
    isHighlighted?: boolean
    onReview?: () => void
}) {
    const vendor = PROJEX_VENDORS.find(v => v.id === bill.vendorId)
    const vendorName = vendor?.name ?? bill.vendorId
    const avatarStyle = VENDOR_AVATAR[bill.vendorId] ?? VENDOR_AVATAR.teknion

    const statusChip = {
        'auto-matched': { text: 'Matched to the penny', cls: 'bg-success/10 text-success border-success/20' },
        'mismatch':     { text: '2 qty · 1 penny variance', cls: 'bg-warning/10 text-warning border-warning/30' },
        'held-no-po':   { text: 'No PO # · PM double-check', cls: 'bg-destructive/10 text-destructive border-destructive/30' },
        'processing':   { text: 'OCR running', cls: 'bg-ai-light text-ai border-ai/30' },
    }[bill.status]

    const showReviewCta = onReview !== undefined

    return (
        <div className={`
            relative rounded-2xl border bg-card p-4 space-y-3 shadow-sm transition-all
            ${isJustArrived ? 'animate-in fade-in slide-in-from-top-2 duration-500 border-border' : 'border-border'}
        `}>
            {isHighlighted && (
                <span className="absolute -inset-1 rounded-2xl bg-ai/15 animate-pulse pointer-events-none" aria-hidden="true" />
            )}

            {/* Header · avatar + vendor + status pill */}
            <div className="relative flex items-start gap-2.5">
                <div className={`h-8 w-8 rounded-full ${avatarStyle.bg} flex items-center justify-center shrink-0 ring-2 ring-card`}>
                    <span className={`text-[10px] font-black ${avatarStyle.text}`}>{vendorInitials(vendorName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-sm font-bold text-foreground truncate">{vendorName}</span>
                        {isJustArrived && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-ai-light text-ai rounded-full px-2 py-0.5 shrink-0">
                                Just arrived
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">{bill.id}</span>
                </div>
            </div>

            {/* Amount + PO row · match Recent Orders shape */}
            <div className="relative space-y-1.5">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground tabular-nums">
                        ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PO #</span>
                    <span className="font-medium text-foreground font-mono truncate ml-2">{bill.poNumber ?? '—'}</span>
                </div>
            </div>

            {/* Project mini-line */}
            <p className="relative text-[11px] text-muted-foreground leading-relaxed truncate">{bill.projectName}</p>

            {/* Footer · status pill + review CTA */}
            <div className="relative pt-2 border-t border-border flex items-center justify-between gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusChip.cls}`}>
                    {statusChip.text}
                </span>
                {showReviewCta ? (
                    <button
                        onClick={onReview}
                        className="py-1.5 px-3 text-[11px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all inline-flex items-center gap-1"
                    >
                        Review
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                ) : (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                        OCR {bill.ocrConfidence}% · {bill.lineCount}L
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Kanban column ─────────────────────────────────────────────────────────────

function KanbanColumn({
    id,
    label,
    description,
    bills,
    justArrivedIds,
    highlightedId,
    onCardReview,
}: {
    id: ColumnId
    label: string
    description: string
    bills: Bill[]
    justArrivedIds: Set<string>
    highlightedId?: string
    onCardReview?: (billId: string) => void
}) {
    return (
        <div className="space-y-3">
            {/* Column header · matches BFI/Recent Orders pattern */}
            <div className="flex items-center justify-between mb-1 px-1">
                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
                    {label}
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full tabular-nums">
                        {bills.length}
                    </span>
                </h4>
                <button
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Column options"
                    aria-label={`${label} column options`}
                >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
            <div className="px-1 -mt-2 mb-1">
                <span className="text-[10px] text-muted-foreground">{description}</span>
            </div>

            {/* Cards */}
            <div className="space-y-3 min-h-[60px]">
                {bills.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                        <p className="text-xs text-muted-foreground">No bills</p>
                    </div>
                ) : (
                    bills.map(b => (
                        <BillCard
                            key={b.id}
                            bill={b}
                            isJustArrived={justArrivedIds.has(b.id)}
                            isHighlighted={highlightedId === b.id}
                            onReview={
                                onCardReview && (id === 'held' || (id === 'in-review' && highlightedId === b.id))
                                    ? () => onCardReview(b.id)
                                    : undefined
                            }
                        />
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Scene shell ──────────────────────────────────────────────────────────────

export default function APInboxSweepScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()

    // 3 phases · matches the Action Center notif cadence (AC opens at ~2s post-step)
    const [phase, setPhase] = useState<'arriving' | 'matched' | 'toast'>('arriving')

    // Choreography: bills "arrive" → matched auto-post (2.4s) → ready-state (3.8s)
    useEffect(() => {
        const cancels: Array<() => void> = []
        cancels.push(pauseAwareTimeout(() => setPhase('matched'), 2400))
        cancels.push(pauseAwareTimeout(() => setPhase('toast'), 3800))
        return () => { cancels.forEach(fn => fn()) }
    }, [pauseAwareTimeout])

    // Action Center CTA → this handler advances to p1.2 (Teknion bill intake).
    // Same handler fires when the user clicks Review on any held/highlighted card.
    useEffect(() => {
        const advance = () => nextStep()
        window.addEventListener('projex:ap-open-teknion', advance)
        return () => window.removeEventListener('projex:ap-open-teknion', advance)
    }, [nextStep])

    const justArrivedIds = phase === 'arriving' ? new Set(PROJEX_BILLS_OVERNIGHT.map(b => b.id)) : new Set<string>()

    // Column bill distribution
    const columnBills: Record<ColumnId, Bill[]> = { 'just-arrived': [], 'in-review': [], 'ready-to-save': [], 'held': [] }
    for (const bill of PROJEX_BILLS_OVERNIGHT) {
        if (phase === 'arriving') {
            columnBills['just-arrived'].push(bill)
        } else {
            columnBills[classifyForKanban(bill)].push(bill)
        }
    }

    // Highlight the two exceptions so Daniel sees them first
    const highlightedId = phase !== 'arriving' ? 'PJX-BILL-8483' : undefined

    const daniel = PROJEX_PERSONAS.daniel
    const jacob = PROJEX_PERSONAS.jacob

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
        { sources: [PROJEX_SOURCES.STRATA_OCR_PJX, PROJEX_SOURCES.STRATA_MATCHER] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO, PROJEX_SOURCES.NETSUITE_BILL] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* ── Header · role banner ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                        <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F1</span>
                        <span>AP intake &amp; matching</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> Live matching
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        AP inbox sweep · 12 overnight matches ready for {daniel.fullName.split(' ')[0]}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {daniel.role} · {jacob.fullName.split(' ')[0]} backs up · 2-person Accounting shop
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Daniel's mornings</div>
                    <div className="text-sm font-semibold text-foreground">
                        ~20 bills/hr easy · 5/hr tough vendors
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
                        Baseline · {PROJEX_VENDOR_TOTALS.billsPerMonthAvg}/mo · Q4 peak {PROJEX_VENDOR_TOTALS.billsPerMonthQ4Peak}
                    </div>
                </div>
            </div>

            {/* ── KPI hero row · 4 counters · tabular-nums · animate up ─────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                    icon={Mail}
                    label="Bills processed overnight"
                    value={PROJEX_MORNING_SUMMARY.totalReceived}
                    tone="ai"
                />
                <KpiCard
                    icon={CheckCircle2}
                    label="Auto-matched · to the penny"
                    value={PROJEX_MORNING_SUMMARY.autoMatched}
                    tone="success"
                />
                <KpiCard
                    icon={AlertTriangle}
                    label="Exceptions · needs eyes"
                    value={PROJEX_MORNING_SUMMARY.exceptions}
                    tone="warning"
                />
                <KpiCard
                    icon={Building2}
                    label="Legal entities in batch"
                    value={3}
                    tone="default"
                />
            </div>

            {/* ── Kanban card · BFI/Recent-Orders shape ─────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Card header · title + status tabs pattern */}
                <div className="px-5 py-4 border-b border-border">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-sm font-semibold text-foreground whitespace-nowrap">Overnight AP inbox</h3>
                            <div className="hidden sm:block w-px h-5 bg-border" />

                            <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                                <button
                                    className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap bg-primary text-primary-foreground shadow-sm"
                                    type="button"
                                >
                                    All
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-foreground/15 text-primary-foreground tabular-nums">
                                        {PROJEX_BILLS_OVERNIGHT.length}
                                    </span>
                                </button>
                                {COLUMNS.map(col => (
                                    <button
                                        key={col.id}
                                        className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-background/60"
                                        type="button"
                                    >
                                        {col.label}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background text-muted-foreground tabular-nums">
                                            {columnBills[col.id].length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search + status row */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="Search bills…"
                                    className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                                {phase === 'arriving' && (
                                    <><Loader2 className="h-3 w-3 text-ai animate-spin" aria-hidden="true" /><span>Sweeping ap@projex-inc.com…</span></>
                                )}
                                {phase === 'matched' && (
                                    <><CheckCircle2 className="h-3 w-3 text-success" aria-hidden="true" /><span>12 matched to the penny · 2 held</span></>
                                )}
                                {phase === 'toast' && (
                                    <><ShieldAlert className="h-3 w-3 text-warning" aria-hidden="true" /><span>2 held bills need review first</span></>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban grid · Recent-Orders pattern */}
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                label={col.label}
                                description={col.description}
                                bills={columnBills[col.id]}
                                justArrivedIds={justArrivedIds}
                                highlightedId={col.id === 'in-review' ? highlightedId : undefined}
                                onCardReview={phase === 'toast' ? () => nextStep() : undefined}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Footer · CEO framing + data sources ──────────────────────── */}
            {/* Notif del sweep vive en el Action Center (bell del navbar) ·
                catalog PROJEX_STEP_NOTIFICATIONS['p1.1'] · dispatchea el evento
                `projex:ap-open-teknion` que este scene escucha para avanzar */}
            <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">CEO framing · Matt Magrann</div>
                    <div className="text-sm text-foreground">"75% AI with the human touch on it."</div>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="text-[10px] text-muted-foreground text-right">
                    <div className="tabular-nums">Sweep · 02:14 → 08:11</div>
                    <div>Daniel opens Strata · 08:14 AM</div>
                </div>
            </div>

            {/* Volume/team breakdown · secondary strip below kanban */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Entity breakdown · today</div>
                    <div className="mt-2 space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-foreground">Projex Inc.</span>
                            <span className="tabular-nums text-muted-foreground">10 bills</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-foreground">Projex Corp.</span>
                            <span className="tabular-nums text-muted-foreground">3 bills</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-foreground">Culture LLC</span>
                            <span className="tabular-nums text-muted-foreground">1 bill</span>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume signal</div>
                    <div className="mt-2 flex items-center gap-2">
                        <Percent className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs text-foreground">
                            5-10% mismatch rate historic · today = <span className="tabular-nums font-semibold">{Math.round(PROJEX_MORNING_SUMMARY.exceptions / PROJEX_MORNING_SUMMARY.totalReceived * 100)}%</span>
                        </span>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Team backup</div>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                            <span className="text-foreground">{daniel.fullName} · lead today</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
                            <span className="text-foreground">{jacob.fullName} · sign-off gate</span>
                        </div>
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="AP inbox pipeline" />
        </div>
    )
}
