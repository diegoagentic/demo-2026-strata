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
import { Sparkles, AlertTriangle, CheckCircle2, Package, ChevronRight, Bell, Loader2, Mail, FileText } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

type SceneState = 'email' | 'monitoring' | 'notified'

const INGEST_LINES = [
    { icon: FileText, text: 'DOE-2847.sif · parsed via OCR · 6 line items extracted' },
    { icon: FileText, text: 'NYC-DOE-2847-specs.pdf · product specs + floor plan parsed' },
    { icon: CheckCircle2, text: 'Quote Q-2026-0089 created · DOE-2847 added to queue' },
]

const ORDERS = [
    { id: 'DOE-2847',  agency: 'NYC Dept. of Education', value: '$48,200',  detail: 'Carpenters: 50h → 45h · OT: 8h → 6h · Impact: −$2,340' },
    { id: 'NYPD-0394', agency: 'NYPD Precinct 40',       value: '$31,750',  detail: null },
    { id: 'DCAS-1182', agency: 'NYC DCAS',               value: '$127,400', detail: null },
    { id: 'DOH-0671',  agency: 'NYC Dept. of Health',    value: '$22,100',  detail: null },
]

const ORDER_STATUS: Record<string, Record<SceneState, { label: string; priority: 'high' | 'medium' | 'done' | 'processing' }>> = {
    'DOE-2847':  { email: { label: 'Incoming · SIF received',                                  priority: 'processing' }, monitoring: { label: 'Pricing · SIF validated · CPR pending',               priority: 'processing' }, notified: { label: 'CPR · 2 discrepancies detected',               priority: 'high'   } },
    'NYPD-0394': { email: { label: 'Pricing · validation in progress',                         priority: 'medium'     }, monitoring: { label: 'Pricing · validation in progress',                     priority: 'medium'     }, notified: { label: 'Pricing · validation in progress',              priority: 'medium' } },
    'DCAS-1182': { email: { label: 'Receiving · 18 days in WIG · 12 days remaining',           priority: 'medium'     }, monitoring: { label: 'Receiving · 18 days in WIG · 12 days remaining',      priority: 'medium'     }, notified: { label: 'Receiving · 18 days in WIG · 12 days remaining', priority: 'medium' } },
    'DOH-0671':  { email: { label: 'Fee verified · ready to invoice',                          priority: 'done'       }, monitoring: { label: 'Fee verified · ready to invoice',                      priority: 'done'       }, notified: { label: 'Fee verified · ready to invoice',               priority: 'done'   } },
}

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [sceneState, setSceneState] = useState<SceneState>('email')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [ingestCount, setIngestCount] = useState(0)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const poll = setInterval(() => {
            if (isPausedRef.current) return
            if (Date.now() - start >= delay) { clearInterval(poll); fn() }
        }, 100)
        return () => clearInterval(poll)
    }, [])

    // Progressive ingest lines in email phase
    useEffect(() => {
        if (sceneState !== 'email') return
        if (ingestCount >= INGEST_LINES.length) return
        const cleanup = pauseAware(() => setIngestCount(c => c + 1), 600 + ingestCount * 700)
        return cleanup
    }, [sceneState, ingestCount, pauseAware])

    // Auto-advance to notified after 2.5s (only once in monitoring)
    useEffect(() => {
        if (sceneState !== 'monitoring') return
        const cleanup = pauseAware(() => setSceneState('notified'), 2500)
        return cleanup
    }, [sceneState, pauseAware])

    const handleOrderClick = (orderId: string) => {
        if (orderId !== 'DOE-2847' || sceneState !== 'notified') return
        setExpandedId(orderId)
        setTimeout(() => { onSelectOrder?.(); nextStep() }, 900)
    }

    return (
        <div className="space-y-3">
            {/* Email phase — incoming SIF + AI ingestion */}
            {sceneState === 'email' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                    {/* Incoming email card */}
                    <div className="border border-border rounded-xl bg-card overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · Miller Knoll</span>
                            <span className="ml-auto text-[10px] text-muted-foreground">May 6 · 8:14 AM</span>
                        </div>
                        <div className="p-3.5 space-y-2">
                            {[
                                { label: 'From',    value: 'Robert Chen · Miller Knoll Rep' },
                                { label: 'To',      value: 'Lauren DeMarco · BFI Furniture' },
                                { label: 'Subject', value: 'Quote request · DOE-2847 · NYC Dept. of Education' },
                            ].map(f => (
                                <div key={f.label} className="flex items-start gap-3 text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-muted-foreground w-14 shrink-0 pt-0.5">{f.label}:</span>
                                    <span className="text-foreground font-medium">{f.value}</span>
                                </div>
                            ))}
                            {/* Attachments */}
                            <div className="pt-1 space-y-1.5">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Attachments</div>
                                {[
                                    { name: 'NYC-DOE-2847-specs.pdf', color: 'text-muted-foreground' },
                                    { name: 'DOE-2847.sif', color: 'text-ai' },
                                ].map(a => (
                                    <div key={a.name} className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
                                        <FileText className={`h-3.5 w-3.5 shrink-0 ${a.color}`} />
                                        <span className={`text-[11px] font-medium ${a.color}`}>{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Strata AI ingestion */}
                    <div className="bg-ai/5 border border-ai/20 rounded-xl px-3.5 py-3 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-3.5 w-3.5 border-2 border-ai border-t-transparent rounded-full animate-spin shrink-0" />
                            <span className="text-[11px] font-bold text-foreground">Strata AI · parsing attachments…</span>
                        </div>
                        {INGEST_LINES.slice(0, ingestCount).map((line, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground animate-in fade-in duration-300">
                                <line.icon className="h-3 w-3 text-success shrink-0" />
                                <span>{line.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA — appears after all lines ingested */}
                    {ingestCount >= INGEST_LINES.length && (
                        <button
                            onClick={() => setSceneState('monitoring')}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm animate-in fade-in duration-300"
                        >
                            <Sparkles className="h-4 w-4" />
                            Review in queue →
                        </button>
                    )}
                </div>
            )}

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

            {/* Before Strata */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lauren managed all CoNY orders through individual emails — no priority view, no system tracking. CPR discrepancies weren't flagged until she manually compared documents line by line.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
