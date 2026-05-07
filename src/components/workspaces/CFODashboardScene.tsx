/**
 * w2.4 — CFODashboardScene
 * CFO Mehmet (Company View) + CAO Tammy (Division View)
 * Wow moment #3: first time seeing company-wide spend on one dashboard
 * Features: multi-dimensional filters, KPIs, category bars, drill-down, April/May comparison, SLA aging, export
 */

import { useState } from 'react'
import { Download, AlertTriangle, ChevronRight, ChevronDown, Bell } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type DashTab = 'company' | 'division'
type Period = 'may' | 'april'

const KPIs = [
    { label: 'This Month',        value: '$48K',  sub: 'May 2026' },
    { label: 'Pending Approvals', value: '23',    sub: 'expenses' },
    { label: 'On-time SLA',       value: '94%',   sub: '↑ from 89%' },
]

const CATEGORIES_MAY   = [{ name: 'Fuel',   amount: 12000 }, { name: 'Meals',  amount: 8500 }, { name: 'Travel', amount: 6000 }, { name: 'Office', amount: 4000 }]
const CATEGORIES_APRIL = [{ name: 'Fuel',   amount: 9000  }, { name: 'Meals',  amount: 7800 }, { name: 'Travel', amount: 5500 }, { name: 'Office', amount: 4200 }]

const FUEL_DRILL = [
    { name: 'John Smith',    amount: '$95.00',  receipt: true },
    { name: 'Maria G.',      amount: '$140.00', receipt: true },
    { name: 'Carlos Ruiz',  amount: '$180.00', receipt: true },
]

const SLA_ALERTS = [
    { name: 'Carlos Ruiz',  amount: '$210',  manager: 'Mike Torres',   days: 4 },
    { name: 'Ana Kim',      amount: '$312',  manager: 'Sarah Johnson', days: 3 },
]

const DIVISION_DEPTS = [
    { name: 'Operations',  amount: 28000 },
    { name: 'Procurement', amount: 14000 },
    { name: 'Other',       amount:  6000 },
]

const LOCATIONS = [
    { city: 'Tampa',           amount: 22000 },
    { city: 'Orlando',         amount: 12000 },
    { city: 'Miami',           amount:  8000 },
    { city: 'Other locations', amount:  6000 },
]

const MAX_AMOUNT = 48000

export default function CFODashboardScene() {
    const [activeTab, setActiveTab] = useState<DashTab>('company')
    const [period, setPeriod]       = useState<Period>('may')
    const [drillCategory, setDrillCategory] = useState<string | null>(null)
    const [reminderSent, setReminderSent]   = useState(false)

    const categories = period === 'may' ? CATEGORIES_MAY : CATEGORIES_APRIL

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'company' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    🏢 Company View — Mehmet
                </button>
                <button
                    onClick={() => setActiveTab('division')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'division' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    📊 Ops & Procurement — Tammy
                </button>
            </div>

            {activeTab === 'company' ? (
                <CompanyView
                    period={period}
                    setPeriod={setPeriod}
                    categories={categories}
                    drillCategory={drillCategory}
                    setDrillCategory={setDrillCategory}
                    reminderSent={reminderSent}
                    setReminderSent={setReminderSent}
                />
            ) : (
                <DivisionView />
            )}
        </div>
    )
}

