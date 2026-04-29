/**
 * COMPONENT: MBIAccountingPage
 * PURPOSE: Flow 1 — Accounting AI, packaged in MBIWizardShell with 5 scenes
 *          that follow Kathy Belleville's morning end-to-end:
 *            1. Morning queue (AP)
 *            2. HealthTrust exception (AP · GPO rebate)
 *            3. Non-EDI reconciliation (AP · line-by-line)
 *            4. AR aging review (AR · live board + analytics)
 *            5. Collection drafts + close (AR · review · send · close)
 *
 *          Mirrors the wizard pattern with shared stepper, persona badge,
 *          per-step CTA, and FlowHandoff at the end. AR was split from a
 *          single wrap-up into two scenes (4 + 5) per Apr 23 Matt's "keep
 *          AP, ADD AR" — gives AR parity with the 3 AP scenes.
 *
 * DEMO TOUR: m2.1 → m2.5 map 1:1 to wizard scenes 0–4. Outside a demo step
 * the user navigates freely via the stepper chips + Back/Next.
 */

import { useEffect, useState } from 'react'
import { Receipt, Heart, GitCompare, DollarSign } from 'lucide-react'
import MBIPageShell from './MBIPageShell'
import MBIModuleHeader from './MBIModuleHeader'
import MBIWizardShell, { type WizardStepSpec } from './MBIWizardShell'
import MBIPersonaBadge from './MBIPersonaBadge'
import AccountingMorningQueue from './AccountingMorningQueue'
import HealthTrustExceptionScene from './HealthTrustExceptionScene'
import NonEDIReconcilerScene from './NonEDIReconcilerScene'
import ARAgingReviewScene from './ARAgingReviewScene'
import ARAgingWrapScene from './ARAgingWrapScene'
import { useDemo } from '../../context/DemoContext'

// Step labels written so a non-finance audience can read them. Acronyms
// are kept (MBI uses them internally) but with a friendlier first word
// where it helps:
//   "Non-EDI" → "Paper bills (Non-EDI)"     — non-EDI = no electronic feed
//   "AR aging" → "AR aging (open accounts)"    — AR = Accounts Receivable
//   "HealthTrust" → "Healthcare contract (HealthTrust GPO)" — GPO context inline
const ACCOUNTING_STEPS: WizardStepSpec[] = [
    { id: 'morning', label: 'Bill queue · pending & recent', shortLabel: '1. Queue' },
    { id: 'healthtrust', label: 'Healthcare contract (HealthTrust GPO)', shortLabel: '2. Healthcare GPO' },
    { id: 'non-edi', label: 'Paper bills reconciliation (Non-EDI)', shortLabel: '3. Paper bills' },
    { id: 'ar-aging', label: 'AR aging · open accounts to collect', shortLabel: '4. AR aging' },
    { id: 'ar-close', label: 'Collection emails + wrap up', shortLabel: '5. Close' },
]

const STEP_TO_WIZARD_INDEX: Record<string, number> = {
    'm2.1': 0,
    'm2.2': 1,
    'm2.3': 2,
    'm2.4': 3,
    'm2.5': 4,
}

const WIZARD_INDEX_TO_STEP: Record<number, string> = {
    0: 'm2.1',
    1: 'm2.2',
    2: 'm2.3',
    3: 'm2.4',
    4: 'm2.5',
}

// Hints emphasize the AP → AR continuity Matt asked for on Apr 23.
// Scenes 0-2 are AP (Accounts Payable · what MBI owes to vendors).
// Scenes 3-4 are AR (Accounts Receivable · what clients owe MBI).
// First mention of each acronym/jargon word includes a plain-language
// gloss so a non-finance audience can follow.
const STEP_HINTS: Record<number, { hint: string; nextLabel: string }> = {
    0: { hint: 'AP starts here (AP = Accounts Payable, the bills MBI owes to vendors). Strata processes bills continuously as they arrive — Kathy opens her queue and sees recent activity + pending exceptions.', nextLabel: 'Review healthcare rebate' },
    1: { hint: 'Approve the auto-calculated 3% rebate (paid to HealthTrust, the healthcare group purchasing organization) · or override with a logged reason · or escalate to the Healthcare Director.', nextLabel: 'Reconcile paper bills' },
    2: { hint: 'Last AP step · line-by-line diff vs PO for non-EDI vendors (paper / PDF bills, no electronic feed) · accept variances that match your delivery, override the rest. Then we move to AR.', nextLabel: 'AP done · move to receivables' },
    3: { hint: 'AP closed · now AR (Accounts Receivable, what clients owe MBI). $240K open · live aging board replaces the bi-weekly Excel · scan the open accounts by how late they are.', nextLabel: 'Review collection drafts' },
    4: { hint: 'Strata drafted every follow-up in the client\'s tone history · review, edit if needed, send · then wrap up the queue.', nextLabel: 'Wrap up' },
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

    const stepMeta = STEP_HINTS[activeStep] ?? { hint: '', nextLabel: undefined }

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
                    actionHint={stepMeta.hint}
                    nextLabel={stepMeta.nextLabel}
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
                    {activeStep === 1 && <HealthTrustExceptionScene />}
                    {activeStep === 2 && <NonEDIReconcilerScene />}
                    {activeStep === 3 && <ARAgingReviewScene onContinue={() => navigateWizard(4)} />}
                    {activeStep === 4 && <ARAgingWrapScene />}
                </MBIWizardShell>
            ) : (
                <OverviewStub />
            )}
        </MBIPageShell>
    )
}

function OverviewStub() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Receipt className="h-4 w-4" />} value="12" label="Bills processed · live queue" accent="text-foreground" />
            <StatCard icon={<Heart className="h-4 w-4" />} value="2" label="HealthTrust rebate flagged" accent="text-zinc-900 dark:text-primary" />
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
