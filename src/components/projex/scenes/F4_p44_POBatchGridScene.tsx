/**
 * COMPONENT: F4_p44_POBatchGridScene (Projex · p4.4)
 * PURPOSE: 26 PO tiles flat batch grid multi-vendor. Per-card DiffViewer inline
 *          muestra auto-draft vs prior human baseline. Never one-batch button.
 *
 * SHAPE · flat batch grid 26 tiles (F4 primary shape · anti-collision con kanban)
 * REUSE · UI-Dealer/po-conversion/PODraftsListPage shape (lifted) + DiffViewer
 * NOTIF · dispatchea `projex:batch-reviewed` on any card review
 */

import { useState } from 'react'
import {
    Package, Filter, Search, MoreHorizontal, ArrowRight,
    CheckCircle2, AlertTriangle, Eye, DollarSign, Building2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_PO_BATCH, MWH_TOTALS, type POBatchItem } from '../../../config/profiles/projex-data/mwhPif'

const VENDOR_AVATAR: Record<string, { bg: string; text: string }> = {
    TEK: { bg: 'bg-primary/25',    text: 'text-foreground' },
    HBF: { bg: 'bg-info/15',       text: 'text-info' },
    BDG: { bg: 'bg-ai/15',         text: 'text-ai' },
    ALA: { bg: 'bg-success/15',    text: 'text-success' },
    NLC: { bg: 'bg-warning/15',    text: 'text-warning' },
    WEL: { bg: 'bg-muted',         text: 'text-muted-foreground' },
}

export default function F4_p44_POBatchGridScene() {
    const { nextStep } = useDemo()

    const [vendorFilter, setVendorFilter] = useState<'all' | string>('all')
    const [selectedPO, setSelectedPO] = useState<POBatchItem | null>(null)

    const filteredBatch = vendorFilter === 'all'
        ? MWH_PO_BATCH
        : MWH_PO_BATCH.filter(p => p.vendorCode === vendorFilter)

    const vendors = Array.from(new Set(MWH_PO_BATCH.map(p => p.vendorCode)))
    const totalBatchAmount = MWH_PO_BATCH.reduce((s, p) => s + p.amount, 0) + 76540 // + hidden POs approx

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
        { sources: [PROJEX_SOURCES.STRATA_COMPOSER] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                        <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                        <span>Order &amp; PO dispatch · step 4</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                            <Package className="h-3 w-3" aria-hidden="true" /> 26 PO batch
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Batch PO drafts · 26 tiles multi-vendor · DiffViewer inline
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Never one-batch button (FC6 fix) · per-card review · Isabella opens each PO for DiffViewer + release intent.
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Batch total</div>
                    <div className="text-sm font-semibold text-foreground tabular-nums">${totalBatchAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">26 POs · MWH residential</div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
                <div className="flex gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
                    <button
                        onClick={() => setVendorFilter('all')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                            vendorFilter === 'all'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                        }`}
                    >
                        All ({MWH_PO_BATCH.length})
                    </button>
                    {vendors.map(v => {
                        const count = MWH_PO_BATCH.filter(p => p.vendorCode === v).length
                        return (
                            <button
                                key={v}
                                onClick={() => setVendorFilter(v)}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                                    vendorFilter === v
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                }`}
                            >
                                {v} ({count})
                            </button>
                        )
                    })}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Search PO # or vendor…"
                        className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                    />
                </div>
                <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/40 transition-colors" aria-label="More filters">
                    <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>

            {/* 26 PO tiles grid · 12 visible + 14 batched */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredBatch.map(po => {
                    const avatar = VENDOR_AVATAR[po.vendorCode]
                    const isSelected = selectedPO?.poNumber === po.poNumber
                    return (
                        <button
                            key={po.poNumber}
                            onClick={() => setSelectedPO(isSelected ? null : po)}
                            className={`
                                text-left rounded-2xl border bg-card p-4 space-y-3 shadow-sm transition-all
                                ${isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-primary/40'}
                            `}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={`h-8 w-8 rounded-full ${avatar.bg} flex items-center justify-center shrink-0 ring-2 ring-card`}>
                                    <span className={`text-[10px] font-black ${avatar.text}`}>{po.vendorCode}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-foreground truncate">{po.vendorName}</div>
                                    <span className="text-[10px] text-muted-foreground font-mono truncate block">{po.poNumber}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-semibold text-foreground tabular-nums">${po.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Lines</span>
                                    <span className="text-foreground tabular-nums">{po.lineCount}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed truncate">{po.method}</p>
                            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full border px-2 py-0.5 ${
                                    po.status === 'draft' ? 'bg-muted text-muted-foreground border-border' : 'bg-success/10 text-success border-success/20'
                                }`}>
                                    {po.status === 'draft' ? 'Draft ready' : po.status}
                                </span>
                                {po.diffFromBaseline !== undefined && po.diffFromBaseline > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                        <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                                        {po.diffFromBaseline} diff
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}

                {/* +14 batched placeholder card */}
                {vendorFilter === 'all' && (
                    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-4 flex flex-col items-center justify-center text-center min-h-[180px]">
                        <MoreHorizontal className="h-6 w-6 text-muted-foreground mb-2" aria-hidden="true" />
                        <div className="text-sm text-foreground font-semibold">+14 more POs batched</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Ready for review on demand</div>
                    </div>
                )}
            </div>

            {/* Selected PO · DiffViewer preview */}
            {selectedPO && (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                            DiffViewer · {selectedPO.poNumber} · auto-draft vs prior human baseline
                        </span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Auto-draft (Strata)</div>
                            <div className="rounded-lg bg-card border border-border p-3 space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="text-foreground">{selectedPO.vendorName}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Lines</span><span className="text-foreground tabular-nums">{selectedPO.lineCount}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-foreground tabular-nums">${selectedPO.amount.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">{selectedPO.method}</span></div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Prior baseline (human)</div>
                            <div className="rounded-lg bg-card border border-border p-3 space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="text-foreground">{selectedPO.vendorName}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Lines</span><span className="text-foreground tabular-nums">
                                    {selectedPO.diffFromBaseline ? selectedPO.lineCount - selectedPO.diffFromBaseline : selectedPO.lineCount}
                                    {selectedPO.diffFromBaseline ? <span className="text-warning ml-1">(+{selectedPO.diffFromBaseline} in draft)</span> : null}
                                </span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-foreground tabular-nums">${Math.round(selectedPO.amount * 0.97).toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">{selectedPO.method}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advance CTA */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Per-vendor release · never one-batch (FC6 fix)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Click cards to explore diffs · Isabella sends per-vendor en next step (Teknion primero via SIF · rest per delivery timing).
                    </div>
                </div>
                <button
                    onClick={nextStep}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                >
                    Open per-vendor send
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

            <DataSourcesBar groups={dataGroups} label="PO batch · 26 draft grid → per-vendor DiffViewer" />
        </div>
    )
}
