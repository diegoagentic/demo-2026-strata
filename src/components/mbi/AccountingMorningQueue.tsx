/**
 * COMPONENT: AccountingMorningQueue
 * PURPOSE: Flow 2 · Scene 1 — Kathy opens Strata and sees the morning queue
 *          already pre-processed overnight. Exception-centric: highlights that
 *          10/12 invoices were auto-posted and only 2 need her review.
 *
 *          Hero surface = invoice queue + detail panel. Footer cue invites
 *          Kathy to review the HealthTrust rebate exception first.
 *
 * DS TOKENS: bg-card · bg-ai/5 · success / amber accents
 *
 * USED BY: MBIAccountingPage (wizard scene 0)
 */

import { useState } from 'react'
import { Zap, Loader2, AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Sparkles, Heart } from 'lucide-react'
import InvoiceQueueTable from './InvoiceQueueTable'
import InvoiceDetailPanel from './InvoiceDetailPanel'
import EmailInboxDropZone from './EmailInboxDropZone'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'
import DataSourcesBar, { SOURCES } from './DataSourcesBar'
import type { Invoice } from '../../config/profiles/mbi-data'

// Invoices that arrive during the demo via the EmailInboxDropZone.
// Stored in component state · always land as 'pending' so they slot
// into the same column the audience just saw "needs your eyes".
function makeIngestedInvoice(filename: string, idx: number): Invoice {
    const vendorFromName = filename.split('_')[0]?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? 'Unknown vendor'
    const ts = new Date().toISOString()
    const amounts = [8400, 14250, 23800, 6900, 31100, 17600]
    return {
        id: `INV-LIVE-${String(idx + 1).padStart(3, '0')}`,
        vendor: vendorFromName,
        poNumber: `PO-2026-${9000 + idx}`,
        amount: amounts[idx % amounts.length],
        received: ts,
        isEDI: false,
        ocrConfidence: 88 + Math.floor(Math.random() * 10),
        hasException: false,
        status: 'pending',
        exceptionReason: 'Newly received from inbox · awaiting your eyes',
    }
}

const RECHECK_STEPS = [
    'Detecting PO change in CORE',
    'Re-running reconciliation · Apex Workspace INV-0484',
    'Mismatch cleared · auto-posting to CORE',
]

function POAutoRecheckDemo({ onAutoResolved }: { onAutoResolved: (id: string) => void }) {
    const [stage, setStage] = useState<'idle' | 'processing' | 'done'>('idle')
    const [stepIdx, setStepIdx] = useState(0)

    const handleSimulate = () => {
        if (stage !== 'idle') return
        setStage('processing')
        setStepIdx(0)
        let i = 0
        const tick = () => {
            i++
            setStepIdx(i)
            if (i < RECHECK_STEPS.length) {
                setTimeout(tick, 800)
            } else {
                setStage('done')
                onAutoResolved('INV-0484')
            }
        }
        setTimeout(tick, 600)
    }

    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-ai" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">CORE PO sync · Strata re-evaluates exceptions every 15 min</div>
                    <div className="text-[10px] text-muted-foreground">When a PO changes in CORE and now matches the bill, the exception clears — no action needed from Kathy</div>
                </div>
            </div>
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground">Apex Workspace · INV-0484 · $12.9K</div>
                    <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                        {stage === 'done'
                            ? 'Quantity resolved: PO updated 5 → 6 in CORE · match confirmed'
                            : 'Quantity mismatch: PO 6, bill 5 · short-shipped Jarvis desks'}
                    </div>
                </div>
                {stage === 'idle' && (
                    <button
                        onClick={handleSimulate}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Simulate PO update in CORE
                    </button>
                )}
                {stage === 'processing' && (
                    <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-ai font-bold">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {RECHECK_STEPS[Math.min(stepIdx, RECHECK_STEPS.length - 1)]}…
                    </div>
                )}
                {stage === 'done' && (
                    <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-success font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Auto-resolved · moved to Done
                    </div>
                )}
            </div>
        </div>
    )
}

type BillFilter = 'all' | 'exception' | 'healthtrust' | 'edi' | 'non-edi'

