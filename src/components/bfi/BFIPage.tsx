/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for both BFI demo flows.
 *
 *   Tab 1 — Agency Fee AI (bfi-agency-fee)
 *     8-step wizard: Queue · Pricing · Discount · Labor · Tracker · CPR · Relay · Fee Verify
 *
 *   Tab 2 — Receiving AI (bfi-receiving)
 *     8-step wizard: Dashboard · FedEx Gap · Bingo Parse · Alert · Work Order · Walter · Storage · Close
 *
 * ROLE SYSTEM:
 *   activeRole drives the persona badge and changes per scene.
 *   b1.4 → Michael (Director of Strategic Accounts)
 *   b1.7 → Michael (CPR Relay to Nancy)
 *   b1.8 → Patricia (Finance / AR)
 *   b2.3 → Lena (Receiving Coordinator)
 *   b2.6 → Walter (CoNY Project Manager)
 *   All others → Lauren (CoNY Account Lead)
 *
 * INTERACTION PRINCIPLE:
 *   No "Next" buttons. Every scene has one semantic action (Approve, Apply,
 *   Confirm, Send) that calls nextStep() as a side effect.
 */

import { useEffect, useState, useCallback } from 'react'
import { Building2, Package } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import MBIWizardShell, { type WizardStepSpec } from '../mbi/MBIWizardShell'
import MBIPersonaBadge from '../mbi/MBIPersonaBadge'
import CoNYMorningQueue from './CoNYMorningQueue'
import PricingValidationScene from './PricingValidationScene'
import DiscountCalcScene from './DiscountCalcScene'
import LaborQuoteParserScene from './LaborQuoteParserScene'
import OrderTrackerScene from './OrderTrackerScene'
import CPRReconciliationScene from './CPRReconciliationScene'
import CPRRelayScene from './CPRRelayScene'
import AgencyFeeVerifyScene from './AgencyFeeVerifyScene'
import CoNYOrderMonitorScene from './CoNYOrderMonitorScene'
import FedExGapScene from './FedExGapScene'
import WIGDocParserScene from './WIGDocParserScene'
import ReceiptAlertScene from './ReceiptAlertScene'
import WorkOrderScene from './WorkOrderScene'
import WalterNotifScene from './WalterNotifScene'
import StorageMonitorScene from './StorageMonitorScene'
import ReceivingCloseScene from './ReceivingCloseScene'
import { useDemo } from '../../context/DemoContext'

// ── Role system ───────────────────────────────────────────────────────────────

type BFIRole = 'account-lead' | 'michael' | 'lena' | 'walter' | 'patricia'

const ROLE_CONFIG: Record<BFIRole, { name: string; role: string; tone: 'ai' | 'neutral' | 'info' }> = {
    'account-lead': { name: 'CoNY Account Lead',              role: 'Agency Fee · Receiving',  tone: 'ai'      },
    'michael':      { name: 'Director of Strategic Accounts', role: 'Labor · CPR Relay',       tone: 'neutral' },
    'lena':         { name: 'Receiving Coordinator',          role: 'WIG · CORE Entry',        tone: 'neutral' },
    'walter':       { name: 'CoNY Project Manager',           role: 'Dispatch · Scheduling',   tone: 'info'    },
    'patricia':     { name: 'Finance / AR',                   role: 'Agency Fee Close',        tone: 'neutral' },
}

// Step → default role (steps not listed default to 'account-lead')
const STEP_ROLE: Record<string, BFIRole> = {
    'b1.4': 'michael',
    'b1.7': 'michael',
    'b1.8': 'patricia',
    'b2.3': 'lena',
    'b2.6': 'walter',
}

// ── Agency Fee wizard (Flow 1 · b1.x) ────────────────────────────────────────

const AGENCY_FEE_STEPS: WizardStepSpec[] = [
    { id: 'queue',    label: 'Active orders · AI triage',          shortLabel: '1. Queue'    },
    { id: 'pricing',  label: 'Pricing · SIF vs CoNY contract',     shortLabel: '2. Pricing'  },
    { id: 'discount', label: 'Discount · sell÷list-1 · true-up',   shortLabel: '3. Discount' },
    { id: 'labor',    label: 'Labor · WIG quote parsed',           shortLabel: '4. Labor'    },
    { id: 'tracker',  label: 'Order tracker · CORE + Omni',        shortLabel: '5. Tracker'  },
    { id: 'cpr',      label: 'CPR · certified vs quoted hours',    shortLabel: '6. CPR'      },
    { id: 'relay',    label: 'CPR relay · Michael → Nancy',        shortLabel: '7. Relay'    },
    { id: 'fee',      label: 'Agency fee · contract verification', shortLabel: '8. Fee'      },
]

