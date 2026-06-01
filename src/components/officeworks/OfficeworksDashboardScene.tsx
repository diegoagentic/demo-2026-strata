/**
 * COMPONENT: OfficeworksDashboardScene
 * PURPOSE: Persistent Dashboard navbar tab (NOT a demo step).
 *          Dramatizes CEO #2 SC5 (capacity self-reported) + CEO #4 SC6 (no KPIs).
 *
 * Enrichments (Iter 2.5):
 *   - 4 KPI cards (cycle time / revisions / error rate / spec checks)
 *   - 4 chart panels (cycle time trend · error rate trend · project mix by region · activity)
 *   - CapacityHeatmap is clickable → opens DesignerDetailModal
 *
 * DS TOKENS: bg-card · bg-background · border-border · text-foreground ·
 *            text-muted-foreground · text-success · text-warning · text-destructive
 */

import { useState } from 'react'
import {
    LayoutDashboard, Activity, Clock, Target, TrendingUp, AlertTriangle, BarChart3,
    LineChart as LineChartIcon, PieChart as PieChartIcon, History,
    Briefcase, CheckCircle2, Truck, AlertCircle, Bell, Building2,
} from 'lucide-react'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
} from 'recharts'
import { useDemo } from '../../context/DemoContext'
import CapacityHeatmap from './shared/CapacityHeatmap'
import DesignerDetailModal from './shared/DesignerDetailModal'
import {
    CYCLE_TIME_TREND, ERROR_RATE_BY_MONTH, RECENT_ACTIVITY,
    projectMixByRegion, findDesigner, type DesignerProfile, regionLabel,
} from './shared/designerProfiles'
import {
    SPEC_CHECK_AT_RISK, SPEC_CHECK_ALERTS, SPEC_CHECK_SLA_SUMMARY,
    LD_KPI_FURNITURE, LD_KPI_WALLS,
    LD_ACTIVE_ESTIMATES_TREND_FURNITURE, LD_ACTIVE_ESTIMATES_TREND_WALLS,
    LD_BID_VARIANCE_DISTRIBUTION_FURNITURE, LD_BID_VARIANCE_DISTRIBUTION_WALLS,
    LD_VENDOR_SCORECARD_FURNITURE, LD_VENDOR_SCORECARD_WALLS,
    LD_INTAKE_FORMATS, LD_BUILDING_KB_COVERAGE, LD_VOLUME_SPLIT,
    type KPICardData,
} from './shared/dashboardData'
import { useOfficeworksVertical } from './shared/verticalSignal'

export default function OfficeworksDashboardScene() {
    const { currentStep } = useDemo()
    const vertical = useOfficeworksVertical()
    const flowId = (currentStep?.flowId ?? 'spec-check') as 'spec-check' | 'labor-delivery'
    const isLD = flowId === 'labor-delivery'

    if (isLD) {
        return <LDDashboardContent vertical={vertical} />
    }

    return <SpecCheckDashboardContent />
}

