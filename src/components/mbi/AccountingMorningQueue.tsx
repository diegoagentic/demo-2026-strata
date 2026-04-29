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
import { Zap, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, FileSignature, X } from 'lucide-react'
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

// AI-detected billing trigger — project hit installation milestone overnight
const BILLING_TRIGGER = {
    project: 'Riverside Medical Center',
    projectId: 'PROJ-2026-017',
    milestone: 'Installation complete',
    amount: 180000,
    invoiceRef: 'BDG-2026-017',
    note: 'All delivery milestones met · 100% installation confirmed · client sign-off received',
}

export default function AccountingMorningQueue() {
    const [ingested, setIngested] = useState<Invoice[]>([])
    const [billingDismissed, setBillingDismissed] = useState(false)
    const [billingCreated, setBillingCreated] = useState(false)
    const allInvoices = [...MBI_INVOICES, ...ingested]

    const total = allInvoices.length
    const pending = allInvoices.filter(i => i.status === 'pending').length
    const inProgress = allInvoices.filter(i => i.status === 'in-progress').length
    const done = allInvoices.filter(i => i.status === 'done').length
    const healthTrust = allInvoices.filter(i => i.isHealthTrust).length

    // Default select the HealthTrust hero so Kathy sees the 3% rebate right away
    const defaultId = MBI_INVOICES.find(i => i.isHealthTrust)?.id ?? MBI_INVOICES[0].id
    const [selectedId, setSelectedId] = useState(defaultId)
    const selected = allInvoices.find(i => i.id === selectedId) ?? allInvoices[0]

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
            {/* AI billing trigger — Strata detected a project ready to invoice */}
            {!billingDismissed && (
                <div className={`
                    border-2 rounded-2xl p-4 flex items-start gap-3 transition-all
                    ${billingCreated
                        ? 'border-success/40 bg-success/5 dark:bg-success/10'
                        : 'border-ai/40 bg-ai/5 dark:bg-ai/10 ring-2 ring-ai/20'}
                `}>
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${billingCreated ? 'bg-success/15 text-success' : 'bg-ai/15 text-ai'}`}>
                        {billingCreated ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${billingCreated ? 'text-success' : 'text-ai'}`}>
                                {billingCreated ? 'Invoice created' : 'Strata AI · ready to invoice'}
                            </div>
                            {!billingCreated && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai/20 text-ai animate-pulse">NEW</span>
                            )}
                        </div>
                        <div className="text-sm font-bold text-foreground mt-0.5">
                            {BILLING_TRIGGER.project} · ${BILLING_TRIGGER.amount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            {BILLING_TRIGGER.milestone} · {BILLING_TRIGGER.note}
                        </div>
                        {billingCreated && (
                            <div className="text-[11px] text-success font-semibold mt-1 inline-flex items-center gap-1">
                                <FileSignature className="h-3 w-3" />
                                Invoice drafted · {BILLING_TRIGGER.invoiceRef} · ready for your review
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {!billingCreated && (
                            <button
                                onClick={() => setBillingCreated(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-900 bg-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                            >
                                <FileSignature className="h-3.5 w-3.5" />
                                Create invoice
                            </button>
                        )}
                        <button
                            onClick={() => setBillingDismissed(true)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Overnight work summary — 3-column workflow story (Apr 23 commitment) */}
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
                        applied HealthTrust 3% rebate logic on <strong className="text-foreground">{healthTrust} GPO bills</strong>.
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

            {/* Email inbox dropzone — Apr 23 Matt highly-desired interactivity.
                Drop a file (or click Simulate) → the new invoice lands in the
                Pending column of the kanban below. */}
            <EmailInboxDropZone onIngest={handleIngest} />

            {/* Queue + detail */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                    <InvoiceQueueTable
                        invoices={allInvoices}
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
                    First up: the Allsteel bill · Strata auto-calculated the <strong>3% rebate</strong> per MBI's GPO contract — needs your approval to post.
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
