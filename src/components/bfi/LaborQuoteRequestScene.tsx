/**
 * COMPONENT: LaborQuoteRequestScene  (a1.2b2)
 * PURPOSE: After Quote Tool approval, Lauren sends a labor quote request
 *          to WIG (Workplace Installation Group). Michael Boyle compiles
 *          the labor figures and returns the quote. Two phases in one step:
 *          (1) Lauren's outgoing email → (2) WIG response with labor figures.
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, FileText, ArrowLeft, Mail, CheckCircle2, Clock, User } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface LaborQuoteRequestSceneProps {
    onContinue?: () => void
}

const SCOPE_LINES = [
    { code: 'HMI-FU-300',  desc: 'Filing Unit',           qty: '×6'  },
    { code: 'HMI-WS-2400', desc: 'Ethospace Workstation', qty: '×24' },
    { code: 'HMI-LS-500',  desc: 'Aeron Seating',         qty: '×12' },
]

const LABOR_LINES = [
    { role: 'Teamsters',    hours: 24, rate: '$145/h',  subtotal: '$3,480' },
    { role: 'Carpenters',   hours: 50, rate: '$95/h',   subtotal: '$4,750' },
    { role: 'Overtime (OT)',hours: 8,  rate: '$129/h',  subtotal: '$1,032' },
]

export default function LaborQuoteRequestScene({ onContinue }: LaborQuoteRequestSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const [phase, setPhase] = useState<'draft' | 'sent' | 'received'>('draft')

    const handleSend = () => {
        setPhase('sent')
        setTimeout(pauseAware(() => setPhase('received')), 1400)
    }

    return (
        <div className="space-y-4">

            {/* ── Lauren's outgoing email ── */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
                {/* Email client header bar */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                    <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-black text-foreground">LD</span>
                        </div>
                        <div className="min-w-0">
                            <div className="text-[11px] font-bold text-foreground leading-none truncate">Lauren DeMarco</div>
                            <div className="text-[9px] text-muted-foreground leading-none mt-0.5">BFI Account Manager</div>
                        </div>
                    </div>
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {phase !== 'draft' && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Sent
                        </span>
                    )}
                </div>

                {/* Email metadata */}
                <div className="px-4 pt-3.5 pb-3 border-b border-border/60 space-y-1">
                    <div className="text-[13px] font-bold text-foreground leading-snug">
                        Labor Quote Request · DOE-2847 · NYC Dept. of Education
                    </div>
                    <div className="space-y-0.5">
                        {[
                            { label: 'From', value: 'lauren.demarco@bfifurniture.com' },
                            { label: 'To',   value: 'm.weller@wiginstall.com (WIG Installation)' },
                            { label: 'Date', value: 'May 6, 2026 · 2:47 PM' },
                        ].map(r => (
                            <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                <span className="text-foreground font-medium truncate">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email body */}
                <div className="px-4 py-4 space-y-3">
                    <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                        <p>Hi Michael,</p>
                        <p>
                            Please provide a labor quote for the following installation at{' '}
                            <span className="font-semibold">30 Court Street, Brooklyn, NY 11201</span>{' '}
                            (NYC Dept. of Education · Order DOE-2847).
                        </p>
                        <p>
                            Pricing has been validated through Quote Tool against CoNY Contract ANT122.
                            Please quote for crew and installation scope below:
                        </p>
                    </div>

                    {/* Scope table */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        <div className="px-3 py-2 bg-muted/40 border-b border-border">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Installation Scope · DOE-2847</p>
                        </div>
                        {SCOPE_LINES.map(l => (
                            <div key={l.code} className="flex items-center gap-3 px-3 py-2 border-b border-border/40 last:border-0">
                                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="text-[10px] font-mono text-muted-foreground">{l.code}</span>
                                <span className="text-[10px] font-medium text-foreground flex-1">{l.desc}</span>
                                <span className="text-[10px] font-mono text-foreground">{l.qty}</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-[12px] text-foreground leading-relaxed space-y-1">
                        <p>
                            Please include crew availability and confirm delivery window.
                            Quote needed ASAP to proceed with the NYC DOE purchase order.
                        </p>
                        <p className="text-muted-foreground">
                            — Lauren DeMarco<br />
                            BFI Furniture · Account Manager
                        </p>
                    </div>
                </div>

                {/* Send CTA */}
                {phase === 'draft' && (
                    <div className="px-4 py-3 border-t border-border bg-card">
                        <button
                            onClick={handleSend}
                            className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                        >
                            <Send className="h-3.5 w-3.5" />
                            Send Request to WIG →
                        </button>
                    </div>
                )}
            </div>

            {/* ── WIG Response (appears after send) ── */}
            {phase === 'sent' && (
                <div className="rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm opacity-60 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
                        <span className="text-[11px] text-muted-foreground font-medium">Waiting for WIG response…</span>
                    </div>
                </div>
            )}

            {phase === 'received' && (
                <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {/* Response header */}
                    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-success/5">
                        <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                                <User className="h-3.5 w-3.5 text-success" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold text-foreground leading-none truncate">Michael Boyle</div>
                                <div className="text-[9px] text-muted-foreground leading-none mt-0.5">WIG Installation · Lead Estimator</div>
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full shrink-0">
                            Labor Quote Received
                        </span>
                    </div>

                    {/* Response metadata */}
                    <div className="px-4 pt-3.5 pb-3 border-b border-border/60 space-y-1">
                        <div className="text-[13px] font-bold text-foreground leading-snug">
                            RE: Labor Quote Request · DOE-2847
                        </div>
                        <div className="space-y-0.5">
                            {[
                                { label: 'From', value: 'm.weller@wiginstall.com' },
                                { label: 'To',   value: 'lauren.demarco@bfifurniture.com' },
                                { label: 'Date', value: 'May 6, 2026 · 3:15 PM' },
                            ].map(r => (
                                <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                    <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                    <span className="text-foreground font-medium truncate">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Response body */}
                    <div className="px-4 py-4 space-y-3">
                        <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                            <p>Hi Lauren,</p>
                            <p>
                                Labor quote compiled for{' '}
                                <span className="font-semibold">DOE-2847</span> — 30 Court Street installation.
                                Scope reviewed, crew availability confirmed for the delivery window.
                            </p>
                        </div>

                        {/* Labor figures table */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Labor Quote · DOE-2847</p>
                                <span className="text-[9px] font-bold text-muted-foreground">Ref: WIG-2026-0412</span>
                            </div>
                            <div className="grid grid-cols-[1fr_3.5rem_4rem_5rem] px-3 py-1.5 bg-muted/20 border-b border-border/50">
                                {['Role', 'Hours', 'Rate', 'Subtotal'].map(h => (
                                    <span key={h} className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide text-right first:text-left">{h}</span>
                                ))}
                            </div>
                            {LABOR_LINES.map(l => (
                                <div key={l.role} className="grid grid-cols-[1fr_3.5rem_4rem_5rem] px-3 py-2.5 border-b border-border/30 last:border-0 items-center">
                                    <span className="text-[10px] font-medium text-foreground">{l.role}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground text-right">{l.hours}h</span>
                                    <span className="text-[10px] font-mono text-muted-foreground text-right">{l.rate}</span>
                                    <span className="text-[10px] font-mono font-semibold text-foreground text-right">{l.subtotal}</span>
                                </div>
                            ))}
                            <div className="px-3 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total Labor Quote</span>
                                <span className="text-[13px] font-black font-mono text-foreground">$9,262</span>
                            </div>
                        </div>

                        <div className="text-[12px] text-foreground leading-relaxed space-y-1">
                            <p>
                                Delivery window: <span className="font-semibold">May 14–21, 2026</span>.
                                Please confirm and we will schedule the crew.
                            </p>
                            <p className="text-muted-foreground">
                                — Michael Boyle<br />
                                WIG Installation · Lead Estimator
                            </p>
                        </div>

                        <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                    </div>

                    {/* Continue CTA */}
                    <div className="px-4 py-3 border-t border-border bg-card">
                        <button
                            onClick={() => onContinue?.()}
                            className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Labor Quote Received · Continue to CORE Entry →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