function SpecCheckDashboardContent() {
    const [selectedDesignerName, setSelectedDesignerName] = useState<string | null>(null)
    const selectedDesigner: DesignerProfile | null = selectedDesignerName ? (findDesigner(selectedDesignerName) ?? null) : null

    const regionMix = projectMixByRegion()
    const regionMixData = (['dc', 'ma', 'pa'] as const).map(r => ({
        region: regionLabel(r),
        Large: regionMix[r].large,
        Medium: regionMix[r].medium,
        Small: regionMix[r].small,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Design Dashboard · Officeworks Inc.</h2>
                    <p className="text-sm text-muted-foreground">
                        Capacity (CEO #2 · SC5) + KPIs (CEO #4 · SC6) · ~30 designers across 3 manager regions
                    </p>
                </div>
            </div>

            {/* KPI cards row (4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={Clock} label="Avg cycle time" value="3.4w" change="+12% vs Q1 target" tone="warning" />
                <KPICard icon={TrendingUp} label="Revisions / project" value="2.7" change="range 2–4 typical" tone="muted" />
                <KPICard icon={Target} label="Error escape rate" value="0.018%" change="below industry 0.025%" tone="success" />
                <KPICard icon={Activity} label="Spec checks / week" value="~20" change="+10 new designs/week" tone="muted" />
            </div>

            {/* SLA Risk · At-Risk Projects · Active Alerts (PP#4 SC6) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* SLA Risk card */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-foreground" aria-hidden="true" />
                            SLA risk
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-md px-2 py-1">
                            {SPEC_CHECK_SLA_SUMMARY.atRiskCount} at risk
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div>
                            <div className="text-3xl font-bold text-foreground tabular-nums">{SPEC_CHECK_SLA_SUMMARY.atRiskCount}<span className="text-base text-muted-foreground font-normal">/{SPEC_CHECK_SLA_SUMMARY.totalInFlight}</span></div>
                            <div className="text-xs text-muted-foreground">projects in-flight</div>
                        </div>
                        <div className="pt-2 border-t border-border">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Nearest breach</span>
                                <span className="text-warning font-semibold tabular-nums">{SPEC_CHECK_SLA_SUMMARY.nearestBreachLabel} · {SPEC_CHECK_SLA_SUMMARY.nearestBreachCode}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                                <span className="text-muted-foreground">Breach rate · last 30d</span>
                                <span className="text-foreground tabular-nums">{SPEC_CHECK_SLA_SUMMARY.breachRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* At-Risk Projects list */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-foreground" aria-hidden="true" />
                            Top at-risk projects
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-md px-2 py-1">
                            Hot-spots
                        </span>
                    </div>
                    <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {SPEC_CHECK_AT_RISK.map(p => {
                            const ratio = p.daysInPhase / p.slaDays
                            const tone = ratio >= 0.9 ? 'destructive' : ratio >= 0.75 ? 'warning' : 'muted'
                            return (
                                <li key={p.code} className="flex items-center gap-2 text-xs">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                        tone === 'destructive' ? 'bg-destructive' :
                                        tone === 'warning' ? 'bg-warning' :
                                        'bg-muted-foreground'
                                    }`} aria-hidden="true" />
                                    <span className="text-foreground font-medium tabular-nums shrink-0">{p.code}</span>
                                    <span className="text-muted-foreground truncate flex-1 min-w-0">{p.phase}</span>
                                    <span className={`tabular-nums shrink-0 ${
                                        tone === 'destructive' ? 'text-destructive font-semibold' :
                                        tone === 'warning' ? 'text-warning' :
                                        'text-muted-foreground'
                                    }`}>{p.daysInPhase}/{p.slaDays}d</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                {/* Active Alerts banner-card */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Bell className="h-4 w-4 text-foreground" aria-hidden="true" />
                            Active alerts
                        </h3>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-2 py-1">
                            {SPEC_CHECK_ALERTS.length} new
                        </span>
                    </div>
                    <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {SPEC_CHECK_ALERTS.map(a => (
                            <li key={a.id} className={`rounded-md border px-2.5 py-2 text-[11px] ${
                                a.severity === 'high' ? 'border-destructive/30 bg-destructive/5' :
                                a.severity === 'medium' ? 'border-warning/30 bg-warning/5' :
                                'border-border bg-card'
                            }`}>
                                <p className="text-foreground leading-relaxed">{a.text}</p>
                                <button
                                    type="button"
                                    className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                                        a.severity === 'high' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
                                        'bg-foreground text-background hover:opacity-80'
                                    }`}
                                >
                                    {a.actionLabel}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Charts row 1: trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cycle time trend · LineChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <LineChartIcon className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Cycle time trend
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 8 weeks · weeks per project · trending down</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            -17% vs W-7
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={CYCLE_TIME_TREND} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={[3, 4.5]} />
                                <Tooltip
                                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                                    formatter={(value: number) => [`${value}w`, 'Cycle time']}
                                />
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error rate by month · BarChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Error rate by month
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months · % escape rate vs industry benchmark</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            Below 0.025%
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ERROR_RATE_BY_MONTH} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <Tooltip
                                    contentStyle={{ fontSize: '11px', borderRadius: '6px' }}
                                    formatter={(value: number) => [`${(value * 100).toFixed(3)}%`, 'Error rate']}
                                />
                                <ReferenceLine y={0.025} stroke="hsl(var(--warning))" strokeDasharray="3 3" label={{ value: 'Industry 0.025%', position: 'top', fontSize: 10, fill: 'currentColor' }} />
                                <Bar dataKey="value" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts row 2: distribution + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Project size distribution by region · stacked BarChart */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Project mix by region
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Large (&gt;$500K) · Medium ($50-500K) · Small (&lt;$50K)</p>
                        </div>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionMixData} layout="vertical" margin={{ top: 8, right: 8, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis type="number" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis dataKey="region" type="category" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" width={120} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                                <Bar dataKey="Large"  stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Medium" stackId="a" fill="hsl(var(--info))"    radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Small"  stackId="a" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent activity timeline */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <History className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Recent activity
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days · assignments · completions · escapes</p>
                        </div>
                    </div>
                    <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {RECENT_ACTIVITY.map((a, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs">
                                <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                                    a.kind === 'arrive' ? 'bg-ai' :
                                    a.kind === 'success' ? 'bg-success' :
                                    'bg-info'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground">{a.text}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.when}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CapacityHeatmap card · clickable */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Designer Capacity</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Self-reported every Thursday · click any designer to see detail
                        </p>
                    </div>
                    <div className="text-xs bg-warning/10 text-warning border border-warning/20 rounded-md px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">SC5: stale data</span>
                        </div>
                    </div>
                </div>
                <CapacityHeatmap onSelect={(name) => setSelectedDesignerName(name)} />
            </div>

            {/* SC6 callout */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">SC6 (CEO #4): No formal KPIs or SLAs today</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Officeworks measures only the NetSuite error report (post-order, reactive). The charts above are the
                            first centralized view of cycle time, error trend, and project mix · enabling proactive resource decisions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Designer detail modal */}
            <DesignerDetailModal
                isOpen={!!selectedDesigner}
                onClose={() => setSelectedDesignerName(null)}
                designer={selectedDesigner}
            />
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// L&D DASHBOARD CONTENT · vertical-aware (Furniture / Walls)
// ═══════════════════════════════════════════════════════════════════════════════

const KPI_ICON_MAP = { Briefcase, Clock, Target, CheckCircle2, TrendingUp, Activity } as const

function LDDashboardContent({ vertical }: { vertical: 'furniture' | 'walls' }) {
    const isWalls = vertical === 'walls'
    const kpis = isWalls ? LD_KPI_WALLS : LD_KPI_FURNITURE
    const trend = isWalls ? LD_ACTIVE_ESTIMATES_TREND_WALLS : LD_ACTIVE_ESTIMATES_TREND_FURNITURE
    const variance = isWalls ? LD_BID_VARIANCE_DISTRIBUTION_WALLS : LD_BID_VARIANCE_DISTRIBUTION_FURNITURE
    const scorecard = isWalls ? LD_VENDOR_SCORECARD_WALLS : LD_VENDOR_SCORECARD_FURNITURE

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Truck className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Labor & Delivery Dashboard · {isWalls ? 'Walls' : 'Furniture'}</h2>
                    <p className="text-sm text-muted-foreground">
                        {isWalls
                            ? 'Paul Egan · Head of Ops · centralized governance · ~60 estimates/mo · NJ + PA + MA'
                            : 'Alan McPhee · Sr Operations · ~240 estimates/mo · DC + NoVA + MD'}
                    </p>
                </div>
            </div>

            {/* 4 KPI cards · core (Active / Bid SLA / Variance / GC compliance) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LDKpiCard data={kpis.activeEstimates} />
                <LDKpiCard data={kpis.bidSlaCompliance} />
                <LDKpiCard data={kpis.bidVarianceAvg} />
                <LDKpiCard data={kpis.gcPortalCompliance} />
            </div>

            {/* Charts row 1: Active estimates + SLA compliance trend · variance distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Active estimates trend · 8 weeks · LineChart with dual line (count + SLA%) */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <LineChartIcon className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Active estimates + SLA trend
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 8 weeks · count + bid SLA compliance %</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            SLA {isWalls ? '+3' : '+6'}pp vs W-7
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend as unknown as { week: string; value: number; slaCompliance: number }[]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" domain={[60, 100]} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                                <Line yAxisId="left"  type="monotone" dataKey="value"         stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Active" />
                                <Line yAxisId="right" type="monotone" dataKey="slaCompliance" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="SLA %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Variance distribution · 6 months · BarChart with threshold reference */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Bid variance vs benchmark
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 6 months · avg variance % · outlier count (≥15%)</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-success/10 text-success border border-success/20 rounded-md px-2 py-1">
                            Within 15% threshold
                        </span>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={variance as unknown as { month: string; avgVariance: number; outliers: number }[]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                                <ReferenceLine y={15}  stroke="hsl(var(--warning))" strokeDasharray="3 3" label={{ value: '+15% threshold', position: 'top', fontSize: 10, fill: 'currentColor' }} />
                                <ReferenceLine y={-15} stroke="hsl(var(--warning))" strokeDasharray="3 3" />
                                <Bar dataKey="avgVariance" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Vendor scorecard table + Intake formats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Vendor scorecard */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Vendor scorecard
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{isWalls ? 'Walls' : 'Furniture'} pool · on-time % · CO rate · 12-month jobs</p>
                        </div>
                    </div>
                    <table className="w-full text-[11px]">
                        <thead>
                            <tr className="text-left text-muted-foreground">
                                <th className="font-semibold py-1.5">Vendor</th>
                                <th className="font-semibold py-1.5 text-right">On-time</th>
                                <th className="font-semibold py-1.5 text-right">CO rate</th>
                                <th className="font-semibold py-1.5 text-right">Jobs 12mo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scorecard.map(v => (
                                <tr key={v.name} className="border-t border-border">
                                    <td className="py-2">
                                        <div className="text-foreground font-medium">{v.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{v.market}</div>
                                    </td>
                                    <td className="py-2 text-right tabular-nums text-foreground">
                                        {v.onTime}%{' '}
                                        {v.trend === 'up' && <span className="text-success" aria-label="trending up">↑</span>}
                                        {v.trend === 'down' && <span className="text-warning" aria-label="trending down">↓</span>}
                                        {v.trend === 'flat' && <span className="text-muted-foreground" aria-label="flat">→</span>}
                                    </td>
                                    <td className="py-2 text-right tabular-nums text-foreground">{v.coRate}%</td>
                                    <td className="py-2 text-right tabular-nums text-foreground">{v.jobs12mo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* RFP intake formats (Furniture only · for Walls shows the structured PDF stat) */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4 text-foreground" aria-hidden="true" />
                                RFP intake formats
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{isWalls ? 'Structured PDF + plain email · centralized routing' : '7 formats today · no consolidation · no tracking'}</p>
                        </div>
                        {!isWalls && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20 rounded-md px-2 py-1">
                                Painpoint
                            </span>
                        )}
                    </div>
                    {isWalls ? (
                        <div className="space-y-3">
                            <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-[11px] text-foreground">
                                <strong>~70%</strong> of bid requests use the structured PDF (Sections A-G). Plain email under volume pressure.
                            </div>
                            <div className="rounded-lg border border-info/30 bg-info/5 px-3 py-2 text-[11px] text-foreground">
                                Paul's ops team actively workload-balances · contrast vs Furniture decentralized.
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-1.5">
                            {LD_INTAKE_FORMATS.map(f => (
                                <li key={f.name} className="flex items-center gap-2 text-[11px]">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                        f.tone === 'success' ? 'bg-success' :
                                        f.tone === 'warning' ? 'bg-warning' :
                                        'bg-muted-foreground'
                                    }`} aria-hidden="true" />
                                    <span className="text-foreground flex-1 truncate">{f.name}</span>
                                    <span className="text-muted-foreground tabular-nums shrink-0">{f.count}</span>
                                    <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                                        <div
                                            className={`h-full ${
                                                f.tone === 'success' ? 'bg-success' :
                                                f.tone === 'warning' ? 'bg-warning' :
                                                'bg-muted-foreground'
                                            }`}
                                            style={{ width: `${f.pct}%` }}
                                        />
                                    </div>
                                    <span className="text-foreground tabular-nums shrink-0 w-9 text-right">{f.pct}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Building KB coverage + Furniture/Walls split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Building KB coverage card */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Building KB coverage
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{LD_BUILDING_KB_COVERAGE.addressesIndexed} addresses indexed · target {LD_BUILDING_KB_COVERAGE.targetAddresses} EOY 2026</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                            <div className="bg-success h-full" style={{ width: `${(LD_BUILDING_KB_COVERAGE.fullCoverage    / LD_BUILDING_KB_COVERAGE.addressesIndexed) * 100}%` }} title={`Full · ${LD_BUILDING_KB_COVERAGE.fullCoverage}`} />
                            <div className="bg-warning h-full" style={{ width: `${(LD_BUILDING_KB_COVERAGE.partialCoverage / LD_BUILDING_KB_COVERAGE.addressesIndexed) * 100}%` }} title={`Partial · ${LD_BUILDING_KB_COVERAGE.partialCoverage}`} />
                            <div className="bg-destructive h-full" style={{ width: `${(LD_BUILDING_KB_COVERAGE.minimalCoverage / LD_BUILDING_KB_COVERAGE.addressesIndexed) * 100}%` }} title={`Minimal · ${LD_BUILDING_KB_COVERAGE.minimalCoverage}`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div>
                                <div className="text-success font-bold tabular-nums">{LD_BUILDING_KB_COVERAGE.fullCoverage}</div>
                                <div className="text-muted-foreground">Full (≥10/12)</div>
                            </div>
                            <div>
                                <div className="text-warning font-bold tabular-nums">{LD_BUILDING_KB_COVERAGE.partialCoverage}</div>
                                <div className="text-muted-foreground">Partial (5-9)</div>
                            </div>
                            <div>
                                <div className="text-destructive font-bold tabular-nums">{LD_BUILDING_KB_COVERAGE.minimalCoverage}</div>
                                <div className="text-muted-foreground">Minimal (&lt;5)</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                            PP#1 · "Nowhere currently" — Alan ~6:54 · Strata captures from prior projects.
                        </div>
                    </div>
                </div>

                {/* Furniture vs Walls split card */}
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-foreground" aria-hidden="true" />
                                Volume split · Furniture vs Walls
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{LD_VOLUME_SPLIT.totalMonthly} estimates/mo total · {LD_VOLUME_SPLIT.activeSimultaneous} active right now</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-foreground font-medium">Furniture · Alan McPhee</span>
                                <span className="text-foreground tabular-nums">{LD_VOLUME_SPLIT.furnitureMonthly}/mo · {LD_VOLUME_SPLIT.furniturePct}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${LD_VOLUME_SPLIT.furniturePct}%` }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-foreground font-medium">Walls · Paul Egan</span>
                                <span className="text-foreground tabular-nums">{LD_VOLUME_SPLIT.wallsMonthly}/mo · {LD_VOLUME_SPLIT.wallsPct}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-info" style={{ width: `${LD_VOLUME_SPLIT.wallsPct}%` }} />
                            </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border">
                            Walls is 20% of volume but ~75% strategic accounts · centralized governance contrast.
                        </div>
                    </div>
                </div>
            </div>

            {/* Painpoint callout · L&D top 3 gaps */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">L&D top 3 gaps · Strata closes the loop</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            (1) No central RFP intake · 7 formats today · Strata routes into one inbox.{' '}
                            (2) No internal benchmark methodology · Strata computes per project · 15% variance threshold.{' '}
                            (3) No vendor scorecard · Strata captures on-time + CO rate + 12mo jobs · feeds MSA renewals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LDKpiCard({ data }: { data: KPICardData }) {
    const Icon = KPI_ICON_MAP[data.iconName] ?? Activity
    const changeClass = data.tone === 'success' ? 'text-success' : data.tone === 'warning' ? 'text-warning' : data.tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs mb-2">
                <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">{data.label}</span>
            </div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{data.value}</div>
            <div className={`text-xs mt-1 ${changeClass}`}>{data.sub}</div>
        </div>
    )
}

// ─── KPI card sub-component ───────────────────────────────────────────────────

interface KPICardProps {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    change: string
    tone: 'success' | 'warning' | 'destructive' | 'muted'
}

function KPICard({ icon: Icon, label, value, change, tone }: KPICardProps) {
    const changeClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs mb-2">
                <Icon className="h-3.5 w-3.5 text-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
            <div className={`text-xs mt-1 ${changeClass}`}>{change}</div>
        </div>
    )
}
