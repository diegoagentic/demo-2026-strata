/**
 * COMPONENT: WIGBingoCheckScene  (r1.2)
 * PURPOSE: Product Receiving step 1 — starts with Operations Dashboard overview.
 *          After 2s a "WIG document received" notification slides in.
 *          Click → 'checking' phase: 3 moments (email, CORE state, bingo sheet) + AI CTA.
 */

import { useState } from 'react'
import { FileText, Mail, Sparkles, Package, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import BFIDashboardScene from './BFIDashboardScene'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WIGBingoCheckSceneProps {
    onAnalyze?: () => void
}

// Generate bingo grid: 1-35, carton 34 is missing
const CARTONS = Array.from({ length: 35 }, (_, i) => i + 1)

export default function WIGBingoCheckScene({ onAnalyze }: WIGBingoCheckSceneProps) {
    const [phase, setPhase] = useState<'dashboard' | 'checking'>('dashboard')
    const [clicked, setClicked] = useState(false)
    const [coreExpanded, setCoreExpanded] = useState(false)
    const [bingoExpanded, setBingoExpanded] = useState(false)

    const handleAnalyze = () => {
        setClicked(true)
        setTimeout(() => onAnalyze?.(), 300)
    }

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                notificationConfig={{
                    title: 'WIG document received',
                    desc: 'PMO-2026-0412 · Bingo Sheet · 35 cartons · ready for AI analysis',
                    cta: 'Review bingo sheet →',
                }}
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

            <button
                onClick={handleAnalyze}
                disabled={clicked}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                <Sparkles className="h-4 w-4" />
                Run AI Analysis
            </button>

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
