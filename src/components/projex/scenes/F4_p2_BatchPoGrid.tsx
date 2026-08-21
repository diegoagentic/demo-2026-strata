/**
 * F84 · F4 p4.2 · Review PIF line items → preview the 26 generated POs.
 *
 * F84.33 · Diego 2026-08-21 · 2-phase scene with proper bulk PO batch
 * grid: presenter reviews the PIF in the Document Review modal, closes
 * it, then sees ALL 26 vendor POs with per-card management actions
 * (View items · Remove) plus a bulk "Send batch by email" CTA. Replaced
 * the earlier PODraftsListPage rendering (only 4 mocks, no Remove) with
 * a scene-local grid so Diego can walk the full batch on stage.
 */

import { useMemo, useState } from 'react'
import {
    ArrowRight, ChevronDown, ChevronUp, FileText, Package, Search, Send, Trash2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import DocumentReviewModal from '../../../vendor/prod-imports/deps/ocr/DocumentReviewModal'
import type { OcrDocCardData } from '../../../vendor/prod-imports/deps/ocr/OcrDocCard'

const MWH_PIF_DOC: OcrDocCardData = {
    id: 'MWH-PIF-2026-08-14',
    name: 'MWH_PIF_2026-08-14.xlsx',
    vendor: 'Aspire Design · Lead Designer',
    type: 'Purchase Order',
    status: 'capturing',
    lineItems: 300,
    date: '2026-08-14',
}

interface DraftPO {
    id: string
    vendor: string
    initials: string
    tone: 'tek' | 'hbf' | 'boss' | 'ala' | 'nel' | 'wes' | 'aux'
    lines: number
    amount: number
}

const BATCH: DraftPO[] = [
    { id: 'PO-2026-4501', vendor: 'Teknion',            initials: 'TK', tone: 'tek', lines: 84, amount:  62450 },
    { id: 'PO-2026-4502', vendor: 'Teknion',            initials: 'TK', tone: 'tek', lines: 44, amount:  28100 },
    { id: 'PO-2026-4508', vendor: 'Teknion',            initials: 'TK', tone: 'tek', lines: 24, amount:  14200 },
    { id: 'PO-2026-4512', vendor: 'Teknion',            initials: 'TK', tone: 'tek', lines: 18, amount:  12440 },
    { id: 'PO-2026-4503', vendor: 'HBF',                initials: 'HB', tone: 'hbf', lines: 22, amount:  18420 },
    { id: 'PO-2026-4509', vendor: 'HBF',                initials: 'HB', tone: 'hbf', lines: 11, amount:   7820 },
    { id: 'PO-2026-4504', vendor: 'Boss Design',        initials: 'BD', tone: 'boss', lines: 12, amount:   9220 },
    { id: 'PO-2026-4514', vendor: 'Boss Design',        initials: 'BD', tone: 'boss', lines:  4, amount:   4980 },
    { id: 'PO-2026-4505', vendor: 'Alamir',             initials: 'AL', tone: 'ala', lines:  9, amount:   6340 },
    { id: 'PO-2026-4506', vendor: 'Alamir',             initials: 'AL', tone: 'ala', lines:  6, amount:   6120 },
    { id: 'PO-2026-4507', vendor: 'Alamir',             initials: 'AL', tone: 'ala', lines:  4, amount:   4980 },
    { id: 'PO-2026-4510', vendor: 'Nelson',             initials: 'NC', tone: 'nel', lines: 10, amount:   7220 },
    { id: 'PO-2026-4515', vendor: 'Nelson',             initials: 'NC', tone: 'nel', lines:  6, amount:   4920 },
    { id: 'PO-2026-4511', vendor: 'West Elm Contract',  initials: 'WE', tone: 'wes', lines:  7, amount:   5680 },
    { id: 'PO-2026-4516', vendor: 'West Elm Contract',  initials: 'WE', tone: 'wes', lines:  4, amount:   4180 },
    { id: 'PO-2026-4517', vendor: 'Herman Miller',      initials: 'HM', tone: 'aux', lines:  6, amount:  12480 },
    { id: 'PO-2026-4518', vendor: 'Herman Miller',      initials: 'HM', tone: 'aux', lines:  3, amount:   8620 },
    { id: 'PO-2026-4519', vendor: 'Knoll',              initials: 'KN', tone: 'aux', lines:  5, amount:   7120 },
    { id: 'PO-2026-4520', vendor: 'Steelcase',          initials: 'SC', tone: 'aux', lines:  4, amount:   6340 },
    { id: 'PO-2026-4521', vendor: 'Haworth',            initials: 'HW', tone: 'aux', lines:  3, amount:   4820 },
    { id: 'PO-2026-4522', vendor: 'Bernhardt',          initials: 'BE', tone: 'aux', lines:  3, amount:   3960 },
    { id: 'PO-2026-4523', vendor: 'Coalesse',           initials: 'CO', tone: 'aux', lines:  2, amount:   2740 },
    { id: 'PO-2026-4524', vendor: 'Global',             initials: 'GL', tone: 'aux', lines:  2, amount:   2280 },
    { id: 'PO-2026-4525', vendor: 'AIS Furniture',      initials: 'AI', tone: 'aux', lines:  2, amount:   1820 },
    { id: 'PO-2026-4526', vendor: 'Kimball',            initials: 'KI', tone: 'aux', lines:  1, amount:   1420 },
    { id: 'PO-2026-4527', vendor: 'HON',                initials: 'HN', tone: 'aux', lines:  1, amount:    980 },
]

const TONE_CLASSES: Record<DraftPO['tone'], string> = {
    tek:  'bg-primary/25 text-foreground',
    hbf:  'bg-info/20 text-info',
    boss: 'bg-warning/20 text-warning',
    ala:  'bg-success/20 text-success',
    nel:  'bg-ai/20 text-ai',
    wes:  'bg-destructive/15 text-destructive',
    aux:  'bg-muted text-muted-foreground',
}

function currency(n: number) {
    return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
}

export default function F4_p2_BatchPoGrid() {
    const { nextStep } = useDemo()
    const [reviewOpen, setReviewOpen] = useState(true)
    const [pos, setPos] = useState<DraftPO[]>(BATCH)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    // F84.34 · Diego 2026-08-21 · replaced overlay preview with inline
    // accordion. Overlay was pulling focus off the demo context and
    // reading like the presenter had navigated out. Accordion keeps the
    // presenter in the same grid · expand a card to walk items in place.
    const [expanded, setExpanded] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [vendorFilter, setVendorFilter] = useState<string>('ALL')

    const filtered = useMemo(() => {
        return pos.filter(p => {
            if (vendorFilter !== 'ALL' && p.vendor !== vendorFilter) return false
            if (search && !`${p.vendor} ${p.id}`.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [pos, search, vendorFilter])

    const totals = useMemo(() => ({
        count: pos.length,
        lines: pos.reduce((s, p) => s + p.lines, 0),
        amount: pos.reduce((s, p) => s + p.amount, 0),
    }), [pos])

    const vendors = useMemo(() => Array.from(new Set(pos.map(p => p.vendor))), [pos])

    const removePO = (id: string) => {
        setPos(prev => prev.filter(p => p.id !== id))
        setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
    }
    const removeSelected = () => {
        setPos(prev => prev.filter(p => !selected.has(p.id)))
        setSelected(new Set())
    }
    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const n = new Set(prev)
            if (n.has(id)) n.delete(id); else n.add(id)
            return n
        })
    }
    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const n = new Set(prev)
            if (n.has(id)) n.delete(id); else n.add(id)
            return n
        })
    }

    return (
        <div className="relative min-h-screen bg-background">
            {reviewOpen && (
                <>
                    <ExpertHubTransactionsWrapper />
                    <DocumentReviewModal
                        isOpen={reviewOpen}
                        onClose={() => setReviewOpen(false)}
                        doc={MWH_PIF_DOC}
                    />
                </>
            )}

            {!reviewOpen && (
                <div className="min-h-screen bg-background p-6 pb-32 space-y-4">
                    {/* Header · icon + short title + status pill · muted meta strip */}
                    <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Package className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                            <h2 className="text-base font-bold text-foreground">PO batch · MWH residential · draft</h2>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-ai/15 text-ai">
                                {totals.count} vendor POs · ready to review
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>Source: <span className="font-mono text-foreground font-semibold">MWH_PIF_2026-08-14.xlsx</span></span>
                            <span>·</span>
                            <span className="tabular-nums">{totals.lines} lines total</span>
                            <span>·</span>
                            <span className="tabular-nums text-foreground font-semibold">{currency(totals.amount)}</span>
                            <span>·</span>
                            <span>Never one-batch button · FC6 · Coordinator sends per-vendor</span>
                        </div>
                    </div>

                    {/* Toolbar · search · vendor filter · bulk actions */}
                    <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-2 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search PO # or vendor…"
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={vendorFilter}
                                onChange={e => setVendorFilter(e.target.value)}
                                className="pl-3 pr-8 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 appearance-none"
                            >
                                <option value="ALL">All vendors</option>
                                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
                        </div>
                        {selected.size > 0 && (
                            <button
                                onClick={removeSelected}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-background hover:bg-destructive/5 border border-destructive/40 rounded-lg px-3 py-1.5 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Remove {selected.size} selected
                            </button>
                        )}
                        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                            Showing {filtered.length} of {totals.count}
                        </span>
                    </div>

                    {/* PO grid · 3-col on lg · per-card collapsible accordion for items + Remove */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map(po => {
                            const isSelected = selected.has(po.id)
                            const isExpanded = expanded.has(po.id)
                            const previewLines = Math.min(5, po.lines)
                            return (
                                <div
                                    key={po.id}
                                    className={`bg-card border rounded-xl p-3 space-y-3 transition-colors ${isSelected ? 'border-primary/60 ring-2 ring-primary/20' : isExpanded ? 'border-ai/40' : 'border-border hover:border-primary/40'}`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(po.id)}
                                            className="mt-1 h-3.5 w-3.5 rounded border-input focus-visible:ring-primary/40"
                                            aria-label={`Select ${po.id}`}
                                        />
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${TONE_CLASSES[po.tone]}`}>
                                            <span className="text-[10px] font-black">{po.initials}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground truncate">{po.vendor}</div>
                                            <div className="text-[10px] font-mono text-muted-foreground">{po.id}</div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ai bg-ai/10 rounded-md px-1.5 py-0.5 shrink-0">
                                            Draft
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded-md bg-muted/40 px-2 py-1.5">
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Lines</div>
                                            <div className="text-foreground font-bold tabular-nums">{po.lines}</div>
                                        </div>
                                        <div className="rounded-md bg-muted/40 px-2 py-1.5">
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Amount</div>
                                            <div className="text-foreground font-bold tabular-nums">{currency(po.amount)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => toggleExpand(po.id)}
                                            aria-expanded={isExpanded}
                                            aria-controls={`items-${po.id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2 py-1.5 transition-colors"
                                        >
                                            <FileText className="h-3 w-3" aria-hidden="true" />
                                            {isExpanded ? 'Hide items' : 'View items'}
                                            {isExpanded
                                                ? <ChevronUp className="h-3 w-3" aria-hidden="true" />
                                                : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
                                        </button>
                                        <button
                                            onClick={() => removePO(po.id)}
                                            className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-destructive bg-background hover:bg-destructive/5 border border-destructive/40 rounded-md px-2 py-1.5 transition-colors"
                                            title="Remove from batch"
                                            aria-label={`Remove ${po.id} from batch`}
                                        >
                                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                                        </button>
                                    </div>
                                    {isExpanded && (
                                        <div
                                            id={`items-${po.id}`}
                                            className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
                                        >
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                Preview · first {previewLines} of {po.lines} lines
                                            </div>
                                            {Array.from({ length: previewLines }).map((_, i) => (
                                                <div key={i} className="flex items-center justify-between gap-2 py-1 border-b last:border-b-0 border-border/60">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[11px] text-foreground font-medium truncate">
                                                            {['Task chair · black mesh', 'Workstation · 66"×24"', 'Storage tower · 5-shelf', 'Panel · velum · 42"', 'Monitor arm · dual'][i]}
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground font-mono truncate">
                                                            {po.id.replace('PO-', 'ITM-')}-{String(i + 1).padStart(3, '0')}
                                                        </div>
                                                    </div>
                                                    <div className="tabular-nums text-[11px] text-foreground font-semibold shrink-0">
                                                        {currency(Math.round(po.amount / po.lines))}
                                                    </div>
                                                </div>
                                            ))}
                                            {po.lines > previewLines && (
                                                <div className="text-[10px] text-muted-foreground italic pt-1">
                                                    +{po.lines - previewLines} more lines · full PDF attached on send.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {pos.length === 0 && (
                        <div className="text-center text-muted-foreground py-12 text-sm">
                            Batch is empty · all POs removed. Cancel or restart to regenerate.
                        </div>
                    )}
                </div>
            )}

            {/* Continue CTA · advance to Send email · disabled when batch empty */}
            {!reviewOpen && (
                <div className="fixed bottom-6 right-6 z-40 bg-card border-2 border-ai/40 rounded-2xl shadow-2xl overflow-hidden w-[380px]">
                    <div className="bg-ai-light px-4 py-3 flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-ai/20 flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-ai" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-ai">
                                {totals.count} POs · {currency(totals.amount)}
                            </div>
                            <p className="text-xs text-foreground font-semibold mt-0.5">Ready for email dispatch</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={nextStep}
                            disabled={pos.length === 0}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            Continue · Send PO batch by email
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
