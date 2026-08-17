/**
 * COMPONENT: F2_p22_W9OcrScene (Projex · p2.2)
 * PURPOSE: Two-phase scene. Phase 1 · Daniel aterriza en la OCR queue del Dealer
 *          Experience (MAC/Onboarding) · 6 tickets en distintos estados (in
 *          queue · extracting · needs review · approved). WBD row highlighted
 *          como "Just landed" pero el drill-in NO empieza automático — espera
 *          click del user en el AC CTA o en el row. Phase 2 · click →
 *          transition al split-pane OCR simulation actual (staged reveal,
 *          bounding-box overlay, per-field confidence, correction flow).
 *
 *          Fix del bug (user 2026-08-17): la simulación arrancaba antes de que
 *          el AC notif llegara · ahora landing → notif → click → simulation.
 *
 * SHAPE LOCK · queue landing (F2 secondary) → split-pane OCR (F2 primary shape)
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            border-border · text-warning · text-success · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12b · VS2 undated W-9s en SharePoint · fix con OCR
 * REUSE FROM: mbi/SIFParserPreview (bounding-box overlay pattern)
 *
 * NOTIF: listens `projex:w9-ocr-open` (AC CTA) → phase='review' + start reveal ·
 *        dispatch `projex:w9-ocr-validated` on Save → advance p2.3 auto
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, FileText, CheckCircle2, AlertTriangle, Loader2,
    Edit3, Save, ArrowRight, Fingerprint, Building2, Calendar, MapPin,
    ScanText, Clock, Inbox, User,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { WBD_W9 } from '../../../config/profiles/projex-data/w9Records'

// OCR queue landing · 6 mock tickets en distintos estados
type QueueStatus = 'in-queue' | 'extracting' | 'needs-review' | 'approved'
interface QueueTicket {
    id: string
    vendorName: string
    initials: string
    initialsBg: string
    docType: 'W-9' | 'ACK' | 'Invoice'
    ticketRef: string
    projectRef: string
    status: QueueStatus
    ocrProgress?: number   // 0-100 · for extracting
    ocrConfidence?: number // 0-100 · for done states
    submittedBy?: string
    receivedAgo: string
}

const OCR_QUEUE: QueueTicket[] = [
    // The one Daniel is about to open
    { id: 'tkt-wbd', vendorName: 'Warehouse by Design', initials: 'WB', initialsBg: 'bg-destructive/15 text-destructive', docType: 'W-9', ticketRef: 'TKT-P2-2026-08-14-001', projectRef: 'Denver Financial install', status: 'needs-review', ocrConfidence: 95, submittedBy: 'Coordinator', receivedAgo: 'Just now' },
    // Other queue items for context
    { id: 'tkt-boss', vendorName: 'Boss Design',        initials: 'BD', initialsBg: 'bg-ai/15 text-ai',                    docType: 'W-9', ticketRef: 'TKT-P2-2026-08-13-004', projectRef: 'MWH residential',           status: 'extracting',  ocrProgress: 65,   submittedBy: 'Coordinator', receivedAgo: '18 min ago' },
    { id: 'tkt-cs',   vendorName: 'Clear Space',        initials: 'CS', initialsBg: 'bg-destructive/15 text-destructive',   docType: 'W-9', ticketRef: 'TKT-P2-2026-08-13-003', projectRef: 'Fairport install',          status: 'in-queue',                                                        submittedBy: 'Coordinator', receivedAgo: '42 min ago' },
    { id: 'tkt-tek',  vendorName: 'Teknion',            initials: 'TK', initialsBg: 'bg-primary/25 text-foreground',        docType: 'ACK', ticketRef: 'TKT-P2-2026-08-13-001', projectRef: 'NCBA · PO-DC-0009642',      status: 'approved',    ocrConfidence: 99, submittedBy: 'Auto ingest',    receivedAgo: '3 hr ago' },
    { id: 'tkt-hbf',  vendorName: 'HBF',                initials: 'HB', initialsBg: 'bg-info/15 text-info',                  docType: 'Invoice', ticketRef: 'TKT-P2-2026-08-13-000', projectRef: 'Denver Financial · exec suite', status: 'approved', ocrConfidence: 97, submittedBy: 'Auto ingest', receivedAgo: 'Yesterday' },
    { id: 'tkt-dig',  vendorName: 'Digital Interior',   initials: 'DI', initialsBg: 'bg-destructive/15 text-destructive',   docType: 'W-9', ticketRef: 'TKT-P2-2026-08-12-002', projectRef: 'Fairport install · AP9',    status: 'needs-review', ocrConfidence: 88, submittedBy: 'Coordinator', receivedAgo: 'Yesterday' },
]

const STATUS_STYLES: Record<QueueStatus, { label: string; cls: string; icon: React.ElementType }> = {
    'in-queue':     { label: 'In queue',     cls: 'bg-muted text-muted-foreground border-border',                icon: Clock },
    'extracting':   { label: 'Extracting',   cls: 'bg-ai-light text-ai border-ai/30',                            icon: Loader2 },
    'needs-review': { label: 'Needs review', cls: 'bg-warning/10 text-warning border-warning/30',                icon: AlertTriangle },
    'approved':     { label: 'Approved',     cls: 'bg-success/10 text-success border-success/20',                icon: CheckCircle2 },
}

// Icons por field key
const FIELD_ICONS: Record<string, React.ElementType> = {
    'legal-name':  Building2,
    'entity-type': Building2,
    'ein':         Fingerprint,
    'signed-date': Calendar,
    'address':     MapPin,
}

export default function F2_p22_W9OcrScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const daniel = PROJEX_PERSONAS.daniel
    const kelly = PROJEX_PERSONAS.kelly

    // Two-phase state · queue landing → review (starts reveal simulation)
    const [phase, setPhase] = useState<'queue' | 'review'>('queue')

    // Staged reveal · 1 field every ~350ms (only runs in review phase)
    const [revealed, setRevealed] = useState(0)
    const [correctedIds, setCorrectedIds] = useState<Set<string>>(new Set())
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

    // Action Center CTA `Open OCR review →` (event `projex:w9-ocr-open`) triggers
    // transition from queue landing to review · also fires when user clicks the
    // WBD row directly in the queue.
    useEffect(() => {
        const open = () => setPhase('review')
        window.addEventListener('projex:w9-ocr-open', open)
        return () => window.removeEventListener('projex:w9-ocr-open', open)
    }, [])

    // Reveal choreography only starts when phase === 'review'
    useEffect(() => {
        if (phase !== 'review') return
        if (revealed < WBD_W9.fields.length) {
            const cancel = pauseAwareTimeout(() => setRevealed(n => n + 1), 350)
            return cancel
        }
    }, [phase, revealed, pauseAwareTimeout])

    const handleCorrect = (fieldKey: string) => {
        setCorrectedIds(prev => new Set([...prev, fieldKey]))
    }

    const handleSave = () => {
        if (saveState !== 'idle') return
        setSaveState('saving')
        pauseAwareTimeout(() => {
            setSaveState('saved')
            window.dispatchEvent(new CustomEvent('projex:w9-ocr-validated'))
        }, 900)
    }

    const allRevealed = revealed >= WBD_W9.fields.length
    const correctableCount = WBD_W9.fields.filter(f => f.correctable).length
    const stillNeedsCorrection = WBD_W9.fields.filter(f => f.correctable && !correctedIds.has(f.key)).length
    const avgConf = Math.round(WBD_W9.fields.reduce((s, f) => s + f.conf, 0) / WBD_W9.fields.length)

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.SHAREPOINT_PROJECTS] },
        { sources: [PROJEX_SOURCES.STRATA_OCR_PJX] },
        { sources: [PROJEX_SOURCES.W9_REGISTRY] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F2</span>
                    <span>Vendor onboarding · step 2</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> OCR live
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {phase === 'queue'
                        ? 'OCR queue · vendor documents awaiting review'
                        : `W-9 upload + OCR extraction · Accounting reviews ${WBD_W9.fields.length} fields`}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {phase === 'queue'
                        ? 'Multiple onboarding tickets in-flight across the Dealer Experience · Warehouse by Design just landed · open from the Action Center notification or click the highlighted row to start OCR review.'
                        : 'Source PDF con bounding-box overlay · per-field confidence · Accounting corrects fields con conf <95%.'}
                </p>
            </div>

            {/* Queue landing · shown until AC CTA click transitions to review */}
            {phase === 'queue' && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            OCR queue · Accounting · {OCR_QUEUE.length} documents
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <ScanText className="h-3 w-3 text-ai" aria-hidden="true" />
                            Strata OCR pipeline · live
                        </span>
                    </div>

                    {/* Column counters */}
                    <div className="grid grid-cols-4 gap-3 p-4 border-b border-border">
                        {(['in-queue', 'extracting', 'needs-review', 'approved'] as QueueStatus[]).map(status => {
                            const count = OCR_QUEUE.filter(t => t.status === status).length
                            const style = STATUS_STYLES[status]
                            const Icon = style.icon
                            return (
                                <div key={status} className="rounded-lg border border-border bg-background p-3 flex items-center gap-2.5">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${style.cls.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ')}`}>
                                        <Icon className={`h-4 w-4 ${status === 'extracting' ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{count}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1">{style.label}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Ticket rows */}
                    <ul className="divide-y divide-border">
                        {OCR_QUEUE.map(ticket => {
                            const isWbd = ticket.id === 'tkt-wbd'
                            const status = STATUS_STYLES[ticket.status]
                            const StatusIcon = status.icon
                            return (
                                <li
                                    key={ticket.id}
                                    className={`
                                        relative px-4 py-3 transition-colors
                                        ${isWbd ? 'bg-ai-light/40 ring-1 ring-inset ring-ai/40' : 'hover:bg-muted/30'}
                                    `}
                                >
                                    {isWbd && (
                                        <div className="absolute inset-y-0 left-0 w-1 bg-ai animate-pulse" aria-hidden="true" />
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full ${ticket.initialsBg} flex items-center justify-center shrink-0 text-[10px] font-bold`}>
                                            {ticket.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-foreground">{ticket.vendorName}</span>
                                                <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                                                    {ticket.docType}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{ticket.ticketRef}</span>
                                                {isWbd && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-ai-light text-ai rounded px-1.5 py-0.5 inline-flex items-center gap-1">
                                                        <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> Just landed
                                                    </span>
                                                )}
                                                <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                                                    {ticket.receivedAgo}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                                                <span className="truncate">{ticket.projectRef}</span>
                                                {ticket.submittedBy && (
                                                    <>
                                                        <span className="text-muted-foreground/50">·</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <User className="h-3 w-3" aria-hidden="true" />
                                                            {ticket.submittedBy}
                                                        </span>
                                                    </>
                                                )}
                                                {ticket.status === 'extracting' && ticket.ocrProgress !== undefined && (
                                                    <>
                                                        <span className="text-muted-foreground/50">·</span>
                                                        <span className="text-ai font-semibold">OCR {ticket.ocrProgress}%</span>
                                                    </>
                                                )}
                                                {(ticket.status === 'needs-review' || ticket.status === 'approved') && ticket.ocrConfidence !== undefined && (
                                                    <>
                                                        <span className="text-muted-foreground/50">·</span>
                                                        <span className="tabular-nums">Conf {ticket.ocrConfidence}%</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-semibold rounded px-2 py-0.5 border inline-flex items-center gap-1 shrink-0 ${status.cls}`}>
                                            <StatusIcon className={`h-3 w-3 ${ticket.status === 'extracting' ? 'animate-spin' : ''}`} aria-hidden="true" />
                                            {status.label}
                                        </span>
                                        {isWbd && (
                                            <button
                                                onClick={() => setPhase('review')}
                                                className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                            >
                                                Open OCR review
                                                <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

            {/* Review phase · KPI row + split-pane + save CTA */}
            {phase === 'review' && (
            <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{WBD_W9.fields.length}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Fields extracted</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-ai-light flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-ai" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{avgConf}%</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Avg OCR confidence</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{stillNeedsCorrection}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Needs Accounting review</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{correctedIds.size}/{correctableCount}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Corrected</div>
                    </div>
                </div>
            </div>

            {/* Layout · split pane · doc preview (left) + fields extracted (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* Doc preview con bounding-box overlay */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Source PDF
                        </span>
                        <span className="ml-auto text-[10px] font-mono text-muted-foreground truncate max-w-[220px]">
                            {WBD_W9.fileName}
                        </span>
                    </div>
                    <div className="p-4 relative min-h-[420px] bg-muted/10">
                        {/* Faux W-9 form layout */}
                        <div className="relative bg-background rounded-lg border border-border/60 p-6 space-y-4 shadow-sm">
                            <div className="text-center border-b border-border pb-2">
                                <div className="text-xs font-bold text-foreground">Form W-9</div>
                                <div className="text-[10px] text-muted-foreground">Request for Taxpayer Identification Number and Certification</div>
                            </div>

                            {/* Field 1 · legal name · con bounding-box overlay animated */}
                            <div className={`relative p-2 rounded ${revealed >= 1 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Name</div>
                                <div className="text-sm text-foreground">Warehouse by Design LLC</div>
                                {revealed >= 1 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">99%</span>}
                            </div>

                            {/* Field 2 · entity type */}
                            <div className={`relative p-2 rounded ${revealed >= 2 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Federal tax classification</div>
                                <div className="text-sm text-foreground">☑ Limited liability company · single-member</div>
                                {revealed >= 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">96%</span>}
                            </div>

                            {/* Field 3 · EIN · con warning overlay */}
                            <div className={`relative p-2 rounded ${revealed >= 3 ? 'ring-2 ring-warning bg-warning/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Employer identification number</div>
                                <div className="text-sm text-foreground font-mono">**-***2841</div>
                                {revealed >= 3 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-warning text-white rounded px-1 tabular-nums">92%</span>}
                            </div>

                            {/* Field 4 · signed date */}
                            <div className={`relative p-2 rounded ${revealed >= 4 ? 'ring-2 ring-ai/40 bg-ai/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Signature · date</div>
                                <div className="text-sm text-foreground italic">2026-03-12</div>
                                {revealed >= 4 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-ai text-white rounded px-1 tabular-nums">100%</span>}
                            </div>

                            {/* Field 5 · address · warning */}
                            <div className={`relative p-2 rounded ${revealed >= 5 ? 'ring-2 ring-warning bg-warning/5 animate-in fade-in duration-300' : ''}`}>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Address</div>
                                <div className="text-sm text-foreground">4820 Wynkoop St · Denver CO 80216</div>
                                {revealed >= 5 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-warning text-white rounded px-1 tabular-nums">88%</span>}
                            </div>
                        </div>

                        {!allRevealed && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 border border-ai/40 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />
                                    <span className="text-xs font-semibold text-foreground">Strata OCR reading… {revealed}/{WBD_W9.fields.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extracted fields with correction affordance */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Extracted fields · Daniel review
                        </span>
                        {allRevealed && stillNeedsCorrection === 0 && (
                            <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                All corrections done
                            </span>
                        )}
                        {allRevealed && stillNeedsCorrection > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                {stillNeedsCorrection} pending
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-2">
                        {WBD_W9.fields.slice(0, revealed).map(f => {
                            const Icon = FIELD_ICONS[f.key] ?? FileText
                            const isCorrected = correctedIds.has(f.key)
                            const needsCorrection = f.correctable && !isCorrected
                            return (
                                <div
                                    key={f.key}
                                    className={`
                                        animate-in fade-in slide-in-from-right-1 duration-300 rounded-lg border px-3 py-2 flex items-start gap-2
                                        ${isCorrected ? 'border-success/40 bg-success/5' : needsCorrection ? 'border-warning/40 bg-warning/5' : 'border-border bg-card'}
                                    `}
                                >
                                    <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
                                            <span className={`text-[10px] font-bold tabular-nums rounded px-1 ${
                                                f.band === 'high' ? 'bg-success/10 text-success' :
                                                f.band === 'medium' ? 'bg-warning/10 text-warning' :
                                                'bg-destructive/10 text-destructive'
                                            }`}>
                                                {f.conf}%
                                            </span>
                                        </div>
                                        <div className="text-sm text-foreground font-medium mt-0.5 truncate">{f.value}</div>
                                    </div>
                                    {needsCorrection && (
                                        <button
                                            onClick={() => handleCorrect(f.key)}
                                            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-primary/15 hover:bg-primary/25 rounded px-1.5 py-0.5 transition-colors"
                                        >
                                            <Edit3 className="h-3 w-3" aria-hidden="true" />
                                            Confirm
                                        </button>
                                    )}
                                    {isCorrected && (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            OK
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Save CTA when all revealed */}
                    {allRevealed && (
                        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-2 animate-in fade-in duration-300">
                            <span className="text-[10px] text-muted-foreground flex-1">
                                Route to compliance preflight when all fields confirmed.
                            </span>
                            {saveState === 'idle' && (
                                <button
                                    onClick={handleSave}
                                    disabled={stillNeedsCorrection > 0}
                                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                    Save + run preflight
                                </button>
                            )}
                            {saveState === 'saving' && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ai animate-pulse">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                    Saving…
                                </span>
                            )}
                            {saveState === 'saved' && (
                                <button
                                    onClick={nextStep}
                                    className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                >
                                    Run preflight
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Provenance strip · shown in both phases */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold shrink-0">
                    {kelly.initials}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                    <span className="text-foreground font-semibold">Ticket TKT-P2-2026-08-14-001 </span>
                    <span className="text-muted-foreground">· requested by Coordinator · Denver Financial install · $3,200 · Aug 12-13</span>
                </div>
            </div>
            </>
            )}

            <DataSourcesBar groups={dataGroups} label="W-9 OCR · source PDF → Strata OCR → field validation" />
        </div>
    )
}
