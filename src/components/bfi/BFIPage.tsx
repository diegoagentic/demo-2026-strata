/**
 * COMPONENT: BFIPage
 * PURPOSE: Container for BFI demo — 3 flows, 11 steps, stepId-based routing.
 *
 *   FLOW 0 — Dashboard (d1.1)
 *   FLOW 1 — Product Receiving (r1.1–r1.6)  · r1.6 = Walter (mobile dark bg)
 *   FLOW 2 — Agency Fee (a1.1–a1.4)
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

const STEP_TITLES: Record<string, string> = {
    'd1.1': 'Operations Dashboard',
    'r1.2': 'Product Receiving',
    'r1.3': 'Product Receiving',
    'r1.4': 'Product Receiving',
    'r1.5': 'Product Receiving',
    'a1.1': 'Agency Fee',
    'a1.2': 'Agency Fee',
    'a1.3': 'Agency Fee',
    'a1.4': 'Agency Fee',
}

export default function BFIPage() {
    const { currentStep, nextStep } = useDemo()
    const stepId = currentStep?.id ?? 'd1.1'

    // Walter (r1.6) — CoNY client PM on phone, breaks out of the MBIPageShell
    if (stepId === 'r1.6') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center py-8 animate-in fade-in duration-500">
                <MobileDeviceFrame>
                    <WalterNotifScene key="r1.6" onConfirm={nextStep} />
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
                {stepId === 'd1.1' && <BFIDashboardScene onNavigate={nextStep} />}
                {stepId === 'r1.2' && <WIGBingoCheckScene onAnalyze={nextStep} />}
                {stepId === 'r1.3' && <AIAnalysisScene onComplete={nextStep} />}
                {stepId === 'r1.4' && <AlertClaimScene onProceed={nextStep} />}
                {stepId === 'r1.5' && <CoreEntryScene onConfirm={nextStep} />}
                {stepId === 'a1.1' && <CoNYMorningQueue onSelectOrder={nextStep} />}
                {stepId === 'a1.2' && <QuoteIntakePricingScene onApply={nextStep} />}
                {stepId === 'a1.3' && <CPRScene onSend={nextStep} />}
                {stepId === 'a1.4' && <AgencyFeeVerifyScene />}
            </div>
        </MBIPageShell>
    )
}
