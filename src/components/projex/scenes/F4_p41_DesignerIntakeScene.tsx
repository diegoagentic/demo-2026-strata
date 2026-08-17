/**
 * COMPONENT: F4_p41_DesignerIntakeScene (Projex · p4.1)
 * PURPOSE: Two-phase scene · lands en el Expert Hub Transactions tab
 *          (order transactions list · MWH PIF highlighted "Just arrived").
 *          Action Center click OR row click drills into email detail +
 *          Ingest confirmation panel. Never auto-ingest.
 *
 *          Fix del user 2026-08-17: F4 debe empezar en Expert Hub ·
 *          Transactions (easier to recognize) · then drill into specific view.
 *
 * SHAPE · Transactions landing (list) → email + ingest detail (drill-in)
 * REUSE · bfi/PMOIntakeScene shape + mbi/EmailInboxDropZone
 * NOTIF · listens `projex:pif-email-open` → phase='detail'
 */

import { useEffect, useState } from 'react'
import {
    Mail, Paperclip, FileText, Sparkles, CheckCircle2, Loader2,
    ArrowRight, Building2, Play, Eye, Inbox, Circle,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { useHighlightOnAcClick } from '../hooks/useHighlightOnAcClick'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_TOTALS } from '../../../config/profiles/projex-data/mwhPif'

// Expert Hub Transactions landing · order transactions in-flight
interface OrderTransaction {
    id: string
    type: 'PIF · order intake' | 'PO batch' | 'ACK received' | 'Snapshot'
    customer: string
    project: string
    lines: number
    amount: number
    status: 'Just arrived · needs ingest' | 'In parse' | 'Draft POs ready' | 'Sent' | 'ACK matched'
    submitted: string
    highlight?: boolean
}

const ORDER_TRANSACTIONS: OrderTransaction[] = [
    { id: 'PIF-MWH-2026-08-14', type: 'PIF · order intake', customer: 'MWH residential', project: 'batch 1 · 26 vendor split', lines: 300, amount: 264500, status: 'Just arrived · needs ingest', submitted: 'Just now', highlight: true },
    { id: 'PO-2026-4421',        type: 'PO batch',           customer: 'NCBA',            project: 'Nurse Station',            lines:  71, amount:  47238, status: 'ACK matched',              submitted: '2 days ago' },
    { id: 'PIF-DEN-2026-08-12',  type: 'PIF · order intake', customer: 'Denver Financial',project: 'exec suite phase 2',       lines: 142, amount: 118400, status: 'Draft POs ready',           submitted: '3 days ago' },
    { id: 'PO-2026-4402',        type: 'PO batch',           customer: 'Seattle Tech',    project: 'phase 1',                  lines:  84, amount:  63200, status: 'Sent',                     submitted: '5 days ago' },
    { id: 'PIF-FAIR-2026-08-10', type: 'PIF · order intake', customer: 'Fairport HQ',     project: 'phase 2',                  lines:  96, amount:  74320, status: 'In parse',                 submitted: '5 days ago' },
]

const STATUS_STYLES: Record<OrderTransaction['status'], string> = {
    'Just arrived · needs ingest': 'bg-ai-light text-ai border-ai/30',
    'In parse':                    'bg-info/10 text-info border-info/20',
    'Draft POs ready':             'bg-warning/10 text-warning border-warning/30',
    'Sent':                        'bg-muted text-muted-foreground border-border',
    'ACK matched':                 'bg-success/10 text-success border-success/20',
}

