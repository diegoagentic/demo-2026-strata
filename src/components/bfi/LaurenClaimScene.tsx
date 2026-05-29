/**
 * COMPONENT: LaurenClaimScene (a1.2e)
 * PURPOSE: Lauren receives Lena's missing-carton notification, reviews the order
 *          + missing item, attaches proof of shipment, and sends a claim to Herman Miller.
 *
 * FLOW:
 *   dashboard → notification from Lena slides in → click → review order + missing item
 *   → attach proof → compose claim dialog → send → nextStep()
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    AlertTriangle, FileText, Mail,
    Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'
import BFIDashboardScene from './BFIDashboardScene'
import RequestInfoDialog from '../shared/RequestInfoDialog'

const LAUREN_NOTIFICATION = {
    title: 'DOE-2847 · Carton #34 missing · Receiving complete',
    desc: 'Lena C. · 34/35 cartons received · carton #34 missing · CORE updated',
    cta: 'Review report & file claim →',
}

// ─── Claim message template ───────────────────────────────────────────────────

const CLAIM_MESSAGE = `Hi Herman Miller team,

We are filing a missing carton claim for HM Sales Order #GD2574 (PO DOE-2847 · CoNY · NYC Dept. of Education), delivered to WIG Group NJ Warehouse on May 11, 2026.

Shipment summary:
  · Cartons received: 34 of 35
  · Missing item: Monitor Arm Dual Adjustable · carton #34

Please review the attached receiving report (RR-37577) and confirm receipt of this claim. We request a replacement unit within 5 business days.

— Lauren DeMarco
  BFI Furniture · CoNY Account Manager
  lauren.demarco@bfifurniture.com`

// ─── Order Detail Card ────────────────────────────────────────────────────────

function OrderDetailCard({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
    const LINES = [
        { abbr: 'FU-2',  desc: 'Filing Unit Lateral 2-Drawer 36"',  qty: 8,  status: 'ok' },
        { abbr: 'FU-4',  desc: 'Filing Unit Vertical 4-Drawer 26"', qty: 4,  status: 'ok' },
        { abbr: 'WS-60', desc: 'Work Surface 60" × 30"',            qty: 6,  status: 'ok' },
        { abbr: 'WS-72', desc: 'Work Surface 72" × 30"',            qty: 4,  status: 'ok' },
        { abbr: 'SC',    desc: 'Storage Cabinet Overhead 72"',       qty: 3,  status: 'ok' },
        { abbr: 'CHAIR', desc: 'Ergonomic Chair · Aeron B · HM',    qty: 8,  status: 'ok' },
        { abbr: 'M-ARM', desc: 'Monitor Arm Dual Adjustable',        qty: 2,  status: 'missing' },
    ]

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/30 transition-colors"
            >
                <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                    <div className="text-[11px] font-bold text-foreground">DOE-2847</div>
                    <div className="text-[9px] text-muted-foreground">NYC Dept. of Education · 35 cartons · 1 carton missing</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        1 missing
                    </span>
                    {expanded
                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    }
                </div>
            </button>

            {expanded && (
                <div className="border-t border-border px-3.5 py-3 space-y-1 animate-in fade-in duration-200">
                    <div className="grid grid-cols-[2.5rem_1fr_2rem_4rem] gap-1 pb-1 border-b border-border/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                        <span>Ref</span><span>Description</span><span className="text-right">Qty</span><span className="text-right">Status</span>
                    </div>
                    {LINES.map(l => (
                        <div key={l.abbr} className={`grid grid-cols-[2.5rem_1fr_2rem_4rem] gap-1 py-0.5 text-[10px] ${l.status === 'missing' ? 'font-bold text-destructive' : 'text-foreground'}`}>
                            <span className={`text-[8px] font-bold px-1 rounded text-center self-center ${l.status === 'missing' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                                {l.abbr}
                            </span>
                            <span className="truncate self-center">{l.desc}</span>
                            <span className="text-right self-center">{l.qty}</span>
                            <span className={`text-right self-center text-[9px] font-bold ${l.status === 'missing' ? 'text-destructive' : 'text-success'}`}>
                                {l.status === 'missing' ? '✗ missing' : '✓ rcv\'d'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function LaurenClaimScene() {
    const { nextStep, isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [phase,         setPhase]         = useState<'dashboard' | 'detail'>('dashboard')

    useEffect(() => {
        const handler = () => setPhase('detail')
        window.addEventListener('bfi:claim-open', handler)
        return () => window.removeEventListener('bfi:claim-open', handler)
    }, [])

    const [orderExpanded, setOrderExpanded] = useState(true)
    const [showClaim,      setShowClaim]      = useState(false)

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                staticMode
                onNavigate={() => setPhase('detail')}
            />
        )
    }

    return (
        <div className="space-y-3">

            {/* ── Notification header from Lena ── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/30 border-b border-border">
                    <div className="h-6 w-6 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-foreground">DOE-2847 · Carton #34 Missing · Receiving complete</div>
                        <div className="text-[9px] text-muted-foreground">From: lena.c@bfifurniture.com · May 11 · 8:42 AM</div>
                    </div>
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
                <div className="px-4 py-3 space-y-1.5 text-[11px] text-foreground leading-relaxed">
                    <p>Hi Lauren,</p>
                    <p>Received DOE-2847 at WIG — <span className="font-semibold">34 of 35 cartons received.</span></p>
                    <p className="text-destructive font-medium">
                        Monitor Arm Dual Adjustable · carton #34 is missing.
                    </p>
                    <p className="text-muted-foreground text-[10px]">— Lena C. · Receiving Coordinator</p>
                </div>
            </div>

            {/* ── 2-column: Receiving Report | Order Detail + Proof + CTA ── */}
            <div className="grid grid-cols-2 gap-3">

                {/* Left: Receiving Report document */}
                <div className="border border-border rounded-xl bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border bg-muted/30">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Receiving Report · RR-37577</span>
                    </div>
                    <div className="p-3 space-y-3">
                        <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={200} extractedFields={[]} />
                        {/* Bingo grid */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-7 gap-0.5">
                                {Array.from({ length: 35 }, (_, i) => i + 1).map(n => {
                                    const missing = n === 34
                                    return (
                                        <div key={n} className={`flex items-center justify-center rounded p-1 text-center min-h-[28px] ${
                                            missing ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/5 border border-success/20'
                                        }`}>
                                            <span className={`text-[9px] font-bold leading-tight ${missing ? 'text-destructive' : 'text-muted-foreground/70'}`}>
                                                {missing ? '✗' : `#${n}`}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-2.5 py-2 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                <span className="text-[10px] font-bold text-foreground">Monitor Arm Dual Adjustable · carton #34 is missing</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order detail + CTA */}
                <div className="space-y-3 flex flex-col">
                    <OrderDetailCard expanded={orderExpanded} onToggle={() => setOrderExpanded(v => !v)} />
                    <button
                        onClick={() => setShowClaim(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-destructive text-white hover:opacity-90 transition-all shadow-sm mt-auto"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Claim →
                    </button>
                </div>
            </div>

            <RequestInfoDialog
                isOpen={showClaim}
                onSent={() => { setShowClaim(false); pauseAware(() => nextStep())() }}
                onClose={() => setShowClaim(false)}
                headerAvatar="HM"
                headerLabel="Herman Miller · Customer Service"
                headerSubtitle="claims@hermanmiller.com · Missing Carton Claim"
                defaults={{
                    from: 'lauren.demarco@bfifurniture.com',
                    to: 'claims@hermanmiller.com',
                    cc: 'walter.goley@conyny.gov · CoNY PM',
                    date: 'May 11, 2026 · 9:05 AM',
                    subject: 'Missing Carton - SO #GD2574 - Monitor Arm',
                    message: CLAIM_MESSAGE,
                    attachments: [{ name: 'RR-37577_BingoSheet_May11.pdf', meta: '2 pages' }],
                    alertTitle: 'Missing Item',
                    alertRows: [
                        { label: 'HM SO',    value: '#GD2574' },
                        { label: 'Order',    value: 'DOE-2847' },
                        { label: 'Item',     value: 'Monitor Arm Dual Adjustable' },
                        { label: 'PO line',  value: 'L7 · 1 of 2 units' },
                        { label: 'Carton',   value: '#34 of 35 · Storage Room' },
                    ],
                    successTitle: 'Claim sent to Herman Miller · May 11 · 9:05 AM',
                    successSubtitle: 'Receiving report attached · Awaiting replacement unit',
                }}
                footer={<DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