const AF_STEP_TO_IDX: Record<string, number> = {
    'b1.1': 0, 'b1.2': 1, 'b1.3': 2, 'b1.4': 3,
    'b1.5': 4, 'b1.6': 5, 'b1.7': 6, 'b1.8': 7,
}
const AF_IDX_TO_STEP: Record<number, string> = {
    0: 'b1.1', 1: 'b1.2', 2: 'b1.3', 3: 'b1.4',
    4: 'b1.5', 5: 'b1.6', 6: 'b1.7', 7: 'b1.8',
}

// ── Receiving wizard (Flow 2 · b2.x) ─────────────────────────────────────────

const RECEIVING_STEPS: WizardStepSpec[] = [
    { id: 'dashboard', label: 'Receiving · WIG order status',       shortLabel: '1. Dashboard' },
    { id: 'fedex',     label: 'FedEx gap · POD request sent',       shortLabel: '2. FedEx'    },
    { id: 'bingo',     label: 'WIG doc · Bingo sheet parsed',       shortLabel: '3. Bingo'    },
    { id: 'alert',     label: '100% receipt · alert triggered',     shortLabel: '4. Alert'    },
    { id: 'workorder', label: 'Work order · NYC signature',         shortLabel: '5. WO'       },
    { id: 'walter',    label: 'CoNY PM · Walter notified',          shortLabel: '6. Walter'   },
    { id: 'storage',   label: '30-day storage monitor',             shortLabel: '7. Storage'  },
    { id: 'close',     label: 'Receiving close · invoiceable',      shortLabel: '8. Close'    },
]

const REC_STEP_TO_IDX: Record<string, number> = {
    'b2.1': 0, 'b2.2': 1, 'b2.3': 2, 'b2.4': 3,
    'b2.5': 4, 'b2.6': 5, 'b2.7': 6, 'b2.8': 7,
}
const REC_IDX_TO_STEP: Record<number, string> = {
    0: 'b2.1', 1: 'b2.2', 2: 'b2.3', 3: 'b2.4',
    4: 'b2.5', 5: 'b2.6', 6: 'b2.7', 7: 'b2.8',
}

// ── Tab type ──────────────────────────────────────────────────────────────────

type BFITab = 'agency-fee' | 'receiving'

