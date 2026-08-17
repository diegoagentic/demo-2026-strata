/**
 * COMPONENT: APBillPostedScene (Projex · p1.6)
 * PURPOSE: Strata saves the bill record in NetSuite · drops the PDF in the
 *          Communications tab with the naming convention Compliance already uses:
 *          date_vendor_invoice#_amount_PO# · SharePoint mirror in Accounting
 *          Private → Invoices → year/month/company. Activity log records:
 *          extracted by OCR · matched by Strata · approved by CEO · saved by
 *          user (audit trail per legal entity).
 *
 *          Staged reveal · Detecting → Posting → Confirmed. DataSourcesBar
 *          footer showing AP_INBOX → OCR → NETSUITE_BILL → SHAREPOINT flow.
 *
 * DS TOKENS: bg-card · bg-success/10 + text-success · bg-primary + text-primary-foreground
 *            · border-border · text-muted-foreground · tabular-nums
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · file naming date_vendor_invoice#_amount_PO#
 * REUSE FROM: mbi/AccountingMorningQueue.tsx POAutoRecheckDemo (staged reveal) ·
 *             DataSourcesBar · ActivityTimeline DS atom
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, CheckCircle2, Loader2, FileText, FolderTree, Database,
    ShieldCheck, Clock, RotateCcw,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

const SAVE_STEPS = [
    'Detecting bill state · match confirmed · CEO approved',
    'Saving bill record in NetSuite · via Bill button',
    'Attaching PDF to Communications tab',
    'Mirroring PDF to SharePoint · Accounting Private',
    'Writing audit trail · per legal entity',
]

interface ActivityEntry {
    id: string
    icon: React.ElementType
    actor: string
    action: string
    time: string
    tone: 'ai' | 'success' | 'primary' | 'muted'
}

const ACTIVITY: ActivityEntry[] = [
    { id: '1', icon: Sparkles,     actor: 'Strata OCR',        action: 'Extracted 291 lines from TEK-2026-0847.pdf',                time: '02:14 AM',        tone: 'ai' },
    { id: '2', icon: Sparkles,     actor: 'PO Matcher',        action: 'Matched to PO-2026-4421 · exact-to-the-penny',              time: '02:14 AM',        tone: 'ai' },
    { id: '3', icon: CheckCircle2, actor: 'Accounting',       action: 'Reviewed line-items · confirmed match',                     time: '08:22 AM',        tone: 'success' },
    { id: '4', icon: ShieldCheck,  actor: 'CEO',      action: 'Approved for payment run · Tue batch',                      time: '08:34 AM',        tone: 'primary' },
    { id: '5', icon: Database,     actor: 'NetSuite Bot',      action: 'Bill record saved · PDF filed · audit trail written',       time: 'just now',        tone: 'success' },
]

export default function APBillPostedScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { goToStep, steps } = useDemo()
    const [stepIdx, setStepIdx] = useState(0)
    const [done, setDone] = useState(false)

    const restart = () => {
        const first = steps.findIndex(s => s.id === 'p1.1')
        if (first >= 0) goToStep(first)
    }

    useEffect(() => {
        if (stepIdx < SAVE_STEPS.length) {
            const cancel = pauseAwareTimeout(() => setStepIdx(n => n + 1), 900)
            return cancel
        }
        setDone(true)
    }, [stepIdx, pauseAwareTimeout])

    const jacob = PROJEX_PERSONAS.jacob

    // File naming: date_vendor_invoice#_amount_PO#
    const fileName = '2026-08-14_Teknion_TEK-2026-0847_47238.11_PO-2026-4421.pdf'
    const sharepointPath = 'Accounting Private / Invoices / 2026 / 08 / Projex Inc.'

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
        { sources: [PROJEX_SOURCES.STRATA_OCR_PJX] },
        { sources: [PROJEX_SOURCES.NETSUITE_BILL, PROJEX_SOURCES.NETSUITE_GL] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_ACCT_PRIVATE] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F1</span>
                    <span>AP intake &amp; matching · step 6</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Consequence of CEO's approval · auto
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-success/10 text-success font-semibold rounded-md px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Complete
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Bill record saved in NetSuite · PDF dropped in Communications tab
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Strata writes the record where {jacob.fullName.split(' ')[0]}'s team already looks for it · file naming convention preserved so the audit trail doesn't break.
                </p>
            </div>

            {/* Staged reveal · save pipeline */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    {done ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    ) : (
                        <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Save pipeline · TEK-2026-0847
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Live</span>
                </div>
                <div className="p-4 space-y-2">
                    {SAVE_STEPS.map((label, i) => {
                        const state = i < stepIdx ? 'done' : i === stepIdx ? 'running' : 'pending'
                        return (
                            <div
                                key={label}
                                className={`
                                    flex items-center gap-2 text-sm
                                    ${state === 'pending' ? 'opacity-40' : ''}
                                `}
                            >
                                {state === 'done' && <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />}
                                {state === 'running' && <Loader2 className="h-4 w-4 text-ai animate-spin shrink-0" aria-hidden="true" />}
                                {state === 'pending' && <span className="h-4 w-4 rounded-full border border-border shrink-0" aria-hidden="true" />}
                                <span className={state === 'done' ? 'text-foreground' : state === 'running' ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                                    {label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Layout · NetSuite view (left) + SharePoint mirror (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* NetSuite Bill record */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">NetSuite · Bill record</span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground">PO-2026-4421</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor</div>
                                <div className="text-foreground font-semibold mt-0.5">Teknion</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Invoice #</div>
                                <div className="text-foreground font-semibold mt-0.5 font-mono">TEK-2026-0847</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</div>
                                <div className="text-foreground font-bold mt-0.5 tabular-nums">$47,238.11</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Entity</div>
                                <div className="text-foreground mt-0.5">Projex Inc.</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                                <div className="text-foreground mt-0.5">NCBA</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Terms</div>
                                <div className="text-foreground mt-0.5">Net 10 · 1.5%/mo late</div>
                            </div>
                        </div>
                        {done && (
                            <div className="animate-in fade-in duration-500 flex items-center gap-2 text-[11px] bg-success/5 border border-success/30 rounded-lg px-3 py-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                                <span className="text-foreground">Bill record saved · Communications tab has the PDF attached.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* SharePoint mirror */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SharePoint · Accounting Private mirror</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">Auto-filed</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Path</div>
                            <div className="text-xs text-foreground font-mono mt-0.5 break-all">{sharepointPath}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">File · Accounting naming convention</div>
                            <div className="mt-1 flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
                                <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                <span className="text-[11px] text-foreground font-mono break-all">{fileName}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                            {['date', 'vendor', 'invoice#', 'amount_PO#'].map(seg => (
                                <div key={seg} className="rounded bg-primary/15 text-foreground font-semibold px-2 py-1 text-center">{seg}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Audit trail · per legal entity</span>
                </div>
                <div className="p-4 space-y-3">
                    {ACTIVITY.map(entry => {
                        const Icon = entry.icon
                        const tone = {
                            ai:      { bg: 'bg-ai-light',      text: 'text-ai' },
                            success: { bg: 'bg-success/10',     text: 'text-success' },
                            primary: { bg: 'bg-primary/15',     text: 'text-foreground' },
                            muted:   { bg: 'bg-muted',          text: 'text-muted-foreground' },
                        }[entry.tone]
                        return (
                            <div key={entry.id} className="flex items-start gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tone.bg}`}>
                                    <Icon className={`h-4 w-4 ${tone.text}`} aria-hidden="true" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground">
                                        <span className="font-semibold">{entry.actor}</span>
                                        <span className="text-muted-foreground"> · {entry.action}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{entry.time}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {done && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                            End of AP flow · Accounting is unblocked · Compliance has full audit trail
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Next Projex flows in the roadmap · Order &amp; PO dispatch · ACK processing · Progress billing · Vendor onboarding.
                        </div>
                    </div>
                    <button
                        onClick={restart}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Replay AP flow
                    </button>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="End-to-end data flow · overnight to save" />
        </div>
    )
}
