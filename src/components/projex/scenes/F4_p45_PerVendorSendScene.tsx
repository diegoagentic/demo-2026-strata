/**
 * COMPONENT: F4_p45_PerVendorSendScene (Projex · p4.5)
 * PURPOSE: Isabella opens SubmitPODialog per PO · sends Teknion primero · HBF hold ·
 *          per-vendor control. Banner "Never auto-send" visible. Cada release
 *          intentional (SOT §12b · FC6 fix).
 *
 * SHAPE · per-vendor strip + SubmitPODialog per row (F4 primary shape)
 * REUSE · UI-Dealer/po-conversion/SubmitPODialog + FinalizePOButton (lifted)
 * NOTIF · dispatchea `projex:po-sent` per release
 */

import { useState } from 'react'
import {
    Send, CheckCircle2, Loader2, AlertTriangle, ArrowRight,
    Clock, ShieldAlert, Sparkles, Play, User,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { MWH_PO_BATCH } from '../../../config/profiles/projex-data/mwhPif'

const VENDOR_AVATAR: Record<string, { bg: string; text: string }> = {
    TEK: { bg: 'bg-primary/25',    text: 'text-foreground' },
    HBF: { bg: 'bg-info/15',       text: 'text-info' },
    BDG: { bg: 'bg-ai/15',         text: 'text-ai' },
    ALA: { bg: 'bg-success/15',    text: 'text-success' },
    NLC: { bg: 'bg-warning/15',    text: 'text-warning' },
    WEL: { bg: 'bg-muted',         text: 'text-muted-foreground' },
}

export default function F4_p45_PerVendorSendScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    const [sentIds, setSentIds] = useState<Set<string>>(new Set())
    const [heldIds, setHeldIds] = useState<Set<string>>(new Set())
    const [sendingId, setSendingId] = useState<string | null>(null)

    // Group by vendor for display
    const byVendor = MWH_PO_BATCH.reduce((acc, po) => {
        if (!acc[po.vendorCode]) acc[po.vendorCode] = []
        acc[po.vendorCode].push(po)
        return acc
    }, {} as Record<string, typeof MWH_PO_BATCH>)

    const handleSend = (poNumber: string) => {
        if (sendingId) return
        setSendingId(poNumber)
        pauseAwareTimeout(() => {
            setSentIds(prev => new Set([...prev, poNumber]))
            setSendingId(null)
            window.dispatchEvent(new CustomEvent('projex:po-sent'))
        }, 900)
    }

    const handleHold = (poNumber: string) => {
        setHeldIds(prev => {
            const next = new Set(prev)
            if (next.has(poNumber)) next.delete(poNumber)
            else next.add(poNumber)
            return next
        })
    }

    const sentCount = sentIds.size
    const heldCount = heldIds.size
    const remainingCount = MWH_PO_BATCH.length - sentCount - heldCount

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
        { sources: [PROJEX_SOURCES.TEKNION_ONLINE, PROJEX_SOURCES.VENDOR_PORTAL_HBF] },
        { sources: [PROJEX_SOURCES.AP_INBOX_PJX] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                    <span>Order &amp; PO dispatch · step 5</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> {isabella.role}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-destructive/10 text-destructive font-semibold rounded-md px-1.5 py-0.5">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" /> Never auto-send
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Per-vendor Send · Isabella releases Teknion primero · never one-batch
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    SubmitPODialog per PO · Teknion (SIF fast) primero · HBF hold para tomorrow · Boss review before send. FC6 human control preserved.
                </p>
            </div>

            {/* Banner · never auto */}
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Banner · Never auto-send (FC6 fix)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Isabella never trusts auto-send (SOT §12b). Every PO release is intentional act · SubmitPODialog gate per vendor. Isabella controls delivery timing per vendor SLA.
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-semibold text-foreground tabular-nums">{sentCount} / {MWH_PO_BATCH.length}</div>
                    <div className="text-[10px] text-muted-foreground">Sent</div>
                </div>
            </div>

            {/* Per-vendor strips */}
            <div className="space-y-3">
                {Object.entries(byVendor).map(([vendorCode, pos]) => {
                    const avatar = VENDOR_AVATAR[vendorCode]
                    const vendorName = pos[0].vendorName
                    const vendorTotal = pos.reduce((s, p) => s + p.amount, 0)
                    return (
                        <div key={vendorCode} className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full ${avatar.bg} flex items-center justify-center shrink-0`}>
                                    <span className={`text-[10px] font-black ${avatar.text}`}>{vendorCode}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground">{vendorName}</div>
                                    <div className="text-[10px] text-muted-foreground">{pos.length} PO{pos.length === 1 ? '' : 's'} · {pos[0].method}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-semibold text-foreground tabular-nums">${vendorTotal.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {pos.map(po => {
                                    const isSent = sentIds.has(po.poNumber)
                                    const isHeld = heldIds.has(po.poNumber)
                                    const isSending = sendingId === po.poNumber
                                    return (
                                        <div key={po.poNumber} className="px-4 py-2 flex items-center gap-3 text-xs">
                                            <span className="text-foreground font-mono truncate w-[140px]">{po.poNumber}</span>
                                            <span className="text-muted-foreground truncate flex-1">{po.lineCount} lines · ${po.amount.toLocaleString()}</span>
                                            {isSent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-2 py-1">
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    Sent
                                                </span>
                                            )}
                                            {isHeld && !isSent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-2 py-1">
                                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                                    Held
                                                </span>
                                            )}
                                            {isSending && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ai animate-pulse">
                                                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                                    Sending…
                                                </span>
                                            )}
                                            {!isSent && !isSending && (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleHold(po.poNumber)}
                                                        className={`text-[10px] font-semibold border rounded px-2 py-1 transition-colors ${
                                                            isHeld
                                                                ? 'border-warning/40 text-warning bg-warning/10'
                                                                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                                        }`}
                                                    >
                                                        {isHeld ? 'Unhold' : 'Hold'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSend(po.poNumber)}
                                                        disabled={isHeld}
                                                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-2 py-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                                    >
                                                        <Play className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Send
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* KPI summary + advance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-success/40 bg-success/5 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{sentCount}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Sent</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{heldCount}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Held</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">{remainingCount}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Pending review</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-ai shrink-0" aria-hidden="true" />
                    <div>
                        <div className="text-lg font-semibold text-foreground leading-none">100%</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Human intent per PO</div>
                    </div>
                </div>
            </div>

            {sentCount > 0 && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">{sentCount} POs released</span>
                        <span className="text-muted-foreground"> · Teknion via SIF Online · rest via email/portal per delivery. Snapshot tri-way match available en next step.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open snapshot audit
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            <DataSourcesBar groups={dataGroups} label="Per-vendor Send · SubmitPODialog per PO · NetSuite dispatch" />
        </div>
    )
}
