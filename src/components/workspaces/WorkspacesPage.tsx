/**
 * COMPONENT: WorkspacesPage
 * PURPOSE: Container for both Workscapes, Inc. demo flows.
 *
 *   Tab 1 — Expense Submission & Approval (workspaces-submit / workspaces-approval)
 *     4-step flow: Submit+OCR · Approval Queue · Approve with Receipt · Expense Status
 *
 *   Tab 2 — AP Processing & Reporting (workspaces-ap / workspaces-reporting)
 *     4-step flow: AP Queue · GL+CORE Sync · Admin Self-Service · CFO Dashboard
 *
 * ROLE SYSTEM:
 *   w1.1, w1.4 → employee (field staff) — full-screen mobile experience
 *   w1.2, w1.3 → manager (Tammy / Operations Manager) — desktop app
 *   w2.1, w2.2, w2.3 → ap (Letza / AP Coordinator) — desktop app
 *   w2.4 → cfo (Mehmet / CFO) — desktop dashboard
 *
 * INTERACTION PRINCIPLE:
 *   No "Next" buttons. Every scene has one semantic action that advances the flow.
 *
 * LAYOUT PRINCIPLE:
 *   Mobile steps (w1.1, w1.4): bypass MBIPageShell entirely — dark bg fills the
 *   viewport below the navbar, phone is the only UI. No titles, no breadcrumbs.
 *   Desktop steps: MBIPageShell with title + tab switcher in preHeader.
 *
 * SOT: src/config/profiles/workspaces-data/workspaces-sot.md
 */

import { useEffect, useState, useCallback } from 'react'
import { Receipt, BarChart2, MousePointerClick } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import MBIPersonaBadge from '../mbi/MBIPersonaBadge'
import { WORKSPACES_STEP_BEHAVIOR } from '../../config/profiles/workspaces'
import ExpenseSubmitScene from './ExpenseSubmitScene'
import ApprovalQueueScene from './ApprovalQueueScene'
import ApproveWithReceiptScene from './ApproveWithReceiptScene'
import ExpenseStatusScene from './ExpenseStatusScene'
import APReviewQueueScene from './APReviewQueueScene'
import GLCoreSyncScene from './GLCoreSyncScene'
import AdminScene from './AdminScene'
import CFODashboardScene from './CFODashboardScene'
import { useDemo } from '../../context/DemoContext'

// ── Role system ───────────────────────────────────────────────────────────────

type WorkspacesRole = 'employee' | 'manager' | 'ap' | 'cfo'

const ROLE_CONFIG: Record<WorkspacesRole, { name: string; role: string; tone: 'ai' | 'neutral' | 'info' }> = {
    'employee': { name: 'John Smith — Field Staff', role: 'Expense Submission · Mobile', tone: 'neutral' },
    'manager':  { name: 'Operations Manager',       role: 'Expense Approval',            tone: 'ai'      },
    'ap':       { name: 'Letza — AP Coordinator',   role: 'GL Review · CORE · Admin',    tone: 'neutral' },
    'cfo':      { name: 'Mehmet — CFO',             role: 'Spend Dashboard · Reporting', tone: 'info'    },
}

// Step → role
const STEP_ROLE: Record<string, WorkspacesRole> = {
    'w1.1': 'employee', 'w1.2': 'manager', 'w1.3': 'manager', 'w1.4': 'employee',
    'w2.1': 'ap',       'w2.2': 'ap',      'w2.3': 'ap',      'w2.4': 'cfo',
}

// ── Tab + step index maps ─────────────────────────────────────────────────────

type WorkspacesTab = 'submission' | 'processing'

const STEP_TO_TAB: Record<string, WorkspacesTab> = {
    'w1.1': 'submission', 'w1.2': 'submission', 'w1.3': 'submission', 'w1.4': 'submission',
    'w2.1': 'processing', 'w2.2': 'processing', 'w2.3': 'processing', 'w2.4': 'processing',
}

const SUB_STEP_TO_IDX: Record<string, number> = { 'w1.1': 0, 'w1.2': 1, 'w1.3': 2, 'w1.4': 3 }
const SUB_IDX_TO_STEP: Record<number, string>  = { 0: 'w1.1', 1: 'w1.2', 2: 'w1.3', 3: 'w1.4' }
const PROC_STEP_TO_IDX: Record<string, number> = { 'w2.1': 0, 'w2.2': 1, 'w2.3': 2, 'w2.4': 3 }
const PROC_IDX_TO_STEP: Record<number, string>  = { 0: 'w2.1', 1: 'w2.2', 2: 'w2.3', 3: 'w2.4' }