function CompanyView({ period, setPeriod, categories, drillCategory, setDrillCategory, reminderSent, setReminderSent }: {
    period: Period
    setPeriod: (p: Period) => void
    categories: typeof CATEGORIES_MAY
    drillCategory: string | null
    setDrillCategory: (c: string | null) => void
    reminderSent: boolean
    setReminderSent: (v: boolean) => void
}) {
    const maxCat = Math.max(...categories.map(c => c.amount))

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-1.5 flex-wrap">
                {['May 2026', 'All Departments', 'All Locations', 'All Categories'].map(f => (
                    <button key={f} className="flex items-center gap-1 text-xs bg-card border border-border text-foreground px-2.5 py-1 rounded-full hover:border-primary transition-colors">
                        {f} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                ))}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
                {KPIs.map(kpi => (
                    <div key={kpi.label} className="bg-card border border-border rounded-xl px-3 py-3 text-center">
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Period toggle + bars */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Spend by Category</p>
                    <div className="flex gap-1 bg-muted/40 rounded-lg p-0.5">
                        {(['april', 'may'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`text-[10px] px-2 py-1 rounded font-medium capitalize transition-all ${period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
                                {p === 'april' ? 'April' : 'May'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-3 space-y-2.5">
                    {categories.map(cat => {
                        const pctMay   = CATEGORIES_MAY.find(c => c.name === cat.name)?.amount ?? 0
                        const pctApril = CATEGORIES_APRIL.find(c => c.name === cat.name)?.amount ?? 0
                        const delta    = pctMay > 0 ? Math.round(((pctMay - pctApril) / pctApril) * 100) : 0
                        const isDrilled = drillCategory === cat.name

                        return (
                            <div key={cat.name}>
                                <button
                                    onClick={() => setDrillCategory(isDrilled ? null : cat.name)}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-foreground w-16 shrink-0">{cat.name}</span>
                                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full bg-primary/70 rounded-full transition-all duration-500"
                                                style={{ width: `${(cat.amount / maxCat) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">${(cat.amount / 1000).toFixed(1)}K</span>
                                        {period === 'may' && cat.name === 'Fuel' && (
                                            <span className="text-[10px] font-bold text-warning">+{delta}%</span>
                                        )}
                                    </div>
                                </button>

                                {/* Drill-down */}
                                {isDrilled && (
                                    <div className="ml-[72px] space-y-1.5 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {FUEL_DRILL.map(item => (
                                            <div key={item.name} className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                                                <span className="text-xs text-foreground">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-foreground">{item.amount}</span>
                                                    {item.receipt && <span className="text-[10px] text-success">receipt ✓</span>}
                                                </div>
                                            </div>
                                        ))}
                                        {cat.name === 'Fuel' && period === 'may' && (
                                            <p className="text-[10px] text-muted-foreground px-1">Fuel +33% MoM — 3 new field staff onboarded in May</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SLA aging alerts */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        <p className="text-xs font-bold text-foreground">⚠️ {SLA_ALERTS.length} reports pending &gt; 3 days</p>
                    </div>
                </div>
                <div className="divide-y divide-border">
                    {SLA_ALERTS.map(a => (
                        <div key={a.name} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <p className="text-xs font-semibold text-foreground">{a.name} · {a.amount}</p>
                                <p className="text-[10px] text-muted-foreground">Manager: {a.manager} · {a.days} days pending</p>
                            </div>
                            <span className="text-[10px] font-bold text-warning">{a.days}d ⚠️</span>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                    <button
                        onClick={() => setReminderSent(true)}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all ${reminderSent ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground hover:text-foreground border border-border'}`}
                    >
                        <Bell className="h-3 w-3" />
                        {reminderSent ? 'Reminders sent ✓' : 'Send reminder to managers'}
                    </button>
                </div>
            </div>

            {/* Export */}
            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-card border border-border text-foreground py-2.5 rounded-xl hover:border-primary transition-colors font-medium">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-card border border-border text-foreground py-2.5 rounded-xl hover:border-primary transition-colors font-medium">
                    <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                Before Strata: Mehmet opened each expense report one by one — no dashboard, no filters, no export
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

function DivisionView() {
    const [reminderSent, setReminderSent] = useState(false)
    const maxDept = Math.max(...DIVISION_DEPTS.map(d => d.amount))

    return (
        <div className="space-y-4">
            {/* Hierarchy badge */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['Employee', 'Manager', 'Dept Head (Tammy)', 'CFO/AP'].map((level, i, arr) => (
                        <div key={level} className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-muted text-foreground px-2 py-1 rounded-full">{level}</span>
                            {i < arr.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Your division: Ops & Procurement · 38 direct + indirect reports</p>
            </div>

            {/* Division spend bars */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Division Spend — May 2026</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                    {DIVISION_DEPTS.map(dept => (
                        <div key={dept.name} className="flex items-center gap-2">
                            <span className="text-xs text-foreground w-24 shrink-0">{dept.name}</span>
                            <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(dept.amount / maxDept) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">${(dept.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cross-location */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">By Location</p>
                </div>
                <div className="divide-y divide-border">
                    {LOCATIONS.map(loc => (
                        <div key={loc.city} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs text-foreground">{loc.city}</span>
                            <span className="text-xs font-bold text-foreground">${(loc.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SLA for Tammy's division */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">⚠️ Overdue in your division</p>
                </div>
                <div className="divide-y divide-border">
                    <div className="flex items-center justify-between px-4 py-2.5">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Mike Torres (manager)</p>
                            <p className="text-[10px] text-muted-foreground">1 expense · 4 days pending</p>
                        </div>
                        <span className="text-[10px] font-bold text-warning">4d ⚠️</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Ana Reyes (manager)</p>
                            <p className="text-[10px] text-muted-foreground">1 expense · 3 days pending</p>
                        </div>
                        <span className="text-[10px] font-bold text-warning">3d ⚠️</span>
                    </div>
                </div>
                <div className="px-4 py-3 border-t border-border">
                    <button
                        onClick={() => setReminderSent(true)}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all ${reminderSent ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground hover:text-foreground border border-border'}`}
                    >
                        <Bell className="h-3 w-3" />
                        {reminderSent ? 'Reminders sent ✓' : 'Send reminder to both managers'}
                    </button>
                </div>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}