export default function F4_p41_DesignerIntakeScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    // Two-phase · Transactions landing → email + ingest detail
    const [phase, setPhase] = useState<'transactions' | 'detail'>('transactions')
    const [state, setState] = useState<'landing' | 'ingesting' | 'ingested'>('landing')

    // Action Center CTA `Open Coordinator inbox →` OR MWH row click → drill-in
    useEffect(() => {
        const openDetail = () => setPhase('detail')
        window.addEventListener('projex:pif-email-open', openDetail)
        return () => window.removeEventListener('projex:pif-email-open', openDetail)
    }, [])

    // F76 · AC click highlights Ingest button (never auto-ingest) · only in detail
    const highlight = useHighlightOnAcClick('projex:pif-email-open')

    const handleIngest = () => {
        if (state !== 'landing') return
        setState('ingesting')
        pauseAwareTimeout(() => {
            setState('ingested')
            window.dispatchEvent(new CustomEvent('projex:pif-ingested'))
        }, 1200)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                    <span>Order &amp; PO dispatch · step 1</span>
                    <span className="text-muted-foreground/60">·</span>
                    {phase === 'transactions' ? (
                        <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                            <Building2 className="h-3 w-3" aria-hidden="true" /> Expert Hub · Transactions
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                            <Sparkles className="h-3 w-3" aria-hidden="true" /> Intake detail
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {phase === 'transactions'
                        ? 'Expert Hub · Transactions · MWH residential PIF just arrived'
                        : 'Designer emails PIF + SIF · MWH residential intake detail'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {phase === 'transactions'
                        ? 'Recent order transactions across Coordinator workspaces · Lead Designer just sent a new PIF workbook + SIF export for MWH · click the highlighted row (or Action Center) to review + Ingest.'
                        : 'Attachment metadata visible · drop-zone accept · Coordinator confirms Ingest before parse starts.'}
                </p>
            </div>

            {/* Transactions landing · Expert Hub · Order transactions list */}
            {phase === 'transactions' && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Transactions · Order intake + PO dispatch · {ORDER_TRANSACTIONS.length} recent
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <Circle className="h-1.5 w-1.5 fill-success text-success" aria-hidden="true" />
                            Live · Coordinator workspaces
                        </span>
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-[160px_1fr_140px_100px_120px_140px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                        <span>ID · Type</span>
                        <span>Customer · Project</span>
                        <span className="text-right">Lines · Amount</span>
                        <span></span>
                        <span className="text-right">Status</span>
                        <span className="text-right">Submitted</span>
                    </div>

                    <ul className="divide-y divide-border">
                        {ORDER_TRANSACTIONS.map(txn => (
                            <li
                                key={txn.id}
                                onClick={() => txn.highlight && setPhase('detail')}
                                className={`
                                    relative grid grid-cols-[160px_1fr_140px_100px_120px_140px] px-4 py-3 text-xs items-center transition-colors
                                    ${txn.highlight ? 'bg-ai-light/40 ring-1 ring-inset ring-ai/40 animate-in fade-in slide-in-from-top-1 duration-500 cursor-pointer hover:bg-ai-light/60' : 'hover:bg-muted/30'}
                                `}
                            >
                                {txn.highlight && (
                                    <div className="absolute inset-y-0 left-0 w-1 bg-ai animate-pulse" aria-hidden="true" />
                                )}
                                <div className="min-w-0">
                                    <div className="text-foreground font-mono font-semibold truncate">{txn.id}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{txn.type}</div>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-foreground font-semibold truncate">{txn.customer}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{txn.project}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-foreground tabular-nums font-semibold">${txn.amount.toLocaleString()}</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">{txn.lines} lines</div>
                                </div>
                                <div className="text-right">
                                    {txn.highlight && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-ai-light text-ai rounded px-1.5 py-0.5">
                                            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                                            New
                                        </span>
                                    )}
                                </div>
                                <span className="text-right">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 border ${STATUS_STYLES[txn.status]}`}>
                                        {txn.status}
                                    </span>
                                </span>
                                <span className="text-right text-[10px] font-mono text-muted-foreground">
                                    {txn.submitted}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Footer with drill-in CTA */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-3 text-[11px]">
                        <span className="text-muted-foreground">
                            <span className="text-foreground font-semibold">{ORDER_TRANSACTIONS.filter(t => t.status === 'Just arrived · needs ingest').length}</span> new intake pending review
                        </span>
                        <button
                            onClick={() => setPhase('detail')}
                            className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Open MWH intake detail
                        </button>
                    </div>
                </div>
            )}

            {phase === 'detail' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
                {/* Email + attachments card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inbound email · MWH kickoff</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">08:14 AM</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                        <div className="grid grid-cols-[70px_1fr] gap-y-1.5 gap-x-2 text-[12px]">
                            <span className="text-muted-foreground">From</span>
                            <span className="text-foreground font-medium">Layne · Lead Designer · layne@aspire-design.example</span>
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">Isabella Bressler · isabella@projex-inc.com</span>
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">MWH residential · PIF + SIF · 300 lines · 26 vendor split</span>
                        </div>
                        <div className="pt-3 border-t border-border text-[12px] text-foreground/80 leading-relaxed">
                            Hi Isabella · attaching PIF workbook con full BOM y SIF export from CET. Big project · 300 lines across Teknion + HBF + Boss + Alamir + Nelson + West Elm. Walls partitions include AI lot line for east wing.
                            Ready for you to parse and dispatch. Let me know si algo needs clarification.
                            — Layne
                        </div>
                        <div className="pt-3 border-t border-border space-y-2">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Attachments</div>
                            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border border-border">
                                <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">MWH_PIF_2026-08-14.xlsx</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">
                                        4.2 MB · {MWH_TOTALS.productLines} product lines · {MWH_TOTALS.snhEntries} S&amp;H entries
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                                    Parse ready
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 border border-border">
                                <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-foreground truncate">MWH_CET_export.sif</div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums">1.8 MB · SIF v4.2 · Teknion-compatible</div>
                                </div>
                                <span className="text-[10px] font-bold bg-ai-light text-ai rounded px-1.5 py-0.5">
                                    SIF ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingest confirmation panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ingest confirmation · {isabella.role}</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                            <div className="text-sm text-foreground font-semibold mt-0.5">MWH residential</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected output</div>
                            <div className="text-sm text-foreground mt-0.5 tabular-nums">
                                {MWH_TOTALS.productLines} product lines · {MWH_TOTALS.snhEntries} S&amp;H entries · {MWH_TOTALS.totalPOs} vendor POs
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. total value</div>
                            <div className="text-lg text-foreground font-bold tabular-nums mt-0.5">${MWH_TOTALS.grandTotal.toLocaleString()}</div>
                        </div>
                        <div className="pt-3 border-t border-border">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Reviewer</div>
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold">
                                    {isabella.initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs text-foreground font-semibold">{isabella.fullName}</div>
                                    <div className="text-[10px] text-muted-foreground">Never auto-ingest · human confirm required</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border">
                        {state === 'landing' && (
                            <button
                                onClick={handleIngest}
                                data-ac-highlight
                                className={`w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                            >
                                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                                Ingest PIF + SIF
                            </button>
                        )}
                        {state === 'ingesting' && (
                            <div className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-ai animate-pulse py-2.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Ingesting workbook…
                            </div>
                        )}
                        {state === 'ingested' && (
                            <button
                                onClick={nextStep}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Open PIF parser
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            )}

            {phase === 'detail' && (
                <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-xs">
                        <div className="text-foreground font-semibold">Why never auto-ingest</div>
                        <div className="text-muted-foreground mt-0.5">
                            Coordinator escalates project scope changes con Lead Designer before parse locks in. 300-line PIF has downstream implications (26 POs · 2.5h manual work if pattern breaks) · confirmation gate protects.
                        </div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Designer intake · email → drop-zone → Ingest" />
        </div>
    )
}
