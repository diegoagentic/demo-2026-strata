/**
 * COMPONENT: CoNYMorningQueue
 * PURPOSE: Flow 1 · Scene 1 — AI triage of active CoNY orders.
 *          4 orders sorted by urgency. DOE-2847 (CPR pending) is top priority.
 *          Clicking the order row triggers the transition to Pricing Validation.
 *
 * TRANSITION PATTERN (Dupler/Leland):
 *   The semantic action is clicking the order row or its CTA — NOT a "Next" button.
 *   The row click IS the navigation trigger (side effect: nextStep via onSelectOrder).
 *
 * DS TOKENS: bg-card · bg-ai/5 · text-success · border-amber-*
 */

import { useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle2, Package, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'

interface CoNYMorningQueueProps {
    onSelectOrder?: () => void
}

const ORDERS = [
    {
        id: 'DOE-2847',
        agency: 'NYC Dept. of Education',
        value: '$48,200',
        status: 'cpr-pending',
        statusLabel: 'CPR · 2 discrepancies detected',
        priority: 'high',
        cta: 'Review pricing →',
        detail: 'Carpenters: 50h → 45h · OT: 8h → 6h · Impact: -$2,340',
    },
    {
        id: 'NYPD-0394',
        agency: 'NYPD Precinct 40',
        value: '$31,750',
        status: 'pricing',
        statusLabel: 'Pricing · validation in progress',
        priority: 'medium',
        cta: 'View validation →',
        detail: null,
    },
    {
        id: 'DCAS-1182',
        agency: 'NYC DCAS',
        value: '$127,400',
        status: 'receiving',
        statusLabel: 'Receiving · 18 days in WIG · 12 days remaining',
        priority: 'medium',
        cta: 'View receiving →',
        detail: null,
    },
    {
        id: 'DOH-0671',
        agency: 'NYC Dept. of Health',
        value: '$22,100',
        status: 'ready',
        statusLabel: 'Fee verified · ready to invoice',
        priority: 'done',
        cta: 'View summary →',
        detail: null,
    },
]

export default function CoNYMorningQueue({ onSelectOrder }: CoNYMorningQueueProps) {
    const { nextStep } = useDemo()
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleOrderClick = (orderId: string) => {
        if (orderId === 'DOE-2847') {
            setExpandedId(orderId)
            // Brief reveal beat before advancing — mirrors Leland's handleApprove pattern
            setTimeout(() => {
                onSelectOrder?.()
                nextStep()
            }, 900)
        }
    }

    return (
        <div className="space-y-3">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">Agency Fee · CoNY Order Queue</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata ranked active orders by priority. DOE-2847 requires action: CPR discrepancy detected.
                    </div>
                </div>
            </div>

            {/* Orders */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {ORDERS.map((order) => (
                    <OrderRow
                        key={order.id}
                        order={order}
                        expanded={expandedId === order.id}
                        onClick={() => handleOrderClick(order.id)}
                    />
                ))}
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · 1 requires immediate action
            </p>
        </div>
    )
}

function OrderRow({ order, expanded, onClick }: {
    order: typeof ORDERS[number]
    expanded: boolean
    onClick: () => void
}) {
    const isHighPriority = order.priority === 'high'
    const isDone = order.priority === 'done'

    return (
        <div
            className={`p-3.5 transition-all duration-300 ${
                isHighPriority
                    ? 'bg-amber-50 dark:bg-amber-500/5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/10'
                    : isDone
                    ? 'bg-card opacity-70'
                    : 'bg-card cursor-default'
            }`}
            onClick={isHighPriority ? onClick : undefined}
        >
            <div className="flex items-start gap-3">
                {/* Priority indicator */}
                <div className="shrink-0 mt-0.5">
                    {isHighPriority && (
                        <div className="relative">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-ai animate-pulse" />
                        </div>
                    )}
                    {isDone && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {!isHighPriority && !isDone && <Package className="h-4 w-4 text-muted-foreground" />}
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

                    <div className={`text-[11px] mt-0.5 ${
                        isHighPriority ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : isDone ? 'text-success font-medium'
                        : 'text-muted-foreground'
                    }`}>
                        {order.statusLabel}
                    </div>

                    {/* Expanded detail (DOE-2847 only) */}
                    {expanded && order.detail && (
                        <div className="mt-2 text-[11px] text-foreground bg-amber-100 dark:bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-200 dark:border-amber-500/20 animate-in fade-in slide-in-from-top-1 duration-300">
                            {order.detail}
                        </div>
                    )}
                </div>

                {/* CTA arrow — only on actionable rows */}
                {isHighPriority && !expanded && (
                    <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
            </div>
        </div>
    )
}