const STEP_TO_TAB: Record<string, BFITab> = {
    'b1.1': 'agency-fee', 'b1.2': 'agency-fee', 'b1.3': 'agency-fee', 'b1.4': 'agency-fee',
    'b1.5': 'agency-fee', 'b1.6': 'agency-fee', 'b1.7': 'agency-fee', 'b1.8': 'agency-fee',
    'b2.1': 'receiving',  'b2.2': 'receiving',  'b2.3': 'receiving',  'b2.4': 'receiving',
    'b2.5': 'receiving',  'b2.6': 'receiving',  'b2.7': 'receiving',  'b2.8': 'receiving',
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BFIPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null

    const [activeTab, setActiveTab]   = useState<BFITab>('agency-fee')
    const [afStep, setAfStep]         = useState(0)
    const [recStep, setRecStep]       = useState(0)
    const [activeRole, setActiveRole] = useState<BFIRole>('account-lead')

    // Sync tab + wizard index + role when the demo tour navigates
    useEffect(() => {
        if (!demoStepId) return
        const tab = STEP_TO_TAB[demoStepId]
        if (!tab) return
        setActiveTab(tab)
        if (tab === 'agency-fee' && demoStepId in AF_STEP_TO_IDX) {
            setAfStep(AF_STEP_TO_IDX[demoStepId])
        } else if (tab === 'receiving' && demoStepId in REC_STEP_TO_IDX) {
            setRecStep(REC_STEP_TO_IDX[demoStepId])
        }
        setActiveRole(STEP_ROLE[demoStepId] ?? 'account-lead')
    }, [demoStepId])

    const navigateAF = useCallback((idx: number) => {
        setAfStep(idx)
        const targetId = AF_IDX_TO_STEP[idx]
        setActiveRole(STEP_ROLE[targetId] ?? 'account-lead')
        if (!isDemoActive || !targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }, [isDemoActive, currentStep, tourSteps, goToStep])

    const navigateRec = useCallback((idx: number) => {
        setRecStep(idx)
        const targetId = REC_IDX_TO_STEP[idx]
        setActiveRole(STEP_ROLE[targetId] ?? 'account-lead')
        if (!isDemoActive || !targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }, [isDemoActive, currentStep, tourSteps, goToStep])

    const roleConfig = ROLE_CONFIG[activeRole]

    const persona = (
        <MBIPersonaBadge
            key={activeRole}
            name={roleConfig.name}
            role={roleConfig.role}
            tone={roleConfig.tone}
        />
    )

    const tabSwitcher = (
        <div className="flex gap-1 bg-muted/40 dark:bg-zinc-800/60 border border-border rounded-xl p-1 w-fit">
            <TabButton
                active={activeTab === 'agency-fee'}
                onClick={() => setActiveTab('agency-fee')}
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Agency Fee AI"
            />
            <TabButton
                active={activeTab === 'receiving'}
                onClick={() => setActiveTab('receiving')}
                icon={<Package className="h-3.5 w-3.5" />}
                label="Receiving AI"
            />
        </div>
    )

    return (
        <MBIPageShell
            preHeader={tabSwitcher}
            title={activeTab === 'agency-fee' ? 'Agency Fee AI' : 'Receiving AI'}
            subtitle={activeTab === 'agency-fee'
                ? 'CoNY Account Lead · pricing validation · CPR reconciliation · fee verification'
                : 'CoNY Account Lead · WIG receiving monitor · work order dispatch'}
            icon={activeTab === 'agency-fee'
                ? <Building2 className="h-5 w-5" />
                : <Package className="h-5 w-5" />}
            activeApp={activeTab === 'agency-fee' ? 'bfi-agency-fee' : 'bfi-receiving'}
        >
            {/* Agency Fee tab — Flow 1 (b1.1 → b1.8) */}
            {activeTab === 'agency-fee' && (
                <MBIWizardShell
                    steps={AGENCY_FEE_STEPS}
                    activeStep={afStep}
                    onStepClick={navigateAF}
                    onPrev={() => navigateAF(Math.max(0, afStep - 1))}
                    onNext={() => navigateAF(Math.min(AGENCY_FEE_STEPS.length - 1, afStep + 1))}
                    canAdvance
                    persona={persona}
                >
                    {afStep === 0 && <CoNYMorningQueue onSelectOrder={() => navigateAF(1)} />}
                    {afStep === 1 && <PricingValidationScene />}
                    {afStep === 2 && <DiscountCalcScene onApply={() => navigateAF(3)} />}
                    {afStep === 3 && <LaborQuoteParserScene onApprove={() => navigateAF(4)} onRoleChange={r => setActiveRole(r as BFIRole)} />}
                    {afStep === 4 && <OrderTrackerScene onConfirm={() => navigateAF(5)} />}
                    {afStep === 5 && <CPRReconciliationScene />}
                    {afStep === 6 && <CPRRelayScene onSend={() => navigateAF(7)} onRoleChange={r => setActiveRole(r as BFIRole)} />}
                    {afStep === 7 && <AgencyFeeVerifyScene />}
                </MBIWizardShell>
            )}

            {/* Receiving tab — Flow 2 (b2.1 → b2.8) */}
            {activeTab === 'receiving' && (
                <MBIWizardShell
                    steps={RECEIVING_STEPS}
                    activeStep={recStep}
                    onStepClick={navigateRec}
                    onPrev={() => navigateRec(Math.max(0, recStep - 1))}
                    onNext={() => navigateRec(Math.min(RECEIVING_STEPS.length - 1, recStep + 1))}
                    canAdvance
                    persona={persona}
                >
                    {recStep === 0 && <CoNYOrderMonitorScene onDispatch={() => navigateRec(1)} />}
                    {recStep === 1 && <FedExGapScene onSend={() => navigateRec(2)} />}
                    {recStep === 2 && <WIGDocParserScene onConfirm={() => navigateRec(3)} onRoleChange={r => setActiveRole(r as BFIRole)} />}
                    {recStep === 3 && <ReceiptAlertScene onAcknowledge={() => navigateRec(4)} />}
                    {recStep === 4 && <WorkOrderScene onApprove={() => navigateRec(5)} />}
                    {recStep === 5 && <WalterNotifScene onConfirm={() => navigateRec(6)} onRoleChange={r => setActiveRole(r as BFIRole)} />}
                    {recStep === 6 && <StorageMonitorScene onConfirm={() => navigateRec(7)} />}
                    {recStep === 7 && <ReceivingCloseScene />}
                </MBIWizardShell>
            )}
        </MBIPageShell>
    )
}

function TabButton({ active, onClick, icon, label }: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                active
                    ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
