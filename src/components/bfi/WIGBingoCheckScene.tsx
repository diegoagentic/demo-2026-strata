/**
 * COMPONENT: WIGBingoCheckScene  (r1.2)
 * PURPOSE: Product Receiving step 1 — starts with Operations Dashboard overview.
 *          After 2s a "WIG document received" notification slides in.
 *          Click → 'checking' phase: 3 moments (email, CORE state, bingo sheet) + AI CTA.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Mail, Sparkles, Package, ChevronDown, ChevronUp, AlertTriangle, MessageSquare, Send, X, CheckCircle2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import BFIDashboardScene from './BFIDashboardScene'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'

interface NotificationConfig {
    title: string
    desc: string
    cta: string
}

interface WIGBingoCheckSceneProps {
    onAnalyze?: () => void
    notificationConfig?: NotificationConfig
}

// Generate bingo grid: 1-35, carton 34 is missing
const CARTONS = Array.from({ length: 35 }, (_, i) => i + 1)

const DEFAULT_NOTIFICATION: NotificationConfig = {
    title: 'WIG document received',
    desc: 'PMO-2026-0412 · Bingo Sheet · 35 cartons · ready for AI analysis',
    cta: 'Review bingo sheet →',
}

export default function WIGBingoCheckScene({ onAnalyze, notificationConfig }: WIGBingoCheckSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase] = useState<'dashboard' | 'checking'>('dashboard')
    const [clicked, setClicked] = useState(false)
    const [coreExpanded, setCoreExpanded] = useState(false)
    const [bingoExpanded, setBingoExpanded] = useState(true)
    const [contactOpen, setContactOpen] = useState(false)
    const [contactSent, setContactSent] = useState(false)
    const [contactNote, setContactNote] = useState('')

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleAnalyze = () => {
        setClicked(true)
        setTimeout(pauseAware(() => onAnalyze?.()), 300)
    }

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                notificationConfig={notificationConfig ?? DEFAULT_NOTIFICATION}
                onNavigate={() => setPhase('checking')}
            />
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <ReceivingProcessBar stepId="r1.2" />

            {/* Moment 1 — Incoming email from WIG */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · WIG Receiving Report</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">May 11 · 8:06 AM</span>
                </div>
                <div className="p-3.5 space-y-2.5">
                    <div className="text-[11px] text-muted-foreground">From: warehouse@wiggroup.com</div>
                    <div className="text-xs text-foreground font-medium">PMO-2026-0412 · Vendor Order #17706 · Receiving Report attached · 35 cartons</div>
                    <div className="border border-border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[11px] text-foreground font-medium">RR-41200_PMO0412_May11.docx</span>
                        </div>
                        <pre className="font-mono text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{`WIG RECEIVING REPORT #RR-41200
