/**
 * COMPONENT: WIGBingoCheckScene  (r1.2)
 * PURPOSE: Product Receiving step 1 — starts with Operations Dashboard overview.
 *          After 2s a "WIG document received" notification slides in.
 *          Click → 'checking' phase: WIG Receiving Report + CTA to trigger AI analysis.
 */

import { useState } from 'react'
import { FileText, Mail, Sparkles } from 'lucide-react'
import BFIDashboardScene from './BFIDashboardScene'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

interface WIGBingoCheckSceneProps {
    onAnalyze?: () => void
}

export default function WIGBingoCheckScene({ onAnalyze }: WIGBingoCheckSceneProps) {
    const [phase, setPhase] = useState<'dashboard' | 'checking'>('dashboard')
    const [clicked, setClicked] = useState(false)

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

            {/* AS-IS contrast */}
            <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Before Strata</div>
                <div className="text-xs text-foreground leading-relaxed">
                    WIG sends the Receiving Report as a Word doc → Lena loads in CORE{' '}
                    <span className="font-bold text-destructive">without flagging partial receipts</span>{' '}
                    → Lauren doesn't know if the order is complete or partial. Manual follow-up: 1–2 days.
                </div>
            </div>

            {/* Incoming email card */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-muted/40 border-b border-border">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Incoming · WIG Receiving Report</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">May 11 · 8:06 AM</span>
                </div>
                <div className="p-3.5 space-y-2.5">
                    <div className="text-[11px] text-muted-foreground">From: warehouse@wiggroup.com</div>
                    <div className="text-xs text-foreground font-medium">PMO-2026-0412 · Vendor Order #17706 · Receiving Report attached · 35 cartons</div>

                    {/* Word doc thumbnail */}
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

                    {/* Bingo sheet attachment */}
                    <div className="bg-muted/30 border border-border rounded-lg px-2.5 py-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                                <div className="text-[11px] font-medium text-foreground">Bingo Sheet · BD-2026-0412</div>
                                <div className="text-[10px] text-muted-foreground">35 cartons · 1 page · attached</div>
                            </div>
                            <span className="ml-auto text-[9px] text-ai bg-ai/10 border border-ai/20 px-1.5 py-0.5 rounded-full font-medium">ready for AI</span>
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">
                            ⚠ No "missing" checkbox in the original — Workplace writes manually. Strata adds digital detection.
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={clicked}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-zinc-900 dark:bg-primary text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
            >
                <Sparkles className="h-4 w-4" />
                Run AI Analysis
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
