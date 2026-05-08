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
 * ROLE → SHELL:
 *   account-lead (Lauren) → BFIAppShell "CoNY Account Management"
 *   michael               → BFIAppShell "Strategic Accounts"
 *   lena                  → BFIAppShell "Receiving Operations"
 *   patricia              → BFIAppShell "Finance & AR"
 *   walter  (b2.6)        → MobileDeviceFrame on bg-zinc-950 (client PM on phone)
 *
 * INTERACTION PRINCIPLE:
 *   No "Next" buttons. No stepper chips. Every scene has one semantic action
 *   (Approve, Apply, Confirm, Send) that calls nextStep() as a side effect.
 */

import { useEffect, useState, useCallback } from 'react'
import { Building2, Package } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'
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
type BFIShellRole = Exclude<BFIRole, 'walter'>

// Step → role (unlisted steps default to 'account-lead')
const STEP_ROLE: Record<string, BFIRole> = {
    'b1.4': 'michael',
    'b1.7': 'michael',
    'b1.8': 'patricia',
    'b2.3': 'lena',
    'b2.6': 'walter',
}

// ── BFI App Shell config ──────────────────────────────────────────────────────

interface BFIShellTab {
    label: string
    activeForSteps?: string[]
    badge?: string
}

interface BFIShellConfig {
    name: string
    initials: string
    appTitle: string
    tabs: BFIShellTab[]
}

const SHELL_CONFIG: Record<BFIShellRole, BFIShellConfig> = {
    'account-lead': {
        name: 'Lauren G.', initials: 'LG', appTitle: 'CoNY Account Management',
        tabs: [
            { label: 'Orders' },
            { label: 'Agency Fee', activeForSteps: ['b1.1', 'b1.2', 'b1.3', 'b1.5', 'b1.6'] },
            { label: 'Receiving',  activeForSteps: ['b2.1', 'b2.2', 'b2.4', 'b2.5', 'b2.7', 'b2.8'] },
            { label: 'Reports' },
        ],
    },
    michael: {
        name: 'Michael B.', initials: 'MB', appTitle: 'Strategic Accounts',
        tabs: [
            { label: 'Dashboard' },
            { label: 'Pending',      badge: '1' },
            { label: 'Labor Quotes', activeForSteps: ['b1.4'] },
            { label: 'CPR Relay',    activeForSteps: ['b1.7'] },
        ],
    },
    lena: {
        name: 'Lena S.', initials: 'LS', appTitle: 'Receiving Operations',
        tabs: [
            { label: 'Incoming',   badge: '1' },
            { label: 'Processing', activeForSteps: ['b2.3'] },
            { label: 'CORE Sync' },
            { label: 'Queue' },
        ],
    },
    patricia: {
        name: 'Patricia L.', initials: 'PL', appTitle: 'Finance & AR',
        tabs: [
            { label: 'AR Aging' },
            { label: 'Agency Fees', badge: '1', activeForSteps: ['b1.8'] },
            { label: 'CORE Sync' },
            { label: 'Reports' },
        ],
    },
}

// ── Step index maps ───────────────────────────────────────────────────────────

const AF_STEP_TO_IDX: Record<string, number> = {
    'b1.1': 0, 'b1.2': 1, 'b1.3': 2, 'b1.4': 3,
    'b1.5': 4, 'b1.6': 5, 'b1.7': 6, 'b1.8': 7,
}
const AF_IDX_TO_STEP: Record<number, string> = {
    0: 'b1.1', 1: 'b1.2', 2: 'b1.3', 3: 'b1.4',
    4: 'b1.5', 5: 'b1.6', 6: 'b1.7', 7: 'b1.8',
}

