/**
 * w2.4 — CFODashboardScene
 * State machine: inbox → notified → company → role-switch → division
 *
 *   'inbox'      — CFO sees expense cycles list; May 2026 is "Processing"
 *   'notified'   — Strata notification slides in; May 2026 updates to "Complete ✓"
 *   'company'    — Mehmet full dashboard: working filters (dept/location/category/period)
 *   'role-switch'— Mehmet → Tammy transition banner (~1s auto)
 *   'division'   — Tammy CAO view with SLA alert and reminder action
 *
 *   showPreview  — PDF report modal overlay on top of 'company'
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, AlertTriangle, ChevronRight, ChevronDown, Bell, Sparkles, ArrowRight, FileText, X, Loader2 } from 'lucide-react'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import { useDemo } from '../../context/DemoContext'

type ScenePhase    = 'inbox' | 'notified' | 'company' | 'role-switch' | 'division'
type Period        = 'may' | 'april'
type DeptFilter    = 'all' | 'operations' | 'sales' | 'procurement'
type LocationFilter = 'all' | 'tampa' | 'orlando' | 'miami'
type CategoryFilter = 'all' | 'Fuel' | 'Meals' | 'Travel' | 'Office'

// ── Data ─────────────────────────────────────────────────────────────────────

const EXPENSE_CYCLES = [
    { period: 'May 2026',      total: '$48K', count: 23, status: 'processing', postedBy: 'Letza Bombard', time: '2:48 PM' },
    { period: 'April 2026',    total: '$43K', count: 19, status: 'closed' },
    { period: 'March 2026',    total: '$41K', count: 21, status: 'closed' },
    { period: 'February 2026', total: '$38K', count: 18, status: 'closed' },
]

const CATEGORIES_BY_DEPT: Record<DeptFilter, Record<Period, { name: string; amount: number }[]>> = {
    all: {
        may:   [{ name: 'Fuel', amount: 12000 }, { name: 'Meals', amount: 8500  }, { name: 'Travel', amount: 6000 }, { name: 'Office', amount: 4000 }],
        april: [{ name: 'Fuel', amount: 9000  }, { name: 'Meals', amount: 7800  }, { name: 'Travel', amount: 5500 }, { name: 'Office', amount: 4200 }],
    },
    operations: {
        may:   [{ name: 'Fuel', amount: 8000  }, { name: 'Travel', amount: 4000 }, { name: 'Meals', amount: 3000  }, { name: 'Office', amount: 2000 }],
        april: [{ name: 'Fuel', amount: 6000  }, { name: 'Travel', amount: 3500 }, { name: 'Meals', amount: 2800  }, { name: 'Office', amount: 2100 }],
    },
    sales: {
        may:   [{ name: 'Meals', amount: 5000 }, { name: 'Travel', amount: 3000 }, { name: 'Fuel', amount: 2000  }, { name: 'Office', amount: 1500 }],
        april: [{ name: 'Meals', amount: 4500 }, { name: 'Travel', amount: 2800 }, { name: 'Fuel', amount: 1800  }, { name: 'Office', amount: 1600 }],
    },
    procurement: {
        may:   [{ name: 'Travel', amount: 4000 }, { name: 'Office', amount: 2500 }, { name: 'Meals', amount: 1500 }, { name: 'Fuel', amount: 2000 }],
        april: [{ name: 'Travel', amount: 3500 }, { name: 'Office', amount: 2400 }, { name: 'Meals', amount: 1400 }, { name: 'Fuel', amount: 1700 }],
    },
}

const KPI_BY_DEPT: Record<DeptFilter, { month: string; pending: number; sla: string }> = {
    all:         { month: '$48K',   pending: 23, sla: '94%' },
    operations:  { month: '$19K',   pending: 10, sla: '96%' },
    sales:       { month: '$11.5K', pending: 7,  sla: '93%' },
    procurement: { month: '$10K',   pending: 6,  sla: '91%' },
}

const FUEL_DRILL = [
    { name: 'John Smith',  amount: '$95.00',  receipt: true, purpose: 'Field ops — Tampa',     location: 'Tampa'   },
    { name: 'Maria G.',    amount: '$140.00', receipt: true, purpose: 'Client site — Orlando', location: 'Orlando' },
    { name: 'Carlos Ruiz', amount: '$180.00', receipt: true, purpose: 'Field ops — Miami',     location: 'Miami'   },
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

const LOCATIONS_LIST = [
    { city: 'Tampa',           amount: 22000 },
    { city: 'Orlando',         amount: 12000 },
    { city: 'Miami',           amount:  8000 },
    { city: 'Other locations', amount:  6000 },
]

const DEPT_LABELS: Record<DeptFilter, string> = {
    all: 'All Departments', operations: 'Operations', sales: 'Sales', procurement: 'Procurement'
}

const LOCATION_SCALE: Record<LocationFilter, number> = {
    all: 1, tampa: 0.46, orlando: 0.25, miami: 0.17
}
const LOCATION_LABELS: Record<LocationFilter, string> = {
    all: 'All Locations', tampa: 'Tampa', orlando: 'Orlando', miami: 'Miami'
}
const CATEGORY_FILTER_LABELS: Record<CategoryFilter, string> = {
    all: 'All Categories', Fuel: 'Fuel', Meals: 'Meals', Travel: 'Travel', Office: 'Office'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NotificationBadge() {
    return (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-ai" />
            <p className="text-[10px] text-ai">Sourced from CORE · Updated 2:48 PM · Auto-aggregated by Strata</p>
        </div>
    )
}

function RoleSwitchBanner() {
    const [progress, setProgress] = useState(false)
    useEffect(() => {
        const t = setTimeout(() => setProgress(true), 50)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="max-w-lg mx-auto animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-xl px-6 py-8 text-center space-y-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Switching view</p>
                <div className="flex items-center justify-center gap-4">
                    <div className="space-y-1.5">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground mx-auto">MB</div>
                        <p className="text-xs font-semibold text-foreground">Mehmet B.</p>
                        <p className="text-[10px] text-muted-foreground">CFO · Company-wide</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-ai shrink-0" />
                    <div className="space-y-1.5">
                        <div className="h-12 w-12 rounded-full bg-ai/10 border border-ai/20 flex items-center justify-center text-sm font-bold text-ai mx-auto">TA</div>
                        <p className="text-xs font-semibold text-foreground">Tammy A.</p>
                        <p className="text-[10px] text-muted-foreground">CAO · Ops &amp; Procurement</p>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground">Loading division view...</p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-ai rounded-full transition-all duration-[900ms] ease-out" style={{ width: progress ? '100%' : '0%' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function TammyNotificationBanner() {
    return (
        <div className="animate-in slide-in-from-top duration-400 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
                <p className="text-xs font-bold text-warning">Action required · Ops &amp; Procurement</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">2 managers pending &gt; 3 days · Review and send reminders below</p>
            </div>
        </div>
    )
}

function ReportPreviewModal({ onClose }: { onClose: () => void }) {
    const [exportState, setExportState] = useState<'idle' | 'generating' | 'done'>('idle')

    const handleExport = () => {
        setExportState('generating')
        setTimeout(() => {
            setExportState('done')
            setTimeout(() => setExportState('idle'), 2000)
        }, 800)
    }

    const MAY = CATEGORIES_BY_DEPT.all.may
    const APR = CATEGORIES_BY_DEPT.all.april
    const mayTotal = MAY.reduce((s, c) => s + c.amount, 0)
    const aprTotal = APR.reduce((s, c) => s + c.amount, 0)
    const totalDelta = Math.round(((mayTotal - aprTotal) / aprTotal) * 100)

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-10">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-bold text-foreground">Expense Report — May 2026</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            disabled={exportState !== 'idle'}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                                exportState === 'done'
                                    ? 'bg-success/10 border-success/20 text-success'
                                    : 'bg-card border-border text-foreground hover:border-primary'
                            }`}
                        >
                            <Download className="h-3 w-3" />
                            {exportState === 'generating' ? 'Generating...' : exportState === 'done' ? 'PDF downloaded ✓' : 'Export PDF'}
                        </button>
                        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Document body */}
                <div className="px-6 py-5 space-y-5 font-mono">
                    {/* Company header */}
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground uppercase tracking-widest">Strata Financial</p>
                        <p className="text-[10px] text-muted-foreground">Expense Report — May 2026</p>
                        <p className="text-[10px] text-muted-foreground">Generated May 8, 2026 · 2:48 PM</p>
                        <p className="text-[10px] text-muted-foreground">Posted to CORE by Letza Bombard · AP Coordinator</p>
                    </div>

                    <div className="border-t border-border" />

                    {/* Executive summary */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Executive Summary</p>
                        <div className="space-y-1">
                            {[
                                { label: 'Total Spend',          value: `$${(mayTotal / 1000).toFixed(0)},000` },
                                { label: 'vs. April 2026',       value: `+$${((mayTotal - aprTotal) / 1000).toFixed(0)},000 (+${totalDelta}%)`, highlight: 'warning' },
                                { label: 'Expenses submitted',   value: '23' },
                                { label: 'SLA On-time',          value: '94%' },
                                { label: 'Receipts verified',    value: '23 / 23 ✓', highlight: 'success' },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between">
                                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                                    <span className={`text-[11px] font-semibold ${row.highlight === 'warning' ? 'text-warning' : row.highlight === 'success' ? 'text-success' : 'text-foreground'}`}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Spend by category table */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Spend by Category</p>
                        <div className="space-y-0">
                            <div className="flex items-center justify-between pb-1 border-b border-border">
                                <span className="text-[10px] font-bold text-muted-foreground w-28">Category</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-16 text-right">May</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-16 text-right">Apr</span>
                                <span className="text-[10px] font-bold text-muted-foreground w-14 text-right">Δ</span>
                            </div>
                            {MAY.map(cat => {
                                const apr = APR.find(c => c.name === cat.name)?.amount ?? 0
                                const delta = apr > 0 ? Math.round(((cat.amount - apr) / apr) * 100) : 0
                                return (
                                    <div key={cat.name} className="flex items-center justify-between py-1 border-b border-border/40">
                                        <span className="text-[11px] text-foreground w-28">{cat.name}</span>
                                        <span className="text-[11px] font-semibold text-foreground w-16 text-right">${(cat.amount / 1000).toFixed(1)}K</span>
                                        <span className="text-[11px] text-muted-foreground w-16 text-right">${(apr / 1000).toFixed(1)}K</span>
                                        <span className={`text-[11px] font-bold w-14 text-right ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                            {delta > 0 ? '+' : ''}{delta}%
                                        </span>
                                    </div>
                                )
                            })}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-[11px] font-bold text-foreground w-28">TOTAL</span>
                                <span className="text-[11px] font-bold text-foreground w-16 text-right">${(mayTotal / 1000).toFixed(0)}K</span>
                                <span className="text-[11px] font-bold text-muted-foreground w-16 text-right">${(aprTotal / 1000).toFixed(0)}K</span>
                                <span className="text-[11px] font-bold text-warning w-14 text-right">+{totalDelta}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Top transactions */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Top Transactions — Fuel</p>
                        <div className="space-y-1">
                            {FUEL_DRILL.map(item => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] text-foreground">{item.name}</span>
                                        <span className="text-[10px] text-muted-foreground"> · {item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-foreground">{item.amount}</span>
                                        {item.receipt && <span className="text-[10px] text-success">receipt ✓</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* SLA status */}
                    <div className="bg-warning/5 border border-warning/20 rounded-lg px-3 py-2.5 flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-semibold text-warning">2 reports pending &gt; 3 days</p>
                            <p className="text-[10px] text-muted-foreground">Carlos Ruiz · Ana Kim — action required</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border pt-3">
                        <p className="text-[9px] text-muted-foreground text-center">
                            Strata Financial Platform · Auto-generated · Sourced from CORE · May 8, 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CFODashboardScene() {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [phase, setPhase]                   = useState<ScenePhase>('inbox')
    const [may2026Complete, setMay2026Complete] = useState(false)
    const [showPreview, setShowPreview]         = useState(false)
    const [barsVisible, setBarsVisible]         = useState(false)
    const [kpisVisible, setKpisVisible]         = useState(false)
    const [period, setPeriod]                   = useState<Period>('may')
    const [deptFilter, setDeptFilter]           = useState<DeptFilter>('all')
    const [deptOpen, setDeptOpen]               = useState(false)
    const [locationFilter, setLocationFilter]   = useState<LocationFilter>('all')
    const [locationOpen, setLocationOpen]       = useState(false)
    const [categoryFilter, setCategoryFilter]   = useState<CategoryFilter>('all')
    const [categoryOpen, setCategoryOpen]       = useState(false)
    const [drillCategory, setDrillCategory]     = useState<string | null>(null)
    const [reminderSent, setReminderSent]       = useState(false)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    // inbox → notified
    useEffect(() => {
        if (phase !== 'inbox') return
        pauseAware(() => {
            setMay2026Complete(true)
            setPhase('notified')
        }, 2500)
    }, [phase, pauseAware])

    // role-switch → division
    useEffect(() => {
        if (phase !== 'role-switch') return
        pauseAware(() => {
            setPhase('division')
            setKpisVisible(false)
            setTimeout(() => setKpisVisible(true), 100)
            setTimeout(() => setBarsVisible(true), 400)
        }, 1000)
    }, [phase, pauseAware])

    // Barras: activar 300ms después de entrar a 'company'
    useEffect(() => {
        if (phase !== 'company') { setBarsVisible(false); return }
        const t = setTimeout(() => setBarsVisible(true), 300)
        return () => clearTimeout(t)
    }, [phase])

    // Resetear barras al cambiar cualquier filtro
    useEffect(() => {
        if (phase !== 'company') return
        setBarsVisible(false)
        const t = setTimeout(() => setBarsVisible(true), 150)
        return () => clearTimeout(t)
    }, [deptFilter, locationFilter, categoryFilter, period])

    // KPI stagger
    useEffect(() => {
        if (phase !== 'company') return
        setKpisVisible(false)
        const t = setTimeout(() => setKpisVisible(true), 100)
        return () => clearTimeout(t)
    }, [deptFilter, phase])

    const goToCompany = () => {
        setPhase('company')
        setKpisVisible(false)
        setTimeout(() => setKpisVisible(true), 100)
    }

    // ── Fase: inbox / notified ──
    if (phase === 'inbox' || phase === 'notified') {
        return (
            <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-400">
                {/* Header context */}
                <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-foreground">CFO Dashboard · Mehmet B.</p>
                        <p className="text-[10px] text-muted-foreground">Executive Expense Overview</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">May 8, 2026</p>
                </div>

                {/* Strata notification — slide-in on 'notified' */}
                {phase === 'notified' && (
                    <button
                        onClick={goToCompany}
                        className="w-full animate-in slide-in-from-top duration-500 bg-ai/5 border border-ai/30 rounded-xl px-4 py-3 text-left flex items-start gap-2.5 hover:border-ai/60 transition-all group shadow-sm"
                    >
                        <div className="relative shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-xl bg-ai/10 flex items-center justify-center">
                                <Sparkles className="h-3.5 w-3.5 text-ai" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai border-2 border-card animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-ai uppercase tracking-wide mb-0.5">Strata · Expense cycle complete</p>
                            <p className="text-xs font-semibold text-foreground">May 2026 · $48K posted to CORE</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Letza Bombard · 2:48 PM · All receipts verified ✓</p>
                            <p className="text-xs font-semibold text-ai mt-1.5 group-hover:underline flex items-center gap-1">
                                View full report <ChevronRight className="h-3 w-3" />
                            </p>
                        </div>
                    </button>
                )}

                {/* Expense cycles list */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs font-bold text-foreground">Expense Cycles</p>
                        <p className="text-[10px] text-muted-foreground">All departments · Strata-aggregated</p>
                    </div>
                    <div className="divide-y divide-border">
                        {EXPENSE_CYCLES.map((cycle, i) => {
                            const isMay = i === 0
                            const isComplete = isMay ? may2026Complete : cycle.status === 'closed'
                            return (
                                <div
                                    key={cycle.period}
                                    className={`flex items-center justify-between px-4 py-3 transition-all ${isMay && may2026Complete ? 'bg-success/5' : ''}`}
                                >
                                    <div className="space-y-0.5">
                                        <p className={`text-xs font-semibold ${isMay ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {cycle.period}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {cycle.total} · {cycle.count} expenses
                                            {isMay && may2026Complete && cycle.postedBy && (
                                                <span className="text-success"> · {cycle.postedBy}</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-medium transition-all duration-300 ${
                                        isComplete
                                            ? 'text-success'
                                            : 'text-muted-foreground flex items-center gap-1'
                                    }`}>
                                        {isMay && !may2026Complete
                                            ? <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />Processing...</span>
                                            : isComplete ? 'Closed ✓' : 'Closed ✓'
                                        }
                                        {isMay && may2026Complete && (
                                            <span className="animate-in fade-in duration-300">Complete ✓</span>
                                        )}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Before Strata:</span> Mehmet opened each expense report one by one — no consolidated view, no auto-aggregation.
                    </p>
                </div>

                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
            </div>
        )
    }

    // ── Fase: role-switch ──
    if (phase === 'role-switch') {
        return <RoleSwitchBanner />
    }

    // ── Fases: company + division ──
    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* PDF preview modal */}
            {showPreview && <ReportPreviewModal onClose={() => setShowPreview(false)} />}

            {/* Tab switcher */}
            <div className="flex gap-1 bg-muted/40 border border-border rounded-xl p-1 w-fit">
                <button
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${phase === 'company' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground cursor-default'}`}
                >
                    🏢 Company — Mehmet
                </button>
                <button
                    onClick={() => { if (phase === 'company') setPhase('role-switch') }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${phase === 'division' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    📊 Ops &amp; Procurement — Tammy
                </button>
            </div>

            {phase === 'company' && <NotificationBadge />}

            {phase === 'company' ? (
                <CompanyView
                    period={period} setPeriod={setPeriod}
                    deptFilter={deptFilter} setDeptFilter={setDeptFilter}
                    deptOpen={deptOpen} setDeptOpen={setDeptOpen}
                    locationFilter={locationFilter} setLocationFilter={setLocationFilter}
                    locationOpen={locationOpen} setLocationOpen={setLocationOpen}
                    categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                    categoryOpen={categoryOpen} setCategoryOpen={setCategoryOpen}
                    drillCategory={drillCategory} setDrillCategory={setDrillCategory}
                    reminderSent={reminderSent} setReminderSent={setReminderSent}
                    kpisVisible={kpisVisible} barsVisible={barsVisible}
                    onPreviewClick={() => setShowPreview(true)}
                />
            ) : (
                <DivisionView kpisVisible={kpisVisible} barsVisible={barsVisible} />
            )}
        </div>
    )
}

// ── CompanyView ───────────────────────────────────────────────────────────────

function CompanyView({
    period, setPeriod, deptFilter, setDeptFilter, deptOpen, setDeptOpen,
    locationFilter, setLocationFilter, locationOpen, setLocationOpen,
    categoryFilter, setCategoryFilter, categoryOpen, setCategoryOpen,
    drillCategory, setDrillCategory, reminderSent, setReminderSent,
    kpisVisible, barsVisible, onPreviewClick,
}: {
    period: Period; setPeriod: (p: Period) => void
    deptFilter: DeptFilter; setDeptFilter: (d: DeptFilter) => void
    deptOpen: boolean; setDeptOpen: (v: boolean) => void
    locationFilter: LocationFilter; setLocationFilter: (l: LocationFilter) => void
    locationOpen: boolean; setLocationOpen: (v: boolean) => void
    categoryFilter: CategoryFilter; setCategoryFilter: (c: CategoryFilter) => void
    categoryOpen: boolean; setCategoryOpen: (v: boolean) => void
    drillCategory: string | null; setDrillCategory: (c: string | null) => void
    reminderSent: boolean; setReminderSent: (v: boolean) => void
    kpisVisible: boolean; barsVisible: boolean
    onPreviewClick: () => void
}) {
    const kpi = KPI_BY_DEPT[deptFilter]

    // Apply location scale + category filter
    const rawCategories = CATEGORIES_BY_DEPT[deptFilter][period]
    const locationScaled = rawCategories.map(c => ({
        ...c,
        amount: locationFilter === 'all' ? c.amount : Math.round(c.amount * LOCATION_SCALE[locationFilter] / 100) * 100,
    }))
    const displayCategories = categoryFilter === 'all'
        ? locationScaled
        : locationScaled.filter(c => c.name === categoryFilter)
    const maxCat = Math.max(...displayCategories.map(c => c.amount), 1)

    const scaledKPI = {
        month: locationFilter === 'all'
            ? kpi.month
            : `$${Math.round(parseInt(kpi.month.replace(/\D/g, '')) * LOCATION_SCALE[locationFilter]).toFixed(0)}K`,
        pending: locationFilter === 'all' ? kpi.pending : Math.ceil(kpi.pending * LOCATION_SCALE[locationFilter]),
        sla: kpi.sla,
    }

    const KPIs = [
        { label: 'This Month',        value: scaledKPI.month,            sub: 'May 2026' },
        { label: 'Pending Approvals', value: String(scaledKPI.pending),   sub: 'expenses' },
        { label: 'On-time SLA',       value: scaledKPI.sla,              sub: '↑ from 89%' },
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

    // Close all dropdowns when clicking one
    const openDept = () => { setDeptOpen(!deptOpen); setLocationOpen(false); setCategoryOpen(false) }
    const openLoc  = () => { setLocationOpen(!locationOpen); setDeptOpen(false); setCategoryOpen(false) }
    const openCat  = () => { setCategoryOpen(!categoryOpen); setDeptOpen(false); setLocationOpen(false) }

    return (
        <div className="space-y-4">
            {/* Filter bar — all 3 functional */}
            <div className="flex gap-1.5 flex-wrap">
                {/* Dept */}
                <div className="relative">
                    <button
                        onClick={openDept}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${deptFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {DEPT_LABELS[deptFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {deptOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(DEPT_LABELS) as DeptFilter[]).map(d => (
                                <button key={d} onClick={() => { setDeptFilter(d); setDeptOpen(false); setDrillCategory(null) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${deptFilter === d ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {DEPT_LABELS[d]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div className="relative">
                    <button
                        onClick={openLoc}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${locationFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {LOCATION_LABELS[locationFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {locationOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(LOCATION_LABELS) as LocationFilter[]).map(l => (
                                <button key={l} onClick={() => { setLocationFilter(l); setLocationOpen(false) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${locationFilter === l ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {LOCATION_LABELS[l]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category */}
                <div className="relative">
                    <button
                        onClick={openCat}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full transition-colors ${categoryFilter !== 'all' ? 'bg-foreground text-background border-foreground font-semibold' : 'bg-card border-border text-foreground hover:border-primary'}`}
                    >
                        {CATEGORY_FILTER_LABELS[categoryFilter]} <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                    {categoryOpen && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                            {(Object.keys(CATEGORY_FILTER_LABELS) as CategoryFilter[]).map(c => (
                                <button key={c} onClick={() => { setCategoryFilter(c); setCategoryOpen(false); setDrillCategory(null) }}
                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-muted transition-colors ${categoryFilter === c ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {CATEGORY_FILTER_LABELS[c]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
                {KPIs.map((kpi, i) => (
                    <div key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 200}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Spend bars */}
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

                <div className="px-4 py-3 space-y-2.5" key={`${deptFilter}-${period}-${locationFilter}-${categoryFilter}`}>
                    {displayCategories.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">No data for selected filters</p>
                    ) : displayCategories.map((cat, catIdx) => {
                        const rawCat   = CATEGORIES_BY_DEPT[deptFilter]
                        const catMay   = (locationFilter === 'all' ? rawCat.may.find(c => c.name === cat.name)?.amount : Math.round((rawCat.may.find(c => c.name === cat.name)?.amount ?? 0) * LOCATION_SCALE[locationFilter] / 100) * 100) ?? 0
                        const catApril = (locationFilter === 'all' ? rawCat.april.find(c => c.name === cat.name)?.amount : Math.round((rawCat.april.find(c => c.name === cat.name)?.amount ?? 0) * LOCATION_SCALE[locationFilter] / 100) * 100) ?? 0
                        const delta    = catApril > 0 ? Math.round(((catMay - catApril) / catApril) * 100) : 0
                        const isDrilled = drillCategory === cat.name

                        return (
                            <div key={cat.name} className="animate-in fade-in duration-300" style={{ animationDelay: `${catIdx * 60}ms` }}>
                                <button onClick={() => setDrillCategory(isDrilled ? null : cat.name)} className="w-full text-left group">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-foreground w-16 shrink-0">{cat.name}</span>
                                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                            <div
                                                className="h-full bg-primary/70 group-hover:bg-primary/90 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: barsVisible ? `${(cat.amount / maxCat) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">
                                            ${cat.amount >= 1000 ? `${(cat.amount / 1000).toFixed(1)}K` : cat.amount}
                                        </span>
                                        {period === 'may' && delta !== 0 && (
                                            <span className={`text-[10px] font-bold w-10 text-right shrink-0 ${delta > 0 ? 'text-warning' : 'text-success'}`}>
                                                {delta > 0 ? '+' : ''}{delta}%
                                            </span>
                                        )}
                                        <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground transition-all duration-200 ${isDrilled ? 'rotate-180 opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                                    </div>
                                </button>

                                {isDrilled && (
                                    <div className="ml-[72px] space-y-1.5 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {FUEL_DRILL.map(item => (
                                            <div key={item.name} className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-1.5 gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs text-foreground">{item.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{item.purpose}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
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

            {/* Preview Full Report CTA */}
            <button
                onClick={onPreviewClick}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-card border border-border text-foreground py-2.5 rounded-xl hover:border-primary transition-colors font-medium"
            >
                <FileText className="h-3.5 w-3.5" />
                Preview Full Report
            </button>

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

            {/* Export */}
            <div className="flex gap-2">
                <ExportButton type="csv" state={exportState.csv} onClick={() => handleExport('csv')} />
                <ExportButton type="pdf" state={exportState.pdf} onClick={() => handleExport('pdf')} />
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_AR] }]} />
        </div>
    )
}

// ── DivisionView ──────────────────────────────────────────────────────────────

function DivisionView({ kpisVisible, barsVisible }: { kpisVisible: boolean; barsVisible: boolean }) {
    const [reminderSent, setReminderSent] = useState(false)
    const maxDept = Math.max(...DIVISION_DEPTS.map(d => d.amount))

    const divisionKPIs = [
        { label: 'Division Spend', value: '$48K', sub: 'May 2026' },
        { label: 'Your Reports',   value: '38',   sub: 'direct + indirect' },
        { label: 'SLA On-time',    value: '92%',  sub: 'Ops & Procurement' },
    ]

    return (
        <div className="space-y-4">
            <TammyNotificationBanner />

            <div className="grid grid-cols-3 gap-2">
                {divisionKPIs.map((kpi, i) => (
                    <div key={kpi.label}
                        className={`bg-card border border-border rounded-xl px-3 py-3 text-center transition-all duration-500 ${kpisVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                        style={{ transitionDelay: `${i * 200}ms` }}
                    >
                        <p className="text-lg font-bold text-foreground leading-none">{kpi.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Hierarchy */}
            <div className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {['Employee', 'Manager', 'Dept Head (Tammy)', 'CFO/AP'].map((level, i, arr) => (
                        <div key={level} className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-1 rounded-full ${level === 'Dept Head (Tammy)' ? 'bg-ai/10 border border-ai/20 text-ai font-semibold' : 'bg-muted text-foreground'}`}>{level}</span>
                            {i < arr.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Your division: Ops &amp; Procurement · 38 direct + indirect reports</p>
            </div>

            {/* Division bars */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">Division Spend — May 2026</p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                    {DIVISION_DEPTS.map(dept => (
                        <div key={dept.name} className="flex items-center gap-2">
                            <span className="text-xs text-foreground w-24 shrink-0">{dept.name}</span>
                            <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary/70 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: barsVisible ? `${(dept.amount / maxDept) * 100}%` : '0%' }} />
                            </div>
                            <span className="text-xs font-bold text-foreground w-12 text-right shrink-0">${(dept.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* By Location */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground">By Location</p>
                </div>
                <div className="divide-y divide-border">
                    {LOCATIONS_LIST.map(loc => (
                        <div key={loc.city} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-xs text-foreground">{loc.city}</span>
                            <span className="text-xs font-bold text-foreground">${(loc.amount / 1000).toFixed(0)}K</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SLA — highlighted for Tammy */}
            <div className="bg-card border border-border rounded-xl overflow-hidden ring-1 ring-warning/30">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <p className="text-xs font-bold text-foreground">Overdue in your division</p>
                </div>
                <div className="divide-y divide-border">
                    {[{ name: 'Mike Torres', days: 4 }, { name: 'Ana Reyes', days: 3 }].map(m => (
                        <div key={m.name} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                                <p className="text-xs font-semibold text-foreground">{m.name} (manager)</p>
                                <p className="text-[10px] text-muted-foreground">1 expense · {m.days} days pending</p>
                            </div>
                            <span className="text-[10px] font-bold text-warning">{m.days}d ⚠️</span>
                        </div>
                    ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                    <button
                        onClick={() => setReminderSent(true)}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-all border ${reminderSent ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'}`}
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

// ── ExportButton ──────────────────────────────────────────────────────────────

function ExportButton({ type, state, onClick }: { type: 'csv' | 'pdf'; state: 'idle' | 'generating' | 'done'; onClick: () => void }) {
    return (
        <button onClick={onClick} disabled={state !== 'idle'}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-medium transition-all border ${state === 'done' ? 'bg-success/10 border-success/20 text-success' : 'bg-card border-border text-foreground hover:border-primary'}`}
        >
            <Download className="h-3.5 w-3.5" />
            {state === 'generating' ? 'Generating...' : state === 'done' ? `${type.toUpperCase()} downloaded ✓` : `Export ${type.toUpperCase()}`}
        </button>
    )
}
