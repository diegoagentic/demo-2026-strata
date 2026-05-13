/**
 * COMPONENT: WIGBingoCheckScene  (r1.2 / a1.2d)
 * PURPOSE: Product Receiving step 1.
 *   Standard mode (r1.2): dashboard → docs + bingo sheet → Run AI Analysis → nextStep()
 *   Upload mode (a1.2d): dashboard → upload zones (bingo + PO) → notes → Update CORE →
 *                        Lauren notification → nextStep()
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { FileText, Mail, Sparkles, AlertTriangle, Upload, CheckCircle2, Send, Loader2, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import BFIDashboardScene from './BFIDashboardScene'
import ReceivingProcessBar from './ReceivingProcessBar'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocViewer, { BFI_DOCS } from './BFIDocViewer'

interface NotificationConfig { title: string; desc: string; cta: string }
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
const DEFAULT_NOTES = `Received DOE-2847 · 35 cartons · Carton #34 not received at dock.
Bingo sheet annotated manually by Workplace. Purchase Order confirmed.
CORE entry updated — partial shipment flag set.`

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({ label, filename, uploaded, onUpload }: {
    label: string; filename: string; uploaded: boolean; onUpload: () => void
}) {
    const [uploading, setUploading] = useState(false)
    const handleClick = () => {
        if (uploaded || uploading) return
        setUploading(true)
        setTimeout(() => { setUploading(false); onUpload() }, 1600)
    }

    if (uploaded) {
        return (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-success/30 bg-success/5 animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
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
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-muted/30">
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
        <button onClick={handleClick}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-dashed border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group text-left">
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

// ─── Uploaded File Card (with expandable preview) ────────────────────────────

function UploadedFileCard({ filename, label, previewSrc, previewHeight = 300 }: {
    filename: string; label: string; previewSrc: string; previewHeight?: number
}) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-muted/40 transition-colors">
                <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-[10px] font-bold text-foreground truncate">{label}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{filename}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold text-success">✓ Uploaded</span>
                    {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                </div>
            </button>
            {expanded && (
                <div className="border-t border-border px-3.5 py-3 animate-in fade-in duration-200">
                    <iframe
                        src={previewSrc}
                        className="w-full rounded-lg border border-border"
                        style={{ height: previewHeight }}
                        title={filename}
                    />
                </div>
            )}
        </div>
    )
}

// ─── Bingo Sheet Card (standard mode) ────────────────────────────────────────

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
                                <span className={`text-[9px] font-bold ${isMissing ? 'text-destructive' : 'text-success'}`}>{isMissing ? '✗' : '○'}</span>
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
                    The bingo sheet has no "missing" checkbox — Workplace writes manually.
                </div>
            </div>
        </div>
    )
}

// ─── Lauren Notification ──────────────────────────────────────────────────────

function LaurenNotification({ notes, onSent }: { notes: string; onSent: () => void }) {
    const [sent, setSent] = useState(false)
    const handleSend = () => { setSent(true); setTimeout(() => onSent(), 900) }

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-in fade-in duration-400">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-muted/30 border-b border-border">
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
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-foreground">Lauren DeMarco</div>
                        <div className="text-[9px] text-muted-foreground">lauren.demarco@bfifurniture.com · CoNY Account Manager</div>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                </div>

                {/* Message */}
                <div className="space-y-1">
                    {[
                        { label: 'From', value: 'lena.c@bfifurniture.com · Receiving Coordinator' },
                        { label: 'Re',   value: 'DOE-2847 · Receiving Complete · Carton #34 missing' },
                    ].map(r => (
                        <div key={r.label} className="flex gap-2 text-[10px]">
                            <span className="text-muted-foreground w-8 shrink-0">{r.label}:</span>
                            <span className="text-foreground font-medium">{r.value}</span>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border border-border bg-background px-3 py-2.5 text-[11px] text-foreground leading-relaxed whitespace-pre-line">
                    {notes}
                </div>

                {/* Attachments */}
                <div className="space-y-1">
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Attachments</div>
                    {[
                        'BD-2026-0412_BingoSheet.pdf',
                        'DOE-2847-PO.pdf',
                    ].map(f => (
                        <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <FileText className="h-3 w-3 shrink-0" /> {f}
                        </div>
                    ))}
                </div>

                {sent ? (
                    <div className="flex items-center gap-2 p-2.5 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        <div className="text-[11px] font-bold text-success">Sent to Lauren · May 11 · 8:42 AM</div>
                    </div>
                ) : (
                    <button onClick={handleSend}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-bold rounded-xl bg-foreground text-background hover:opacity-80 transition-all">
                        <Send className="h-3.5 w-3.5" />
                        Send to Lauren →
                    </button>
                )}
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
    // Upload mode state
    const [bingoUploaded, setBingoUploaded] = useState(false)
    const [poUploaded,    setPoUploaded]    = useState(false)
    const [notes,         setNotes]         = useState(DEFAULT_NOTES)
    const [coreUpdated,   setCoreUpdated]   = useState(false)
    const [coreUpdating,  setCoreUpdating]  = useState(false)
    // Standard mode state
    const [clicked, setClicked] = useState(false)

    const bothUploaded = bingoUploaded && poUploaded

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

    const handleUpdateCore = () => {
        setCoreUpdating(true)
        setTimeout(pauseAware(() => { setCoreUpdating(false); setCoreUpdated(true) }), 1400)
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

            {/* ══ UPLOAD MODE ══════════════════════════════════════════════════ */}
            {uploadMode && (
                <>
                    {/* Upload zones or uploaded file cards */}
                    <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-3">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-[12px] font-bold text-foreground">DOE-2847 · Warehouse Documents</div>
                                <div className="text-[10px] text-muted-foreground">Attach receiving documents to continue</div>
                            </div>
                        </div>

                        {bingoUploaded ? (
                            <UploadedFileCard
                                label="Bingo Sheet · BD-2026-0412"
                                filename="BD-2026-0412_BingoSheet.pdf"
                                previewSrc="/docs/bfi/receiving/RR-37577-missing.pdf"
                                previewHeight={280}
                            />
                        ) : (
                            <UploadZone
                                label="Bingo Sheet · BD-2026-0412"
                                filename="BD-2026-0412_BingoSheet.pdf"
                                uploaded={bingoUploaded}
                                onUpload={() => setBingoUploaded(true)}
                            />
                        )}

                        {poUploaded ? (
                            <UploadedFileCard
                                label="Purchase Order · DOE-2847"
                                filename="DOE-2847-PO.pdf"
                                previewSrc="/docs/bfi/invoices/invoice-030923-NYPL.pdf"
                                previewHeight={280}
                            />
                        ) : (
                            <UploadZone
                                label="Purchase Order · DOE-2847"
                                filename="DOE-2847-PO.pdf"
                                uploaded={poUploaded}
                                onUpload={() => setPoUploaded(true)}
                            />
                        )}
                    </div>

                    {/* Notes — visible once both uploaded */}
                    {bothUploaded && !coreUpdated && (
                        <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2 animate-in fade-in duration-300">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Notes</span>
                            </div>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={4}
                                className="w-full text-[11px] text-foreground bg-muted/30 border border-border rounded-xl px-3 py-2 leading-relaxed resize-none outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    )}

                    {/* Update CORE button */}
                    {bothUploaded && !coreUpdated && (
                        <button
                            onClick={handleUpdateCore}
                            disabled={coreUpdating}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm animate-in fade-in duration-300"
                        >
                            {coreUpdating
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating CORE…</>
                                : <><CheckCircle2 className="h-4 w-4" /> Update CORE →</>
                            }
                        </button>
                    )}

                    {/* CORE updated chip */}
                    {coreUpdated && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-success/30 bg-success/5 animate-in fade-in duration-400">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            <div className="text-[11px]">
                                <span className="font-bold text-foreground">CORE updated · </span>
                                <span className="text-muted-foreground">DOE-2847 · 35 cartons · carton #34 flagged as missing</span>
                            </div>
                        </div>
                    )}

                    {/* Lauren notification */}
                    {coreUpdated && (
                        <LaurenNotification notes={notes} onSent={() => onAnalyze?.()} />
                    )}
                </>
            )}

            {/* ══ STANDARD MODE ════════════════════════════════════════════════ */}
            {!uploadMode && (
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

                    <button onClick={handleAnalyze} disabled={clicked}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        {clicked ? 'Analyzing…' : 'Run AI Analysis'}
                    </button>
                </>
            )}

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
        </div>
    )
}
