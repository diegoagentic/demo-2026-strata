/**
 * COMPONENT: OfficeworksDocumentReviewModal
 * PURPOSE: Stage-adaptive document review modal · Manager opens it from
 *          the OfficeworksFunnel to drill into MANATT project at any stage.
 *
 * CLONE OF: src/components/bfi/BFIDocumentReviewModal.tsx (simplified shell)
 *
 * STAGE: one of 15 — matches every demo step
 * LAYOUT:
 *   - Header (project · stage progress · close)
 *   - AI context banner (per stage)
 *   - Split pane: Left doc tabs (3/5) · Right stage panel (2/5)
 *   - Footer: Approve & Continue CTA → calls onValidate (= nextStep)
 *
 * DS TOKENS: bg-card · bg-ai/X · text-foreground · semantic only
 */

import { Fragment, useEffect, useRef, useState } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Sparkles, FileText, MapPin, ClipboardCheck, ArrowRight, AlertCircle, CheckCircle2, FileWarning, Image as ImageIcon, Eye, UserCheck, Users, Paperclip, Mail, Loader2, HelpCircle, ShieldCheck, Search, AlertTriangle, DollarSign, Send, Calendar, Layers } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import { MANATT_ORDER_META } from './shared/manattOrderData'
import { OFFICEWORKS_FUNNEL } from './shared/funnelStages'
import CapacityHeatmap from './shared/CapacityHeatmap'
import BlueprintFloorPlan from './shared/BlueprintFloorPlan'
import { OFFICEWORKS_PDFS } from './shared/PDFPreviewModal'
import { findDesigner, regionLabel, computeCapacity } from './shared/designerProfiles'
import RequestInfoDialog from '../shared/RequestInfoDialog'

// 16 stages matching demo steps (intake split into intake/intake-complete)
export type OfficeworksReviewStage =
    | 'intake' | 'intake-complete'
    | 'design' | 'bom-gen' | 'validation' | 'field-verify'
    | 'sq-check' | 'teknion-preview' | 'spec-gap' | 'phasing'
    | 'self-audit' | 'peer-review' | 'submission' | 'handoff' | 'ack-review'

// Stage → funnel column index (5 cols: intake / design / spec-check / submission / ack)
const STAGE_TO_COL: Record<OfficeworksReviewStage, number> = {
    'intake': 0, 'intake-complete': 0,
    'design': 1, 'bom-gen': 1, 'validation': 1, 'field-verify': 1, 'sq-check': 1,
    'teknion-preview': 2, 'spec-gap': 2, 'phasing': 2, 'self-audit': 2, 'peer-review': 2,
    'submission': 3, 'handoff': 3,
    'ack-review': 4,
}

const STAGE_AI_BANNER: Record<OfficeworksReviewStage, string> = {
    'intake':           '75-80% of Works forms arrive incomplete · Strata detected missing CAD + blank SQ · email drafted to Caitlin',
    'intake-complete':  'Caitlin replied · CAD .dwg attached · SQ #436533 confirmed · designer assignment unlocked',
    'design':           'Three sub-steps · (1) Upload BOM · Strata analyzes + 3 findings · (2) Attach validation deck · Strata reads 6 sections · (3) Send proposal to client · GW2A gate clears on Felicia\'s sign-off',
    'bom-gen':          'CAP generates BOM · 71 lines across 4 Tags · List $296,228 / Net $61,464.80 · 13 CRs (25-40 days)',
    'validation':       'Google Slides auto-compiled · client approval gate · GW2A revision type sub-gateway',
    'field-verify':     'Pre-installation drawings sent to Abigail PM · field verification BEFORE Teknion order',
    'sq-check':         'MANATT GSA · SQ #436533 confirmed · Create platform inline · 2025 catalog vigente',
    'teknion-preview':  'Tifani returns preview · 1-2 weeks · GW3: clean / spec gap / timeline conflict',
    'spec-gap':         'Spec gap on CR 2046138 (40-day leadtime) · Strata suggests fix · resubmit preview',
    'phasing':          'Teknion can\'t meet date · 3-way huddle Designer + PM + Salesperson · phased plan',
    'self-audit':       'Kimberly checks her own BOM · 5-step audit · 71 lines × 6 attrs · 13 CRs · Today: 6h paper. With Strata: 25min.',
    'peer-review':      'Rebecca reviews Kimberly\'s audit · Felicia\'s tacit knowledge surfaces as rules (SC7)',
    'submission':       'BOM PDF + SP4 file to Caitlin + Coordinator · OW Best Practice template',
    'handoff':          'Coordinator uploads SP4 to NetSuite · 79% discount · Caitlin releases PO to Teknion',
    'ack-review':       'Gemini already in use · Strata supercharges · 71-line diff · 2 EE terminal states',
}

// ─── Sub-component: Stage progress stepper (5 stages) ──────────────────────────

