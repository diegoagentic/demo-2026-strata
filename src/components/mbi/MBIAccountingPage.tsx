/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Flow 1 — Accounting AI, packaged in MBIWizardShell with 4 scenes
 *          that follow Kathy Belleville's morning end-to-end:
 *            1. Morning queue (AP · Pending Review)
 *            2. Non-EDI reconciliation (AP · line-by-line + HealthTrust rebate)
 *            3. AR aging review (AR · live board + analytics)
 *            4. Collection drafts + close (AR · review · send · close)
 *
 *          Mirrors the wizard pattern with shared stepper, persona badge,
 *          per-step CTA, and FlowHandoff at the end.
 *
 * DEMO TOUR: m2.1 / m2.3 / m2.4 / m2.5 map 1:1 to wizard scenes 0–3.
 * Outside a demo step the user navigates freely via the stepper chips + Back/Next.
 */

import { useEffect, useState } from 'react'
import { Receipt, GitCompare, DollarSign, Flag, UserCheck } from 'lucide-react'
import { ReasonDialog as MBIReasonModal } from '../shared'
import MBIPageShell from './MBIPageShell'
import MBIModuleHeader from './MBIModuleHeader'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import AccountingMorningQueue from './AccountingMorningQueue'
import NonEDIReconcilerScene from './NonEDIReconcilerScene'
import ARAgingReviewScene from './ARAgingReviewScene'
import ARAgingWrapScene from './ARAgingWrapScene'
import { useDemo } from '../../context/DemoContext'

const ACCOUNTING_STEPS: WizardStepSpec[] = [
    { id: 'morning',  label: 'AP · Pending Review',                   shortLabel: '1. AP Queue' },
    { id: 'non-edi',  label: 'Bill Review — line-by-line',            shortLabel: '2. Bill Review' },
    { id: 'ar-aging', label: 'AR aging · open accounts to collect',   shortLabel: '3. AR aging' },
    { id: 'ar-close', label: 'Collection emails + wrap up',            shortLabel: '4. Close' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm2.1': 0,
    'm2.3': 1,
    'm2.4': 2,
    'm2.5': 3,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm2.1',
    1: 'm2.3',
    2: 'm2.4',
    3: 'm2.5',
}

const STEP_NEXT_LABELS: Record<number, string> = {
    0: 'Review',
    1: 'Post',
    2: 'Review collection drafts',
    3: 'Wrap up',
}

export default function MBIAccountingPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null
    const demoWizardIdx = demoStepId && demoStepId in STEP_TO_WIZARD_INDEX
        ? STEP_TO_WIZARD_INDEX[demoStepId]
        : null

    const [activeStep, setActiveStep] = useState(0)
    const inWizard = demoWizardIdx !== null || !isDemoActive

    useEffect(() => {
        if (demoWizardIdx !== null) setActiveStep(demoWizardIdx)
    }, [demoWizardIdx])

    const navigateWizard = (idx: number) => {
        setActiveStep(idx)
        if (!isDemoActive) return
        const targetId = WIZARD_INDEX_TO_STEP[idx]
        if (!targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }

    return (
        <MBIPageShell
            title="Accounting AI"
            subtitle="Prototype · Phase 1 (Mark's pick) · Kathy Belleville (Controller) · daily accounting queue · 4h → 18 min"
            icon={<Receipt className="h-5 w-5" />}
            activeApp="mbi-accounting"
        >
            <MBIModuleHeader
                module="accounting"
                tint="ai"
                outcome="Kathy gets her time back — exception-only review, HealthTrust royalties auto-flagged, AR collected on time, billing forecast live for leadership."
            />

            {inWizard ? (
                <MBIWizardShell
                    steps={ACCOUNTING_STEPS}
                    activeStep={activeStep}
                    onStepClick={navigateWizard}
                    onPrev={() => navigateWizard(Math.max(0, activeStep - 1))}
                    onNext={() => navigateWizard(Math.min(ACCOUNTING_STEPS.length - 1, activeStep + 1))}
                    canAdvance
                    nextLabel={STEP_NEXT_LABELS[activeStep]}
                    secondaryAction={activeStep === 1 ? <EscalateAllButton /> : undefined}
                    persona={
                        <MBIPersonaBadge
                            name="Kathy Belleville"
                            role="Controller · Accounting"
                            isPilot
                            tone="ai"
                        />
                    }
                >
                    {activeStep === 0 && <AccountingMorningQueue />}
                    {activeStep === 1 && <NonEDIReconcilerScene />}
                    {activeStep === 2 && <ARAgingReviewScene onContinue={() => navigateWizard(3)} />}
                    {activeStep === 3 && <ARAgingWrapScene />}
                </MBIWizardShell>
            ) : (
                <OverviewStub />
            )}
        </MBIPageShell>
    )
}

const ESCALATE_ALL_CATEGORIES = [
    { id: 'vendor-dispute', label: 'Vendor disputing the variances' },
    { id: 'manager-review', label: 'Needs manager approval' },
    { id: 'contract-issue', label: 'Potential contract discrepancy' },
    { id: 'other', label: 'Other (describe below)' },
]

function EscalateAllButton() {
    const [open, setOpen] = useState(false)
    const [done, setDone] = useState(false)

    if (done) return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <Flag className="h-3.5 w-3.5" />
            Escalated
        </span>
    )

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-background dark:bg-zinc-800 border border-red-200 dark:border-red-500/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
                <Flag className="h-3.5 w-3.5" />
                Escalate
            </button>
            <MBIReasonModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onSubmit={() => { setOpen(false); setDone(true) }}
                tone="danger"
                icon={<Flag className="h-5 w-5" />}
                title="Escalate flagged line items"
                subtitle="Apex Workspace · INV-0484 · 2 exceptions pending"
                contextBanner={{
                    tone: 'info',
                    icon: <UserCheck className="h-4 w-4" />,
                    title: 'Manager will be notified.',
                    body: 'All pending exceptions will be held for manager review. The bill won\'t auto-post until resolved.',
                }}
                categories={ESCALATE_ALL_CATEGORIES}
                defaultCategoryId="vendor-dispute"
                categoryPrompt="Why escalate?"
                notesPlaceholder="e.g. Apex confirmed short ship by email — need manager to approve the PO amendment before posting."
                notesRequiredForCategoryId="other"
                confirmLabel="Escalate to manager"
            />
        </>
    )
}

function OverviewStub() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={<Receipt className="h-4 w-4" />} value="12" label="Bills processed · live queue" accent="text-foreground" />
            <StatCard icon={<GitCompare className="h-4 w-4" />} value="2" label="Non-EDI exceptions" accent="text-amber-600 dark:text-amber-400" />
            <StatCard icon={<DollarSign className="h-4 w-4" />} value="$240K" label="AR live · forecast refreshed" accent="text-success" />
        </div>
    )
}

function StatCard({ icon, value, label, accent }: { icon: React.ReactNode; value: string; label: string; accent: string }) {
    return (
        <div className="bg-card dark:bg-zinc-800 border border-border rounded-2xl p-4">
            <div className={`flex items-center gap-2 ${accent}`}>
                {icon}
                <span className="text-2xl font-bold leading-none">{value}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">{label}</div>
        </div>
    )
}
