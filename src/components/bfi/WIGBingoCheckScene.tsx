/**
 * COMPONENT: WIGBingoCheckScene  (r1.2 / a1.2d)
 * PURPOSE: Product Receiving step 1 — Operations Dashboard overview.
 *          Notification slides in → click → WIG report + bingo sheet + AI CTA.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Mail, Sparkles, AlertTriangle } from 'lucide-react'
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

            {/* WIG Receiving Report email */}
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

            {/* Bingo Sheet — always expanded */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="text-left">
                            <div className="text-[10px] font-bold text-foreground">Bingo Sheet · BD-2026-0412</div>
                            <div className="text-[9px] text-muted-foreground">review required · manual notation detected</div>
                        </div>
                    </div>
                    <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full">ready for AI</span>
                </div>

                <div className="border-t border-border px-3.5 py-3 space-y-2.5">
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
            </div>

            <button onClick={handleAnalyze} disabled={clicked}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                <Sparkles className="h-4 w-4" />
                {clicked ? 'Analyzing…' : 'Run AI Analysis'}
            </button>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