// ─────────────────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
    const { currentStep, isDemoActive, steps: tourSteps, goToStep } = useDemo()
    const demoStepId = isDemoActive ? currentStep?.id : null

    const [activeTab, setActiveTab]   = useState<WorkspacesTab>('submission')
    const [subStep, setSubStep]       = useState(0)
    const [procStep, setProcStep]     = useState(0)
    const [activeRole, setActiveRole] = useState<WorkspacesRole>('employee')

    // Sync tab + step index + role when the demo tour navigates
    useEffect(() => {
        if (!demoStepId) return
        const tab = STEP_TO_TAB[demoStepId]
        if (!tab) return
        setActiveTab(tab)
        if (tab === 'submission' && demoStepId in SUB_STEP_TO_IDX) {
            setSubStep(SUB_STEP_TO_IDX[demoStepId])
        } else if (tab === 'processing' && demoStepId in PROC_STEP_TO_IDX) {
            setProcStep(PROC_STEP_TO_IDX[demoStepId])
        }
        setActiveRole(STEP_ROLE[demoStepId] ?? 'employee')
    }, [demoStepId])

    const navigateSub = useCallback((idx: number) => {
        setSubStep(idx)
        const targetId = SUB_IDX_TO_STEP[idx]
        setActiveRole(STEP_ROLE[targetId] ?? 'employee')
        if (!isDemoActive || !targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }, [isDemoActive, currentStep, tourSteps, goToStep])

    const navigateProc = useCallback((idx: number) => {
        setProcStep(idx)
        const targetId = PROC_IDX_TO_STEP[idx]
        setActiveRole(STEP_ROLE[targetId] ?? 'ap')
        if (!isDemoActive || !targetId || currentStep?.id === targetId) return
        const tourIdx = tourSteps.findIndex(s => s.id === targetId)
        if (tourIdx >= 0) goToStep(tourIdx)
    }, [isDemoActive, currentStep, tourSteps, goToStep])

    // ── Mobile steps (w1.1, w1.4) — no MBIPageShell, dark viewport fill ───────
    // The phone IS the entire experience. No titles, breadcrumbs, or tab chrome.

    if (activeTab === 'submission' && (subStep === 0 || subStep === 3)) {
        return (
            <div className="min-h-screen bg-zinc-950 dark:bg-zinc-900 flex flex-col items-center justify-center py-8 gap-6 animate-in fade-in duration-500">
                {subStep === 0 && <ExpenseSubmitScene onSubmit={() => navigateSub(1)} />}
                {subStep === 3 && <ExpenseStatusScene />}
            </div>
        )
    }

    // ── Desktop steps — MBIPageShell with tab switcher + persona badge ─────────

    const tabSwitcher = (
        <div className="flex gap-1 bg-muted/40 dark:bg-zinc-800/60 border border-border rounded-xl p-1 w-fit">
            <TabButton
                active={activeTab === 'submission'}
                onClick={() => setActiveTab('submission')}
                icon={<Receipt className="h-3.5 w-3.5" />}
                label="Expense Submission"
            />
            <TabButton
                active={activeTab === 'processing'}
                onClick={() => setActiveTab('processing')}
                icon={<BarChart2 className="h-3.5 w-3.5" />}
                label="AP & Reporting"
            />
        </div>
    )

    const roleConfig = ROLE_CONFIG[activeRole]
    const personaBadge = (
        <MBIPersonaBadge key={activeRole} name={roleConfig.name} role={roleConfig.role} tone={roleConfig.tone} />
    )

    return (
        <MBIPageShell
            preHeader={tabSwitcher}
            title={activeTab === 'submission' ? 'Expense Submission & Approval' : 'AP Processing & Reporting'}
            subtitle={activeTab === 'submission'
                ? 'Mobile OCR · inline receipt approval · audit trail · resubmit loop'
                : 'GL auto-fill · CORE sync · admin self-service · spend dashboard'}
            icon={activeTab === 'submission'
                ? <Receipt className="h-5 w-5" />
                : <BarChart2 className="h-5 w-5" />}
            activeApp={activeTab === 'submission' ? 'workspaces-submit' : 'workspaces-ap'}
        >
            {/* Flow 1 — desktop steps only (w1.2, w1.3) */}
            {activeTab === 'submission' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <StepHint stepId={SUB_IDX_TO_STEP[subStep]} />
                    {subStep === 1 && <ApprovalQueueScene onReview={() => navigateSub(2)} />}
                    {subStep === 2 && <ApproveWithReceiptScene onApprove={() => navigateSub(3)} />}
                </div>
            )}

            {/* Flow 2 — all desktop (w2.1 → w2.4) */}
            {activeTab === 'processing' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {personaBadge}
                    <StepHint stepId={PROC_IDX_TO_STEP[procStep]} />
                    {procStep === 0 && <APReviewQueueScene onReview={() => navigateProc(1)} />}
                    {procStep === 1 && <GLCoreSyncScene onPost={() => navigateProc(2)} />}
                    {procStep === 2 && <AdminScene onSave={() => navigateProc(3)} />}
                    {procStep === 3 && <CFODashboardScene />}
                </div>
            )}
        </MBIPageShell>
    )
}

// ── Step hint — replaces the orange AI banner for desktop steps ───────────────

function StepHint({ stepId }: { stepId: string | undefined }) {
    if (!stepId) return null
    const behavior = WORKSPACES_STEP_BEHAVIOR[stepId]
    if (!behavior?.userAction) return null
    return (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>{behavior.userAction}</span>
        </div>
    )
}

// ── Tab button (desktop / light mode) ────────────────────────────────────────

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
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}
