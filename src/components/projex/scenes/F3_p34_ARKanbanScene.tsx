/**
 * COMPONENT: F3_p34_ARKanbanScene (Projex · p3.4)
 * PURPOSE: Shared AR aging kanban 4-col por bucket (0-30/31-60/61-90/90+).
 *          Row-per-invoice cards · notes-per-row · ownership assignment.
 *          Replaces dead-tracker (AR3) · Net 10 + 1.5%/mo late fee.
 *
 * SHAPE LOCK · kanban 4-col (F3 primary shape · anti-collision con F1 kanban ·
 * F3 groups por bucket · F1 groups por status)
 * REUSE · mbi/ARStatusBoard shape adapted a bucket taxonomy (net-new per plan)
 * NOTIF · dispatchea `projex:ar-explored` on any card click
 */

import { useMemo, useState } from 'react'
import {
    TrendingUp, Users, Search, Filter, MoreHorizontal, ArrowRight,
    Clock, DollarSign, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_AR_RECORDS, type ARBucket, type ARRecord } from '../../../config/profiles/projex-data/arAging'

const BUCKETS: { id: ARBucket; label: string; description: string; tone: 'success' | 'warning' | 'destructive' }[] = [
    { id: '0-30',  label: '0-30 days',   description: 'Current · watching',       tone: 'success' },
    { id: '31-60', label: '31-60 days',  description: 'Draft friendly follow-up', tone: 'warning' },
    { id: '61-90', label: '61-90 days',  description: 'Firm follow-up',           tone: 'warning' },
    { id: '90+',   label: '90+ days',    description: 'Escalate to Accounting lead', tone: 'destructive' },
]

const OWNER_META = {
    isabella: { color: 'bg-ai/15 text-ai',              short: 'IB' },
    alec:     { color: 'bg-warning/15 text-warning',    short: 'AG' },
    jacob:    { color: 'bg-primary/15 text-foreground', short: 'JS' },
} as const

