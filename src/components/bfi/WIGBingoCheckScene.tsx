/**
 * COMPONENT: WIGBingoCheckScene  (r1.2 / a1.2d)
 * PURPOSE: Product Receiving step 1.
 *   Standard mode (r1.2): dashboard → docs + bingo sheet → Run AI Analysis → nextStep()
 *   Upload mode (a1.2d): dashboard → empty upload zones → upload files → docs + AI →
 *                        CORE update + notify Lauren → nextStep()
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Mail, Sparkles, AlertTriangle, Upload, CheckCircle2, Send, Loader2, Package } from 'lucide-react'
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
    uploadMode?: boolean
}

const CARTONS = Array.from({ length: 35 }, (_, i) => i + 1)

const DEFAULT_NOTIFICATION: NotificationConfig = {
    title: 'WIG document received',
    desc: 'PMO-2026-0412 · Bingo Sheet · 35 cartons · ready for AI analysis',
    cta: 'Review bingo sheet →',
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({
    label, filename, uploaded, onUpload,
}: { label: string; filename: string; uploaded: boolean; onUpload: () => void }) {
    const [uploading, setUploading] = useState(false)

    const handleClick = () => {
        if (uploaded || uploading) return
        setUploading(true)
        setTimeout(() => { setUploading(false); onUpload() }, 1600)
    }

    if (uploaded) {
        return (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-success/30 bg-success/5 animate-in fade-in duration-300">
                <div className="h-7 w-7 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-foreground truncate">{filename}</div>
                    <div className="text-[9px] text-success">Uploaded · ready</div>
                </div>
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>
        )
    }

    if (uploading) {
        return (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-muted/30 animate-pulse">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-muted-foreground">Uploading {label}…</div>
                    <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ transition: 'width 1.5s ease-in-out', width: '100%' }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-dashed border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
        >
            <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
                <div className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
                <div className="text-[9px] text-muted-foreground">Click to attach file</div>
            </div>
        </button>
    )
}

// ─── Lauren Notification ──────────────────────────────────────────────────────

function LaurenNotification({ onSent }: { onSent: () => void }) {
    const [sent, setSent] = useState(false)

    const handleSend = () => {
        setSent(true)
        setTimeout(() => onSent(), 900)
    }

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-in fade-in duration-400">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/40 border-b border-border">
                <div className="h-6 w-6 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Send className="h-3 w-3 text-primary" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-foreground">Notify Lauren · DOE-2847</div>
                    <div className="text-[9px] text-muted-foreground">Strata pre-drafted · receiving complete</div>
                </div>
            </div>

            <div className="px-3.5 py-3 space-y-2.5">
                {/* Recipient */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border">
                    <div className="h-7 w-7 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-info">LD</span>
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-foreground">Lauren DeMarco</div>
                        <div className="text-[9px] text-muted-foreground">lauren.demarco@bfifurniture.com · CoNY Account Manager</div>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success ml-auto shrink-0" />
                </div>

                {/* Message */}
                <div className="rounded-xl border border-border bg-background px-3 py-2.5 text-[11px] text-foreground leading-relaxed space-y-1.5">
                    <p>Hi Lauren,</p>
                    <p>Receiving for order <span className="font-semibold">DOE-2847</span> is complete. <span className="text-warning font-medium">Carton #34 was not received at dock</span> — manually noted on the bingo sheet by Workplace. CORE has been updated.</p>
                    <p className="text-muted-foreground text-[10px]">— Lena C. · BFI Receiving Coordinator</p>
                </div>

                {/* Attachments */}
                <div className="space-y-1">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Attachments</div>
                    {['BD-2026-0412_BingoSheet.pdf', 'RR-41200_PMO0412_May11.docx'].map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <FileText className="h-3 w-3 shrink-0" />
                            {f}
                        </div>
                    ))}
                </div>

                {sent ? (
                    <div className="flex items-center gap-2 p-2.5 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        <div className="text-[11px] font-bold text-success">Sent to Lauren · May 11 · 8:42 AM</div>
                    </div>
                ) : (
                    <button
                        onClick={handleSend}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send to Lauren →
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Bingo Sheet Card ─────────────────────────────────────────────────────────

function BingoSheetCard() {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                        <div className="text-[10px] font-bold text-foreground">Bingo Sheet · BD-2026-0412</div>
                        <div className="text-[9px] text-muted-foreground">review required · manual notation detected</div>
                    </div>
                </div>
                <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full">ready for AI</span>
            </div>

            <div className="border-t border-border px-3.5 py-3 space-y-2.5">
                <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={340} />

                <div className="grid grid-cols-7 gap-1">
                    {CARTONS.map(n => {
                        const isMissing = n === 34
                        return (
                            <div key={n} className={`flex flex-col items-center justify-center rounded p-1 text-center ${
                                isMissing ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/5 border border-success/20'
                            }`}>
                                <span className={`text-[9px] font-bold ${isMissing ? 'text-destructive' : 'text-success'}`}>
                                    {isMissing ? '✗' : '○'}
                                </span>
                                <span className={`text-[8px] ${isMissing ? 'text-destructive' : 'text-muted-foreground'}`}>{n}</span>
                            </div>
                        )
                    })}
                </div>

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
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function WIGBingoCheckScene({ onAnalyze, notificationConfig, uploadMode }: WIGBingoCheckSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase] = useState<'dashboard' | 'checking'>('dashboard')
    // Upload mode states
    const [bingoUploaded, setBingoUploaded] = useState(false)
    const [reportUploaded, setReportUploaded] = useState(false)
    const [analyzed, setAnalyzed] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    // Standard mode
    const [clicked, setClicked] = useState(false)

    const bothUploaded = bingoUploaded && reportUploaded

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => {
            if (!isPausedRef.current) { clearInterval(poll); fn() }
        }, 200)
    }, [])

    const handleAnalyze = () => {
        setClicked(true)
        if (uploadMode) {
            setAnalyzing(true)
            setTimeout(pauseAware(() => { setAnalyzing(false); setAnalyzed(true) }), 1200)
        } else {
            setTimeout(pauseAware(() => onAnalyze?.()), 300)
        }
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
            {!uploadMode && <ReceivingProcessBar stepId="r1.2" />}

            {uploadMode && !bothUploaded ? (
                /* ── Upload phase (empty) ── */
                <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-card px-4 py-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-[12px] font-bold text-foreground">DOE-2847 · Warehouse Receiving</div>
                                <div className="text-[10px] text-muted-foreground">Attach receiving documents to continue</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <UploadZone
                                label="Bingo Sheet"
                                filename="BD-2026-0412_BingoSheet.pdf"
                                uploaded={bingoUploaded}
                                onUpload={() => setBingoUploaded(true)}
                            />
                            <UploadZone
                                label="Receiving Report"
                                filename="RR-41200_PMO0412_May11.docx"
                                uploaded={reportUploaded}
                                onUpload={() => setReportUploaded(true)}
                            />
                        </div>
                    </div>

                    <button disabled className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary/30 text-primary-foreground/60 cursor-not-allowed">
                        <Sparkles className="h-4 w-4" />
                        Run AI Analysis
                    </button>
                </div>
            ) : (
                /* ── Uploaded / Standard phase ── */
                <>
                    {/* WIG email card */}
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

                    <BingoSheetCard />

                    {/* CORE update chip — shows after analysis */}
                    {analyzed && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-success/30 bg-success/5 animate-in fade-in duration-400">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <div className="text-[11px]">
                                <span className="font-bold text-foreground">CORE updated · </span>
                                <span className="text-muted-foreground">DOE-2847 · 35 cartons received · carton #34 flagged as missing</span>
                            </div>
                        </div>
                    )}

                    {/* Lauren notification — shows after analysis (upload mode only) */}
                    {analyzed && uploadMode && (
                        <LaurenNotification onSent={() => onAnalyze?.()} />
                    )}

                    {/* Run AI Analysis — standard mode or pre-analysis upload mode */}
                    {!analyzed && (
                        <button
                            onClick={handleAnalyze}
                            disabled={clicked}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
                        >
                            {analyzing
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
                                : <><Sparkles className="h-4 w-4" /> Run AI Analysis</>
                            }
                        </button>
                    )}
                </>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
