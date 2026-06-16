import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight, Sparkles, Mail, Phone } from 'lucide-react'
import type { RegionCapacity } from './installScheduleData'
import { CAPACITY_BY_REGION, THIRD_PARTY_INSTALLER, WEEKS } from './installScheduleData'

interface Props {
    /** Step that triggered the panel · controls default-open behavior */
    stepId?: string
}

/**
 * Adapter of the CapacityHeatmap accordion pattern (Officeworks) for CLC.
 * 3 region accordions (NY/NJ/PA) instead of 3 manager regions.
 * Default-expands NY when clc1.3 fires (the capacity warning step).
 */
export default function CLCCapacityWarningPanel({ stepId }: Props) {
    const [expandedRegion, setExpandedRegion] = useState<string | null>(
        stepId === 'clc1.3' ? 'ny' : null
    )

    const statusBadge = (status: RegionCapacity['status']) => {
        switch (status) {
            case 'red':   return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
            case 'amber': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30'
            case 'green': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30'
        }
    }
    const statusLabel = (status: RegionCapacity['status']) => {
        switch (status) {
            case 'red':   return 'Over capacity'
            case 'amber': return 'Tight'
            case 'green': return 'Healthy'
        }
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">Capacity by region</h3>
                    <span className="text-[11px] text-muted-foreground ml-auto">In-house crews · weekly load</span>
                </div>
            </div>

            <div className="divide-y divide-border">
                {CAPACITY_BY_REGION.map(region => {
                    const isOpen = expandedRegion === region.region
                    const isOver = region.status === 'red'
                    return (
                        <div key={region.region}>
                            <button
                                onClick={() => setExpandedRegion(isOpen ? null : region.region)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                            >
                                {isOpen
                                    ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                                <span className="text-sm font-bold text-foreground w-32 shrink-0">{region.label}</span>
                                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${statusBadge(region.status)}`}>
                                    {statusLabel(region.status)}
                                </span>
                                <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
                                    <span><span className="font-bold text-foreground">{region.inHouseCrews}</span> crew{region.inHouseCrews !== 1 ? 's' : ''}</span>
                                    <span><span className="font-bold text-foreground">{region.activeJobs}</span> active</span>
                                </span>
                            </button>

                            {isOpen && (
                                <div className="px-3 pb-4 pt-1 space-y-3 border-t border-border bg-muted/10">
                                    {/* Weekly load mini-bars */}
                                    <div className="pt-3">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Weekly load · 6 weeks ahead</div>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {WEEKS.map(week => {
                                                const load = region.weeklyLoad[week.monday] ?? 0
                                                const isOverLoad = load > region.inHouseCrews
                                                return (
                                                    <div key={week.monday} className="text-center">
                                                        <div className="h-12 flex items-end mb-1">
                                                            <div
                                                                className={`w-full rounded-t ${
                                                                    isOverLoad ? 'bg-red-500' :
                                                                    load === region.inHouseCrews ? 'bg-yellow-500' :
                                                                    load > 0 ? 'bg-green-500/70' :
                                                                    'bg-muted'
                                                                }`}
                                                                style={{ height: `${Math.min(100, (load / Math.max(region.inHouseCrews + 2, 3)) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground">{week.label}</div>
                                                        <div className={`text-[10px] font-bold ${isOverLoad ? 'text-red-700 dark:text-red-300' : 'text-foreground'}`}>{load}/{region.inHouseCrews}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Third-party suggestion (only on red regions) */}
                                    {isOver && (
                                        <div className="rounded-lg border border-red-200 bg-red-50/40 dark:border-red-500/30 dark:bg-red-500/10 p-3">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strata AI suggests</span>
                                            </div>
                                            <div className="text-sm font-semibold text-foreground">
                                                {THIRD_PARTY_INSTALLER.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {THIRD_PARTY_INSTALLER.distance} · {THIRD_PARTY_INSTALLER.history}
                                            </div>
                                            <div className="text-xs text-foreground mt-1.5 leading-snug">
                                                {THIRD_PARTY_INSTALLER.note}
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <button
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                                    title="Strata never auto-sends · operator reviews the draft and confirms"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Open outreach draft
                                                </button>
                                                <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-md hover:bg-muted transition-colors">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Call dispatcher
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