function StageProgress({ activeCol }: { activeCol: number }) {
    return (
        <div className="flex items-center gap-1">
            {OFFICEWORKS_FUNNEL.map((s, i) => {
                const isPast = i < activeCol
                const isActive = i === activeCol
                return (
                    <Fragment key={s.id}>
                        <div className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium ${
                            isActive ? 'bg-primary text-primary-foreground' :
                            isPast ? 'bg-success/10 text-success' :
                            'bg-muted text-muted-foreground'
                        }`}>
                            <span className="font-mono tabular-nums">{i + 1}</span>
                            <span>{s.label}</span>
                        </div>
                        {i < OFFICEWORKS_FUNNEL.length - 1 && (
                            <div className={`h-px w-3 ${isPast ? 'bg-success/40' : 'bg-border'}`} />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}

// ─── Document tabs (left panel) ────────────────────────────────────────────────

const DOC_TABS = [
    { id: 'works-form' as const, icon: FileText, label: 'Works Form' },
    { id: 'bom' as const,        icon: ClipboardCheck, label: 'BOM' },
    { id: 'validation' as const, icon: FileText, label: 'Validation Doc' },
    { id: 'floor-plan' as const, icon: MapPin, label: 'Floor Plan' },
    { id: 'attachments' as const, icon: Paperclip, label: 'Attachments' },
    { id: 'ack' as const,        icon: FileText, label: 'Acknowledgment' },
] as const

type DocTab = typeof DOC_TABS[number]['id']

// Stage-aware tab visibility. Flow 1 + Flow 2 (design through sq-check) start
// with a 3-tab contextual base (Works Form, Floor Plan, Attachments). The BOM
// and Validation Doc tabs are added dynamically by DefaultDocTabs once the
// designer uploads the BOM (sc1.2) or compiles the validation doc (sc1.3) —
// see FlowProgress.
const STAGE_TABS: Partial<Record<OfficeworksReviewStage, DocTab[]>> = {
    'intake': ['works-form', 'floor-plan', 'attachments'],
    'intake-complete': ['works-form', 'floor-plan', 'attachments'],
    'design': ['works-form', 'floor-plan', 'attachments'],
    'sq-check': ['works-form', 'floor-plan', 'attachments'],
}
const DEFAULT_TAB_SET: DocTab[] = ['works-form', 'bom', 'validation', 'floor-plan', 'ack']

// Flags toggled by Flow 2 panels as the designer produces artifacts.
// Used by DefaultDocTabs to reveal the BOM / Validation Doc tabs and by
// BOMPreview to flip from placeholder to real table.
// `validationStarted` flips at sub-step 2 (designer clicks "Attach validation
// deck") so the tab appears as an empty placeholder · `validationCompiled`
// flips at the end of processing so the tab fills with the file + sections.
interface FlowProgress {
    bomUploaded: boolean
    validationStarted: boolean
    validationCompiled: boolean
    clientApproved: boolean
}

// Default doc tab per stage (which document is most relevant)
const DEFAULT_DOC: Record<OfficeworksReviewStage, DocTab> = {
    'intake': 'works-form', 'intake-complete': 'works-form',
    'design': 'floor-plan', 'bom-gen': 'bom', 'validation': 'validation', 'field-verify': 'floor-plan',
    'sq-check': 'bom', 'teknion-preview': 'bom', 'spec-gap': 'bom', 'phasing': 'bom',
    'self-audit': 'bom', 'peer-review': 'bom',
    'submission': 'bom', 'handoff': 'bom',
    'ack-review': 'ack',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    isOpen: boolean
    onClose: () => void
    stage: OfficeworksReviewStage
    /** Called when user clicks "Approve & Continue" — advances demo */
    onValidate: () => void
    /** Optional override for the right-panel content (used by parent to inject hero scenes) */
    rightPanelOverride?: React.ReactNode
    /** Optional override for the left doc panel (default shows BOM/floor plan placeholders) */
    leftPanelOverride?: React.ReactNode
    /** Bypass split-pane entirely · use full modal body for the content (hero scenes) */
    fullContent?: React.ReactNode
    /** Currently assigned designer (passed in from parent state) · used by IntakeAssignPanel */
    assignedDesigner?: string | null
    /** Called when user assigns/changes a designer from inside the modal */
    onAssignDesigner?: (name: string) => void
}

export default function OfficeworksDocumentReviewModal({
    isOpen, onClose, stage, onValidate, rightPanelOverride, leftPanelOverride, fullContent,
    assignedDesigner, onAssignDesigner,
}: Props) {
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    const leftOffset = isDemoActive && !isSidebarCollapsed ? 'left-80' : 'left-0'
    const activeCol = STAGE_TO_COL[stage]
    const aiBanner = STAGE_AI_BANNER[stage]

    // Modal-level progress flags · drive dynamic tab visibility + BOMPreview gate
    const [flowProgress, setFlowProgress] = useState<FlowProgress>({
        bomUploaded: false,
        validationStarted: false,
        validationCompiled: false,
        clientApproved: false,
    })
    // Defensive reset when the modal returns to a pre-Flow-2 stage (back-navigation).
    // The DesignBOMPanel owns its own state machine for the 3 sub-steps in sc1.2.
    useEffect(() => {
        if (stage === 'intake' || stage === 'intake-complete') {
            setFlowProgress({ bomUploaded: false, validationStarted: false, validationCompiled: false, clientApproved: false })
        }
    }, [stage])
    const markBomUploaded       = () => setFlowProgress(p => ({ ...p, bomUploaded: true }))
    const markValidationStarted = () => setFlowProgress(p => ({ ...p, validationStarted: true }))
    const markValidationDone    = () => setFlowProgress(p => ({ ...p, validationCompiled: true }))
    const markClientApproved    = () => setFlowProgress(p => ({ ...p, clientApproved: true }))

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 bg-black/50 backdrop-blur-sm`} />
                </TransitionChild>

                <div className={`fixed top-0 ${leftOffset} right-0 bottom-0 overflow-y-auto`}>
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-6xl h-[calc(100vh-1.5rem)] transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl border border-border flex flex-col">

                                {/* ── Header ── */}
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4 shrink-0">
                                    <div className="flex items-center gap-3 min-w-0 shrink-0">
                                        <div className="h-9 w-9 rounded-xl bg-ai/10 text-ai flex items-center justify-center shrink-0">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-[15px] font-bold text-foreground leading-tight truncate">
                                                Document Review — MANATT 4th Floor
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Stage progress in header */}
                                    <div className="flex-1 flex justify-center min-w-0 overflow-hidden">
                                        <StageProgress activeCol={activeCol} />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* AI context banner (per stage) */}
                                <div className="px-6 py-2 bg-ai/5 border-b border-ai/20 flex items-center gap-2 shrink-0">
                                    <Sparkles className="h-3.5 w-3.5 text-ai shrink-0" />
                                    <p className="text-[11px] text-ai font-medium truncate">
                                        <span className="font-bold">Strata AI · </span>{aiBanner}
                                    </p>
                                </div>

                                {/* ── Body: either fullContent (heros) or split-pane (default) ── */}
                                {fullContent ? (
                                    <div className="flex-1 min-h-0 overflow-y-auto p-5 bg-muted/10">
                                        {fullContent}
                                    </div>
                                ) : (
                                    <div className="flex-1 grid grid-cols-5 min-h-0">
                                        {/* Left: Document tabs */}
                                        <div className="col-span-3 border-r border-border flex flex-col min-h-0">
                                            {leftPanelOverride ?? <DefaultDocTabs stage={stage} flowProgress={flowProgress} />}
                                        </div>

                                        {/* Right: Stage-adaptive panel */}
                                        <div className="col-span-2 flex flex-col min-h-0 overflow-hidden">
                                            {(() => {
                                                if (rightPanelOverride) {
                                                    return (
                                                        <>
                                                            <div className="flex-1 overflow-y-auto p-5">{rightPanelOverride}</div>
                                                        </>
                                                    )
                                                }
                                                // Flow 1 · intake assign · owns its own CTA
                                                if (stage === 'intake' || stage === 'intake-complete') {
                                                    return (
                                                        <IntakeAssignPanel
                                                            stage={stage}
                                                            assignedDesigner={assignedDesigner ?? null}
                                                            onAssignDesigner={onAssignDesigner}
                                                            onValidate={onValidate}
                                                        />
                                                    )
                                                }
                                                // Flow 2 · interactive panels (each owns its own CTA)
                                                if (stage === 'design')     return <DesignBOMPanel onValidate={onValidate} onBOMUploaded={markBomUploaded} onValidationStarted={markValidationStarted} onValidationCompiled={markValidationDone} onClientApproved={markClientApproved} bomUploaded={flowProgress.bomUploaded} />
                                                if (stage === 'sq-check')   return <SQCheckPanel onValidate={onValidate} />
                                                // Flow 3 · 2 interactive panels
                                                if (stage === 'teknion-preview') return <TeknionPreviewPanel onValidate={onValidate} />
                                                if (stage === 'spec-gap')        return <SpecGapResolvePanel onValidate={onValidate} />
                                                // Default · static description + Approve & Continue
                                                return (
                                                    <>
                                                        <div className="flex-1 overflow-y-auto p-5">
                                                            <DefaultStagePanel stage={stage} onValidate={onValidate} />
                                                        </div>
                                                        <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={onValidate}
                                                                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                                                            >
                                                                Approve & Continue
                                                                <ArrowRight className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Default doc tabs (left panel) ─────────────────────────────────────────────

function DefaultDocTabs({ stage, flowProgress }: { stage: OfficeworksReviewStage; flowProgress: FlowProgress }) {
    const baseTabIds = STAGE_TABS[stage] ?? DEFAULT_TAB_SET
    const visibleTabIds: DocTab[] = [...baseTabIds]
    // Dynamic tabs · appear once their artifact exists.
    if (flowProgress.bomUploaded && !visibleTabIds.includes('bom')) visibleTabIds.push('bom')
    if ((flowProgress.validationStarted || flowProgress.validationCompiled) && !visibleTabIds.includes('validation')) visibleTabIds.push('validation')
    const visibleTabs = DOC_TABS.filter(t => visibleTabIds.includes(t.id))
    const [activeTab, setActiveTab] = useState<DocTab>(DEFAULT_DOC[stage])

    // Auto-surface the BOM tab the moment the upload completes (bomUploaded → true).
    // Deterministic: fires on the same render the 'bom' tab becomes visible.
    useEffect(() => {
        if (flowProgress.bomUploaded) setActiveTab('bom')
    }, [flowProgress.bomUploaded])

    // "View in BOM" / "View floor plan" links anywhere in the modal surface their tab.
    useEffect(() => {
        const surfaceBom = () => setActiveTab('bom')
        const surfaceFloorPlan = () => setActiveTab('floor-plan')
        const surfaceValidation = () => setActiveTab('validation')
        window.addEventListener('officeworks:bom-tab-focus', surfaceBom)
        window.addEventListener('officeworks:floor-plan-focus', surfaceFloorPlan)
        window.addEventListener('officeworks:validation-tab-focus', surfaceValidation)
        return () => {
            window.removeEventListener('officeworks:bom-tab-focus', surfaceBom)
            window.removeEventListener('officeworks:floor-plan-focus', surfaceFloorPlan)
            window.removeEventListener('officeworks:validation-tab-focus', surfaceValidation)
        }
    }, [])

    return (
        <>
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b border-border bg-muted/30 shrink-0 px-4 pt-2 overflow-x-auto">
                {visibleTabs.map(tab => {
                    const isDynamic = (tab.id === 'bom' && flowProgress.bomUploaded)
                                   || (tab.id === 'validation' && flowProgress.validationCompiled)
                    const isBaseTab = baseTabIds.includes(tab.id)
                    const justArrived = isDynamic && !isBaseTab
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 mr-1 shrink-0 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            } ${justArrived ? 'animate-in fade-in slide-in-from-right-1 duration-300' : ''}`}
                        >
                            <tab.icon className="h-3 w-3" />
                            {tab.label}
                            {justArrived && (
                                <span className="ml-1 text-[8px] font-bold uppercase tracking-wider bg-success/15 text-success border border-success/30 rounded px-1 py-0 animate-pulse">
                                    new
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
                <DocTabContent tab={activeTab} stage={stage} flowProgress={flowProgress} />
            </div>
        </>
    )
}

// ─── Doc tab content dispatch (real previews) ─────────────────────────────────

function DocTabContent({ tab, stage, flowProgress }: { tab: DocTab; stage: OfficeworksReviewStage; flowProgress: FlowProgress }) {
    if (tab === 'works-form') return <WorksFormPreview stage={stage} />
    if (tab === 'bom') return <BOMPreview stage={stage} bomUploaded={flowProgress.bomUploaded} />
    if (tab === 'validation') return <ValidationDocPreview validationCompiled={flowProgress.validationCompiled} clientApproved={flowProgress.clientApproved} />
    if (tab === 'floor-plan') return <FloorPlanPreview stage={stage} />
    if (tab === 'attachments') return <AttachmentsPreview stage={stage} />
    if (tab === 'ack') return <AckPreview stage={stage} />
    return null
}

// ─── Works Form preview · highlights missing fields at intake ────────────────

interface FormField {
    label: string
    value: string | null
    status: 'complete' | 'missing'
    required: boolean
    note?: string
}

function WorksFormPreview({ stage }: { stage: OfficeworksReviewStage }) {
    // Only at sc1.0 (intake) are CAD + SQ missing. From sc1.0b (intake-complete) onward
    // the reply arrived and the form is complete.
    const isIntakePending = stage === 'intake'
    const isIntakeComplete = stage === 'intake-complete'
    const cadValue = isIntakePending
        ? null
        : isIntakeComplete
            ? 'manatt-4th-floor.dwg · received 2026-04-17 11:08 from Caitlin'
            : 'manatt-4th-floor.dwg · received 18h after submission'

    const fields: FormField[] = [
        { label: 'Client', value: 'Manatt Phelps & Phillips LLP', status: 'complete', required: true },
        { label: 'Project', value: 'MANATT · 4th Floor · Workstations', status: 'complete', required: true },
        { label: 'Market', value: 'DC (Washington D.C.)', status: 'complete', required: true },
        { label: 'Scope', value: '~30 workstations · Standard/Large', status: 'complete', required: true },
        { label: 'Submitted by', value: 'Caitlin Barolet · DC Salesrep', status: 'complete', required: true },
        { label: 'Co-submitter', value: 'Danielle Dunlap', status: 'complete', required: false },
        { label: 'CAD file (.dwg)', value: cadValue, status: isIntakePending ? 'missing' : 'complete', required: true, note: isIntakePending ? 'Required to start design in CET' : undefined },
        { label: 'PDF floor plan', value: 'manatt-4th-floor-floorplan.pdf', status: 'complete', required: false },
        { label: 'SQ number (price-protected)', value: isIntakePending ? null : `#${MANATT_ORDER_META.specialQuote}`, status: isIntakePending ? 'missing' : 'complete', required: true, note: isIntakePending ? 'GSA client · price protection required' : undefined },
        { label: 'Catalog effective', value: isIntakePending ? 'Strata suggests 2025' : '2025', status: 'complete', required: true },
        { label: 'Due date', value: '2026-03-20 (Sched Ship)', status: 'complete', required: true },
    ]

    const missingCount = fields.filter(f => f.status === 'missing').length

    return (
        <div className="h-full overflow-y-auto p-6 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Google Form · Works Intake</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Submitted 2026-04-16 · auto-routed to 3 design managers</div>
                    </div>
                    {isIntakePending && missingCount > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-md px-2 py-1 animate-pulse">
                            {missingCount} missing
                        </span>
                    )}
                    {isIntakeComplete && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            Complete
                        </span>
                    )}
                </div>

                {/* AI helper line at intake */}
                {isIntakePending && missingCount > 0 && (
                    <div className="px-4 py-2 bg-ai/5 border-b border-ai/20 flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <div className="text-[11px] text-ai">
                            <span className="font-bold">Strata flagged {missingCount} missing required fields</span> · email drafted to Caitlin Barolet · CAD must arrive before design can start in CET (Task 3)
                        </div>
                    </div>
                )}

                {/* Form fields */}
                <div className="divide-y divide-border">
                    {fields.map((f, i) => (
                        <div
                            key={i}
                            className={`px-4 py-2.5 grid grid-cols-3 gap-3 items-center text-sm ${
                                f.status === 'missing' ? 'bg-warning/5' : ''
                            }`}
                        >
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                {f.label}
                                {f.required && <span className="text-destructive">*</span>}
                            </div>
                            <div className="col-span-2 flex items-center justify-between gap-2">
                                <span className={`text-sm flex-1 truncate ${
                                    f.status === 'missing' ? 'text-warning italic' : 'text-foreground'
                                }`}>
                                    {f.value ?? '— required —'}
                                </span>
                                {f.status === 'missing' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/30 rounded px-1.5 py-0.5 shrink-0 animate-pulse">
                                        <AlertCircle className="h-3 w-3" />
                                        Missing
                                    </span>
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                )}
                            </div>
                            {f.note && (
                                <div className="col-span-3 text-[10px] text-warning italic pl-2 -mt-1">{f.note}</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground text-center">
                    The Works form (intranet) · auto-routes to all 3 design managers · 24-48h assignment SLA (not enforced)
                </div>
            </div>
        </div>
    )
}

// ─── BOM tab ──────────────────────────────────────────────────────────────────

function BOMPreview({ bomUploaded }: { stage: OfficeworksReviewStage; bomUploaded: boolean }) {
    // BOM tab is invisible until the designer uploads (see DefaultDocTabs), but
    // if the tab is forced open (e.g., via dev), show a clear placeholder.
    if (!bomUploaded) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <ClipboardCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">BOM not yet uploaded</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            The designer builds the BOM externally in CET / CAP and uploads the file (.pdf, .sp4, .xlsx) to Strata. Awaiting upload in the right panel.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-muted/20">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2 shrink-0">
                <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    MANATT-4F_BOM_v1.pdf · 149 line items · $1,541,392 List
                </div>
                <span className="ml-auto text-[10px] text-success font-medium">Uploaded</span>
            </div>
            <iframe
                // #navpanes=0 hides the native thumbnail sidebar · view=FitH fits page width
                src={`${OFFICEWORKS_PDFS.manattBOM}#navpanes=0&view=FitH`}
                title="MANATT 4F BOM"
                className="flex-1 w-full border-0 bg-card"
            />
        </div>
    )
}

// ─── Validation Doc tab ───────────────────────────────────────────────────────

// Strata's analysis of the validation document the designer attached.
// 6 sections detected across 24 slides · order matches typical OW Validation Doc.
const VALIDATION_DOC_SECTIONS = [
    { page: 1,  title: 'Overall floor plan',  detail: 'CAD-aligned · 71 stations across 4 workstation groups',         iconKey: 'plan' },
    { page: 4,  title: '2D drawings',          detail: 'Workstation typicals + dimensions for each room type',          iconKey: 'draw' },
    { page: 9,  title: '3D renderings',        detail: 'Photo-real preview of the finished space',                      iconKey: 'cube' },
    { page: 14, title: 'Finishes catalog',     detail: 'Mica Very White 83 · Smooth Felt Admiral Blue · Flintwood 5N',  iconKey: 'palette' },
    { page: 18, title: 'Wire management',      detail: 'E-chain · cable wrap · power cubes · monitor arms',             iconKey: 'cable' },
    { page: 21, title: 'Electrical layout',    detail: 'Washington D.C. code · base feed visible · Power Spine 120',    iconKey: 'zap' },
] as const

function SectionIcon({ iconKey }: { iconKey: string }) {
    const cls = 'h-3.5 w-3.5 text-muted-foreground shrink-0'
    if (iconKey === 'plan')    return <MapPin       className={cls} aria-hidden="true" />
    if (iconKey === 'draw')    return <FileText     className={cls} aria-hidden="true" />
    if (iconKey === 'cube')    return <ImageIcon    className={cls} aria-hidden="true" />
    if (iconKey === 'palette') return <Sparkles     className={cls} aria-hidden="true" />
    if (iconKey === 'cable')   return <Search       className={cls} aria-hidden="true" />
    if (iconKey === 'zap')     return <ShieldCheck  className={cls} aria-hidden="true" />
    return <FileText className={cls} aria-hidden="true" />
}

interface ValidationDocPreviewProps {
    validationCompiled: boolean
    clientApproved?: boolean
}

function ValidationDocPreview({ validationCompiled, clientApproved = false }: ValidationDocPreviewProps) {
    const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle')
    const [sendInfoVisible, setSendInfoVisible] = useState(false)

    if (!validationCompiled) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto" aria-hidden="true">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Validation document not yet attached</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            The designer prepares the presentation outside Strata (Google Slides, PowerPoint, etc.) and attaches it here. Send it from the right panel to populate this tab.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const handleDownload = () => {
        setDownloadState('downloading')
        setTimeout(() => setDownloadState('done'), 1200)
    }

    const handleSend = () => {
        setSendInfoVisible(true)
        setTimeout(() => setSendInfoVisible(false), 2400)
    }

    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20 space-y-4">
            {/* File card · the uploaded presentation */}
            <section
                aria-label="Validation document"
                className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto"
            >
                <div className="px-4 py-3 flex items-start gap-3">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground truncate">MANATT-Validation-Doc-v1.pptx</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 shrink-0">
                                Uploaded
                            </span>
                            {clientApproved && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 shrink-0">
                                    Approved by client
                                </span>
                            )}
                            {!clientApproved && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded px-1.5 py-0.5 shrink-0">
                                    Awaiting approval
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            1.8 MB · 24 slides · attached by Designer
                        </div>
                    </div>
                </div>
                <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 bg-muted/20">
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloadState === 'downloading'}
                        aria-label="Download MANATT validation document"
                        aria-busy={downloadState === 'downloading'}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-60"
                    >
                        {downloadState === 'downloading' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                        {downloadState === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />}
                        {downloadState === 'idle' && <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />}
                        {downloadState === 'idle' && 'Download'}
                        {downloadState === 'downloading' && 'Downloading…'}
                        {downloadState === 'done' && 'Downloaded'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        aria-label="Re-send validation document to client"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                    >
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        Send
                    </button>
                    {sendInfoVisible && (
                        <span role="status" className="text-[10px] italic text-muted-foreground animate-in fade-in duration-200">
                            Resend opens from the right panel
                        </span>
                    )}
                </div>
            </section>

            {/* Strata's page analysis · replaces the old empty card grid */}
            <section
                aria-label="Validation document section analysis by Strata"
                className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto"
            >
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                        Strata read the document · 6 sections detected
                    </span>
                </div>
                <ul className="divide-y divide-border">
                    {VALIDATION_DOC_SECTIONS.map(s => (
                        <li key={s.page} className="px-4 py-2.5 flex items-start gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-7 shrink-0 mt-0.5" aria-hidden="true">
                                {String(s.page).padStart(2, '0')}.
                            </span>
                            <span className="mt-0.5">
                                <SectionIcon iconKey={s.iconKey} />
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground">
                                    <span className="sr-only">Page {s.page}: </span>{s.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}

// ─── Floor Plan tab · BlueprintFloorPlan shared SVG (lifted from BFI) ─────────

function FloorPlanPreview({ stage }: { stage: OfficeworksReviewStage }) {
    const isIntakePending = stage === 'intake'
    const isIntakeComplete = stage === 'intake-complete'
    const headerLabel = isIntakePending
        ? 'PDF Floor Plan · manatt-4th-floor-floorplan.pdf'
        : isIntakeComplete
            ? 'PDF Floor Plan + CAD · manatt-4th-floor.dwg attached'
            : 'CAD Floor Plan'
    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-3xl mx-auto">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {headerLabel}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">MANATT 4th Floor · 71 stations · WS-01(10) + WS-02(6)×2 + WS-02.A(8)</div>
                    </div>
                    {isIntakePending && (
                        <span className="text-[10px] text-muted-foreground font-medium">PDF · 4 pages · 2.1 MB</span>
                    )}
                    {isIntakeComplete && (
                        <span className="text-[10px] text-success font-medium">PDF + .dwg received ✓</span>
                    )}
                    {!isIntakePending && !isIntakeComplete && (
                        <span className="text-[10px] text-success font-medium">CAD verified ✓</span>
                    )}
                </div>
                <div className="p-4 bg-muted/10">
                    <BlueprintFloorPlan
                        locationLabel="Architectural Layout · MANATT 4th Floor"
                        zoneALabel="ZONE A · WORKSTATIONS WS-01/WS-02 ×22"
                        zoneBLabel="ZONE B · CONFERENCE + BREAK"
                        zoneCLabel="ZONE C · WS-02.A ×8 + STORAGE"
                        footerLabel={`Manatt Phelps & Phillips LLP · ${MANATT_ORDER_META.poNumber} · by Caitlin Barolet`}
                    />
                </div>
                <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground text-center">
                    {MANATT_ORDER_META.sqName} · {MANATT_ORDER_META.poNumber} · DC market · 4th Floor
                </div>
            </div>
        </div>
    )
}

// ─── Attachments tab · file list with status (intake-only) ────────────────────

function AttachmentsPreview({ stage }: { stage: OfficeworksReviewStage }) {
    const isIntakePending = stage === 'intake'
    const files = [
        {
            name: 'manatt-4th-floor-floorplan.pdf',
            kind: 'PDF',
            meta: 'Received with form · 2026-04-16 · 2.1 MB',
            status: 'attached' as const,
        },
        {
            name: 'manatt-4th-floor.dwg',
            kind: 'CAD',
            meta: isIntakePending
                ? 'Required to start design in CET (Task 3)'
                : 'Received from Caitlin · 2026-04-17 11:08 · 4.8 MB',
            status: (isIntakePending ? 'missing' : 'attached') as 'missing' | 'attached',
        },
    ]
    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Attachments</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Files submitted with the Works form · auto-routed for review</div>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {files.map(f => (
                        <div key={f.name} className={`px-4 py-3 flex items-center gap-3 ${f.status === 'missing' ? 'bg-warning/5' : ''}`}>
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                                f.status === 'missing' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                            }`}>
                                {f.status === 'missing' ? <AlertCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">
                                    {f.name}
                                </div>
                                <div className={`text-[10px] mt-0.5 ${f.status === 'missing' ? 'text-warning italic' : 'text-muted-foreground'}`}>
                                    {f.meta}
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 shrink-0 ${
                                f.status === 'missing'
                                    ? 'bg-warning/10 text-warning border border-warning/30 animate-pulse'
                                    : 'bg-success/10 text-success border border-success/30'
                            }`}>
                                {f.status === 'missing' ? 'Missing' : 'Attached'}
                            </span>
                        </div>
                    ))}
                </div>

                {isIntakePending ? (
                    <div className="px-4 py-3 bg-ai/5 border-t border-ai/20 flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <div className="text-[11px] text-ai">
                            <span className="font-bold">Clarification email drafted to Caitlin Barolet.</span> CAD must arrive before design can start in CET (Task 3).
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-3 bg-success/5 border-t border-success/20 flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <div className="text-[11px] text-success">
                            <span className="font-bold">Caitlin replied · CAD and SQ resolved.</span> Form is complete · proceed to designer assignment.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Acknowledgment tab · real PDF iframe at ack-review · placeholder otherwise ─

function AckPreview({ stage }: { stage: OfficeworksReviewStage }) {
    if (stage !== 'ack-review') {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <FileWarning className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Acknowledgment not yet received</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Teknion acknowledgment arrives after the Sales Coordinator releases the PO (stage <span className="font-mono">handoff</span>).
                            Currently at stage <span className="font-mono">{stage}</span>.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="h-full flex flex-col bg-muted/20">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2 shrink-0">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Real Teknion Acknowledgment · {MANATT_ORDER_META.poNumber}
                </div>
                <span className="ml-auto text-[10px] text-success font-medium">Universal #{MANATT_ORDER_META.universal}</span>
            </div>
            <iframe
                src={OFFICEWORKS_PDFS.poAcknowledgment}
                title="PO-DC-0009642 Acknowledgment"
                className="flex-1 w-full border-0 bg-card"
            />
        </div>
    )
}

// ─── Default right panel (used for stages without a hero override) ─────────────

interface PanelProps { stage: OfficeworksReviewStage; onValidate: () => void }

function DefaultStagePanel({ stage }: PanelProps) {
    const intro: Record<OfficeworksReviewStage, { headline: string; body: React.ReactNode; cta?: string }> = {
        'intake': {
            headline: 'Form completeness · Assign designer',
            body: <>
                <p>Caitlin Barolet submitted the Works form for MANATT 4th Floor. <span className="text-warning font-medium">CAD file missing</span>, <span className="text-warning font-medium">SQ blank</span>.</p>
                <p className="mt-2">Strata drafted a clarifying email to Caitlin and surfaced the capacity heatmap. Felicia reviews the form and assigns the designer (GW1 soft check).</p>
            </>,
            cta: 'Request CAD + assign designer',
        },
        'design': {
            headline: 'CET layout in progress',
            body: <p>Kimberly drawing 32 typicals across 4 tag groups (WS-01/02/02/02.A) · Level 4. Teknion part library loaded. <span className="font-medium">Optional DDP parallel:</span> Prepare Deep Discounting BOM for volume discount negotiation.</p>,
            cta: 'Export to CAP',
        },
        'bom-gen': {
            headline: 'CAP exports BOM · 71 line items',
            body: <p>Specifications + electrical coordination embedded here (not standalone steps). Subtotals grouped per Tag (Alias 1) + Level 4 (Alias 2). List Total ${MANATT_ORDER_META.listTotal.toLocaleString()}.</p>,
            cta: 'Continue to validation',
        },
        'validation': {
            headline: 'Client approval gate (GW2A)',
            body: <p>Google Slides validation doc compiled (2D/3D drawings, finishes, electrical). Sent to MANATT for approval. <span className="text-warning font-medium">Primary delay driver.</span> If revisions: layout change → Task 3 (CET) · BOM-only → Task 4 (CAP).</p>,
            cta: 'Client approved · proceed',
        },
        'field-verify': {
            headline: 'Field verification (PM handoff)',
            body: <p>Pre-installation drawings (2D dimensions + blocking + electrical) sent to Abigail's PM team. Field verification happens <span className="font-medium">BEFORE order placed</span> with Teknion. Confirms GC built space to spec.</p>,
            cta: 'Field verification complete',
        },
        'sq-check': {
            headline: 'SQ #436533 · price-protected GSA',
            body: <p>MANATT is a price-protected law firm. Strata embeds the Teknion Create platform inline (no context switch · SC3 dramatized). Verifying SQ #436533 + 2025 catalog effective date.</p>,
            cta: 'Confirm SQ · use 2025 catalog',
        },
        'teknion-preview': {
            headline: 'Order Preview submitted to Tifani',
            body: <p>Form auto-filled from BOM. Submitted. Tifani's typical turnaround 1-2 weeks. <span className="font-medium">GW3 outcomes:</span> clean → audit · spec gap → Task 7A · timeline conflict → Task 7B phasing.</p>,
            cta: 'Clean response · proceed to audit',
        },
        'spec-gap': {
            headline: 'Resolve specification gaps',
            body: <p>Tifani flagged a spec gap on a 40-day CR. Strata suggests the fix · designer accepts/edits · BOM revised · preview resubmitted (sub-loop back to GW3).</p>,
            cta: 'Apply fix · resubmit preview',
        },
        'phasing': {
            headline: '3-way order phasing huddle',
            body: <p>Teknion can't meet Must-Arrive Date due to 40-day Flintwood CRs. 3-way comms: Designer + PM (Abigail) + Salesperson (Caitlin). Long-lead items phased into subsequent deliveries.</p>,
            cta: 'Phased plan accepted',
        },
        'self-audit':  { headline: 'Self-audit panel', body: <p>Hero panel · see right side.</p> },
        'peer-review': { headline: 'Peer review panel', body: <p>Hero panel · see right side.</p> },
        'submission': {
            headline: 'BOM Submission email',
            body: <p>Standard template auto-filled. Two attachments: BOM PDF + SP4 file (NetSuite-ready). Strata pre-validates SP4 against schema before send. Sent to Caitlin Barolet + Sales Coordinator.</p>,
            cta: 'Send for handoff',
        },
        'handoff': {
            headline: 'Coordinator → Salesperson handoff',
            body: <p>Cross-lane: Coordinator uploads SP4 to NetSuite + applies discount (79% off list = ${MANATT_ORDER_META.netTotal.toLocaleString()} net). Then Salesperson Caitlin releases the PO to Teknion (PO-DC-0009642 generated).</p>,
            cta: 'Wait for Teknion acknowledgment',
        },
        'ack-review': { headline: 'Acknowledgment review', body: <p>Hero panel · see right side.</p> },
    }

    const data = intro[stage]

    return (
        <div className="space-y-4 text-sm">
            <div>
                <h4 className="text-base font-semibold text-foreground">{data.headline}</h4>
                <div className="text-muted-foreground mt-2 leading-relaxed">{data.body}</div>
            </div>
        </div>
    )
}

// ─── IntakeAssignPanel · stage-aware: sc1.0 = send clarification · sc1.0b = assign ─

interface IntakeAssignPanelProps {
    stage: OfficeworksReviewStage
    assignedDesigner: string | null
    onAssignDesigner?: (name: string) => void
    onValidate: () => void
}

const REQUEST_MESSAGE = `Hi Caitlin,

Thanks for submitting the Works form for the MANATT 4th Floor build-out. To start the design in CET we need two items before we can route to a designer:

  · CAD floor plan (.dwg) · required for layout in CET (Task 3)
  · SQ number for the GSA price-protected client · Strata suggests #${MANATT_ORDER_META.specialQuote} (catalog 2025) · please confirm

The rest of the form is complete. As soon as the CAD arrives we'll assign and kick off.

— Strata (drafted on behalf of Felicia Miano-Poles · EVP Design & PM)
strata-ai@officeworks.com`

function IntakeAssignPanel({ stage, assignedDesigner, onAssignDesigner, onValidate }: IntakeAssignPanelProps) {
    const isIntakePending = stage === 'intake'
    const isIntakeComplete = stage === 'intake-complete'
    const designerProfile = assignedDesigner ? findDesigner(assignedDesigner) : null
    const [dialogOpen, setDialogOpen] = useState(false)
    const [sizeConfirmed, setSizeConfirmed] = useState(false)

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Form completeness summary · adapts to stage */}
                <div>
                    <h4 className="text-base font-semibold text-foreground">Form completeness</h4>
                    {isIntakePending ? (
                        <ul className="mt-2 space-y-1.5">
                            <li className="flex items-start gap-2 text-xs text-warning">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span><span className="font-semibold">CAD file missing</span> · Strata drafted email to Caitlin Barolet</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-warning">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span><span className="font-semibold">SQ blank</span> · GSA price-protected · Strata suggests SQ #{MANATT_ORDER_META.specialQuote} · catalog 2025</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-success">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>All other fields complete · proceed in parallel (GW1 soft check)</span>
                            </li>
                        </ul>
                    ) : (
                        <ul className="mt-2 space-y-1.5">
                            <li className="flex items-start gap-2 text-xs text-success">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span><span className="font-semibold">CAD .dwg received</span> · 4.8 MB · from Caitlin · 2026-04-17 11:08</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-success">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span><span className="font-semibold">SQ #{MANATT_ORDER_META.specialQuote} confirmed</span> · GSA price-protected · catalog 2025</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-success">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>All required fields satisfied · ready for designer assignment</span>
                            </li>
                        </ul>
                    )}
                </div>

                {/* sc1.0 · send clarification block */}
                {isIntakePending && (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Missing required information
                            </h4>
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning border border-warning/20 rounded px-2 py-0.5 animate-pulse">
                                Required
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Strata drafted a clarification email to <span className="font-medium text-foreground">Caitlin Barolet</span> requesting the CAD file (.dwg) and SQ number. Designer assignment unlocks once the response arrives.
                        </p>
                        <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                Email preview
                            </div>
                            <div className="text-foreground"><span className="text-muted-foreground">To: </span>caitlin.barolet@manatt.com</div>
                            <div className="text-foreground"><span className="text-muted-foreground">Subject: </span>MANATT 4th Floor · clarification needed · CAD file + SQ number</div>
                            <div className="text-muted-foreground line-clamp-2 pt-1">Thanks for submitting the Works form for the MANATT 4th Floor build-out. To start the design in CET we need two items before we can route to a designer…</div>
                        </div>
                    </div>
                )}

                {/* sc1.0b · resolved · designer list */}
                {isIntakeComplete && (() => {
                    const kim = findDesigner('Kimberly Tucker')
                    const kimCap = kim ? computeCapacity(kim) : null
                    const kimRationale = kimCap
                        ? `${kimCap.freeHours}h free this week / ${kimCap.availableHours}h available · prior MANATT · cross-market`
                        : 'prior MANATT · cross-market'
                    return (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <div className="font-semibold text-success">Caitlin replied with CAD + SQ confirmed · received 2026-04-17 11:08</div>
                                <div className="text-muted-foreground">Ready to assign · Felicia recommends Kimberly Tucker · {kimRationale}</div>
                            </div>
                        </div>

                        {/* Strata project-size identification (GW1B) · DM confirms before assigning */}
                        <div className="rounded-lg border border-ai/20 bg-ai/5 px-3 py-2.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                <Sparkles className="h-3 w-3 text-ai" />
                                Strata · project size (GW1B)
                            </div>
                            <div className="text-xs text-foreground">
                                Identified as{' '}
                                <RuleTooltip
                                    rule="GW1B project-size gateway: Small projects (1-5 stations) bypass several design tasks; Standard/Large run the full flow. MANATT is ~30 stations → Standard/Large."
                                    source="Source: officeworks-sot.md (project size) + BPMN gateway GW1B"
                                >
                                    <strong>Standard / Large</strong>
                                </RuleTooltip>
                                {' '}· ~30 stations · full design flow.
                            </div>
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sizeConfirmed}
                                    onChange={e => setSizeConfirmed(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                                />
                                <span className="text-[11px] text-foreground">Confirm project size · Standard / Large</span>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Assign designer
                            </h4>
                            {!assignedDesigner && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning border border-warning/20 rounded px-2 py-0.5 animate-pulse">
                                    Required
                                </span>
                            )}
                        </div>

                        <CapacityHeatmap
                            onSelect={onAssignDesigner}
                            selectedName={assignedDesigner}
                            highlightName="Kimberly Tucker"
                            priorClientHighlight={{
                                label: 'Worked with MANATT',
                                predicate: d => !!d.priorMANATT,
                            }}
                            compact
                        />

                        {designerProfile && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                                        <UserCheck className="h-3.5 w-3.5 text-foreground/70" />
                                        Assigning to {designerProfile.name}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground bg-primary/25 rounded px-1.5 py-0.5">{designerProfile.seniority}</span>
                                </div>
                                <div className="text-muted-foreground grid grid-cols-2 gap-2">
                                    <div><span className="text-[10px] uppercase">Region · </span>{regionLabel(designerProfile.region)}</div>
                                    <div><span className="text-[10px] uppercase">Utilization · </span>{designerProfile.utilization}%</div>
                                    <div><span className="text-[10px] uppercase">Active · </span>{designerProfile.projects.active.length} projects</div>
                                    <div><span className="text-[10px] uppercase">YTD · </span>{designerProfile.projects.completedYTD} completed</div>
                                </div>
                            </div>
                        )}
                    </div>
                    )
                })()}
            </div>

            {/* Footer CTA · stage-aware */}
            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {isIntakePending && (
                    <button
                        type="button"
                        onClick={() => setDialogOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        Open & send message
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
                {isIntakeComplete && (
                    <button
                        type="button"
                        onClick={onValidate}
                        disabled={!assignedDesigner || !sizeConfirmed}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {assignedDesigner && sizeConfirmed ? (
                            <>
                                Approve & Assign · Continue to Design
                                <ArrowRight className="h-4 w-4" />
                            </>
                        ) : !assignedDesigner ? (
                            'Select a designer to continue'
                        ) : (
                            'Confirm project size to continue'
                        )}
                    </button>
                )}
            </div>

            {/* RequestInfoDialog · only used in sc1.0; on send → advance demo to sc1.0b */}
            {isIntakePending && (
                <RequestInfoDialog
                    isOpen={dialogOpen}
                    onSent={() => { setDialogOpen(false); onValidate() }}
                    onClose={() => setDialogOpen(false)}
                    headerAvatar="CB"
                    headerLabel="Salesperson · DC market"
                    headerSubtitle="caitlin.barolet@manatt.com · Clarification Request"
                    defaults={{
                        from: 'strata-ai@officeworks.com',
                        to: 'caitlin.barolet@manatt.com',
                        cc: 'felicia.miano-poles@officeworks.com · EVP Design & PM',
                        date: '2026-04-16 · 10:48 AM',
                        subject: 'MANATT 4th Floor · clarification needed · CAD file + SQ number',
                        message: REQUEST_MESSAGE,
                        attachments: [{ name: 'manatt-works-form-summary.pdf', meta: '1 page · auto-generated' }],
                        alertTitle: 'Missing Required Information',
                        alertRows: [
                            { label: 'Client',  value: 'Manatt Phelps & Phillips LLP' },
                            { label: 'Project', value: 'MANATT · 4th Floor · ~30 stations' },
                            { label: 'Missing 1', value: 'CAD floor plan (.dwg)' },
                            { label: 'Missing 2', value: `SQ number · GSA price-protected (Strata suggests #${MANATT_ORDER_META.specialQuote})` },
                        ],
                        successTitle: 'Clarification request sent',
                        successSubtitle: 'Awaiting CAD attachment + SQ confirmation',
                    }}
                />
            )}
        </>
    )
}

// ═══════════════════════════════════════════════════════════════════════════
// Flow 2 panels · sc1.2 DesignBOMPanel (BOM upload + analysis + send validation) ·
//                 sc1.4 SQCheckPanel
// Modal stays open across these stages (handled in OfficeworksPage).
// ═══════════════════════════════════════════════════════════════════════════

// ─── sc1.2 DesignBOMPanel · PP2 capacity ledger + BOM upload narrative + PP1 ──

interface DesignBOMPanelProps {
    onValidate: () => void
    onBOMUploaded: () => void
    onValidationStarted: () => void
    onValidationCompiled: () => void
    onClientApproved: () => void
    bomUploaded: boolean
}

// Email body for the unified proposal (BOM + Validation Doc) sent to the client.
const PROPOSAL_MESSAGE = `Hi Caitlin,

Attached please find the proposal for MANATT 4th Floor:
• BOM · 149 line items · $1,541,392 list (Teknion T25)
• Validation Document · 24 slides · floor plan, 2D/3D drawings, finishes, wire mgmt, electrical

Please forward to Felicia at MANATT for sign-off before we proceed to SQ verification and Teknion submission.

Thanks,
Kimberly`

// Bullets shown in 'processing-validation' phase · sub-step 2.
const VALIDATION_BULLETS = [
    'Parsing MANATT-Validation-Doc-v1.pptx · 24 slides',
    'Detecting sections · floor plan · 2D · 3D · finishes · wire · electrical',
    'Cross-referencing with the 149-line BOM finishes',
    '6 sections detected · ready for client review',
]

const LEDGER_EVENTS = [
    { text: 'CET session opened · Kimberly · 11:14 AM', delay: 400 },
    { text: '+6h committed to Kimberly · this week', delay: 900 },
    { text: 'Revision cycle started · WS-02.A typicals',  delay: 1400 },
    { text: 'Capacity ledger sync · 18h committed / 40h available', delay: 1900 },
]

const UPLOAD_BULLETS = [
    'Parsing PDF · 149 line items extracted · 15 pages · Teknion T25',
    '11 areas tagged (WS-01/02/02.A · Office_WO.1/.2/.3 · Office_IO.1/.4 · Focus RM · Wellness · Reception)',
    '22 Custom Requests flagged for spec-check verification',
    'Cross-referencing finish codes · 1 inconsistency surfaced (Item 73 · XS Storm White vs area XG Very White)',
    'Pricing parsed · $1,541,392 List · catalog effective Sep 2025 + Oct 2025 mix',
    'AI BOM Validator queued · 149 × 6 = 894 attribute checks pending',
]

const RELATED_PROCESSES = [
    { label: 'AI BOM Validator', detail: '894 checks queued for self-audit (sc1.6) · PP1 SC2' },
    { label: 'Validation document', detail: 'Google Slides template auto-populated · 11 area sheets ready to compile' },
    { label: 'Pre-install drawings', detail: 'Dimensions + blocking + floor cores per area · ready for Abigail (PM)' },
    { label: 'Capacity ledger', detail: '18h committed updated · feeding live capacity board (PP2 SC5)' },
]

/**
 * Findings derived from the REAL MANATT-4F_BOM_v1.pdf (149 line items, 11
 * areas, 22 CRs, $1.54M list). Each finding has an actual page/item citation
 * the user can verify by clicking "View in BOM" — the iframe of the real PDF
 * loads in the BOM tab and the user can navigate to the cited page.
 */
interface BOMFinding {
    id: string
    severity: 'warning' | 'ai'
    title: string
    detail: string
    source: string
    answer: string
    citation: string
    primary: { label: string; tone: 'success' | 'ai' }
    secondary: string
}

const BOM_FINDINGS: BOMFinding[] = [
    {
        id: 'finish-mismatch',
        severity: 'warning',
        title: 'One panel has the wrong finish · Item 73',
        detail: 'This wall-office panel says "Storm White" but the other 9 panels in the same office area are "Very White". Likely a typo at order entry.',
        source: 'Source: BOM · page 9 · Item 73',
        answer: 'All other panels in this wall office are "Source Laminate · Very White". Item 73 is the only one using "Storm White". Very likely a copy-paste slip when the BOM was generated. Worth confirming with Caitlin before the order goes to Teknion — a wrong finish ships and has to be replaced at install.',
        citation: 'Compared Item 73 against the other 9 panels in the same wall-office area',
        primary: { label: 'Flag for revision', tone: 'success' },
        secondary: 'Keep as-is',
    },
    {
        id: 'cr-2046138',
        severity: 'ai',
        title: 'Custom-made screen needs a quick check · CR 2046138',
        detail: 'A workstation includes a custom solid screen in flintwood White Oak finish · 1 unit · $1,406.',
        source: 'Source: BOM · page 13 · Item 118',
        answer: 'Custom parts from Teknion always need an extra look before sending the order. Open this one in Teknion Create to confirm the design matches what was quoted, the finish is right, and the lead-time fits the install date.',
        citation: 'Teknion Create · CR 2046138 lookup',
        primary: { label: 'Verified · proceed', tone: 'success' },
        secondary: 'Open in Teknion Create',
    },
    {
        id: 'cr-2090148',
        severity: 'ai',
        title: 'Same custom shelf appears in 5 different offices · CR 2090148',
        detail: 'Items 10, 31, 52, 62, 73 — 5 different private offices · $427 each, $2,135 total.',
        source: 'Source: BOM · pages 2-9 · 5 line items',
        answer: 'The same custom shelf modification is repeated across 5 rooms. Worth a quick floor-plan check that each room genuinely needs it (sometimes one room gets duplicated by mistake), then a single lookup in Teknion Create covers all 5 since they share the same part.',
        citation: 'BOM · CR 2090148 on items 10 / 31 / 52 / 62 / 73',
        primary: { label: 'All 5 verified · proceed', tone: 'success' },
        secondary: 'Open in Teknion Create',
    },
]

/** Surface the BOM tab from anywhere in the modal · listened by DefaultDocTabs */
const focusBOMTab = () => window.dispatchEvent(new CustomEvent('officeworks:bom-tab-focus'))

/**
 * Renders the 3 real BOM_FINDINGS in the analyzed phase · same interaction
 * idiom as the checklist rows (expand → "Strata answers" KB popover → Accept marks
 * resolved). Each finding cites a real page/item in the PDF and offers a
 * "View in BOM" link that surfaces the iframe tab via focusBOMTab().
 */
/** Surface the Floor Plan tab · listened by DefaultDocTabs */
const focusFloorPlanTab = () => window.dispatchEvent(new CustomEvent('officeworks:floor-plan-focus'))

/** Surface the Validation Doc tab · listened by DefaultDocTabs */
const focusValidationTab = () => window.dispatchEvent(new CustomEvent('officeworks:validation-tab-focus'))

function BOMFindings() {
    const [resolved, setResolved] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<string | null>(null)

    const accept = (id: string) => {
        setResolved(prev => new Set(prev).add(id))
        setExpanded(null)
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-ai" />
                    Strata findings · {BOM_FINDINGS.length} flagged
                </div>
                {resolved.size < BOM_FINDINGS.length && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-warning/10 text-warning border border-warning/20 rounded px-2 py-0.5">
                        {BOM_FINDINGS.length - resolved.size} to review
                    </span>
                )}
            </div>

            {/* Source of truth · the BOM is checked against the floor plan (AS-IS · Felicia 0:33) */}
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground">Verified against · Floor Plan (CET design)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Strata checks the 149 BOM lines against the parts, quantities, finishes &amp; CRs drawn in CET.
                    </div>
                    <button type="button" onClick={focusFloorPlanTab} className="mt-1 text-[10px] font-bold text-foreground bg-primary/20 rounded px-1.5 py-0.5 hover:bg-primary/30 transition-colors">
                        View floor plan ↗
                    </button>
                </div>
            </div>

            {BOM_FINDINGS.map(f => {
                const isResolved = resolved.has(f.id)
                const isExpanded = expanded === f.id
                const SeverityIcon = f.severity === 'warning' ? AlertCircle : Sparkles
                const severityColor = f.severity === 'warning' ? 'text-warning' : 'text-ai'
                const restingBorder = f.severity === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-ai/20 bg-ai/5'
                return (
                    <div key={f.id} className={`rounded-lg border ${isResolved ? 'border-success/30 bg-success/5' : restingBorder}`}>
                        <button
                            type="button"
                            onClick={() => !isResolved && setExpanded(isExpanded ? null : f.id)}
                            disabled={isResolved}
                            className="w-full flex items-start gap-2 px-3 py-2.5 text-left"
                        >
                            {isResolved
                                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                : <SeverityIcon className={`h-4 w-4 ${severityColor} shrink-0 mt-0.5`} />}
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-semibold ${isResolved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {f.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">{f.detail}</div>
                                <div className="text-[10px] italic text-muted-foreground mt-0.5">{f.source}</div>
                            </div>
                            {!isResolved && (
                                <span className="text-[10px] font-bold text-foreground bg-primary/20 rounded px-1.5 py-0.5 shrink-0">
                                    {isExpanded ? 'Hide' : 'Strata answers'} {isExpanded ? '▴' : '▾'}
                                </span>
                            )}
                        </button>
                        {isExpanded && !isResolved && (
                            <div className="border-t border-border/60 px-3 py-2.5 space-y-2 animate-in fade-in duration-200">
                                <div className="text-xs text-foreground">{f.answer}</div>
                                <div className="text-[10px] text-muted-foreground italic">{f.citation}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => accept(f.id)}
                                        className={`inline-flex items-center gap-1.5 rounded-md text-[11px] font-bold px-2.5 py-1 border transition-colors ${
                                            f.primary.tone === 'ai'
                                                ? 'bg-ai/15 text-ai border-ai/30 hover:bg-ai/20'
                                                : 'bg-success/15 text-success border-success/30 hover:bg-success/20'
                                        }`}
                                    >
                                        <CheckCircle2 className="h-3 w-3" /> {f.primary.label}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => accept(f.id)}
                                        className="inline-flex items-center rounded-md text-[11px] font-medium px-2.5 py-1 border border-border text-muted-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        {f.secondary}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={focusBOMTab}
                                        className="ml-auto text-[10px] font-bold text-foreground bg-primary/20 rounded px-1.5 py-0.5 hover:bg-primary/30 transition-colors"
                                    >
                                        View in BOM ↗
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function DesignBOMPanel({ onValidate, onBOMUploaded, onValidationStarted, onValidationCompiled, onClientApproved, bomUploaded }: DesignBOMPanelProps) {
    type Phase =
        | 'waiting-bom'
        | 'processing-bom'
        | 'bom-analyzed'
        | 'waiting-validation'
        | 'processing-validation'
        | 'validation-ready'
        | 'sending'
        | 'approved'
    const [phase, setPhase] = useState<Phase>(bomUploaded ? 'bom-analyzed' : 'waiting-bom')
    const [ledgerCount, setLedgerCount] = useState(0)
    const [ddpEnabled, setDdpEnabled] = useState(false)
    const [uploadCount, setUploadCount] = useState(0)
    const [validationCount, setValidationCount] = useState(0)
    const [proposalDialog, setProposalDialog] = useState(false)
    const timeoutsRef = useRef<number[]>([])

    // Phase 'waiting-bom': progressive ledger events
    useEffect(() => {
        if (phase !== 'waiting-bom') return
        setLedgerCount(0)
        LEDGER_EVENTS.forEach((ev, i) => {
            const id = window.setTimeout(() => setLedgerCount(i + 1), ev.delay)
            timeoutsRef.current.push(id)
        })
        return () => {
            timeoutsRef.current.forEach(id => window.clearTimeout(id))
            timeoutsRef.current = []
        }
    }, [phase])

    // Phase 'processing-bom': progressive bullets · then advance to 'bom-analyzed'
    useEffect(() => {
        if (phase !== 'processing-bom') return
        setUploadCount(0)
        UPLOAD_BULLETS.forEach((_, i) => {
            const id = window.setTimeout(() => setUploadCount(i + 1), 500 * (i + 1))
            timeoutsRef.current.push(id)
        })
        const doneId = window.setTimeout(() => {
            setPhase('bom-analyzed')
            onBOMUploaded()  // flips flowProgress.bomUploaded → DefaultDocTabs auto-switches to the BOM tab
        }, 500 * UPLOAD_BULLETS.length + 400)
        timeoutsRef.current.push(doneId)
        return () => {
            timeoutsRef.current.forEach(id => window.clearTimeout(id))
            timeoutsRef.current = []
        }
    }, [phase, onBOMUploaded])

    // Phase 'processing-validation': progressive bullets · then advance to 'validation-ready'
    useEffect(() => {
        if (phase !== 'processing-validation') return
        VALIDATION_BULLETS.forEach((_, i) => {
            const id = window.setTimeout(() => setValidationCount(i + 1), 500 * (i + 1))
            timeoutsRef.current.push(id)
        })
        const doneId = window.setTimeout(() => {
            onValidationCompiled() // flips flowProgress.validationCompiled → fills the Validation Doc tab
            setPhase('validation-ready')
        }, 500 * VALIDATION_BULLETS.length + 400)
        timeoutsRef.current.push(doneId)
        return () => {
            timeoutsRef.current.forEach(id => window.clearTimeout(id))
            timeoutsRef.current = []
        }
    }, [phase, onValidationCompiled])

    // Phase 'sending': 1.5s simulated client wait · then 'approved'
    useEffect(() => {
        if (phase !== 'sending') return
        const id = window.setTimeout(() => {
            onClientApproved()
            setPhase('approved')
        }, 1500)
        timeoutsRef.current.push(id)
        return () => {
            timeoutsRef.current.forEach(t => window.clearTimeout(t))
            timeoutsRef.current = []
        }
    }, [phase, onClientApproved])

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Capacity ledger ticker · PP2 */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-base font-semibold text-foreground">Live capacity ledger</h4>
                        <span className="text-[10px] text-muted-foreground">· events from CET</span>
                    </div>
                    <div className="bg-muted/30 border border-border rounded-lg p-3 text-xs space-y-1.5 min-h-[120px]">
                        {LEDGER_EVENTS.slice(0, ledgerCount).map((ev, i) => (
                            <div key={i} className="flex items-start gap-2 text-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                <span>{ev.text}</span>
                            </div>
                        ))}
                        {phase === 'waiting-bom' && ledgerCount < LEDGER_EVENTS.length && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic pt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                                Waiting for next event…
                            </div>
                        )}
                    </div>
                </div>

                {/* Sub-step 1 · Dropzone BOM + DDP toggle */}
                {phase === 'waiting-bom' && (
                    <>
                        <div className="border-t border-border pt-4 space-y-2">
                            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                Sub-step 1 · Upload BOM
                            </h4>
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                <span className="text-[11px] text-muted-foreground">
                                    Scope confirmed on the kickoff call · ~30 stations · <span className="font-medium text-foreground">Standard/Large</span> (GW1B) · finishes locked.
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Kimberly builds the BOM externally in <span className="font-medium text-foreground">CET / CAP</span> and uploads the file to Strata for analysis. Supported: .pdf · .sp4 · .xlsx
                            </p>
                            <button
                                type="button"
                                onClick={() => { focusBOMTab(); setPhase('processing-bom') }}
                                aria-label="Attach BOM file (simulated)"
                                className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center" aria-hidden="true">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-xs font-semibold text-foreground">Drop BOM file here · or click to browse</div>
                                <div className="text-[10px] text-muted-foreground italic">Demo · click to simulate the upload of MANATT-4F_BOM_v1.sp4 (212 KB)</div>
                            </button>
                        </div>
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ddpEnabled}
                                    onChange={e => setDdpEnabled(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                                />
                                <div>
                                    <div className="text-sm font-semibold text-foreground">Optional · DDP parallel</div>
                                    <div className="text-[11px] text-muted-foreground">Prepare Deep Discounting BOM in parallel for RFP volume negotiation.</div>
                                </div>
                            </label>
                        </div>
                    </>
                )}

                {/* Sub-step 1 · processing BOM bullets */}
                {phase === 'processing-bom' && (
                    <div className="border-t border-border pt-4 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-foreground animate-spin" aria-hidden="true" />
                            <h4 className="text-base font-semibold text-foreground">Strata processing BOM upload…</h4>
                        </div>
                        <ul className="space-y-1.5" role="status" aria-live="polite">
                            {UPLOAD_BULLETS.slice(0, uploadCount).map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sub-step 1 · BOM analyzed · findings + related processes */}
                {phase === 'bom-analyzed' && (
                    <div className="border-t border-border pt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <div className="text-xs flex-1 min-w-0">
                                <div className="font-semibold text-success">BOM uploaded · 149 line items · $1,541,392 list</div>
                                <div className="text-muted-foreground">
                                    MANATT-4F_BOM_v1.pdf · Teknion T25 · 11 areas · 22 CRs · largest: Office_WO.1 (20 units · $419,660){ddpEnabled ? ' · DDP parallel queued' : ''}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <button type="button" onClick={focusBOMTab} className="text-[10px] font-bold text-foreground bg-primary/20 rounded px-1.5 py-0.5 hover:bg-primary/30 transition-colors">
                                        View in BOM ↗
                                    </button>
                                    <button type="button" onClick={() => setPhase('waiting-bom')} className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 hover:bg-muted/50 transition-colors">
                                        <Paperclip className="h-3 w-3" aria-hidden="true" /> Replace file
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BOM Findings · derived from real PDF content · each with citation + KB popover */}
                        <BOMFindings />

                        <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-ai" />
                                Related processes ready
                            </div>
                            {RELATED_PROCESSES.map(p => (
                                <div key={p.label} className="rounded-lg border border-ai/20 bg-ai/5 px-3 py-2">
                                    <div className="text-[11px] font-semibold text-foreground">{p.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{p.detail}</div>
                                </div>
                            ))}
                        </div>

                        <div className="text-[10px] text-muted-foreground italic">
                            Tip · click the <strong>BOM</strong> tab on the left to scroll through the real 15-page PDF · each finding above cites a page + item.
                        </div>
                    </div>
                )}

                {/* Sub-step 2 · Dropzone PowerPoint validation deck */}
                {phase === 'waiting-validation' && (
                    <div className="border-t border-border pt-4 space-y-2 animate-in fade-in duration-300">
                        <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            Sub-step 2 · Attach validation deck
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                            Attach the validation deck (Google Slides export, PowerPoint, PDF). Strata reads the sections and prepares them for the client proposal.
                        </p>
                        <button
                            type="button"
                            onClick={() => { focusValidationTab(); setPhase('processing-validation') }}
                            aria-label="Attach validation deck (simulated)"
                            className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center" aria-hidden="true">
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="text-xs font-semibold text-foreground">Drop validation deck here · or click to attach</div>
                            <div className="text-[10px] text-muted-foreground italic">Demo · click to simulate the upload of MANATT-Validation-Doc-v1.pptx (1.8 MB · 24 slides)</div>
                        </button>
                    </div>
                )}

                {/* Sub-step 2 · processing validation bullets */}
                {phase === 'processing-validation' && (
                    <div className="border-t border-border pt-4 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-foreground animate-spin" aria-hidden="true" />
                            <h4 className="text-base font-semibold text-foreground">Strata reading the document…</h4>
                        </div>
                        <ul className="space-y-1.5" role="status" aria-live="polite">
                            {VALIDATION_BULLETS.slice(0, validationCount).map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sub-step 3 · validation ready · proposal preview */}
                {phase === 'validation-ready' && (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0" aria-hidden="true">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground">Proposal ready to send</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        BOM (149 lines · $1.54M list) + Validation Document (24 slides · 6 sections). Sales (Caitlin Barolet) will forward to Felicia Miano-Poles at MANATT.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    Validation Doc · 6 sections detected by Strata
                                </span>
                            </div>
                            <ul className="divide-y divide-border">
                                {VALIDATION_DOC_SECTIONS.map(s => (
                                    <li key={s.page} className="px-4 py-1.5 flex items-center gap-2.5">
                                        <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-7 shrink-0" aria-hidden="true">
                                            {String(s.page).padStart(2, '0')}.
                                        </span>
                                        <SectionIcon iconKey={s.iconKey} />
                                        <span className="text-[11px] text-foreground flex-1 min-w-0 truncate">{s.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Sub-step 3 · sending (after dialog Send) · spinner */}
                {phase === 'sending' && (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in duration-300">
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0" aria-hidden="true">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground">Sending proposal to MANATT…</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        Designer → Sales → client · waiting for sign-off…
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sub-step 3 · approved · sign-off banner */}
                {phase === 'approved' && (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="rounded-xl border border-success/30 bg-success/5 overflow-hidden">
                            <div className="px-4 py-3 flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0" aria-hidden="true">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground">Client approved the proposal</div>
                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                        Felicia Miano-Poles signed off · BOM + validation locked · GW2A gate cleared
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                    6 sections approved by client
                                </span>
                            </div>
                            <ul className="divide-y divide-border">
                                {VALIDATION_DOC_SECTIONS.map(s => (
                                    <li key={s.page} className="px-4 py-1.5 flex items-center gap-2.5">
                                        <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-7 shrink-0" aria-hidden="true">
                                            {String(s.page).padStart(2, '0')}.
                                        </span>
                                        <SectionIcon iconKey={s.iconKey} />
                                        <span className="text-[11px] text-foreground flex-1 min-w-0 truncate">{s.title}</span>
                                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" aria-label="Section approved" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {phase === 'waiting-bom' && (
                    <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                    >
                        Upload BOM to continue
                    </button>
                )}
                {phase === 'processing-bom' && (
                    <button type="button" disabled aria-busy="true" className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Processing upload…
                    </button>
                )}
                {phase === 'bom-analyzed' && (
                    <button
                        type="button"
                        onClick={() => { onValidationStarted(); focusValidationTab(); setPhase('waiting-validation') }}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        Attach validation deck
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
                {phase === 'waiting-validation' && (
                    <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
                    >
                        Attach validation deck to continue
                    </button>
                )}
                {phase === 'processing-validation' && (
                    <button type="button" disabled aria-busy="true" className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Processing…
                    </button>
                )}
                {phase === 'validation-ready' && (
                    <button
                        type="button"
                        onClick={() => setProposalDialog(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Send proposal to client →
                    </button>
                )}
                {phase === 'sending' && (
                    <button type="button" disabled aria-busy="true" className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Awaiting client approval…
                        <span className="sr-only">Awaiting client approval response</span>
                    </button>
                )}
                {phase === 'approved' && (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Continue to SQ check
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}
            </div>

            <RequestInfoDialog
                isOpen={proposalDialog}
                onSent={() => { setProposalDialog(false); setPhase('sending') }}
                onClose={() => setProposalDialog(false)}
                headerAvatar="CB"
                headerLabel="Send proposal to client · GW2A gate"
                headerSubtitle="Client sign-off blocks SQ + Teknion"
                defaults={{
                    from: 'kimberly.tucker@officeworks.com',
                    to: 'caitlin.barolet@manatt.com',
                    cc: 'felicia.miano-poles@officeworks.com',
                    date: '2026-04-22 · 2:15 PM',
                    subject: 'MANATT 4th Floor · Proposal for Client Approval',
                    message: PROPOSAL_MESSAGE,
                    attachments: [
                        { name: 'MANATT-4F_BOM_v1.pdf',          meta: '149 lines · 212 KB' },
                        { name: 'MANATT-Validation-Doc-v1.pptx', meta: '24 slides · 1.8 MB' },
                    ],
                    alertTitle: 'Client approval required (GW2A)',
                    alertRows: [
                        { label: 'Project',   value: 'MANATT 4th Floor · DC market' },
                        { label: 'Documents', value: 'BOM + Validation Document' },
                        { label: 'Sent to',   value: 'Caitlin Barolet (Sales) → Felicia Miano-Poles (MANATT)' },
                    ],
                    successTitle: 'Proposal sent to client',
                    successSubtitle: "Awaiting Felicia's sign-off · typical reply 1-2 business days",
                }}
            />
        </>
    )
}

// ─── sc1.4 SQCheckPanel · PP3 (Knowledge Assistant peak) ──────────────────────

/**
 * Inline tooltip that surfaces the business rule behind a value + its source.
 * Same dark Radix tooltip used by DataSourcesBar. Renders the wrapped term with
 * a small help icon; rule + source appear on hover/focus.
 */
function RuleTooltip({ children, rule, source }: { children: React.ReactNode; rule: string; source: string }) {
    return (
        <TooltipPrimitive.Provider delayDuration={150}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className="inline-flex items-center gap-0.5 cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2">
                        {children}
                        <HelpCircle className="h-2.5 w-2.5 opacity-50 shrink-0" />
                    </span>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side="top"
                        sideOffset={6}
                        className="z-[60] max-w-[280px] rounded-lg bg-zinc-900 px-3 py-2 text-[11px] leading-snug text-zinc-100 shadow-lg animate-in fade-in-0 zoom-in-95"
                    >
                        <div>{rule}</div>
                        <div className="text-zinc-400 mt-1 italic">{source}</div>
                        <TooltipPrimitive.Arrow className="fill-zinc-900" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

// ─── SQ Confirmation Email Dialog ─────────────────────────────────────────────
// Clone of BFI PatriciaDialog · sent by the designer (Kimberly) after she
// confirms the SQ inline · closes the loop on SC4 (no built-in trigger today).
// Recipients per Spec Check AS-IS · §Section 9 BOM Submission flow.

const SQ_EMAIL_FROM = 'kimberly.tucker@officeworksinc.com'
const SQ_EMAIL_TO   = 'caitlin.barolet@officeworksinc.com'
const SQ_EMAIL_CC   = 'felicia.miano-poles@officeworksinc.com, dc-coordinator@officeworksinc.com'

function buildSQEmailSubject(): string {
    return `SQ #${MANATT_ORDER_META.specialQuote} Confirmed · MANATT 4th Floor · Price Protected · 2025 Catalog`
}

function buildSQEmailBody(): string {
    const discountPct = Math.round((MANATT_ORDER_META.discountTotal / MANATT_ORDER_META.listTotal) * 100)
    return `Hi Caitlin,

Confirming pricing protection for MANATT 4th Floor before I submit the Order Preview to Teknion. Sharing for your records and so you can align with the client.

· SQ #${MANATT_ORDER_META.specialQuote} (${MANATT_ORDER_META.sqName})
· Catalog: 2025 · effective dates valid through Sched Ship ${MANATT_ORDER_META.schedShipDate}
· List Total: $${MANATT_ORDER_META.listTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
· Net Total: $${MANATT_ORDER_META.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
· Discount: ~${discountPct}% off list

Verification trail (cross-referenced by Strata):
  ✓ Teknion Create platform · SQ lookup ACTIVE
  ✓ Officeworks-DC special pricing form · on file (filed at intake)
  ✓ Prior acknowledgment ${MANATT_ORDER_META.poNumber} · terms consistent
  ✓ Catalog 2025 effective dates · valid

The 4 documented risk checks (PZ column · all 71 items on SQ · Service Fees/T-code surcharges · catalog effective date) are all confirmed.

Next step: submitting the Order Preview to Tifani at Teknion. I'll notify you when she returns the preview number.

— Kimberly Tucker
   Design Manager · PA · cross-market to DC
   Officeworks Inc.`
}

interface SQEmailMetaRow {
    label: string
    value: string
    onChange?: (v: string) => void
    muted?: boolean
}

function SQEmailMetadataBlock({ rows, disabled }: { rows: SQEmailMetaRow[]; disabled: boolean }) {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {rows.map(r => (
                <div key={r.label} className="flex items-center gap-2 px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-12 shrink-0">{r.label}</span>
                    {r.onChange ? (
                        <input
                            type="text"
                            value={r.value}
                            onChange={e => r.onChange!(e.target.value)}
                            disabled={disabled}
                            className={`flex-1 bg-transparent text-[11px] focus:outline-none ${r.muted ? 'text-muted-foreground' : 'text-foreground'} disabled:opacity-60`}
                        />
                    ) : (
                        <span className={`flex-1 text-[11px] truncate ${r.muted ? 'text-muted-foreground' : 'text-foreground'}`}>{r.value}</span>
                    )}
                </div>
            ))}
        </div>
    )
}

interface SQConfirmationDialogProps {
    isOpen: boolean
    onSent: () => void
    onCancel: () => void
    /** Optional override · when absent uses the SQ-confirmation defaults (to Caitlin) */
    emailConfig?: {
        title?: string
        subtitle?: string
        from?: string
        to?: string
        cc?: string
        subject?: string
        body?: string
        attachments?: { name: string; size: string; badge: string }[]
        sentMessage?: string
    }
}

function SQConfirmationDialog({ isOpen, onSent, onCancel, emailConfig }: SQConfirmationDialogProps) {
    const cfg = emailConfig ?? {}
    const [subject, setSubject] = useState(cfg.subject ?? buildSQEmailSubject())
    const [message, setMessage] = useState(cfg.body ?? buildSQEmailBody())
    const [attachments, setAttachments] = useState(cfg.attachments ?? [
        { name: `MANATT-SQ-${MANATT_ORDER_META.specialQuote}-confirmation.pdf`, size: '240 KB', badge: 'Auto-generated' },
        { name: 'verification-trail.json', size: '8 KB', badge: 'Sources log' },
    ])
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => onSent(), 900)
        }, 800)
    }

    const removeAttachment = (name: string) =>
        setAttachments(prev => prev.filter(a => a.name !== name))

    const fromEmail = cfg.from ?? SQ_EMAIL_FROM
    const toEmail   = cfg.to   ?? SQ_EMAIL_TO
    const ccEmail   = cfg.cc   ?? SQ_EMAIL_CC
    const title       = cfg.title       ?? 'SQ Confirmation · MANATT 4th Floor'
    const subtitle    = cfg.subtitle    ?? 'Strata drafted on your behalf · review and send'
    const sentMessage = cfg.sentMessage ?? 'Sent · recipients notified'

    const metaRows: SQEmailMetaRow[] = [
        { label: 'From', value: fromEmail },
        { label: 'To',   value: toEmail },
        { label: 'CC',   value: ccEmail, muted: true },
        { label: 'Subj', value: subject, onChange: setSubject },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => { if (!sending && !sent) onCancel() }} className="relative z-[400]">
                <TransitionChild as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-card rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">{title}</p>
                                    <p className="text-[10px] text-muted-foreground">{subtitle}</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Attachments — removable */}
                                {attachments.map(a => (
                                    <div key={a.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-success/30 bg-success/5">
                                        <Paperclip className="h-3.5 w-3.5 text-success shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-semibold text-foreground truncate">{a.name}</div>
                                            <div className="text-[9px] text-muted-foreground">{a.size}</div>
                                        </div>
                                        <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded shrink-0">{a.badge}</span>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                        {!sent && (
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(a.name)}
                                                className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                                                aria-label={`Remove ${a.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Email metadata (From/To/CC read-only · Subject editable) */}
                                <SQEmailMetadataBlock rows={metaRows} disabled={sent} />

                                {/* Editable body */}
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={16}
                                    disabled={sent}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono disabled:opacity-60"
                                />
                            </div>

                            <div className="px-5 py-4 border-t border-border shrink-0 flex items-center gap-2">
                                {sent ? (
                                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">{sentMessage}</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={onCancel}
                                            disabled={sending}
                                            className="h-10 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSend}
                                            disabled={sending}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                        >
                                            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                            {sending ? 'Sending…' : 'Send →'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── (ClientApprovalPanel removed · sc1.2 DesignBOMPanel now owns BOM + Validation + Send-to-client + Approval) ───

interface SQCheckPanelProps { onValidate: () => void }

function SQCheckPanel({ onValidate }: SQCheckPanelProps) {
    const [confirmed, setConfirmed] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)

    const handleEmailSent = () => {
        setEmailDialogOpen(false)
        setConfirmed(true)
    }

    const discountPct = Math.round((MANATT_ORDER_META.discountTotal / MANATT_ORDER_META.listTotal) * 100)

    return (
        <>
            <SQConfirmationDialog
                isOpen={emailDialogOpen}
                onSent={handleEmailSent}
                onCancel={() => setEmailDialogOpen(false)}
            />
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-base font-semibold text-foreground">Strata Knowledge Assistant · SQ lookup</h4>
                </div>
                <p className="text-[11px] text-muted-foreground">PP3 · Captured-knowledge assistant answers the SQ / catalog / GSA question inline · no senior interrupt needed.</p>

                {/* ── Section 1 · Question + Answer (existing · keep) ── */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Question</span>
                        <span className="text-xs text-foreground">Is MANATT GSA price-protected? Which catalog applies?</span>
                    </div>
                    <div className="px-4 py-3">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Answer</div>
                        <div className="text-xs text-foreground">
                            <strong className="text-success">YES · </strong>
                            <RuleTooltip
                                rule="GSA / government clients are price-protected and require a Special Quote (SQ) lookup. ~20% of all orders need this — ~50% of DC orders for GSA accounts."
                                source="Source: Spec Check AS-IS · 'Exception: Price-Protected Orders'"
                            >
                                <strong className="text-success">GSA price-protected</strong>
                            </RuleTooltip>
                            . The{' '}
                            <RuleTooltip
                                rule="The price catalog effective date must be confirmed — using the wrong price zone / catalog is a documented spec-check error that sends incorrect pricing to the client."
                                source="Source: Spec Check AS-IS · Error Profile"
                            >
                                2025 catalog
                            </RuleTooltip>
                            {' '}applies for{' '}
                            <RuleTooltip
                                rule="A Special Quote number is the manufacturer's price-protection reference for this client / project. Verified in Teknion Create together with the manufacturer's special pricing form."
                                source="Source: Spec Check AS-IS · Tools (Create = CR / SQ verification)"
                            >
                                SQ #436533
                            </RuleTooltip>
                            .
                        </div>
                    </div>
                </div>

                {/* ── Section 2 · Pricing terms (real PO numbers) ── */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Pricing terms locked under SQ #{MANATT_ORDER_META.specialQuote}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-border">
                        <div className="bg-card px-3 py-2.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">List Total</div>
                            <div className="text-base text-foreground tabular-nums mt-0.5">${MANATT_ORDER_META.listTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Net Total</div>
                            <div className="text-base font-bold text-success tabular-nums mt-0.5">${MANATT_ORDER_META.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Discount Total</div>
                            <div className="text-base text-foreground tabular-nums mt-0.5">${MANATT_ORDER_META.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Implied %</div>
                            <div className="text-base font-bold text-success tabular-nums mt-0.5">~{discountPct}% off list</div>
                        </div>
                    </div>
                    <div className="px-4 py-2.5 bg-muted/20 border-t border-border text-[11px] text-foreground/70">
                        Valid for items on the SQ schedule. Service Fees and T-code surcharges may apply differently.
                    </div>
                </div>

                {/* ── Section 4 · Verification trail (NEW · sources with timestamps) ── */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verification trail · 4 sources cross-referenced</span>
                    </div>
                    <ul className="divide-y divide-border">
                        {[
                            {
                                title: 'Teknion Create platform',
                                detail: `SQ #${MANATT_ORDER_META.specialQuote} lookup`,
                                badge: 'ACTIVE',
                                badgeClass: 'bg-success/10 text-success border-success/20',
                                meta: 'verified just now',
                            },
                            {
                                title: 'Officeworks-DC special pricing form',
                                detail: 'on file · filed by Caitlin Barolet at intake',
                                badge: 'ON FILE',
                                badgeClass: 'bg-success/10 text-success border-success/20',
                                meta: '18h ago',
                            },
                            {
                                title: `Prior acknowledgment ${MANATT_ORDER_META.poNumber}`,
                                detail: 'terms consistent · Universal #' + MANATT_ORDER_META.universal,
                                badge: 'MATCH',
                                badgeClass: 'bg-success/10 text-success border-success/20',
                                meta: MANATT_ORDER_META.orderReceipt,
                            },
                            {
                                title: 'Catalog 2025 effective dates',
                                detail: `Sched Ship ${MANATT_ORDER_META.schedShipDate} within window`,
                                badge: 'VALID',
                                badgeClass: 'bg-success/10 text-success border-success/20',
                                meta: 'verified just now',
                            },
                        ].map((src, i) => (
                            <li key={i} className="px-4 py-2 flex items-center gap-2.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-foreground font-medium truncate">{src.title}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{src.detail}</div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border ${src.badgeClass}`}>{src.badge}</span>
                                    <span className="text-[9px] text-muted-foreground">{src.meta}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {confirmed && (
                    <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-semibold text-success">SQ #{MANATT_ORDER_META.specialQuote} confirmed · 2025 catalog locked</div>
                            <div className="text-muted-foreground">
                                <strong className="text-foreground">Caitlin notified</strong> · Felicia &amp; Coordinator CC'd · proceed to Teknion Order Preview
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {!confirmed ? (
                    <button
                        type="button"
                        onClick={() => setEmailDialogOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        Confirm SQ →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Proceed to Teknion Order Preview
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </>
    )
}

// ─── Flow 3 · sc1.5 · Teknion Order Preview submission ────────────────────────
// Replaces the descriptive default panel · 5 sections · action-oriented.
// SC2 painpoint: pre-flight validation runs locally what Tifani would catch in 1-2 weeks.
// SC6 painpoint: submission tracker visualizes the 1-2 week black box.

const PRE_FLIGHT_CHECKS = [
    {
        id: 'crs-finish',
        label: 'All 13 CRs have complete finish + grain spec',
        tooltip: 'Strata checked each custom request against the validation document — finish family, color code, and grain direction all populated. Missing finishes are the #1 reason Tifani returns a spec gap.',
        source: 'Source: Spec Check AS-IS · §Step 8 (CR review) + validation doc',
    },
    {
        id: 'parts',
        label: '71 part numbers · valid in Teknion 2025 catalog',
        tooltip: 'Each part number cross-referenced against the active 2025 catalog. Discontinued parts and 2024 carry-overs flagged before submission.',
        source: 'Source: Teknion 2025 catalog · Effective May 26, 2025',
    },
    {
        id: 'pricing',
        label: 'Price zone applied · matches SQ #436533',
        tooltip: 'PZ Description column verified · all rows show "Price Effective May 26, 2025" matching the SQ. No off-SQ items would surprise the client at invoice.',
        source: 'Source: Confirmed at Step 6A · SQ check',
    },
    {
        id: 'leadtime',
        label: 'Longest CR leadtime fits Sched Ship 2026/03/20',
        tooltip: 'Strata computed longest CR leadtime (40 days · CR 2046138 Flintwood Add-On Screen) against the Sched Ship date. Buffer remains for Teknion factory queue.',
        source: 'Source: Manatt order data · CR leadtime ledger',
    },
] as const

const SIGNALS = [
    { ts: '2025/12/30 14:22', text: 'Teknion · order received · queued for Tifani', icon: 'check' as const },
    { ts: 'Now',              text: 'Teknion · in review by Tifani · ETA varies by factory load', icon: 'loader' as const },
    { ts: 'Pending',          text: 'Tifani returns preview number + status', icon: 'gray' as const },
]

interface TeknionPreviewPanelProps { onValidate: () => void }

function TeknionPreviewPanel({ onValidate }: TeknionPreviewPanelProps) {
    const [phase, setPhase] = useState<'pre-flight' | 'submitted'>('pre-flight')
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)

    const tifaniSubmissionConfig = {
        title: 'Order Preview Submission · MANATT 4th Floor',
        subtitle: 'Strata pre-validated · ready to send',
        from: 'kimberly.tucker@officeworksinc.com',
        to: 'tifani.cooper@teknion.com',
        cc: 'felicia.miano-poles@officeworksinc.com, caitlin.barolet@officeworksinc.com',
        subject: `Order Preview · MANATT 4th Floor · ${MANATT_ORDER_META.poNumber} · Sched Ship ${MANATT_ORDER_META.schedShipDate}`,
        body: `Hi Tifani,

Submitting the order preview for MANATT 4th Floor for your review. Strata ran pre-flight validation against the 2025 catalog — all 4 checks passed before submission.

Project summary:
· PO: ${MANATT_ORDER_META.poNumber} · Universal #${MANATT_ORDER_META.universal}
· 71 line items · 13 CRs (all with finish + grain spec)
· Sched Ship: ${MANATT_ORDER_META.schedShipDate}
· Longest CR lead time: 40 days (CR 2046138 Flintwood Add-On Screen) · buffered

SQ #${MANATT_ORDER_META.specialQuote} confirmed at our end · 2025 catalog effective.

Please let me know if you spot any spec gaps. Targeting your typical 1-2 week turnaround for the preview number.

— Kimberly Tucker
   Design Manager · PA · cross-market to DC
   Officeworks Inc.`,
        attachments: [
            { name: `MANATT-4F-BOM-v1.pdf`, size: '1.4 MB', badge: 'BOM · 149 lines' },
            { name: `MANATT-validation-doc.pdf`, size: '380 KB', badge: 'Approved by client' },
            { name: `pre-flight-validation.json`, size: '12 KB', badge: 'Strata · 4 checks passed' },
        ],
        sentMessage: 'Sent · recipients notified',
    }

    return (
        <>
            <SQConfirmationDialog
                isOpen={emailDialogOpen}
                onSent={() => { setEmailDialogOpen(false); setPhase('submitted') }}
                onCancel={() => setEmailDialogOpen(false)}
                emailConfig={tifaniSubmissionConfig}
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Section 1 · Pre-flight checks */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-foreground" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Pre-flight · 4 validations vs Teknion catalog</span>
                    </div>
                    <ul className="divide-y divide-border">
                        {PRE_FLIGHT_CHECKS.map(check => (
                            <li key={check.id} className="px-4 py-2.5 flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                <RuleTooltip rule={check.tooltip} source={check.source}>
                                    <span className="text-xs text-foreground">{check.label}</span>
                                </RuleTooltip>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Section 2 · Order economics · SQ-locked */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Order economics · SQ-locked</span>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-border">
                        <div className="bg-card px-3 py-2.5">
                            <RuleTooltip
                                rule="List Total is the full Teknion catalog price before SQ discount. Used as the baseline for the implied % off."
                                source="Source: MANATT-4F_BOM_v1 · 149 lines"
                            >
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">List Total</span>
                            </RuleTooltip>
                            <div className="text-base text-foreground tabular-nums mt-0.5">${MANATT_ORDER_META.listTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <RuleTooltip
                                rule="Net Total is what Officeworks Inc. pays Teknion after the SQ contract discount. Confirmed against the SQ schedule at Step 6A."
                                source="Source: SQ #436533 · effective May 26, 2025"
                            >
                                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Net Total</span>
                            </RuleTooltip>
                            <div className="text-base font-bold text-success tabular-nums mt-0.5">${MANATT_ORDER_META.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Discount Total</span>
                            <div className="text-base text-foreground tabular-nums mt-0.5">${MANATT_ORDER_META.discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-card px-3 py-2.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Implied %</span>
                            <div className="text-base font-bold text-success tabular-nums mt-0.5">~{Math.round((MANATT_ORDER_META.discountTotal / MANATT_ORDER_META.listTotal) * 100)}% off list</div>
                        </div>
                    </div>
                    <div className="px-4 py-2.5 bg-muted/20 border-t border-border text-[11px] text-foreground/70">
                        SQ #{MANATT_ORDER_META.specialQuote} · catalog effective May 26, 2025 · 71 lines covered · PO amount ${MANATT_ORDER_META.poAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Section 3 · Order composition */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Layers className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Order composition</span>
                    </div>
                    <ul className="divide-y divide-border text-xs">
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Line items</span>
                            <span className="text-foreground tabular-nums">71</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <RuleTooltip
                                rule="Custom Requests are non-catalog items requiring Teknion factory quoting. Longest leadtime drives the GW3 timeline-conflict risk."
                                source="Source: Spec Check AS-IS · §Step 8 · CR ledger"
                            >
                                <span className="text-muted-foreground">Custom Requests</span>
                            </RuleTooltip>
                            <span className="text-foreground tabular-nums">13 · longest 40d (CR 2046138 Flintwood)</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Workstation groups</span>
                            <span className="text-foreground tabular-nums">4 · 30 stations (WS-01 ×10 · WS-02 ×6 · WS-02 ×6 · WS-02.A ×8)</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">BOM sub-categories</span>
                            <span className="text-foreground">9 · panels · glass · electrical · storage · hat · office · conference · accessory · screen</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Largest tag</span>
                            <span className="text-foreground">Office_WO.1 · 20 units</span>
                        </li>
                    </ul>
                </div>

                {/* Section 4 · Timeline & buffer */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-foreground" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Timeline &amp; buffer</span>
                    </div>
                    <ul className="divide-y divide-border text-xs">
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Order receipt</span>
                            <span className="text-foreground tabular-nums">{MANATT_ORDER_META.orderReceipt}</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <RuleTooltip
                                rule="No-change-after date locks the BOM for Teknion factory planning. Changes after this date trigger rework + leadtime extension."
                                source="Source: PO-DC-0009642 contract terms"
                            >
                                <span className="text-muted-foreground">Lockdown (no-change-after)</span>
                            </RuleTooltip>
                            <span className="text-foreground tabular-nums">{MANATT_ORDER_META.noChangeAfter}</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Sched Ship</span>
                            <span className="text-foreground tabular-nums">{MANATT_ORDER_META.schedShipDate}</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Longest CR leadtime</span>
                            <span className="text-foreground tabular-nums">40 days · CR 2046138</span>
                        </li>
                        <li className="px-4 py-2 flex items-center justify-between gap-3">
                            <span className="text-muted-foreground font-medium">Buffer at Sched Ship</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded px-1.5 py-0.5 tabular-nums">~40 days · healthy</span>
                        </li>
                    </ul>
                    <div className="px-4 py-2.5 bg-muted/20 border-t border-border text-[11px] text-foreground/70">
                        Strata recomputes the buffer if Tifani returns a leadtime adjustment.
                    </div>
                </div>

                {/* Section 5 · GW3 outcome forecast · Strata read */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">GW3 outcome forecast · Strata read</span>
                    </div>
                    <ul className="divide-y divide-border text-xs">
                        <li className="px-4 py-2.5 flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-success">Clean</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    All pre-flight checks pass · all 13 CRs spec&apos;d · 71 part numbers valid · catalog matches SQ.
                                </div>
                            </div>
                        </li>
                        <li className="px-4 py-2.5 flex items-start gap-2.5">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-warning">Spec gap</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Low risk · finishes documented at sc1.7 peer review · grain direction confirmed on 5 Flintwood CRs · cross-referenced with validation doc.
                                </div>
                            </div>
                        </li>
                        <li className="px-4 py-2.5 flex items-start gap-2.5">
                            <AlertCircle className="h-4 w-4 text-foreground shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground">Timeline conflict</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    Low risk · longest CR (40 days) fits within the ~40-day Sched Ship buffer · monitor Tifani&apos;s response for factory queue updates.
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div className="px-4 py-2.5 bg-muted/20 border-t border-border text-[11px] text-foreground/70 italic">
                        Strata derives these reads from pre-flight + leadtime ledger + CR catalog cross-check · not a guarantee.
                    </div>
                </div>

                {/* Section 3 · Submission tracker (only when submitted) */}
                {phase === 'submitted' && (
                    <div className="rounded-xl border border-success/30 bg-card overflow-hidden animate-in fade-in slide-in-from-top-1 duration-400">
                        <div className="px-4 py-3 bg-success/5 border-b border-success/20 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-success" />
                            <span className="text-xs font-bold uppercase tracking-wider text-success">Submission tracker · Tifani 1-2 week turnaround</span>
                        </div>
                        <div className="px-4 py-3 flex items-center gap-1.5 text-[11px]">
                            <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-success/10 text-success font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Submitted
                            </div>
                            <div className="h-px w-3 bg-success/40" />
                            <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-ai/10 text-ai font-semibold">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Tifani reviewing
                            </div>
                            <div className="h-px w-3 bg-border" />
                            <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-muted text-muted-foreground">
                                Returned
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 4 · Real-time signals (only when submitted) */}
                {phase === 'submitted' && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden animate-in fade-in slide-in-from-top-1 duration-400">
                        <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                            <Search className="h-4 w-4 text-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Real-time signals from Teknion</span>
                        </div>
                        <ul className="divide-y divide-border">
                            {SIGNALS.map((s, i) => (
                                <li key={i} className="px-4 py-2 flex items-center gap-2.5 text-xs">
                                    {s.icon === 'check' && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                                    {s.icon === 'loader' && <Loader2 className="h-3.5 w-3.5 text-ai animate-spin shrink-0" />}
                                    {s.icon === 'gray' && <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />}
                                    <span className="flex-1 text-foreground truncate">{s.text}</span>
                                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{s.ts}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {phase === 'pre-flight' ? (
                    <button
                        type="button"
                        onClick={() => setEmailDialogOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        Submit Order Preview →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Continue · spec gap detected
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </>
    )
}

// ─── Flow 3 · sc1.5b · Resolve specification gap ──────────────────────────────
// SC7 painpoint: Strata answers the CR question inline · no senior interrupt.
// S3 painpoint: auto-drafted resubmission email · designer doesn't write from scratch.

interface SpecGapResolvePanelProps { onValidate: () => void }

function SpecGapResolvePanel({ onValidate }: SpecGapResolvePanelProps) {
    const [phase, setPhase] = useState<'gap-shown' | 'resubmitted'>('gap-shown')
    const [expanded, setExpanded] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)

    const resubmitConfig = {
        title: 'Resubmit · CR 2046138 grain direction',
        subtitle: 'Strata drafted the answer · review and send',
        from: 'kimberly.tucker@officeworksinc.com',
        to: 'tifani.cooper@teknion.com',
        cc: 'felicia.miano-poles@officeworksinc.com',
        subject: `Re: Order Preview · MANATT 4th Floor · CR 2046138 grain direction`,
        body: `Hi Tifani,

Quick follow-up on your spec gap for CR 2046138 (Solid Add-On Screen · Flintwood White Oak 5N).

Grain direction: vertical · matches the validation doc approved by Manatt and the other 4 Flintwood pieces in this project (CRs 2046131, 2046136, 2046139, 2046140 — all vertical).

No other changes to the BOM. Resubmitting for your review · same Sched Ship target ${MANATT_ORDER_META.schedShipDate}.

— Kimberly Tucker
   Design Manager · PA · cross-market to DC
   Officeworks Inc.`,
        attachments: [
            { name: `CR-2046138-grain-update.pdf`, size: '120 KB', badge: 'Spec update' },
            { name: `flintwood-grain-reference.png`, size: '88 KB', badge: 'Validation doc · page 7' },
        ],
        sentMessage: 'Resubmitted · recipients notified',
    }

    return (
        <>
            <SQConfirmationDialog
                isOpen={emailDialogOpen}
                onSent={() => { setEmailDialogOpen(false); setPhase('resubmitted') }}
                onCancel={() => setEmailDialogOpen(false)}
                emailConfig={resubmitConfig}
            />

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                {/* Section 1 · Tifani's response banner */}
                <div className="rounded-xl border border-ai/40 bg-ai/5 px-4 py-3 flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-semibold text-foreground">Tifani returned preview · 1 spec gap detected</div>
                        <div className="text-muted-foreground mt-0.5">Preview #OP-2025-0001605 · 2 of 3 surfaced CRs verified clean · 1 needs clarification</div>
                    </div>
                </div>

                {/* Section 2 · Gap card (BOM_FINDINGS pattern) */}
                <div className="rounded-xl border border-warning/30 bg-card overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                    >
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground">CR 2046138 · finish detail missing in spec</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                Tifani: "Flintwood White Oak 5N specified but no grain direction provided. Default vertical assumed?"
                            </div>
                            <div className="text-[10px] italic text-muted-foreground mt-0.5">Source: Tifani · Teknion · 2025/12/31 09:14</div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground bg-primary/20 rounded px-1.5 py-0.5 shrink-0">
                            {expanded ? 'Hide' : 'Strata answers'} {expanded ? '▴' : '▾'}
                        </span>
                    </button>
                    {expanded && (
                        <div className="bg-muted/40 px-4 py-3 border-t border-border space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-ai" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-ai">Strata's answer · grounded in this project</span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">
                                The other 4 Flintwood pieces in this BOM all specify <strong>vertical grain</strong> (CRs 2046131, 2046136, 2046139, 2046140). The validation doc approved by Manatt on page 7 shows vertical grain on all wood surfaces. Strongly suggest replying: <em>"Vertical grain · matches validation doc and the other 4 Flintwood pieces."</em>
                            </p>
                            <p className="text-[10px] italic text-muted-foreground">
                                Citation: Spec Check AS-IS · §Step 8A (CR lookup) + Validation doc page 7 + MANATT CR ledger (4 of 4 Flintwood = vertical)
                            </p>
                        </div>
                    )}
                </div>

                {/* Section 3 · Resubmission summary (only when resubmitted) */}
                {phase === 'resubmitted' && (
                    <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-semibold text-success">CR 2046138 updated · grain direction: vertical</div>
                            <div className="text-muted-foreground">Resubmission queued · Tifani notified · Felicia CC'd · expected clean on next turnaround</div>
                        </div>
                    </div>
                )}

                {/* Section 4 · Schedule risk · phasing comms drafted (only when resubmitted · folded in from former sc1.5c) */}
                {phase === 'resubmitted' && (
                    <div className="rounded-xl border border-warning/30 bg-card overflow-hidden animate-in fade-in slide-in-from-top-1 duration-400">
                        <div className="px-4 py-3 bg-warning/5 border-b border-warning/20 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warning">Also detected · Sched Ship at risk</span>
                        </div>
                        <div className="px-4 py-3 space-y-2.5 text-xs">
                            <p className="text-foreground">
                                The 40-day Flintwood CRs combined with the resubmit cycle push the Must-Arrive Date close to the {MANATT_ORDER_META.schedShipDate} ship target. Strata drafted a 3-way phasing huddle to PM and Salesperson so phasing options are ready before Tifani returns.
                            </p>
                            <div className="rounded-lg bg-muted/30 border border-border px-3 py-2 space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">3-way phasing thread</div>
                                <div className="flex justify-between gap-2 text-foreground">
                                    <span>Designer</span><span className="font-mono text-[11px]">Kimberly Tucker (you)</span>
                                </div>
                                <div className="flex justify-between gap-2 text-foreground">
                                    <span>PM</span><span className="font-mono text-[11px]">Abigail's team · Furniture PMs</span>
                                </div>
                                <div className="flex justify-between gap-2 text-foreground">
                                    <span>Salesperson</span><span className="font-mono text-[11px]">Caitlin Barolet · DC</span>
                                </div>
                            </div>
                            <p className="text-muted-foreground italic text-[11px]">
                                Long-lead items (Flintwood CRs) phased into a Phase 2 delivery · core workstations ship on schedule.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {phase === 'gap-shown' ? (
                    <button
                        type="button"
                        onClick={() => setEmailDialogOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        Apply suggestion &amp; resubmit →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Proceed to Self-Audit
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>
        </>
    )
}
