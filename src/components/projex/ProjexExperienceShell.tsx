/**
 * COMPONENT: ProjexExperienceShell (Projex · F75)
 * PURPOSE: Wraps every Projex scene with the platform chrome that matches the
 *          Capability Path's Experience assignment (per ProjeX_strata_solution
 *          _internal_3.html §04):
 *            F1 · AP intake              → Expert Hub
 *            F2 · Vendor onboarding      → Dealer Experience
 *            F3 · Progress billing       → Dealer Experience
 *            F4 · Order/PO dispatch      → Expert Hub
 *            F5 · Electronic ACK         → Expert Hub
 *
 *          Shell adds a top strip with the tenant chip + secondary nav tabs
 *          local to the platform (Expert Hub tabs vs Dealer tabs). Scenes
 *          keep their own inline title/description headers underneath.
 *
 *          Tabs are visual-only (non-interactive, aria-disabled) · click does
 *          NOT navigate · preserves the demo engine step-per-scene semantics.
 *
 * DS TOKENS: bg-card · bg-primary/15 (active tab) · border-border ·
 *            text-foreground · text-muted-foreground · text-ai · bg-ai/10
 *
 * SOURCE OF TRUTH: SOT §12 · HTML §04 Capability Paths
 * REUSE FROM: mbi/MBIPageShell.tsx (shape reference)
 */

import type { ReactNode } from 'react'
import {
    ScanText, TableProperties, GitCompare, MessageCircle,
    LayoutDashboard, BookOpen, Boxes, ClipboardList, ArrowLeftRight,
    FileText, Tag, Building2, Building,
} from 'lucide-react'

export type ProjexExperience = 'expert-hub' | 'dealer'

// Expert Hub tabs · mirror expert-hub/src/components/Navbar.tsx
export type ExpertHubTab = 'ocr' | 'transactions' | 'comparisons' | 'feedback'

// Dealer Experience tabs · mirror UI-Dealer/src/components/Navbar.tsx
export type DealerTab = 'dashboard' | 'catalogs' | 'inventory' | 'mac' | 'transactions' | 'pd-to-sif' | 'pricing'

export type ProjexTab = ExpertHubTab | DealerTab

const EXPERT_HUB_TABS: { id: ExpertHubTab; label: string; icon: React.ElementType }[] = [
    { id: 'ocr',          label: 'OCR',          icon: ScanText },
    { id: 'transactions', label: 'Transactions', icon: TableProperties },
    { id: 'comparisons',  label: 'Comparisons',  icon: GitCompare },
    { id: 'feedback',     label: 'Feedback',     icon: MessageCircle },
]

const DEALER_TABS: { id: DealerTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'catalogs',    label: 'Catalogs',    icon: BookOpen },
    { id: 'inventory',   label: 'Inventory',   icon: Boxes },
    { id: 'mac',         label: 'MAC',         icon: ClipboardList },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'pd-to-sif',   label: 'PD to SIF',   icon: FileText },
    { id: 'pricing',     label: 'Pricing',     icon: Tag },
]

interface ProjexExperienceShellProps {
    experience: ProjexExperience
    activeTab: ProjexTab
    /** Defaults to "Projex Inc." */
    tenantLabel?: string
    children: ReactNode
}

export default function ProjexExperienceShell({
    experience,
    activeTab,
    tenantLabel = 'Projex Inc.',
    children,
}: ProjexExperienceShellProps) {
    const tabs = experience === 'expert-hub' ? EXPERT_HUB_TABS : DEALER_TABS
    const productLabel = experience === 'expert-hub' ? 'Strata for Expert Hub' : 'Strata for Dealer Experience'
    const ProductIcon = experience === 'expert-hub' ? Building : Building2
    const productTone = experience === 'expert-hub' ? 'text-ai bg-ai-light' : 'text-info bg-info/10'

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top platform strip · tenant + product + secondary tabs */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-6 py-3 space-y-3">
                    {/* Tenant + product row */}
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                        <span className="text-muted-foreground font-semibold">{tenantLabel}</span>
                        <span className="text-muted-foreground/50" aria-hidden="true">·</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-semibold ${productTone}`}>
                            <ProductIcon className="h-3 w-3" aria-hidden="true" />
                            {productLabel}
                        </span>
                    </div>

                    {/* Secondary nav tabs · visual-only mimic of the platform */}
                    <nav
                        className="flex items-center gap-1 overflow-x-auto -mx-1"
                        aria-label={`${productLabel} navigation (preview only)`}
                    >
                        {tabs.map(tab => {
                            const active = tab.id === activeTab
                            const Icon = tab.icon
                            return (
                                <span
                                    key={tab.id}
                                    aria-disabled="true"
                                    aria-current={active ? 'page' : undefined}
                                    className={`
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
                                        whitespace-nowrap select-none cursor-default transition-colors
                                        ${active
                                            ? 'bg-primary/15 text-foreground'
                                            : 'text-muted-foreground'}
                                    `}
                                    title={active ? `${tab.label} · active` : `${tab.label} (preview only)`}
                                >
                                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                    {tab.label}
                                </span>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Scene body */}
            {children}
        </div>
    )
}