Date: 05/11/2026  Carrier: ALTL
Cartons rcv'd: 35  Damage: None
[bingo sheet + packing slips · pages 2-4]
Note: carton 34 not received at dock`}</pre>
                    </div>
                </div>
            </div>

            {/* Moment 2 — CORE current state (Lena's entry — no flag) */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <button
                    onClick={() => setCoreExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] font-bold text-foreground">CORE — current entry (Lena)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded uppercase tracking-wide">No partial flag</span>
                        {coreExpanded
                            ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        }
                    </div>
                </button>
                {coreExpanded && (
                    <div className="border-t border-border animate-in fade-in duration-200">
                        <div className="divide-y divide-border/60">
                            {[
                                { label: 'PMO', value: 'PMO-2026-0412' },
                                { label: 'Vendor Order', value: '#17706' },
                                { label: 'Cartons', value: '35' },
                                { label: 'Status', value: 'RECEIVED ✓' },
                                { label: 'Partial flag', value: '—' },
                                { label: 'Missing alert', value: '—' },
                                { label: 'Short-ship note', value: '—' },
                            ].map(r => (
                                <div key={r.label} className="flex items-center justify-between gap-3 px-3.5 py-2">
                                    <span className="text-[10px] text-muted-foreground">{r.label}</span>
                                    <span className="text-[10px] font-medium text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="px-3.5 py-2.5 border-t border-border/60 bg-muted/20">
                            <p className="text-[9px] text-muted-foreground italic">CORE shows 35 cartons received — no way to tell the order is incomplete from the system alone.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Moment 3 — Bingo Sheet (expandable with mini grid) */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <button
                    onClick={() => setBingoExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-foreground">Bingo Sheet · BD-2026-0412</div>
                            <div className="text-[9px] text-muted-foreground">review required · manual notation detected</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full">ready for AI</span>
                        {bingoExpanded
                            ? <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        }
                    </div>
                </button>
                {bingoExpanded && (
                    <div className="border-t border-border px-3.5 py-3 space-y-2.5 animate-in fade-in duration-200">
                        {/* Actual WIG receiving report PDF — includes bingo sheet page 2 */}
                        <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={380} />

                        {/* Mini bingo grid — 7 columns */}
                        <div className="grid grid-cols-7 gap-1">
                            {CARTONS.map(n => {
                                const isMissing = n === 34
                                return (
                                    <div
                                        key={n}
                                        className={`flex flex-col items-center justify-center rounded p-1 text-center ${
                                            isMissing
                                                ? 'bg-destructive/10 border border-destructive/30'
                                                : 'bg-success/5 border border-success/20'
                                        }`}
                                    >
                                        <span className={`text-[9px] font-bold ${isMissing ? 'text-destructive' : 'text-success'}`}>
                                            {isMissing ? '✗' : '○'}
                                        </span>
                                        <span className={`text-[8px] ${isMissing ? 'text-destructive' : 'text-muted-foreground'}`}>{n}</span>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Manual annotation */}
                        <div className="bg-warning/5 border border-warning/20 rounded-lg px-2.5 py-2">
                            <div className="text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">Carton #34 —</span>{' '}
                                <span className="italic text-amber-600 dark:text-amber-400">"not rcv'd at dock"</span>{' '}
                                (written manually by Workplace)
                            </div>
                        </div>
                        <div className="flex items-start gap-1.5 text-[9px] text-muted-foreground">
                            <AlertTriangle className="h-2.5 w-2.5 text-warning shrink-0 mt-0.5" />
                            The bingo sheet has no "missing" checkbox — Workplace writes manually. This is the only paper record of the discrepancy.
                        </div>
                    </div>
                )}
            </div>

            {/* Contact panel */}
            {contactOpen && !contactSent && (
                <div className="border border-ai/20 rounded-xl bg-ai/5 overflow-hidden animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-ai/10 bg-ai/5">
                        <MessageSquare className="h-3 w-3 text-ai shrink-0" />
                        <span className="text-[10px] font-bold text-ai">Contact — Lauren → Michael Boyle (BFI Receiving)</span>
                        <button onClick={() => setContactOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                    </div>
                    <div className="px-3 py-2 space-y-1 border-b border-ai/10 text-[10px]">
                        <div className="flex gap-2"><span className="text-muted-foreground w-8 shrink-0">To:</span><span className="font-medium text-foreground">Michael Boyle · mboyle@bfifurniture.com</span></div>
                        <div className="flex gap-2"><span className="text-muted-foreground w-8 shrink-0">Re:</span><span className="font-medium text-foreground">PMO-2026-0412 · Carton #34 — inquiry</span></div>
                    </div>
                    <div className="px-3 py-2">
                        <textarea rows={3} value={contactNote} onChange={e => setContactNote(e.target.value)}
                            placeholder="Hi Michael, can you confirm whether Carton #34 was short-shipped or held at origin?..."
                            className="w-full text-[10px] bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-none" />
                    </div>
                    <div className="flex items-center justify-end gap-2 px-3 pb-3">
                        <button onClick={() => setContactOpen(false)} className="px-2.5 py-1 text-[10px] text-muted-foreground border border-border rounded hover:bg-muted/30">Cancel</button>
                        <button onClick={() => { setContactSent(true); setContactOpen(false) }}
                            className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:opacity-90">
                            <Send className="h-3 w-3" /> Send →
                        </button>
                    </div>
                </div>
            )}

            {contactSent && (
                <div className="flex items-center gap-2 px-3 py-2 bg-success/5 border border-success/20 rounded-xl text-[10px] text-success animate-in fade-in duration-300">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    Message sent to Michael Boyle · awaiting response on Carton #34
                </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-2">
                {!contactSent && (
                    <button onClick={() => setContactOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-3 text-sm font-bold rounded-xl border border-border text-muted-foreground hover:bg-muted/30 transition-all">
                        <MessageSquare className="h-4 w-4" /> Contact →
                    </button>
                )}
                <button onClick={handleAnalyze} disabled={clicked}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    {clicked ? 'Analyzing…' : 'Run AI Analysis'}
                </button>
            </div>

            {/* Before Strata */}
            <div className="bg-muted/40 border border-border rounded-xl px-3 py-2.5">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Before Strata:</span> Lena loaded the receiving report in CORE without a partial-shipment flag — every order looked the same whether 34 or 35 cartons arrived. Lauren had to manually cross-reference the Word doc against CORE, a 1–2 day manual process with no system alert.
                </p>
            </div>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
