/**
 * w2.4 — CFODashboardScene
 * CFO Mehmet (Company View) + CAO Tammy (Division View)
 * Features: functional dept filter, KPI stagger reveal, export feedback,
 *   category drill-down, April/May comparison, SLA aging, role hierarchy
 */

import { useState, useEffect } from 'react'
import { Download, AlertTriangle, ChevronRight, ChevronDown, Bell } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

type DashTab  = 'company' | 'division'
type Period   = 'may' | 'april'
type DeptFilter = 'all' | 'operations' | 'sales' | 'procurement'

// Company-level data by department filter
const CATEGORIES_BY_DEPT: Record<DeptFilter, Record<Period, { name: string; amount: number }[]>> = {
    all: {
        may:   [{ name: 'Fuel', amount: 12000 }, { name: 'Meals',  amount: 8500  }, { name: 'Travel', amount: 6000 }, { name: 'Office', amount: 4000 }],
        april: [{ name: 'Fuel', amount: 9000  }, { name: 'Meals',  amount: 7800  }, { name: 'Travel', amount: 5500 }, { name: 'Office', amount: 4200 }],
    },
    operations: {
        may:   [{ name: 'Fuel', amount: 8000  }, { name: 'Travel', amount: 4000  }, { name: 'Meals',  amount: 3000 }, { name: 'Office', amount: 2000 }],
        april: [{ name: 'Fuel', amount: 6000  }, { name: 'Travel', amount: 3500  }, { name: 'Meals',  amount: 2800 }, { name: 'Office', amount: 2100 }],
    },
    sales: {
        may:   [{ name: 'Meals',  amount: 5000 }, { name: 'Travel', amount: 3000 }, { name: 'Fuel', amount: 2000 }, { name: 'Office', amount: 1500 }],
        april: [{ name: 'Meals',  amount: 4500 }, { name: 'Travel', amount: 2800 }, { name: 'Fuel', amount: 1800 }, { name: 'Office', amount: 1600 }],
    },
    procurement: {
        may:   [{ name: 'Travel', amount: 4000 }, { name: 'Office', amount: 2500 }, { name: 'Meals', amount: 1500 }, { name: 'Fuel', amount: 2000 }],
        april: [{ name: 'Travel', amount: 3500 }, { name: 'Office', amount: 2400 }, { name: 'Meals', amount: 1400 }, { name: 'Fuel', amount: 1700 }],
    },
}

const KPI_BY_DEPT: Record<DeptFilter, { month: string; pending: number; sla: string }> = {
    all:         { month: '$48K', pending: 23, sla: '94%' },
    operations:  { month: '$19K', pending: 10, sla: '96%' },
    sales:       { month: '$11.5K', pending: 7, sla: '93%' },
    procurement: { month: '$10K',   pending: 6, sla: '91%' },
}

const FUEL_DRILL = [
    { name: 'John Smith',   amount: '$95.00',  receipt: true  },
    { name: 'Maria G.',     amount: '$140.00', receipt: true  },
    { name: 'Carlos Ruiz',  amount: '$180.00', receipt: true  },
]

const SLA_ALERTS = [
    { name: 'Carlos Ruiz', amount: '$210', manager: 'Mike Torres',   days: 4 },
    { name: 'Ana Kim',     amount: '$312', manager: 'Sarah Johnson', days: 3 },
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

const DEPT_LABELS: Record<DeptFilter, string> = {
    all: 'All Departments', operations: 'Operations', sales: 'Sales', procurement: 'Procurement'
}

export default function CFODashboardScene() {
    const [activeTab, setActiveTab] = useState<DashTab>('company')
    const [period, setPeriod]       = useState<Period>('may')
    const [deptFilter, setDeptFilter] = useState<DeptFilter>('all')
    const [deptOpen, setDeptOpen]   = useState(false)
    const [drillCategory, setDrillCategory] = useState<string | null>(null)
    const [reminderSent, setReminderSent]   = useState(false)
    const [kpisVisible, setKpisVisible]     = useState(false)

    // Stagger KPI reveal on tab enter or filter change
    useEffect(() => {
        setKpisVisible(false)
        const t = setTimeout(() => setKpisVisible(true), 100)
        return () => clearTimeout(t)
    }, [activeTab, deptFilter])

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
                    deptFilter={deptFilter}
                    setDeptFilter={setDeptFilter}
                    deptOpen={deptOpen}
                    setDeptOpen={setDeptOpen}
                    drillCategory={drillCategory}
                    setDrillCategory={setDrillCategory}
                    reminderSent={reminderSent}
                    setReminderSent={setReminderSent}
                    kpisVisible={kpisVisible}
                />
            ) : (
                <DivisionView kpisVisible={kpisVisible} />
            )}
        </div>
    )
}

