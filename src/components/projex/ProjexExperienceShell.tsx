/**
 * COMPONENT: ProjexExperienceShell (Projex · F75 · F80.5)
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
 * F80.5 · Diego 2026-08-21 · Dealer tabs collapsed 7 → 4 per Figma D11 spec
 *          (yesterday's plan `elegant-weaving-steele.md` · file
 *          `MXoE4BJ0GpMn0TvChOhxWD` "Strata Dealer Experience") · el shell
 *          canonical del Dealer NO es el portal UI-Dealer viejo · es el
 *          shell de `quote-converter` = 4 tabs (OCR · Observability ·
 *          Feedback · Transactions). Los IDs viejos (dashboard · catalogs
 *          · inventory · mac · pd-to-sif · pricing) se mantienen como
 *          type-only alias para no romper `activeTabFor()` de scenes que
 *          los referencien · pero visualmente ya no aparecen.
 *
 * DS TOKENS: bg-card · bg-primary/15 (active tab) · border-border ·
 *            text-foreground · text-muted-foreground · text-ai · bg-ai/10
 *
 * SOURCE OF TRUTH: SOT §12 · HTML §04 Capability Paths · Figma D11 (2026-08-20)
 * REUSE FROM: mbi/MBIPageShell.tsx (shape reference) ·
 *             quote-converter/src/components/Navbar.tsx (Dealer 4-tab shape)
 */

import type { ReactNode } from 'react'
import {
    ScanText, TableProperties, GitCompare, MessageCircle,
    BarChart3, MessageSquarePlus,
    Building2, Building,
} from 'lucide-react'

export type ProjexExperience = 'expert-hub' | 'dealer'

// Expert Hub tabs · mirror expert-hub/src/components/Navbar.tsx
export type ExpertHubTab = 'ocr' | 'transactions' | 'comparisons' | 'feedback'

// F80.5 · Dealer tabs canonicalizadas al shell de quote-converter (D11).
// Los IDs viejos (`dashboard` · `catalogs` · `inventory` · `mac` · `pd-to-sif`
// · `pricing`) siguen en el union para no romper `activeTabFor()` de scenes
// pre-F80.5 · pero solo los 4 canonical se rendean visualmente.
export type DealerTab =
    | 'ocr'
    | 'observability'
    | 'feedback'
    | 'transactions'
    // Legacy · type-only compat · re-mapean a canonical en el render.
    | 'dashboard' | 'catalogs' | 'inventory' | 'mac' | 'pd-to-sif' | 'pricing'

export type ProjexTab = ExpertHubTab | DealerTab

const EXPERT_HUB_TABS: { id: ExpertHubTab; label: string; icon: React.ElementType }[] = [
    { id: 'ocr',          label: 'OCR',          icon: ScanText },
    { id: 'transactions', label: 'Transactions', icon: TableProperties },
    { id: 'comparisons',  label: 'Comparisons',  icon: GitCompare },
    { id: 'feedback',     label: 'Feedback',     icon: MessageCircle },
]

// F80.5 · new Dealer shell = 4 tabs per Figma D11 (quote-converter shape)
const DEALER_TABS: { id: DealerTab; label: string; icon: React.ElementType }[] = [
    { id: 'ocr',           label: 'OCR',           icon: ScanText },
    { id: 'observability', label: 'Observability', icon: BarChart3 },
    { id: 'feedback',      label: 'Feedback',      icon: MessageSquarePlus },
    { id: 'transactions',  label: 'Transactions',  icon: TableProperties },
]

// Legacy Dealer IDs → canonical mapping · para scenes que aún pasan el
// nombre viejo desde `activeTabFor()`. Preserva "algún tab" activo aunque
// el ID no matchee ya un tab visible.
const DEALER_LEGACY_TAB_ALIAS: Partial<Record<DealerTab, DealerTab>> = {
    dashboard:   'transactions',   // billing dashboard → transactions
    catalogs:    'ocr',            // catalog docs → OCR
    inventory:   'transactions',
    mac:         'ocr',            // MAC requests · vendor onboarding OCR
    'pd-to-sif': 'ocr',
    pricing:     'transactions',
}

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

    // F80.5 · si el activeTab viene con un ID legacy de Dealer · re-mapear
    // a canonical antes de comparar contra la nueva lista de 4 tabs.
    const resolvedActiveTab: ProjexTab =
        experience === 'dealer' && activeTab in DEALER_LEGACY_TAB_ALIAS
            ? (DEALER_LEGACY_TAB_ALIAS[activeTab as DealerTab] ?? activeTab)
            : activeTab

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
                            const active = tab.id === resolvedActiveTab
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
