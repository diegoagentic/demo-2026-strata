import { useState } from 'react'
import { Bell, ChevronDown, Inbox, Layers, Mail, Moon, Pencil, Sun, User } from 'lucide-react'
import { useTheme } from 'strata-design-system'
import { useTenant } from '../../TenantContext'

interface NavItem {
    key: string
    label: string
    Icon: typeof Inbox
}

interface Props {
    activeView: string
    onSelectView: (key: string) => void
    /** Pills primarias (CRM core · Pipeline, Forecast). */
    primaryItems: NavItem[]
    /** Pill secundaria opcional con separador previo (e.g. Design Intake). */
    secondaryItem?: NavItem
}

// CRM custom Header · copia exacta del standalone (Downloads/strata crm header
// L424-471) · Layers brand + STRATA AI eyebrow + tenant name + nav pills lime +
// separator + Design Intake pill + Notes/Mail/Bell+dot/Theme toggle + User dropdown.
// Solo usado en el CRM demo · reemplaza al Navbar global de demo-2026-strata.
export default function CRMHeader({ activeView, onSelectView, primaryItems, secondaryItem }: Props) {
    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const renderItem = (item: NavItem) => {
        const active = activeView === item.key
        const Icon = item.Icon
        return active ? (
            <button
                key={item.key}
                type="button"
                onClick={() => onSelectView(item.key)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-300 dark:bg-brand-500 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:brightness-105"
            >
                <Icon className="h-4 w-4" strokeWidth={2.1} />
                {item.label}
            </button>
        ) : (
            <button
                key={item.key}
                type="button"
                onClick={() => onSelectView(item.key)}
                aria-label={item.label}
                title={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
            </button>
        )
    }

    return (
        <header className="sticky top-4 z-30 mx-4 mt-4 flex items-center justify-between rounded-full border border-border bg-card px-4 py-2 shadow-sm">
            {/* Brand · Layers icon dark + STRATA AI eyebrow + tenant name + vertical divider */}
            <div className="flex items-center gap-3 pr-4 border-r border-border">
                <div className="h-9 w-9 rounded-lg bg-foreground flex items-center justify-center text-background">
                    <Layers className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="leading-tight">
                    <div className="text-[10px] uppercase tracking-[0.13em] font-extrabold text-muted-foreground">
                        STRATA AI
                    </div>
                    <div className="text-sm font-bold text-foreground">{currentTenant} Inc.</div>
                </div>
            </div>

            {/* Center nav · primary pills + separator + secondary (Design Intake) + Notes/Mail */}
            <nav className="flex items-center gap-1.5" aria-label="CRM sections">
                {primaryItems.map(renderItem)}
                {secondaryItem && (
                    <>
                        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                        {renderItem(secondaryItem)}
                    </>
                )}
                <button
                    type="button"
                    aria-label="Notes"
                    title="Notes"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Pencil className="h-4 w-4" strokeWidth={1.9} />
                </button>
                <button
                    type="button"
                    aria-label="Messages"
                    title="Messages"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Mail className="h-4 w-4" strokeWidth={1.9} />
                </button>
            </nav>

            {/* Right · Bell (dot), Theme toggle, User dropdown */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    aria-label="Notifications"
                    title="Notifications"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Bell className="h-4 w-4" strokeWidth={1.9} />
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-card" />
                </button>
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* User section · avatar gradient + tenant name + "Strata AI Demo" + ChevronDown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setUserMenuOpen(o => !o)}
                        className="ml-2 flex items-center gap-2.5 pl-3 border-l border-border transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 flex items-center justify-center text-white shadow-sm">
                            <User className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="leading-tight text-left">
                            <div className="text-sm font-bold text-foreground">{currentTenant}</div>
                            <div className="text-[11px] text-muted-foreground">Strata AI Demo</div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {userMenuOpen && (
                        <>
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setUserMenuOpen(false)}
                                className="fixed inset-0 z-40 cursor-default"
                            />
                            <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-border bg-card p-1 shadow-lg">
                                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
                                    Demo account
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                    Profile settings
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                    Switch tenant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                                >
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