function CompanyView({ period, setPeriod, deptFilter, setDeptFilter, deptOpen, setDeptOpen, drillCategory, setDrillCategory, reminderSent, setReminderSent, kpisVisible }: {
    period: Period
    setPeriod: (p: Period) => void
    deptFilter: DeptFilter
    setDeptFilter: (d: DeptFilter) => void
    deptOpen: boolean
    setDeptOpen: (v: boolean) => void
    drillCategory: string | null
    setDrillCategory: (c: string | null) => void
    reminderSent: boolean
    setReminderSent: (v: boolean) => void
    kpisVisible: boolean
}) {
    const categories = CATEGORIES_BY_DEPT[deptFilter][period]
    const kpi        = KPI_BY_DEPT[deptFilter]
    const maxCat     = Math.max(...categories.map(c => c.amount))

    const KPIs = [
        { label: 'This Month',        value: kpi.month,           sub: 'May 2026' },
        { label: 'Pending Approvals', value: String(kpi.pending),  sub: 'expenses' },
        { label: 'On-time SLA',       value: kpi.sla,             sub: '↑ from 89%' },
    ]

    const [exportState, setExportState] = useState<Record<string, 'idle' | 'generating' | 'done'>>({
        csv: 'idle', pdf: 'idle',
    })

    const handleExport = (type: 'csv' | 'pdf') => {
        setExportState(prev => ({ ...prev, [type]: 'generating' }))
        setTimeout(() => {
            setExportState(prev => ({ ...prev, [type]: 'done' }))
            setTimeout(() => setExportState(prev => ({ ...prev, [type]: 'idle' })), 2000)
        }, 700)
    }

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-1.5 flex-wrap">
                {/* Functional dept filter */}
                <div className="relative">
                    <button
                        onClick={() => setDeptOpen(!deptOpen)}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${deptFilter !== 'all' ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {DEPT_LABELS[deptFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {deptOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(DEPT_LABELS) as DeptFilter[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => { setDeptFilter(d); setDeptOpen(false); setDrillCategory(null) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${deptFilter === d ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                                >
                                    {DEPT_LABELS[d]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Decorative filters */}
                {['May 2026', 'All Locations', 'All Categories'].map(f => (
                    <button key={f} className="flex items-center gap-1 text-xs bg-card border border-border text-foreground px-2.5 py-1 rounded-full hover:border-primary transition-colors">
                        {f} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                ))}
            </div>

            {/* KPIs with stagger reveal */}
            <div className="grid grid-cols-3 gap-2">
                {KPIs.map((kpi, i) => (
                    <div
                        key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Period toggle + spend bars */}
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

                <div className="px-4 py-3 space-y-2.5" key={`${deptFilter}-${period}`}>
                    {categories.map((cat, catIdx) => {
                        const catMay   = CATEGORIES_BY_DEPT[deptFilter].may.find(c => c.name === cat.name)?.amount ?? 0
                        const catApril = CATEGORIES_BY_DEPT[deptFilter].april.find(c => c.name === cat.name)?.amount ?? 0
                        const delta    = catApril > 0 ? Math.round(((catMay - catApril) / catApril) * 100) : 0
                        const isDrilled = drillCategory === cat.name

                        return (
                            <div key={cat.name}
                                className="animate-in fade-in duration-300"
                                style={{ animationDelay: `${catIdx * 60}ms` }}
                            >
                                <button onClick={() => setDrillCategory(isDrilled ? null : cat.name)} className="w-full text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-foreground w-16 shrink-0">{cat.name}</span>
                                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full bg-primary/70 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${(cat.amount / maxCat) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">${(cat.amount / 1000).toFixed(1)}K</span>
                                        {period === 'may' && delta !== 0 && (
                                            <span className={`text-[10px] font-bold w-10 text-right shrink-0 ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                                {delta > 0 ? '+' : ''}{delta}%
                                            </span>
                                        )}
                                    </div>
                                </button>

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
                                            <p className="text-[10px] text-muted-foreground px-1">Fuel +{delta}% MoM — 3 new field staff onboarded in May</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SLA aging */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <p className="text-xs font-bold text-foreground">{SLA_ALERTS.length} reports pending &gt; 3 days</p>
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

            {/* Export with feedback */}
            <div className="flex gap-2">
                <ExportButton type="csv" state={exportState.csv} onClick={() => handleExport('csv')} />
                <ExportButton type="pdf" state={exportState.pdf} onClick={() => handleExport('pdf')} />
            </div>

            <p className="text-xs text-center text-muted-foreground">
                Before Strata: Mehmet opened each expense report one by one — no dashboard, no filters, no export
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

function ExportButton({ type, state, onClick }: { type: 'csv' | 'pdf'; state: 'idle' | 'generating' | 'done'; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={state !== 'idle'}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-medium transition-all border ${
                state === 'done'
                    ? 'bg-success/10 border-success/20 text-success'
                    : 'bg-card border-border text-foreground hover:border-primary'
            }`}
        >
            <Download className="h-3.5 w-3.5" />
            {state === 'generating' ? 'Generating...' : state === 'done' ? `${type.toUpperCase()} downloaded ✓` : `Export ${type.toUpperCase()}`}
        </button>
    )
}

function DivisionView({ kpisVisible }: { kpisVisible: boolean }) {
    const [reminderSent, setReminderSent] = useState(false)
    const maxDept = Math.max(...DIVISION_DEPTS.map(d => d.amount))

    const divisionKPIs = [
        { label: 'Division Spend', value: '$48K',  sub: 'May 2026' },
        { label: 'Your Reports',   value: '38',    sub: 'direct + indirect' },
        { label: 'SLA On-time',    value: '92%',   sub: 'Ops & Procurement' },
    ]

    return (
        <div className="space-y-4">
            {/* KPIs with stagger */}
            <div className="grid grid-cols-3 gap-2">
                {divisionKPIs.map((kpi, i) => (
                    <div
                        key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

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
                                <div className="h-full bg-primary/70 rounded-full transition-all duration-500" style={{ width: `${(dept.amount / maxDept) * 100}%` }} />
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
