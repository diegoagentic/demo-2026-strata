/**
 * COMPONENT: CoNYMorningQueue
 * PURPOSE: Flow 1 · Scene 1 — Login simulation → AI triage of active CoNY orders.
 *          login → monitoring (4 orders, DOE-2847 neutral) → notified (AI alert arrives,
 *          DOE-2847 flips urgent) → click DOE-2847 → advances to Pricing Validation.
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-amber-*
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, Package, ChevronRight, Bell, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

type SceneState = 'login' | 'signing-in' | 'monitoring' | 'notified'

const ORDERS = [
    { id: 'DOE-2847',  agency: 'NYC Dept. of Education', value: '$48,200',  detail: 'Carpenters: 50h → 45h · OT: 8h → 6h · Impact: −$2,340' },
    { id: 'NYPD-0394', agency: 'NYPD Precinct 40',       value: '$31,750',  detail: null },
    { id: 'DCAS-1182', agency: 'NYC DCAS',               value: '$127,400', detail: null },
    { id: 'DOH-0671',  agency: 'NYC Dept. of Health',    value: '$22,100',  detail: null },
]

const ORDER_STATUS: Record<string, Record<'monitoring' | 'notified', { label: string; priority: 'high' | 'medium' | 'done' | 'processing' }>> = {
    'DOE-2847':  { monitoring: { label: 'Agency fee · SIF submitted',                          priority: 'processing' }, notified: { label: 'CPR · 2 discrepancies detected',              priority: 'high'   } },
    'NYPD-0394': { monitoring: { label: 'Pricing · validation in progress',                    priority: 'medium'     }, notified: { label: 'Pricing · validation in progress',             priority: 'medium' } },
    'DCAS-1182': { monitoring: { label: 'Receiving · 18 days in WIG · 12 days remaining',     priority: 'medium'     }, notified: { label: 'Receiving · 18 days in WIG · 12 days remaining', priority: 'medium' } },
    'DOH-0671':  { monitoring: { label: 'Fee verified · ready to invoice',                     priority: 'done'       }, notified: { label: 'Fee verified · ready to invoice',              priority: 'done'   } },
}

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('login')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const poll = setInterval(() => {
            if (isPausedRef.current) return
            if (Date.now() - start >= delay) { clearInterval(poll); fn() }
        }, 100)
        return () => clearInterval(poll)
    }, [])

    // Once monitoring starts, auto-advance to notified after 2.5s
    useEffect(() => {
        if (sceneState !== 'monitoring') return
        const cleanup = pauseAware(() => setSceneState('notified'), 2500)
        return cleanup
    }, [sceneState, pauseAware])

    const handleSignIn = () => {
        setSceneState('signing-in')
        setTimeout(() => setSceneState('monitoring'), 1400)
    }

    const handleOrderClick = (orderId: string) => {
        if (orderId !== 'DOE-2847' || sceneState !== 'notified') return
        setExpandedId(orderId)
        setTimeout(() => { onSelectOrder?.(); nextStep() }, 900)
    }

    // ── Login screen ────────────────────────────────────────────────────────────
    if (sceneState === 'login' || sceneState === 'signing-in') {
        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                    {/* App header */}
                    <div className="bg-zinc-900 dark:bg-zinc-950 px-4 py-3 flex items-center gap-2.5">
                        <div className="flex gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex-1 mx-2 bg-zinc-800 rounded px-3 py-1 text-[10px] text-zinc-400 font-mono">
                            app.strata.ai/bfi
                        </div>
                    </div>

                    {/* Login form */}
                    <div className="px-6 py-8 flex flex-col items-center gap-5">
                        {/* Logo area */}
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-ai/15 border border-ai/30 flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-ai" />
                                </div>
                                <span className="text-sm font-bold text-foreground">Strata · BFI</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Sign in to your workspace</p>
                        </div>

                        {/* Fields */}
                        <div className="w-full space-y-2.5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
                                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/30">
                                    <span className="text-xs text-foreground flex-1">lauren@bfiinc.com</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
                                <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/30">
                                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="text-xs text-muted-foreground tracking-widest">••••••••</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleSignIn}
                            disabled={sceneState === 'signing-in'}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-70"
                        >
                            {sceneState === 'signing-in' ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </>
                            )}
                        </button>

                        {sceneState === 'signing-in' && (
                            <p className="text-[10px] text-muted-foreground animate-in fade-in duration-300">
                                Loading your CoNY order queue…
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ── Queue screen (monitoring + notified) ────────────────────────────────────
    const queueState = sceneState as 'monitoring' | 'notified'

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
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

            {/* Context banner — monitoring placeholder */}
            {sceneState === 'monitoring' && (
                <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                    <p className="text-xs text-muted-foreground">Strata is reviewing your active orders…</p>
                </div>
            )}

            {/* Orders list */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {ORDERS.map((order) => {
                    const { label, priority } = ORDER_STATUS[order.id][queueState]
                    const isHigh       = priority === 'high'
                    const isDone       = priority === 'done'
                    const isProcessing = priority === 'processing'

                    return (
                        <div
                            key={order.id}
                            onClick={() => handleOrderClick(order.id)}
                            className={`p-3.5 transition-all duration-500 ${
                                isHigh      ? 'bg-amber-50 dark:bg-amber-500/5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/10'
                                : isDone    ? 'bg-card opacity-60'
                                : 'bg-card'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Priority icon */}
                                <div className="shrink-0 mt-0.5">
                                    {isHigh && (
                                        <div className="relative">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                                        </div>
                                    )}
                                    {isDone       && <CheckCircle2 className="h-4 w-4 text-success" />}
                                    {(isProcessing || priority === 'medium') && <Package className="h-4 w-4 text-muted-foreground" />}
                                </div>

                                {/* Content */}
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

                                    {/* Expanded CPR detail */}
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
