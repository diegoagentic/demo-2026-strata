/**
 * AcmeDealerNavbar · demo topbar mirroring the production Expert Hub +
 * quote-converter Navbars, grafted for the Acme Dealer demo context.
 *
 * SOURCES:
 *   expert-hub/src/components/Navbar.tsx         · pill nav shell + tabs + user menu
 *   quote-converter/src/components/Navbar.tsx    · MessageSquarePlus feedback dropdown
 * COMMIT: HEAD (2026-08-21) · lifted F85.1
 *
 * Do not edit in place · re-sync from source when prod evolves.
 * Adaptations preserved with inline F85.N comments · summary:
 *
 *   F85.1 · Diego 2026-08-21 · matt danyliw ceo review requires
 *   Feedback + PDF-to-SIF as standard modules across BOTH Acme Dealer
 *   experiences (Expert Hub + Dealer). Acme Dealer demo topbar was the
 *   shared Navbar.tsx (wrong-icon Feedback tab · no PD-to-SIF ·
 *   generic right cluster). This component mirrors expert-hub's pill
 *   navbar chrome, grafts quote-converter's MessageSquarePlus
 *   feedback dropdown into the right cluster, and adds a PD to SIF
 *   center-nav pill that routes to the already-lifted PDtoSIF
 *   wizard. Tenant chip is single-value ("PROJEX") — no multi-tenant
 *   dropdown needed. Unread badge starts at zero (no useUserFeedbacks
 *   lift for the demo).
 */

import { Fragment, useState, useRef, useEffect } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import {
    ScanEye, Activity, Receipt, GitCompare, FileText, MessageSquarePlus,
    ListChecks, Moon, Sun, LogOut, ChevronDown, Check,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDemoProfile } from '../../context/useDemoProfile'
// F85.1.fix1 · Diego 2026-08-21 · restore the real Strata logo (same PNG
// twins the shared Navbar uses) · earlier version rendered a placeholder
// "S" square + "STRATA" text that lost brand parity.
import logoLightBrand from '../../assets/logo-light-brand.png'
import logoDarkBrand from '../../assets/logo-dark-brand.png'
// F85.2 · Diego 2026-08-21 · restore Action Center mount (regression from
// F85.1 · branching off the shared Navbar dropped the AC · p2.1 W-9 scene
// broke because it depends on the `acme-dealer:w9-open` event the AC dispatches).
// Also read isSidebarCollapsed from useDemo to offset the pill center when
// the tour sidebar (w-80) is open · avoids the navbar clipping under it.
import ActionCenter from '../../components/notifications/ActionCenter'
import { useDemo } from '../../context/DemoContext'

type AcmeDealerExperience = 'expert-hub' | 'dealer'

interface AcmeDealerNavbarProps {
    experience: AcmeDealerExperience
    activeTab?: string
    onNavigate: (page: string) => void
    onOpenFeedback: () => void
    onLogout: () => void
    tenantLabel?: string
}

interface Tab {
    name: string
    label: string
    page: string
    icon: any
}

const EXPERT_HUB_TABS: Tab[] = [
    { name: 'OCR',          label: 'OCR Tracking', page: 'acme-dealer-ocr',           icon: ScanEye  },
    { name: 'Transactions', label: 'Transactions', page: 'acme-dealer-transactions',  icon: Receipt  },
    { name: 'Comparisons',  label: 'Comparisons',  page: 'acme-dealer-comparisons',   icon: GitCompare },
    { name: 'PDtoSIF',      label: 'PD to SIF',    page: 'acme-dealer-pd-to-sif',     icon: FileText },
]

const DEALER_TABS: Tab[] = [
    { name: 'OCR',           label: 'OCR',           page: 'acme-dealer-ocr',           icon: ScanEye  },
    { name: 'Observability', label: 'Observability', page: 'acme-dealer-observability', icon: Activity },
    { name: 'Transactions',  label: 'Transactions',  page: 'acme-dealer-transactions',  icon: Receipt  },
    { name: 'PDtoSIF',       label: 'PD to SIF',     page: 'acme-dealer-pd-to-sif',     icon: FileText },
]

