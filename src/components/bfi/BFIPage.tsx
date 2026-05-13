/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for BFI demo — 2 flows, 9 steps, stepId-based routing.
 *
 *   FLOW 1 — Product Receiving (r1.2–r1.6)  · r1.6 = Walter (mobile dark bg)
 *   FLOW 2 — Agency Fee (a1.1–a1.4)
 *
 * BFIDashboardPage: standalone export for the persistent Dashboard navbar tab.
 */

import { Building2, Package, LayoutDashboard } from 'lucide-react'
import MBIPageShell from '../mbi/MBIPageShell'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'
import { useDemo } from '../../context/DemoContext'

import BFIDashboardScene from './BFIDashboardScene'
import WIGBingoCheckScene from './WIGBingoCheckScene'
import AIAnalysisScene from './AIAnalysisScene'
import AlertClaimScene from './AlertClaimScene'
import CoreEntryScene from './CoreEntryScene'
import WalterNotifScene from './WalterNotifScene'
import CoNYMorningQueue from './CoNYMorningQueue'
import QuoteIntakePricingScene from './QuoteIntakePricingScene'
import CPRScene from './CPRScene'
import AgencyFeeVerifyScene from './AgencyFeeVerifyScene'
import DesignerResponseScene from './DesignerResponseScene'
import POLaborScene from './POLaborScene'

const STEP_TITLES: Record<string, string> = {
    'r1.2': 'Product Receiving',
    'r1.3': 'Product Receiving',
    'r1.4': 'Product Receiving',
    'r1.5': 'Product Receiving',
    'a1.1': 'Agency Fee',
    'a1.2': 'Agency Fee',
    'a1.2b': 'Agency Fee',
    'a1.2c': 'Agency Fee',
    'a1.2d': 'Product Receiving',
    'a1.3': 'Agency Fee',
    'a1.4': 'Agency Fee',
}

export default function BFIPage() {
    const { currentStep, nextStep } = useDemo()
    const stepId = currentStep?.id ?? 'r1.2'

    // Walter (r1.6) — CoNY client PM on phone, breaks out of the MBIPageShell
    if (stepId === 'r1.6') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center py-6 animate-in fade-in duration-500">
                <MobileDeviceFrame size="lg" darkScreen>
                    <WalterNotifScene key="r1.6" onConfirm={nextStep} />
                </MobileDeviceFrame>
            </div>
        )
    }

    // Robert Chen (a1.2) — Miller Knoll designer email view, breaks out of the MBIPageShell
    if (stepId === 'a1.2') {
        return (
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center py-6 animate-in fade-in duration-500">
                <MobileDeviceFrame size="lg">
                    <DesignerResponseScene key="a1.2" onAcknowledge={nextStep} />
                </MobileDeviceFrame>
            </div>
        )
    }

    const isReceiving = stepId.startsWith('r')
    const isAgencyFee = stepId.startsWith('a')

    const icon = isReceiving
        ? <Package className="h-5 w-5" />
        : isAgencyFee
        ? <Building2 className="h-5 w-5" />
        : <LayoutDashboard className="h-5 w-5" />

    return (
        <MBIPageShell
            title={STEP_TITLES[stepId] ?? 'BFI Demo'}
            tenantLabel="BFI"
            productLabel="Strata for BFI"
            icon={icon}
        >
            <div key={stepId} className="space-y-4 animate-in fade-in duration-500">
                {stepId === 'r1.2' && <WIGBingoCheckScene onAnalyze={nextStep} />}
                {stepId === 'r1.3' && <AIAnalysisScene onComplete={nextStep} />}
                {stepId === 'r1.4' && <AlertClaimScene onProceed={nextStep} />}
                {stepId === 'r1.5' && <CoreEntryScene onConfirm={nextStep} />}
                {stepId === 'a1.1' && <CoNYMorningQueue onSelectOrder={nextStep} />}
                {stepId === 'a1.2b' && <QuoteIntakePricingScene onApply={nextStep} />}
                {stepId === 'a1.2c' && <POLaborScene />}
                {stepId === 'a1.2d' && (
                    <WIGBingoCheckScene
                        onAnalyze={nextStep}
                        notificationConfig={{
                            title: 'Purchase Order confirmed · NYC Dept. of Education',
                            desc: 'DOE-2847 · Q-2026-0089 · Delivery May 14–21 · 35 cartons · warehouse receiving',
                            cta: 'Review receiving documents →',
                        }}
                    />
                )}
                {stepId === 'a1.3' && <CPRScene onSend={nextStep} />}
                {stepId === 'a1.4' && <AgencyFeeVerifyScene />}
            </div>
        </MBIPageShell>
    )
}

/** Standalone dashboard page — rendered when user clicks the "Dashboard" navbar tab. */
export function BFIDashboardPage() {
    return (
        <MBIPageShell
            title="Operations Dashboard"
            tenantLabel="BFI"
            productLabel="Strata for BFI"
            icon={<LayoutDashboard className="h-5 w-5" />}
        >
            <BFIDashboardScene staticMode />
        </MBIPageShell>
    )
}
