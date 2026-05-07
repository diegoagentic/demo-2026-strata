/**
 * COMPONENT: WIGDocParserScene
 * PURPOSE: Flow 2 · Scene 3 — WIG Receiving Report + HM Bingo Sheet parsed.
 *          Role: Lena (Receiving Coordinator). Strata maps each Bingo # to
 *          its CORE line, detects Bingo #36 missing (FedEx sub-path).
 *          Lena confirms receipt in CORE with one click.
 *
 * DS TOKENS: bg-card · bg-success/5 · bg-amber-50 · border-border
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, FileText, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WIGDocParserSceneProps {
    onConfirm?: () => void
    onRoleChange?: (role: string) => void
}

const BINGO_RANGES = [
    { range: '1 – 8',   product: 'Lounge Chair ×8',  status: 'received' as const },
    { range: '9 – 20',  product: 'Work Table ×12',    status: 'received' as const },
    { range: '21 – 24', product: 'Storage Unit ×4',   status: 'received' as const },
    { range: '25 – 35', product: 'Side Chair ×11',    status: 'received' as const },
    { range: '36',      product: 'Side Chair ×1',     status: 'missing' as const  },
]

const LINE_ITEMS = [
    { line: 'L1', product: 'Lounge Chair',    ordered: 8,  received: 8,  gap: false },
    { line: 'L2', product: 'Work Table 60×30', ordered: 12, received: 12, gap: false },
    { line: 'L3', product: 'Storage Unit',    ordered: 4,  received: 4,  gap: false },
    { line: 'L4', product: 'Side Chair',      ordered: 12, received: 11, gap: true  },
]

export default function WIGDocParserScene({ onConfirm, onRoleChange }: WIGDocParserSceneProps) {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [confirmed, setConfirmed] = useState(false)
    const [showRaw, setShowRaw] = useState(false)

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleConfirm = () => {
        setConfirmed(true)
        setTimeout(pauseAware(() => {
            onConfirm?.()
            nextStep()
        }), 800)
    }

    return (
        <div className="space-y-4">
            {/* Context banner */}
            <div className="bg-ai/5 dark:bg-ai/10 border border-ai/30 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div className="text-xs flex-1">
                    <div className="font-bold text-foreground">WIG Doc Parser · DOH-0671</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        Strata parsed the WIG Receiving Report and HM Packing List — mapping each Bingo # to its CORE order line. Bingo #36 unconfirmed → FedEx sub-path flagged.
                    </div>
                </div>
            </div>

            {/* Receiving Report header */}
            <div className="border border-border rounded-xl p-3.5 bg-card">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">WIG Receiving Report · RR-38821</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div><span className="text-muted-foreground">Date: </span><span className="text-foreground">May 6, 2026</span></div>
                    <div><span className="text-muted-foreground">Dealer: </span><span className="text-foreground">BFI Furniture</span></div>
                    <div><span className="text-muted-foreground">Client: </span><span className="text-foreground">NYC Dept. of Health</span></div>
                    <div><span className="text-muted-foreground">PO: </span><span className="text-foreground">18091-29443</span></div>
                    <div><span className="text-muted-foreground">Order: </span><span className="text-foreground">GD2891</span></div>
                    <div><span className="text-muted-foreground">Received: </span><span className="text-foreground font-medium">36 cartons</span></div>
                </div>
            </div>

            {/* Raw doc toggle — before/after */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <button
                    onClick={() => setShowRaw(v => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-muted-foreground">
                            {showRaw ? 'WIG Word Doc · raw (before Strata)' : 'WIG Word Doc · show raw document'}
                        </span>
                    </div>
                    {showRaw
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </button>
                {showRaw && (
                    <div className="px-3.5 pb-3 pt-0 border-t border-border animate-in fade-in duration-200 space-y-2">
                        <div className="text-[10px] text-muted-foreground pt-2">
                            WIG_ReceivingReport_DOH0671_May6.docx — received via email
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg px-3 py-2.5">
{`WIG RECEIVING REPORT
Date: 05/06/2026
Customer: BFI Furniture
Job: NYC DOH - 14 W 31st St

RR#: RR-38821    Carrier: ALTL
Cartons rcv'd: 36    Damage: None

[packing slips attached - pages 2-7]
See attached for bingo numbers and
item detail. Missing noted: carton 36
shipped separately via FedEx per MK.`}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            Before Strata: Lena re-enters every line manually in CORE — up to 7 days, no SLA
                        </div>
                    </div>
                )}
            </div>

            {/* Bingo sheet */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-border bg-muted/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Bingo Sheet · GD2891</span>
                    <span className="text-[11px] text-muted-foreground">35/36 confirmed</span>
                </div>
                {BINGO_RANGES.map((row) => (
                    <div
                        key={row.range}
                        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0 ${
                            row.status === 'missing'
                                ? 'bg-amber-50 dark:bg-amber-500/5'
                                : ''
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {row.status === 'received'
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                                : <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            }
                            <div>
                                <span className="text-xs font-bold text-foreground">Bingo #{row.range}</span>
                                <span className="text-[11px] text-muted-foreground ml-2">{row.product}</span>
                            </div>
                        </div>
                        <div className={`text-[11px] font-medium ${
                            row.status === 'received'
                                ? 'text-success'
                                : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            {row.status === 'received' ? 'Received' : 'Missing — FedEx small parcel'}
                        </div>
                    </div>
                ))}
            </div>

            {/* CORE line matching */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-3.5 py-2 border-b border-border bg-muted/40">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">CORE Line Matching</span>
                </div>
                <div className="grid grid-cols-4 gap-2 px-3.5 py-1.5 border-b border-border bg-muted/20">
                    {['Line', 'Product', 'Ordered', 'Received'].map(h => (
                        <div key={h} className="text-[10px] font-bold text-muted-foreground text-right first:text-left">{h}</div>
                    ))}
                </div>
                {LINE_ITEMS.map((item) => (
                    <div key={item.line} className={`grid grid-cols-4 gap-2 px-3.5 py-2.5 border-b border-border last:border-b-0 items-center ${
                        item.gap ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                    }`}>
                        <div className="text-[11px] font-bold text-muted-foreground">{item.line}</div>
                        <div className="text-xs text-foreground">{item.product}</div>
                        <div className="text-xs text-foreground text-right tabular-nums">{item.ordered}</div>
                        <div className={`text-xs font-medium text-right tabular-nums flex items-center justify-end gap-1 ${
                            item.gap ? 'text-amber-600 dark:text-amber-400' : 'text-success'
                        }`}>
                            {item.gap && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {item.received}
                            {item.gap && <span className="text-[10px] font-normal"> via FedEx</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action */}
            {!confirmed ? (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                    >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Flag damage
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 transition-all shadow-sm"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Confirm receipt in CORE
                    </button>
                </div>
            ) : (
                <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-foreground">35 items confirmed in CORE · DOH-0671</div>
                        <div className="text-muted-foreground mt-0.5">L4 marked partial · Bingo #36 → FedEx tracking pending · Lauren notified</div>
                    </div>
                </div>
            )}

            <DataSourcesBar groups={[
                { sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] },
            ]} />
        </div>
    )
}