export default function AcmeDealerNavbar({
    experience,
    activeTab,
    onNavigate,
    onOpenFeedback,
    onLogout,
    tenantLabel = 'Acme Dealer Inc.',
}: AcmeDealerNavbarProps) {
    const { user } = useAuth()
    // F85.2 · pull isSidebarCollapsed + isDemoActive from DemoContext ·
    // together they determine whether the tour sidebar is actually
    // occupying the left 320px of the viewport (only when demo active AND
    // sidebar expanded) so we know when to apply the sidebar-offset layout.
    const { isSidebarCollapsed, isDemoActive } = useDemo()
    // F85.4 · Diego 2026-08-21 · restore the demo profile switcher that the
    // shared Navbar exposed via the app-name / company Popover. Mirroring
    // the same pattern lets account teams switch demos (Acme Dealer ↔ BFI ↔
    // Officeworks · etc.) without leaving the Acme Dealer chrome.
    const { activeProfile, profiles, switchProfile } = useDemoProfile()

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const stored = localStorage.getItem('strata-theme')
            if (stored === 'light' || stored === 'dark') return stored
        } catch {}
        return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light'
    })

    // Sync theme to <html> so the rest of the app follows. Same behavior
    // as strata-design-system's useTheme(); no context available inside
    // this demo repo, so we own it locally.
    useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
        try { localStorage.setItem('strata-theme', theme) } catch {}
    }, [theme])
    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

    const tabs = experience === 'expert-hub' ? EXPERT_HUB_TABS : DEALER_TABS

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Demo User'
    const userRole = (user?.user_metadata as { role?: string } | undefined)?.role
        ?? (experience === 'expert-hub' ? 'Expert' : 'Coordinator')
    const initial = displayName.charAt(0).toUpperCase()

    // Unread badge · starts at zero for the demo (no useUserFeedbacks lift).
    const unreadCount = 0

    // Close feedback menu on outside click.
    const feedbackRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (feedbackRef.current && !feedbackRef.current.contains(e.target as Node)) {
                setIsFeedbackMenuOpen(false)
            }
        }
        if (isFeedbackMenuOpen) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isFeedbackMenuOpen])

    // F85.2 · Diego 2026-08-21 · two layout modes for the pill.
    //  · Demo INACTIVE or sidebar COLLAPSED · centered on the viewport with
    //    the original width shape (`min-w-[60vw]` / `lg:w-[80vw]`) so the
    //    pill reads as centered chrome the whole app uses.
    //  · Demo ACTIVE + sidebar EXPANDED · anchor left of the sidebar edge
    //    (336px = 320px sidebar + 16px gutter) and right of the viewport
    //    (24px gutter) so the pill naturally fills the remaining space with
    //    breathing room on both sides · no manual centering / min-widths
    //    that would push it into either edge.
    const sidebarOpen = isDemoActive && !isSidebarCollapsed
    const positionClasses = sidebarOpen
        ? 'left-4 right-4 md:left-[336px] md:right-6'
        : 'left-1/2 -translate-x-1/2 min-w-[60vw] max-w-fit lg:min-w-0 lg:max-w-7xl lg:w-[80vw]'

    return (
        <div className={`fixed top-6 z-50 transition-all duration-300 ${positionClasses}`}>
            <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg">

                {/* Left · Strata brand logo (real PNG twins) + demo-profile switcher chip */}
                <div className="flex items-center gap-1">
                    <div className="px-2 shrink-0">
                        <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                        <img src={logoDarkBrand} alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
                    </div>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    {/* F85.4 · Demo profile Popover · same shape as shared Navbar's
                        app-name/company button · click opens a Switch Demo panel
                        listing every profile (Acme Dealer, BFI, Officeworks, etc.). */}
                    <Popover className="relative hidden sm:block">
                        <PopoverButton className="flex flex-col items-start text-left px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer outline-none group">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
                                {experience === 'expert-hub' ? 'Expert Hub' : 'Dealer Experience'}
                            </span>
                            <span className="text-sm font-bold text-foreground leading-tight mt-0.5 flex items-center gap-1">
                                {tenantLabel}
                                <ChevronDown className="w-3 h-3 text-muted-foreground group-data-[open]:rotate-180 transition-transform" aria-hidden="true" />
                            </span>
                        </PopoverButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <PopoverPanel className="absolute left-0 top-full mt-2 w-64 py-2 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl z-[200] max-h-[70vh] flex flex-col">
                                <div className="px-3 py-2 border-b border-border mb-1 shrink-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Switch Demo</p>
                                </div>
                                <div className="overflow-y-auto flex-1 min-h-0">
                                    {profiles.map(profile => (
                                        <PopoverButton
                                            as="button"
                                            key={profile.id}
                                            onClick={() => switchProfile(profile.id)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                                        >
                                            <span className="text-lg shrink-0">{profile.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{profile.description}</p>
                                            </div>
                                            {activeProfile.id === profile.id && (
                                                <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                                            )}
                                        </PopoverButton>
                                    ))}
                                </div>
                            </PopoverPanel>
                        </Transition>
                    </Popover>
                </div>

                {/* Center · nav tabs with expanding label on hover/active (expert-hub pattern) */}
                <div className="flex items-center gap-1 mx-auto">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.name || activeTab === tab.page
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.name}
                                onClick={() => onNavigate(tab.page)}
                                className={`relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:shadow-sm'
                                }`}
                                aria-label={tab.label}
                                aria-pressed={isActive}
                            >
                                <span className="relative z-10"><Icon className="w-5 h-5" /></span>
                                <span className={`ml-2 text-sm font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${
                                    isActive
                                        ? 'max-w-xs opacity-100'
                                        : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                                }`}>
                                    {tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Right · Action Center · Feedback dropdown · Theme · User */}
                <div className="flex items-center gap-1 shrink-0">

                    {/* F85.2 · Action Center · restored after F85.1 regression.
                        Self-contained popover · reads currentStep from
                        DemoContext · fires acme-dealer:* events on CTA click. */}
                    <ActionCenter />

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* Feedback dropdown · verbatim shape from quote-converter Navbar */}
                    <div className="relative" ref={feedbackRef}>
                        <button
                            onClick={() => setIsFeedbackMenuOpen(o => !o)}
                            className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            title="Feedback"
                            aria-label="Feedback menu"
                            aria-haspopup="menu"
                            aria-expanded={isFeedbackMenuOpen}
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span
                                    className={`absolute -top-0.5 -right-0.5 inline-flex h-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold leading-none text-destructive-foreground ${
                                        unreadCount < 10 ? 'w-4' : 'px-1 min-w-[1.25rem]'
                                    }`}
                                    aria-label={`${unreadCount} unread replies`}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isFeedbackMenuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 p-1"
                            >
                                <button
                                    role="menuitem"
                                    onClick={() => { setIsFeedbackMenuOpen(false); onOpenFeedback() }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    <MessageSquarePlus className="h-4 w-4" />
                                    Send feedback
                                </button>
                                <button
                                    role="menuitem"
                                    onClick={() => { setIsFeedbackMenuOpen(false); onNavigate('acme-dealer-feedback-status') }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    <ListChecks className="h-4 w-4" />
                                    My feedback status
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    {/* User menu · simplified · Sign out only (Change Password dropped for demo) */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white text-xs font-bold">
                                {initial}
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">{displayName}</div>
                                <div className="text-[10px] text-muted-foreground leading-none">{userRole}</div>
                            </div>
                            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                        </button>

                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 p-1">
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <div className="text-sm font-medium text-foreground">{displayName}</div>
                                        <div className="text-xs text-muted-foreground">{user?.email || 'demo@strata.com'}</div>
                                    </div>
                                    <button
                                        onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
