/**
 * COMPONENT: CoNYMorningQueue
 * PURPOSE: Flow 1 · Scene 1 — AI triage of active CoNY orders.
 *          Starts in monitoring (4 orders, DOE-2847 neutral).
 *          After 2.5s Strata notification arrives → DOE-2847 flips to urgent.
 *          Click DOE-2847 → advances to Pricing Validation.
 *
 * NOTE: Login screen is handled by BFIPage before this component mounts.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-amber-*
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, Package, ChevronRight, Bell, Loader2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

type SceneState = 'monitoring' | 'notified'

const ORDERS = [
    { id: 'DOE-2847',  agency: 'NYC Dept. of Education', value: '$48,200',  detail: 'Carpenters: 50h → 45h · OT: 8h → 6h · Impact: −$2,340' },
    { id: 'NYPD-0394', agency: 'NYPD Precinct 40',       value: '$31,750',  detail: null },
    { id: 'DCAS-1182', agency: 'NYC DCAS',               value: '$127,400', detail: null },
    { id: 'DOH-0671',  agency: 'NYC Dept. of Health',    value: '$22,100',  detail: null },
]

const ORDER_STATUS: Record<string, Record<SceneState, { label: string; priority: 'high' | 'medium' | 'done' | 'processing' }>> = {
    'DOE-2847':  { monitoring: { label: 'Agency fee · SIF submitted',                           priority: 'processing' }, notified: { label: 'CPR · 2 discrepancies detected',               priority: 'high'   } },
    'NYPD-0394': { monitoring: { label: 'Pricing · validation in progress',                     priority: 'medium'     }, notified: { label: 'Pricing · validation in progress',              priority: 'medium' } },
    'DCAS-1182': { monitoring: { label: 'Receiving · 18 days in WIG · 12 days remaining',      priority: 'medium'     }, notified: { label: 'Receiving · 18 days in WIG · 12 days remaining', priority: 'medium' } },
    'DOH-0671':  { monitoring: { label: 'Fee verified · ready to invoice',                      priority: 'done'       }, notified: { label: 'Fee verified · ready to invoice',               priority: 'done'   } },
}

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('monitoring')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const poll = setInterval(() => {
            if (isPausedRef.current) return
            if (Date.now() - start >= delay) { clearInterval(poll); fn() }
        }, 100)
        return () => clearInterval(poll)
    }, [])

    // Auto-advance to notified after 2.5s
    useEffect(() => {
        const cleanup = pauseAware(() => setSceneState('notified'), 2500)
        return cleanup
    }, [pauseAware])

    const handleOrderClick = (orderId: string) => {
        if (orderId !== 'DOE-2847' || sceneState !== 'notified') return
        setExpandedId(orderId)
        setTimeout(() => { onSelectOrder?.(); nextStep() }, 900)
    }

    return (
        <div className="space-y-3">
            {/* Strata notification — slides in when notified */}
            {sceneState === 'notified' && (
                <button
                    onClick={() => handleOrderClick('DOE-2847')}
                    className="w-full animate-in slide-in-from-top duration-500 flex items-start gap-2.5 bg-card border border-ai/30 rounded-xl px-3 py-3 text-left shadow-sm group hover:border-ai/60 transition-colors"
                >
                    <div className="relative shrink-0 mt-0.5">
                        <Bell className="h-4 w-4 text-ai" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ai animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Sparkles className="h-3 w-3 text-ai shrink-0" />
                            <p className="text-[10px] font-bold text-ai uppercase tracking-wide">Strata · Agency Fee Alert</p>
                        </div>
                        <p className="text-xs font-semibold text-foreground leading-snug">DOE-2847 requires action — CPR discrepancy detected</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Carpenters: 50h → 45h · OT: 8h → 6h · Impact: −$2,340</p>
                        <p className="text-[10px] text-ai mt-1.5 font-semibold group-hover:underline">Review order →</p>
                    </div>
                </button>
            )}

            {/* Monitoring banner */}
            {sceneState === 'monitoring' && (
                <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                    <p className="text-xs text-muted-foreground">Strata is reviewing your active orders…</p>
                </div>
            )}

            {/* Orders list */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {ORDERS.map((order) => {
                    const { label, priority } = ORDER_STATUS[order.id][sceneState]
                    const isHigh       = priority === 'high'
                    const isDone       = priority === 'done'
                    const isProcessing = priority === 'processing'

                    return (
                        <div
                            key={order.id}
                            onClick={() => handleOrderClick(order.id)}
                            className={`p-3.5 transition-all duration-500 ${
                                isHigh   ? 'bg-amber-50 dark:bg-amber-500/5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/10'
                                : isDone ? 'bg-card opacity-60'
                                : 'bg-card'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                    {isHigh && (
                                        <div className="relative">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                                        </div>
                                    )}
                                    {isDone        && <CheckCircle2 className="h-4 w-4 text-success" />}
                                    {(isProcessing || priority === 'medium') && <Package className="h-4 w-4 text-muted-foreground" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <span className="text-xs font-bold text-foreground">{order.id}</span>
                                            <span className="text-xs text-muted-foreground ml-1.5">· {order.agency}</span>
                                        </div>
                                        <span className="text-xs font-bold text-foreground tabular-nums shrink-0">{order.value}</span>
                                    </div>

                                    <div className={`text-[11px] mt-0.5 transition-colors duration-500 ${
                                        isHigh   ? 'text-amber-600 dark:text-amber-400 font-medium'
                                        : isDone ? 'text-success font-medium'
                                        : 'text-muted-foreground'
                                    }`}>
                                        {label}
                                    </div>

                                    {expandedId === order.id && order.detail && (
                                        <div className="mt-2 text-[11px] text-foreground bg-amber-100 dark:bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-200 dark:border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-300">
                                            {order.detail}
                                        </div>
                                    )}
                                </div>

                                {isHigh && expandedId !== order.id && (
                                    <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · {sceneState === 'notified' ? '1 requires immediate action' : 'monitoring…'}
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
