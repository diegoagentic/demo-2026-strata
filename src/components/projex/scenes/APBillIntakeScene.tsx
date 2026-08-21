/**
 * COMPONENT: APBillIntakeScene (Projex · p1.2)
 * PURPOSE: A Teknion vendor invoice arrives at ap@projex-inc.com · single PO
 *          for the NCBA project · 291 lines. Strata OCR pipeline visible:
 *          Email Intake → OCR → PO Matcher → NetSuite Bot.
 *          Header extracted first · 291 line items reveal staggered · OCR
 *          confidence 97%.
 *
 * DS TOKENS: bg-card · bg-primary · bg-ai-light + text-ai · border-border ·
 *            text-muted-foreground · tabular-nums
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · Compliance "20/hr easy · 5/hr tough" ·
 *                  Multi-Line Edit tool + "match to the penny" rule
 * REUSE FROM: simulations/AgentPipelineStrip.tsx · mbi/EmailInboxDropZone.tsx ·
 *             modals/AIProcessingModal.tsx (multi-phase reveal pattern)
 */

import { useEffect, useState } from 'react'
import {
    Mail, FileText, Sparkles, CheckCircle2, ChevronRight, Loader2,
    Paperclip, Hash, DollarSign, ScanLine, ArrowRight, Eye,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import AgentPipelineStrip, { type AgentStep } from '../../simulations/AgentPipelineStrip'
import VendorInvoicePreview from '../VendorInvoicePreview'
import { PROJEX_BILLS_OVERNIGHT } from '../../../config/profiles/projex-data/bills'
import { PROJEX_VENDORS } from '../../../config/profiles/projex-data/vendors'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

// The 291-line NCBA Teknion bill (from bills.ts fixture)
const NCBA_BILL_ID = 'PJX-BILL-8471'

const PIPELINE_PHASES: { agents: AgentStep[] }[] = [
    // Phase 0 · email arriving
    {
        agents: [
            { id: 'intake', name: 'EmailIntake', status: 'running', detail: 'Reading ap@projex-inc.com' },
            { id: 'ocr', name: 'OCR', status: 'pending' },
            { id: 'matcher', name: 'POMatcher', status: 'pending' },
            { id: 'bot', name: 'NetSuiteBot', status: 'pending' },
        ],
    },
    // Phase 1 · OCR running
    {
        agents: [
            { id: 'intake', name: 'EmailIntake', status: 'done', detail: 'Attachment · TEK-0847.pdf' },
            { id: 'ocr', name: 'OCR', status: 'running', detail: 'Extracting 291 lines' },
            { id: 'matcher', name: 'POMatcher', status: 'pending' },
            { id: 'bot', name: 'NetSuiteBot', status: 'pending' },
        ],
    },
    // Phase 2 · Matcher running
    {
        agents: [
            { id: 'intake', name: 'EmailIntake', status: 'done', detail: 'Attachment · TEK-0847.pdf' },
            { id: 'ocr', name: 'OCR', status: 'done', detail: 'Conf 97%' },
            { id: 'matcher', name: 'POMatcher', status: 'running', detail: 'PO-2026-4421 · line-by-line' },
            { id: 'bot', name: 'NetSuiteBot', status: 'pending' },
        ],
    },
    // Phase 3 · NetSuite ready
    {
        agents: [
            { id: 'intake', name: 'EmailIntake', status: 'done', detail: 'Attachment · TEK-0847.pdf' },
            { id: 'ocr', name: 'OCR', status: 'done', detail: 'Conf 97%' },
            { id: 'matcher', name: 'POMatcher', status: 'done', detail: '291 / 291 match' },
            { id: 'bot', name: 'NetSuiteBot', status: 'running', detail: 'Ready for save' },
        ],
    },
    // Phase 4 · complete
    {
        agents: [
            { id: 'intake', name: 'EmailIntake', status: 'done', detail: 'Attachment · TEK-0847.pdf' },
            { id: 'ocr', name: 'OCR', status: 'done', detail: 'Conf 97%' },
            { id: 'matcher', name: 'POMatcher', status: 'done', detail: '291 / 291 match' },
            { id: 'bot', name: 'NetSuiteBot', status: 'done', detail: 'Ready for review · Accounting' },
        ],
    },
]

// ─── Extracted fields (revealed staggered) ─────────────────────────────────────

interface ExtractedField {
    key: string
    label: string
    value: string
    conf: number
}

const EXTRACTED_FIELDS: ExtractedField[] = [
    { key: 'vendor',    label: 'Vendor',          value: 'Teknion',                                       conf: 99 },
    { key: 'mfg',       label: 'Mfg code',        value: 'TEK',                                           conf: 99 },
    { key: 'invoice',   label: 'Vendor invoice #', value: 'TEK-2026-0847',                                 conf: 99 },
    { key: 'po',        label: 'PO #',            value: 'PO-2026-4421',                                  conf: 98 },
    { key: 'project',   label: 'Project',         value: 'NCBA · National Cattlemen\'s Beef Association', conf: 96 },
    { key: 'entity',    label: 'Legal entity',    value: 'Projex Inc.',                                   conf: 99 },
    { key: 'amount',    label: 'Amount',          value: '$47,238.11',                                    conf: 99 },
    { key: 'lines',     label: 'Line items',      value: '291',                                           conf: 97 },
    { key: 'terms',     label: 'Terms',           value: 'Net 10 · 1.5%/mo late',                         conf: 98 },
    { key: 'ship',      label: 'Ship-to',         value: 'NCBA · Centennial, CO',                         conf: 95 },
]

// ─── Scene ────────────────────────────────────────────────────────────────────

export default function APBillIntakeScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const [phase, setPhase] = useState(0)
    const [revealedFields, setRevealedFields] = useState(0)
    const [previewOpen, setPreviewOpen] = useState(false)

    const bill = PROJEX_BILLS_OVERNIGHT.find(b => b.id === NCBA_BILL_ID)
    const vendor = PROJEX_VENDORS.find(v => v.id === bill?.vendorId)

    // Pipeline choreography · 5 phases · ~1.4s each
    useEffect(() => {
        if (phase >= PIPELINE_PHASES.length - 1) return
        const cancel = pauseAwareTimeout(() => setPhase(p => p + 1), 1400)
        return cancel
    }, [phase, pauseAwareTimeout])

    // Field reveal cadence · starts once OCR done (phase 2)
    useEffect(() => {
        if (phase < 2) { setRevealedFields(0); return }
        if (revealedFields >= EXTRACTED_FIELDS.length) return
        const cancel = pauseAwareTimeout(() => setRevealedFields(n => n + 1), 220)
        return cancel
    }, [phase, revealedFields, pauseAwareTimeout])
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
            <h1 className="text-2xl font-bold text-foreground">
                    Vendor bill in the AP inbox · Teknion 291-line PO (NCBA)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Overnight · a Teknion invoice lands at ap@projex-inc.com · Strata reads all 291 lines in seconds instead of the ~40 min Accounting would spend keying it by hand.
                </p>
            </div>

            {/* Agent pipeline strip */}
            <AgentPipelineStrip agents={PIPELINE_PHASES[phase].agents} accentColor="purple" />

            {/* Layout · email envelope (left) + extracted fields (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 items-start">

                {/* Email envelope + attachment preview */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Inbound email</span>
                        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">02:14 AM</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                        <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-2 text-[12px]">
                            <span className="text-muted-foreground">From</span>
                            <span className="text-foreground font-medium">billing@teknion.com</span>
                            <span className="text-muted-foreground">To</span>
                            <span className="text-foreground">ap@projex-inc.com</span>
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-foreground font-semibold">
                                Invoice TEK-2026-0847 · PO-2026-4421 · NCBA project · $47,238.11
                            </span>
                        </div>
                        <div className="pt-3 border-t border-border text-[12px] text-foreground/80 leading-relaxed">
                            Please find attached invoice <span className="font-mono">TEK-2026-0847</span> covering line items <span className="tabular-nums">1-291</span> for PO <span className="font-mono">PO-2026-4421</span>. Payment terms Net 10. Thank you.
                        </div>
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="mt-2 w-full flex items-center gap-2 bg-muted/40 hover:bg-muted rounded-lg px-3 py-2 border border-border hover:border-primary/60 transition-colors group text-left"
                            aria-label="Preview invoice document"
                        >
                            <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <FileText className="h-4 w-4 text-foreground" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-foreground truncate">TEK-2026-0847.pdf</div>
                                <div className="text-[10px] text-muted-foreground tabular-nums">14 pages · 291 line items</div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground bg-background border border-border rounded px-1.5 py-0.5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                                <Eye className="h-3 w-3" aria-hidden="true" />
                                Preview
                            </span>
                            {phase >= 1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ai bg-ai-light rounded px-1.5 py-0.5">
                                    <ScanLine className="h-3 w-3" aria-hidden="true" />
                                    OCR
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Extracted fields · staggered reveal */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Extracted fields</span>
                        <span className="ml-auto text-[10px] font-bold tabular-nums bg-ai-light text-ai rounded px-1.5 py-0.5">
                            OCR conf 97%
                        </span>
                    </div>
                    <div className="p-4">
                        {phase < 1 && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Waiting for OCR…
                            </div>
                        )}
                        {phase >= 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                {EXTRACTED_FIELDS.slice(0, revealedFields).map(f => (
                                    <div
                                        key={f.key}
                                        className="animate-in fade-in slide-in-from-left-1 duration-300 grid grid-cols-[100px_1fr_36px] items-center gap-2 border-b border-border/40 pb-1.5 last:border-0"
                                    >
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
                                        <span className="text-xs text-foreground font-medium truncate">{f.value}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground tabular-nums text-right">{f.conf}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {phase >= 3 && (
                        <div className="px-4 pb-4">
                            <div className="animate-in fade-in duration-500 rounded-lg border border-success/40 bg-success/5 px-3 py-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                                <span className="text-xs text-foreground">
                                    All 291 lines mapped exact-to-the-penny · ready for Accounting's line-item review.
                                </span>
                                <button
                                    onClick={nextStep}
                                    className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-1.5 px-3 hover:opacity-90 transition-opacity shadow-sm"
                                >
                                    Open line-item review
                                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Volume context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/20 p-3 flex items-center gap-3">
                    <Hash className="h-8 w-8 text-muted-foreground p-1.5 bg-muted rounded-lg" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">291</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Line items in one PO</div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-muted-foreground p-1.5 bg-muted rounded-lg" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">
                            ${bill?.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Bill total · NCBA</div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-ai p-1.5 bg-ai-light rounded-lg" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground leading-none">
                            {vendor?.billsLast12mo}<span className="text-xs font-normal text-muted-foreground ml-1">bills / 12mo</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Teknion volume · ~70% of Projex</div>
                    </div>
                </div>
            </div>


            {/* Vendor invoice preview · mock (no real PDF for fictional Teknion) */}
            {bill && (
                <VendorInvoicePreview
                    isOpen={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    bill={bill}
                    vendorName={vendor?.name ?? 'Teknion'}
                    vendorAddress="1150 Flint Rd · Toronto ON M3J 2J5 · Canada"
                />
            )}
        </div>
    )
}