export default function F3_p34_ARKanbanScene() {
    const { nextStep } = useDemo()

    const [ownerFilter, setOwnerFilter] = useState<'all' | 'isabella' | 'alec' | 'jacob'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRecord, setSelectedRecord] = useState<ARRecord | null>(null)

    const filteredRecords = useMemo(() => {
        return PROJEX_AR_RECORDS.filter(r => {
            if (ownerFilter !== 'all' && r.ownedBy !== ownerFilter) return false
            if (searchQuery && !r.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
    }, [ownerFilter, searchQuery])

    const bucketRecords = useMemo(() => {
        const map: Record<ARBucket, ARRecord[]> = { '0-30': [], '31-60': [], '61-90': [], '90+': [] }
        for (const r of filteredRecords) map[r.bucket].push(r)
        return map
    }, [filteredRecords])

    const totalOutstanding = filteredRecords.reduce((s, r) => s + r.amount, 0)
    const totalLateFee = filteredRecords.reduce((s, r) => s + r.lateFeeAccrued, 0)

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_BILL] },
        { sources: [PROJEX_SOURCES.STRATA_AI_PJX] },
        { sources: [PROJEX_SOURCES.FINANCIAL_DASHBOARD] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                        <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F3</span>
                        <span>Progress billing · step 4</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                            <Users className="h-3 w-3" aria-hidden="true" /> Shared board
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        AR aging board · 4-column kanban por bucket
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Replaces dead-tracker (AR3) · Net 10 + 1.5%/mo late fee · notes-per-row · ownership per invoice.
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Outstanding</div>
                    <div className="text-sm font-semibold text-foreground tabular-nums">${totalOutstanding.toLocaleString()}</div>
                    <div className="text-[10px] text-warning mt-0.5 tabular-nums">+${totalLateFee.toFixed(2)} late fee accrued</div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
                <div className="flex gap-1 bg-muted p-1 rounded-lg">
                    {(['all', 'isabella', 'alec', 'jacob'] as const).map(o => (
                        <button
                            key={o}
                            onClick={() => setOwnerFilter(o)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all whitespace-nowrap ${
                                ownerFilter === o
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                            }`}
                        >
                            {o === 'all' ? 'All owners' : PROJEX_PERSONAS[o].fullName.split(' ')[0]}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search customer or invoice #…"
                        className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-background border border-input rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                    />
                </div>
                <button className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/40 transition-colors" aria-label="More filters">
                    <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                    {filteredRecords.length} of {PROJEX_AR_RECORDS.length} invoices
                </span>
            </div>

            {/* Kanban 4-col */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {BUCKETS.map(b => {
                    const records = bucketRecords[b.id]
                    const bucketTotal = records.reduce((s, r) => s + r.amount, 0)
                    const toneCls = b.tone === 'success' ? 'bg-success/10 text-success' :
                                    b.tone === 'warning' ? 'bg-warning/10 text-warning' :
                                    'bg-destructive/10 text-destructive'
                    return (
                        <div key={b.id} className="space-y-3">
                            {/* Column header · label + count + MoreHorizontal */}
                            <div className="flex items-center justify-between mb-1 px-1">
                                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm">
                                    {b.label}
                                    <span className={`text-xs px-2 py-0.5 rounded-full tabular-nums ${toneCls}`}>
                                        {records.length}
                                    </span>
                                </h4>
                                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={`${b.label} options`}>
                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="px-1 -mt-2 mb-1 flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">{b.description}</span>
                                <span className="text-[10px] tabular-nums text-muted-foreground">${bucketTotal.toLocaleString()}</span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3 min-h-[60px]">
                                {records.length === 0 ? (
                                    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
                                        <p className="text-xs text-muted-foreground">No invoices</p>
                                    </div>
                                ) : (
                                    records.map(r => {
                                        const owner = OWNER_META[r.ownedBy]
                                        const isSelected = selectedRecord?.id === r.id
                                        return (
                                            <button
                                                key={r.id}
                                                onClick={() => setSelectedRecord(isSelected ? null : r)}
                                                className={`
                                                    w-full text-left rounded-2xl border bg-card p-4 space-y-2.5 shadow-sm transition-all
                                                    ${isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-primary/40'}
                                                `}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <div className={`h-8 w-8 rounded-full ${owner.color} flex items-center justify-center shrink-0 ring-2 ring-card`}>
                                                        <span className="text-[10px] font-black">{owner.short}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-foreground truncate">{r.customer}</div>
                                                        <span className="text-[10px] text-muted-foreground font-mono block truncate">{r.invoiceNumber}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Amount</span>
                                                        <span className="font-semibold text-foreground tabular-nums">${r.amount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-muted-foreground">Late fee</span>
                                                        <span className="text-warning tabular-nums">${r.lateFeeAccrued.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed truncate">{r.project}</p>
                                                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px]">
                                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="h-3 w-3" aria-hidden="true" />
                                                        {r.daysPastDue}d past
                                                    </span>
                                                    <span className={`font-semibold rounded px-1.5 py-0.5 ${
                                                        r.status === 'escalated' ? 'bg-destructive/10 text-destructive' :
                                                        r.status === 'no-response' ? 'bg-warning/10 text-warning' :
                                                        r.status === 'committed-to-pay' ? 'bg-success/10 text-success' :
                                                        'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {r.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Selected record footer · advance CTA */}
            {selectedRecord && (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <DollarSign className="h-5 w-5 text-foreground" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">{selectedRecord.customer} · {selectedRecord.invoiceNumber}</span>
                        <span className="text-muted-foreground"> · ${selectedRecord.amount.toLocaleString()} · {selectedRecord.daysPastDue}d past due · {selectedRecord.status}</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Draft collection emails
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Anchor CTA when nothing selected */}
            {!selectedRecord && (
                <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-xs">
                        <div className="text-foreground font-semibold">Click a card to explore · or continue to draft collection emails</div>
                        <div className="text-muted-foreground mt-0.5">
                            <span className="tabular-nums">{PROJEX_AR_RECORDS.filter(r => r.bucket !== '0-30').length} accounts overdue</span> · shared board means Walls Director sees the same state as Coordinator instantly.
                        </div>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Draft collection emails
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Buckets warning strip · net-new note */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Bucket taxonomy · net-new for Projex</div>
                    <div className="text-muted-foreground mt-0.5">
                        Production AR components (mbi/ARStatusBoard) use status taxonomy (escalated/no-response/pending-approval/committed-to-pay) · aquí layered con bucket (0-30/31-60/61-90/90+) porque Compliance CFO reviews by aging days · both visible per card.
                    </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            </div>

            <DataSourcesBar groups={dataGroups} label="AR aging · shared board → collection queue" />
        </div>
    )
}
