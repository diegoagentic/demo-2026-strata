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
import { X, Sparkles, FileText, MapPin, ClipboardCheck, ArrowRight, AlertCircle, CheckCircle2, FileWarning, Image as ImageIcon, Eye, UserCheck, Users, Paperclip, Mail, Loader2, HelpCircle } from 'lucide-react'
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
    'design':           'Export the CET layout → CAP · upload the 149-line BOM · Strata analyzes + flags findings · then send the validation doc to MANATT for client approval',
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
    'validation': ['works-form', 'floor-plan', 'attachments'],
    'sq-check': ['works-form', 'floor-plan', 'attachments'],
}
const DEFAULT_TAB_SET: DocTab[] = ['works-form', 'bom', 'validation', 'floor-plan', 'ack']

// Flags toggled by Flow 2 panels as the designer produces artifacts.
// Used by DefaultDocTabs to reveal the BOM / Validation Doc tabs and by
// BOMPreview to flip from placeholder to real table.
interface FlowProgress {
    bomUploaded: boolean
    validationCompiled: boolean
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
        validationCompiled: false,
    })
    // Defensive reset when the modal returns to a pre-Flow-2 stage (back-navigation)
    useEffect(() => {
        if (stage === 'intake' || stage === 'intake-complete') {
            setFlowProgress({ bomUploaded: false, validationCompiled: false })
        }
    }, [stage])
    const markBomUploaded       = () => setFlowProgress(p => ({ ...p, bomUploaded: true }))
    const markValidationDone    = () => setFlowProgress(p => ({ ...p, validationCompiled: true }))

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
                                                // Flow 2 · 3 interactive panels (each owns its own CTA)
                                                if (stage === 'design')     return <DesignBOMPanel onValidate={onValidate} onBOMUploaded={markBomUploaded} onValidationCompiled={markValidationDone} bomUploaded={flowProgress.bomUploaded} />
                                                if (stage === 'sq-check')   return <SQCheckPanel onValidate={onValidate} />
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
    if (flowProgress.validationCompiled && !visibleTabIds.includes('validation')) visibleTabIds.push('validation')
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
        window.addEventListener('officeworks:bom-tab-focus', surfaceBom)
        window.addEventListener('officeworks:floor-plan-focus', surfaceFloorPlan)
        return () => {
            window.removeEventListener('officeworks:bom-tab-focus', surfaceBom)
            window.removeEventListener('officeworks:floor-plan-focus', surfaceFloorPlan)
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
    if (tab === 'validation') return <ValidationDocPreview validationCompiled={flowProgress.validationCompiled} />
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

function ValidationDocPreview({ validationCompiled }: { validationCompiled: boolean }) {
    if (!validationCompiled) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                <div className="bg-card border border-dashed border-border rounded-xl p-8 max-w-md text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Validation document not yet sent</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Strata auto-compiles the Google Slides validation doc after the BOM is analyzed.
                            Send it to MANATT from the right panel to populate this tab.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const slides = [
        { title: 'Overall floor plan', content: 'CAD-aligned · 71 stations' },
        { title: '2D drawings', content: 'Workstation typicals · dimensions' },
        { title: '3D renderings', content: 'Detailed product descriptions' },
        { title: 'Finishes', content: 'Mica Very White 83 · Smooth Felt QR Admiral Blue · Flintwood 5N White Oak' },
        { title: 'Wire management', content: 'E-chain · cable wrap · power cubes · monitor arms' },
        { title: 'Electrical', content: 'OWDC code · BF visible · Power Spine 120' },
    ]

    return (
        <div className="h-full overflow-y-auto p-4 bg-muted/20">
            <div className="bg-card border border-border rounded-xl overflow-hidden max-w-2xl mx-auto">
                <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Validation Document · Google Slides</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">MANATT 4th Floor · {MANATT_ORDER_META.poNumber} · auto-compiled</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                        Approved
                    </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    {slides.map((s, i) => (
                        <div key={i} className="bg-muted/30 border border-border rounded-lg aspect-video flex flex-col items-center justify-center text-center p-3 text-xs">
                            <ImageIcon className="h-5 w-5 text-muted-foreground mb-1" />
                            <div className="font-semibold text-foreground">{s.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{s.content}</div>
                        </div>
                    ))}
                </div>
            </div>
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
            cta: 'Tifani: clean · proceed to audit',
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
            cta: 'Send to Caitlin + Coordinator',
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
                        disabled={!assignedDesigner}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {assignedDesigner ? (
                            <>
                                Approve & Assign · Continue to Kickoff
                                <ArrowRight className="h-4 w-4" />
                            </>
                        ) : (
                            'Select a designer to continue'
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
                    headerLabel="Caitlin Barolet · DC Salesrep"
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
                        successTitle: 'Clarification request sent to Caitlin',
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
    onValidationCompiled: () => void
    bomUploaded: boolean
}

// Email body for the validation document sent to the MANATT client.
const VALIDATION_MESSAGE = `Hi Caitlin,

Attaching the validation document for MANATT 4th Floor — 2D/3D drawings, finishes, electrical and wire management. Please confirm or request revisions.

— Kimberly Tucker
Officeworks · Design`

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

// Conversion/export simulation shown before the send modal opens.
const EXPORT_BULLETS = [
    'Converting CET layout → CAP BOM worksheet · 149 lines',
    'Exporting SP4 file for order placement',
    'Compiling validation document · 2D/3D · finishes · electrical',
    'Packaging attachments · ready to send',
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
        title: 'Item 73 · Office_WO.3 panel finish mismatch',
        detail: 'Source Laminate XS Storm White vs the area\'s XG Very White pattern · BMWOOH7224BTNN (CR 2090148)',
        source: 'Source: BOM page 9 · Item 73 · Office_WO.3 area',
        answer: 'The other Office_WO.3 panels in the BOM use Source Laminate XG Very White · Item 73 alone uses XS Storm White. Likely a typo — confirm against the floor plan and with Caitlin before submission.',
        citation: 'Detected in the BOM · Item 73 finish vs the other Office_WO.3 panels · confirm against the floor plan',
        primary: { label: 'Flag for resubmit', tone: 'success' },
        secondary: 'Override · keep XS',
    },
    {
        id: 'cr-2046138',
        severity: 'ai',
        title: 'CR 2046138 · Solid Add-On Screen · WS-02',
        detail: 'Custom flintwood finish White Oak 5N · qty 1 · $1,406 list',
        source: 'Source: BOM page 13 · Item 118 · WS-02 (6) area',
        answer: 'Custom Request found on this line · look up CR 2046138 in Teknion Create to confirm the part, finish, and lead-time before submission.',
        citation: 'Teknion Create · CR 2046138 lookup',
        primary: { label: 'Accept · proceed', tone: 'success' },
        secondary: 'Open Create platform',
    },
    {
        id: 'cr-2090148',
        severity: 'ai',
        title: 'CR 2090148 · Wall Panel shelf placement · ×5 occurrences',
        detail: 'Items 10, 31, 52, 62, 73 · IO.1 + IO.4 + WO.1 + WO.2 + WO.3 · $427 × 5 = $2,135 list',
        source: 'Source: BOM pages 2-9 · multiple line items',
        answer: 'The same CR appears on 5 line items across IO.1/IO.4/WO.1/WO.2/WO.3. Confirm each instance is intended on the floor plan and look up CR 2090148 in Teknion Create.',
        citation: 'Detected in the BOM · CR 2090148 on items 10/31/52/62/73 · verify in Teknion Create',
        primary: { label: 'Accept · proceed', tone: 'success' },
        secondary: 'Bulk override',
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

function DesignBOMPanel({ onValidate, onBOMUploaded, onValidationCompiled, bomUploaded }: DesignBOMPanelProps) {
    type Phase = 'waiting-upload' | 'processing-upload' | 'analyzed' | 'exporting' | 'sent'
    const [phase, setPhase] = useState<Phase>(bomUploaded ? 'analyzed' : 'waiting-upload')
    const [ledgerCount, setLedgerCount] = useState(0)
    const [ddpEnabled, setDdpEnabled] = useState(false)
    const [uploadCount, setUploadCount] = useState(0)
    const [exportCount, setExportCount] = useState(0)
    const [validationDialog, setValidationDialog] = useState(false)
    const timeoutsRef = useRef<number[]>([])

    // Phase 'waiting-upload': progressive ledger events
    useEffect(() => {
        if (phase !== 'waiting-upload') return
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

    // Phase 'processing-upload': progressive bullets · then advance to 'analyzed' and notify modal
    useEffect(() => {
        if (phase !== 'processing-upload') return
        setUploadCount(0)
        UPLOAD_BULLETS.forEach((_, i) => {
            const id = window.setTimeout(() => setUploadCount(i + 1), 500 * (i + 1))
            timeoutsRef.current.push(id)
        })
        const doneId = window.setTimeout(() => {
            setPhase('analyzed')
            onBOMUploaded()  // flips flowProgress.bomUploaded → DefaultDocTabs auto-switches to the BOM tab
        }, 500 * UPLOAD_BULLETS.length + 400)
        timeoutsRef.current.push(doneId)
        return () => {
            timeoutsRef.current.forEach(id => window.clearTimeout(id))
            timeoutsRef.current = []
        }
    }, [phase, onBOMUploaded])

    // Phase 'exporting': convert/package the BOM, then open the send modal with the file ready
    useEffect(() => {
        if (phase !== 'exporting') return
        setExportCount(0)
        EXPORT_BULLETS.forEach((_, i) => {
            const id = window.setTimeout(() => setExportCount(i + 1), 450 * (i + 1))
            timeoutsRef.current.push(id)
        })
        const openId = window.setTimeout(() => setValidationDialog(true), 450 * EXPORT_BULLETS.length + 350)
        timeoutsRef.current.push(openId)
        return () => {
            timeoutsRef.current.forEach(id => window.clearTimeout(id))
            timeoutsRef.current = []
        }
    }, [phase])

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
                        {phase === 'waiting-upload' && ledgerCount < LEDGER_EVENTS.length && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic pt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                                Waiting for next event…
                            </div>
                        )}
                    </div>
                </div>

                {/* Waiting for BOM upload · drop zone + DDP toggle */}
                {phase === 'waiting-upload' && (
                    <>
                        <div className="border-t border-border pt-4 space-y-2">
                            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                Awaiting BOM upload
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
                                onClick={() => setPhase('processing-upload')}
                                className="w-full border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg p-5 flex flex-col items-center justify-center gap-2 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
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

                {/* Processing upload · progressive bullets */}
                {phase === 'processing-upload' && (
                    <div className="border-t border-border pt-4 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-foreground animate-spin" />
                            <h4 className="text-base font-semibold text-foreground">Strata processing BOM upload…</h4>
                        </div>
                        <ul className="space-y-1.5">
                            {UPLOAD_BULLETS.slice(0, uploadCount).map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Exporting · converting/packaging the BOM before the send modal opens */}
                {phase === 'exporting' && (
                    <div className="border-t border-border pt-4 space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-foreground animate-spin" />
                            <h4 className="text-base font-semibold text-foreground">Exporting BOM · preparing files to send…</h4>
                        </div>
                        <ul className="space-y-1.5">
                            {EXPORT_BULLETS.slice(0, exportCount).map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-foreground animate-in fade-in slide-in-from-left-1 duration-300">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Analyzed · success + BOM findings + related processes */}
                {phase === 'analyzed' && (
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
                                    <button type="button" onClick={() => setPhase('waiting-upload')} className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 hover:bg-muted/50 transition-colors">
                                        <Paperclip className="h-3 w-3" /> Replace file
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

                {/* Validation sent · client approval requested */}
                {phase === 'sent' && (
                    <div className="border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <div className="font-semibold text-success">Validation document sent to MANATT</div>
                                <div className="text-muted-foreground">
                                    2D/3D drawings · finishes · electrical sent to Caitlin Barolet for client approval. Pre-install drawings hand off to the PM team for field verification in parallel.
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground italic">
                            Once approved, Strata moves the order to the price-protected SQ check.
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {phase === 'waiting-upload' && (
                    <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium opacity-60 cursor-not-allowed"
                    >
                        Upload BOM to continue
                    </button>
                )}
                {phase === 'processing-upload' && (
                    <button type="button" disabled className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium opacity-60 cursor-not-allowed">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing upload…
                    </button>
                )}
                {phase === 'analyzed' && (
                    <button
                        type="button"
                        onClick={() => setPhase('exporting')}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        Export and send
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
                {phase === 'exporting' && (
                    <button type="button" disabled className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium opacity-60 cursor-not-allowed">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exporting…
                    </button>
                )}
                {phase === 'sent' && (
                    <button
                        type="button"
                        onClick={onValidate}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                        Continue to SQ check
                        <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>

            <RequestInfoDialog
                isOpen={validationDialog}
                onSent={() => { setValidationDialog(false); setPhase('sent'); onValidationCompiled() }}
                onClose={() => { setValidationDialog(false); setPhase('analyzed') }}
                headerAvatar="CB"
                headerLabel="Caitlin Barolet · MANATT (DC)"
                headerSubtitle="caitlin.barolet@manatt.com · Validation Document"
                defaults={{
                    from: 'kimberly.tucker@officeworks.com',
                    to: 'caitlin.barolet@manatt.com',
                    cc: 'felicia.miano-poles@officeworks.com',
                    date: '2026-04-22 · 2:15 PM',
                    subject: 'MANATT 4th Floor · Validation Document · approval requested',
                    message: VALIDATION_MESSAGE,
                    attachments: [{ name: 'MANATT-4F_validation-v1.pdf', meta: '6 slides · Google Slides export' }],
                    alertTitle: 'Client approval gate (GW2A)',
                    alertRows: [
                        { label: 'Project', value: 'MANATT · 4th Floor · ~30 stations' },
                        { label: 'Doc',     value: 'Validation v1 · 2D/3D + finishes + electrical' },
                        { label: 'Sent to', value: 'Caitlin Barolet · MANATT (DC)' },
                    ],
                    successTitle: 'Validation doc sent to MANATT',
                    successSubtitle: 'Awaiting Caitlin approval · field verification runs in parallel',
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

interface SQCheckPanelProps { onValidate: () => void }

function SQCheckPanel({ onValidate }: SQCheckPanelProps) {
    const [confirmed, setConfirmed] = useState(false)

    return (
        <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-base font-semibold text-foreground">Strata Knowledge Assistant · SQ lookup</h4>
                </div>
                <p className="text-[11px] text-muted-foreground">PP3 · Captured-knowledge assistant answers the SQ / catalog / GSA question inline · no senior interrupt needed.</p>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Question</span>
                        <span className="text-xs text-foreground">Is MANATT GSA price-protected? Which catalog applies?</span>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                        <div>
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
                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Price protection</div>
                                <div className="text-[11px] text-foreground mt-0.5">YES · GSA client</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Special Quote</div>
                                <div className="text-[11px] text-foreground mt-0.5">SQ #436533</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Catalog</div>
                                <div className="text-[11px] text-foreground mt-0.5">2025 · confirm effective dates</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Verified in</div>
                                <RuleTooltip
                                    rule="SQ and price-protection are looked up in Teknion's Create platform together with the manufacturer's special pricing form — a manual step today, run inline here by Strata."
                                    source="Source: Spec Check AS-IS · Tools + 'Exception: Price-Protected Orders'"
                                >
                                    <span className="text-[11px] text-foreground mt-0.5">Teknion Create + special pricing form</span>
                                </RuleTooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {confirmed && (
                    <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-semibold text-success">SQ #436533 confirmed · 2025 catalog locked</div>
                            <div className="text-muted-foreground">Knowledge base updated · proceed to Teknion Order Preview</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-border px-5 py-3 bg-card shrink-0">
                {!confirmed ? (
                    <button
                        type="button"
                        onClick={() => setConfirmed(true)}
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md bg-brand-400 hover:bg-brand-300 text-zinc-900 text-sm font-bold transition-colors"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Confirm SQ · use 2025 catalog
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