export default function AccountingMorningQueue() {
    const [ingested, setIngested] = useState<Invoice[]>([])
    const [autoResolved, setAutoResolved] = useState<Set<string>>(new Set())
    const [billFilter, setBillFilter] = useState<BillFilter>('all')

    const allInvoices = [...MBI_INVOICES, ...ingested].map(inv =>
        autoResolved.has(inv.id) ? { ...inv, status: 'done' as const } : inv
    )

    const filteredInvoices = billFilter === 'all' ? allInvoices
        : billFilter === 'exception' ? allInvoices.filter(i => i.hasException)
        : billFilter === 'healthtrust' ? allInvoices.filter(i => i.isHealthTrust)
        : billFilter === 'edi' ? allInvoices.filter(i => i.isEDI)
        : allInvoices.filter(i => !i.isEDI)

    const total = allInvoices.length
    const pending = allInvoices.filter(i => i.status === 'pending').length
    const inProgress = allInvoices.filter(i => i.status === 'in-progress').length
    const done = allInvoices.filter(i => i.status === 'done').length
    const healthTrust = allInvoices.filter(i => i.isHealthTrust).length

    // Default select the HealthTrust hero so Kathy sees the 3% rebate right away
    const defaultId = MBI_INVOICES.find(i => i.isHealthTrust)?.id ?? MBI_INVOICES[0].id
    const [selectedId, setSelectedId] = useState(defaultId)
    const selected = allInvoices.find(i => i.id === selectedId) ?? allInvoices[0]

    const handleAutoResolved = (id: string) => {
        setAutoResolved(prev => new Set([...prev, id]))
    }

    const handleIngest = (filename: string) => {
        setIngested(prev => {
            const next = makeIngestedInvoice(filename, prev.length)
            // Auto-select the newly ingested invoice so Kathy sees the detail
            setSelectedId(next.id)
            return [next, ...prev]
        })
    }

    return (
        <div className="space-y-4">
            {/* Continuous processing summary — 3-column workflow story (Apr 23 commitment) */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-sm font-bold text-foreground">Strata processes bills continuously · recent &amp; pending</div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">Kathy · AP Accountant</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Processed <strong className="text-foreground">{total} vendor bills</strong> continuously as they arrived throughout the day ·
                        Document AI extracted fields · matched to open POs in CORE ·
                        applied GPO contract logic on <strong className="text-foreground">{healthTrust} HealthTrust bills</strong>.
                        New bills received at any time go through the same pipeline immediately — Kathy reviews recent activity and pending exceptions on her schedule.
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            {pending} pending · your eyes
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ai">
                            <Loader2 className="h-3 w-3" />
                            {inProgress} in progress · agents
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            {done} done · auto-posted
                        </span>
                    </div>
                </div>
            </div>

            {/* Email inbox dropzone */}
            <EmailInboxDropZone onIngest={handleIngest} activeFilter={billFilter} />

            {/* Shared filter chips — controls both the email inbox above and the bill queue below */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Filter inbox + queue:</span>
                {([
                    { key: 'all',         label: 'All',            icon: null,                                    count: allInvoices.length },
                    { key: 'exception',   label: 'Exceptions',     icon: <AlertTriangle className="h-3 w-3" />,   count: allInvoices.filter(i => i.hasException).length },
                    { key: 'healthtrust', label: 'HealthTrust GPO',icon: <Heart className="h-3 w-3" />,          count: allInvoices.filter(i => i.isHealthTrust).length },
                    { key: 'edi',         label: 'EDI',            icon: <Zap className="h-3 w-3" />,            count: allInvoices.filter(i => i.isEDI).length },
                    { key: 'non-edi',     label: 'Non-EDI',        icon: <Sparkles className="h-3 w-3" />,       count: allInvoices.filter(i => !i.isEDI).length },
                ] as { key: BillFilter; label: string; icon: React.ReactNode; count: number }[]).map(chip => (
                    <button
                        key={chip.key}
                        onClick={() => setBillFilter(chip.key)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            billFilter === chip.key
                                ? 'bg-primary text-zinc-900 border-primary/50'
                                : 'bg-card dark:bg-zinc-800 border-border text-muted-foreground hover:text-foreground hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                    >
                        {chip.icon}
                        {chip.label}
                        <span className={`tabular-nums ${billFilter === chip.key ? 'opacity-70' : 'opacity-60'}`}>{chip.count}</span>
                    </button>
                ))}
            </div>

            {/* PO auto-recheck demo */}
            <POAutoRecheckDemo onAutoResolved={handleAutoResolved} />

            {/* Queue + detail */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <InvoiceQueueTable
                        invoices={filteredInvoices}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </div>
                <div className="lg:col-span-2">
                    <InvoiceDetailPanel invoice={selected} />
                </div>
            </div>

            {/* Forward cue */}
            <div className="flex items-center gap-3 text-xs bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-primary shrink-0" />
                <span className="flex-1 text-foreground">
                    First up: the Allsteel HealthTrust GPO bill · Strata matched the contract and flagged it for your review before posting to CORE.
                </span>
            </div>

            {/* Data sources */}
            <DataSourcesBar groups={[
                { sources: [SOURCES.VENDOR_EMAIL] },
                { sources: [SOURCES.DOC_AI] },
                { sources: [SOURCES.CORE_PO, SOURCES.HT_DB, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