const REC_STEP_TO_IDX: Record<string, number> = {
    'b2.1': 0, 'b2.2': 1, 'b2.3': 2, 'b2.4': 3,
    'b2.5': 4, 'b2.6': 5, 'b2.7': 6, 'b2.8': 7,
}
const REC_IDX_TO_STEP: Record<number, string> = {
    0: 'b2.1', 1: 'b2.2', 2: 'b2.3', 3: 'b2.4',
    4: 'b2.5', 5: 'b2.6', 6: 'b2.7', 7: 'b2.8',
}

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

    const currentStepId = activeTab === 'agency-fee'
        ? (AF_IDX_TO_STEP[afStep] ?? 'b1.1')
        : (REC_IDX_TO_STEP[recStep] ?? 'b2.1')

    // Sync tab + step index + role when the demo tour navigates
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

    // Walter (b2.6) is the one step that leaves the BFI app shell entirely
    const isWalterStep = activeTab === 'receiving' && recStep === 5

    // Shell role — walter never reaches BFIAppShell, falls back to account-lead as guard
    const shellRole: BFIShellRole =
        activeRole === 'walter' ? 'account-lead' : (activeRole as BFIShellRole)

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
            {/* ── Walter b2.6 — client PM on phone, outside the BFI app ── */}
            {isWalterStep && (
                <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] bg-zinc-950 rounded-2xl animate-in fade-in duration-500">
                    <MobileDeviceFrame>
                        <WalterNotifScene
                            onConfirm={() => navigateRec(6)}
                            onRoleChange={r => setActiveRole(r as BFIRole)}
                        />
                    </MobileDeviceFrame>
                </div>
            )}

            {/* ── Agency Fee tab (b1.x) ── */}
            {activeTab === 'agency-fee' && (
                <BFIAppShell role={shellRole} currentStepId={currentStepId}>
                    {afStep === 0 && <CoNYMorningQueue onSelectOrder={() => navigateAF(1)} />}
                    {afStep === 1 && <PricingValidationScene />}
                    {afStep === 2 && <DiscountCalcScene onApply={() => navigateAF(3)} />}
                    {afStep === 3 && (
                        <LaborQuoteParserScene
                            onApprove={() => navigateAF(4)}
                            onRoleChange={r => setActiveRole(r as BFIRole)}
                        />
                    )}
                    {afStep === 4 && <OrderTrackerScene onConfirm={() => navigateAF(5)} />}
                    {afStep === 5 && <CPRReconciliationScene />}
                    {afStep === 6 && (
                        <CPRRelayScene
                            onSend={() => navigateAF(7)}
                            onRoleChange={r => setActiveRole(r as BFIRole)}
                        />
                    )}
                    {afStep === 7 && <AgencyFeeVerifyScene />}
                </BFIAppShell>
            )}

            {/* ── Receiving tab (b2.x) — Walter excluded ── */}
            {activeTab === 'receiving' && !isWalterStep && (
                <BFIAppShell role={shellRole} currentStepId={currentStepId}>
                    {recStep === 0 && <CoNYOrderMonitorScene onDispatch={() => navigateRec(1)} />}
                    {recStep === 1 && <FedExGapScene onSend={() => navigateRec(2)} />}
                    {recStep === 2 && (
                        <WIGDocParserScene
                            onConfirm={() => navigateRec(3)}
                            onRoleChange={r => setActiveRole(r as BFIRole)}
                        />
                    )}
                    {recStep === 3 && <ReceiptAlertScene onAcknowledge={() => navigateRec(4)} />}
                    {recStep === 4 && <WorkOrderScene onApprove={() => navigateRec(5)} />}
                    {recStep === 6 && <StorageMonitorScene onConfirm={() => navigateRec(7)} />}
                    {recStep === 7 && <ReceivingCloseScene />}
                </BFIAppShell>
            )}
        </MBIPageShell>
    )
}

// ── BFIAppShell ───────────────────────────────────────────────────────────────

function BFIAppShell({
    role,
    currentStepId,
    children,
}: {
    role: BFIShellRole
    currentStepId: string
    children: React.ReactNode
}) {
    const cfg = SHELL_CONFIG[role]

    return (
        <div
            key={role}
            className="flex flex-col border border-border rounded-2xl overflow-hidden bg-background shadow-sm animate-in fade-in duration-300"
        >
            {/* App header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black tracking-widest text-foreground">BFI</span>
                    <span className="text-border text-sm leading-none">│</span>
                    <span className="text-xs font-semibold text-foreground">{cfg.appTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-primary-foreground leading-none">{cfg.initials}</span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{cfg.name}</span>
                </div>
            </div>

            {/* App nav tabs */}
            <div className="flex items-center gap-0.5 px-3 pt-1 border-b border-border bg-card">
                {cfg.tabs.map(tab => {
                    const isActive = tab.activeForSteps?.includes(currentStepId) ?? false
                    return (
                        <div
                            key={tab.label}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground'
                            }`}
                        >
                            {tab.label}
                            {tab.badge && (
                                <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shrink-0">
                                    {tab.badge}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 space-y-4">
                {children}
            </div>
        </div>
    )
}

// ── TabButton ─────────────────────────────────────────────────────────────────

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
