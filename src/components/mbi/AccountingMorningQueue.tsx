/**
 * COMPONENT: AccountingMorningQueue
 * PURPOSE: Flow 2 · Scene 1 — Kathy opens Strata and sees the morning queue
 *          already pre-processed overnight. Exception-centric: highlights that
 *          10/12 invoices were auto-posted and only 2 need her review.
 *
 *          Hero surface = invoice queue + detail panel. Footer cue invites
 *          Kathy to review the HealthTrust royalty exception first.
 *
 * DS TOKENS: bg-card · bg-ai/5 · success / amber accents
 *
 * USED BY: MBIAccountingPage (wizard scene 0)
 */

import { useState } from 'react'
import { Moon, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import InvoiceQueueTable from './InvoiceQueueTable'
import InvoiceDetailPanel from './InvoiceDetailPanel'
import EmailInboxDropZone from './EmailInboxDropZone'
import { MBI_INVOICES } from '../../config/profiles/mbi-data'
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

export default function AccountingMorningQueue() {
    const [ingested, setIngested] = useState<Invoice[]>([])
    const allInvoices = [...MBI_INVOICES, ...ingested]

    const total = allInvoices.length
    const pending = allInvoices.filter(i => i.status === 'pending').length
    const inProgress = allInvoices.filter(i => i.status === 'in-progress').length
    const done = allInvoices.filter(i => i.status === 'done').length
    const healthTrust = allInvoices.filter(i => i.isHealthTrust).length

    // Default select the HealthTrust hero so Kathy sees the 3% royalty right away
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
            {/* Overnight work summary — 3-column workflow story (Apr 23 commitment) */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-2xl p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-ai/15 text-ai flex items-center justify-center shrink-0">
                    <Moon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground">Strata worked overnight</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Read <strong className="text-foreground">{total} vendor bills</strong> ·
                        extracted fields with Document AI · matched to open POs in CORE ·
                        applied HealthTrust 3% royalty logic on <strong className="text-foreground">{healthTrust} GPO bills</strong>.
                        The queue below shows what's done, what agents are still working on, and what only you can decide.
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
                    First up: the HealthTrust Mercy bill · Strata auto-calculated the <strong>3% royalty</strong> per MBI's GPO contract — needs your approval to post.
                </span>
            </div>
        </div>
    )
}
