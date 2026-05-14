/**
 * COMPONENT: WIGBingoCheckScene  (r1.2 / a1.2d)
 * PURPOSE: Product Receiving step 1.
 *   Standard mode (r1.2): dashboard → docs + bingo sheet → Run AI Analysis → nextStep()
 *   Upload mode (a1.2d): dashboard → upload zones → uploaded files + bingo grid → notes → Update CORE → Lauren dialog → nextStep()
 */

import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { FileText, Mail, Sparkles, AlertTriangle, Upload, CheckCircle2, Send, Loader2, Package } from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
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

// ─── PO Line Items ────────────────────────────────────────────────────────────

const PO_LINES = [
    { id: 'L1', desc: 'Filing Unit Lateral 2-Drawer 36"',    qty: 8, unit: 945,  cartons: [1,2,3,4,5,6,7,8],    abbr: 'FU-2',  zone: 'A' },
    { id: 'L2', desc: 'Filing Unit Vertical 4-Drawer 26"',   qty: 4, unit: 680,  cartons: [9,10,11,12],          abbr: 'FU-4',  zone: 'A' },
    { id: 'L3', desc: 'Work Surface 60" × 30"',              qty: 6, unit: 1240, cartons: [13,14,15,16,17,18],   abbr: 'WS-60', zone: 'B' },
    { id: 'L4', desc: 'Work Surface 72" × 30"',              qty: 4, unit: 1480, cartons: [19,20,21,22],         abbr: 'WS-72', zone: 'B' },
    { id: 'L5', desc: 'Storage Cabinet Overhead 72"',        qty: 3, unit: 890,  cartons: [23,24,25],            abbr: 'SC',    zone: 'B' },
    { id: 'L6', desc: 'Ergonomic Chair · Aeron B · HM',      qty: 8, unit: 1890, cartons: [26,27,28,29,30,31,32,33], abbr: 'CHAIR', zone: 'C' },
    { id: 'L7', desc: 'Monitor Arm Dual Adjustable',         qty: 2, unit: 385,  cartons: [34,35],               abbr: 'M-ARM', zone: 'C' },
]

// Carton → item abbreviation map
const CARTON_MAP: Record<number, string> = {}
PO_LINES.forEach(l => l.cartons.forEach(c => { CARTON_MAP[c] = l.abbr }))

const MISSING_CARTON = 34

const PO_TOTAL = PO_LINES.reduce((s, l) => s + l.unit * l.qty, 0)

const DEFAULT_NOTIFICATION: NotificationConfig = {
    title: 'WIG document received',
    desc: 'PMO-2026-0412 · Bingo Sheet · 35 cartons · ready for AI analysis',
    cta: 'Review bingo sheet →',
}

const DEFAULT_NOTES =
`Hi Lauren,

Received DOE-2847 at WIG — 34 of 35 cartons confirmed.

Carton #34 NOT received: Monitor Arm Dual Adjustable (1 of 2 units). Bingo sheet annotated manually by Workplace.

CORE updated — partial shipment flag set. Line 7 excluded from entry pending claim resolution.

— Lena C. · Receiving Coordinator`

// ─── Purchase Order Document ──────────────────────────────────────────────────

function PODocument() {
    return (
        <div className="text-[10px] space-y-3 bg-background rounded-xl border border-border p-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[13px] font-black text-foreground">PURCHASE ORDER</div>
                    <div className="text-muted-foreground mt-0.5">DOE-2847 · Q-2026-0089</div>
                </div>
                <div className="text-right space-y-0.5">
                    <div className="font-bold text-foreground">NYC Dept. of Education</div>
                    <div className="text-muted-foreground">Procurement Office</div>
                    <div className="text-muted-foreground">May 6, 2026</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                {[
                    { label: 'Vendor',    value: 'BFI Furniture · Herman Miller' },
                    { label: 'Contract',  value: 'CoNY · City of New York' },
                    { label: 'Ship to',   value: 'WIG Group · NJ Warehouse' },
                    { label: 'Delivery',  value: 'May 14–21, 2026 · 35 cartons' },
                ].map(r => (
                    <div key={r.label}>
                        <span className="text-muted-foreground">{r.label}: </span>
                        <span className="font-medium text-foreground">{r.value}</span>
                    </div>
                ))}
            </div>

            {/* Line items table */}
            <div className="border-t border-border pt-2 space-y-0.5">
                <div className="grid grid-cols-[1fr_3rem_4rem_4rem] gap-1 pb-1 border-b border-border/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>Description</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Unit</span>
                    <span className="text-right">Total</span>
                </div>
                {PO_LINES.map(l => (
                    <div key={l.id} className={`grid grid-cols-[1fr_3rem_4rem_4rem] gap-1 py-0.5 ${l.id === 'L7' ? 'text-warning font-medium' : ''}`}>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-bold bg-muted px-1 rounded text-muted-foreground shrink-0">{l.abbr}</span>
                            <span className="truncate">{l.desc}</span>
                        </div>
                        <span className="text-right">{l.qty}</span>
                        <span className="text-right">${l.unit.toLocaleString()}</span>
                        <span className="text-right">${(l.unit * l.qty).toLocaleString()}</span>
                    </div>
                ))}
                <div className="grid grid-cols-[1fr_3rem_4rem_4rem] gap-1 border-t border-border pt-1 font-bold text-foreground">
                    <span className="col-span-3 text-right">Total</span>
                    <span className="text-right">${PO_TOTAL.toLocaleString()}</span>
                </div>
            </div>

            <div className="text-[9px] text-muted-foreground border-t border-border pt-2">
                Zones A·B·C · Install crew: 3 technicians · Labor: Carpenters 45h + OT 6h
            </div>
        </div>
    )
}

// ─── Enhanced Bingo Grid ──────────────────────────────────────────────────────

function BingoGrid() {
    const cartons = Array.from({ length: 35 }, (_, i) => i + 1)
    return (
        <div className="space-y-2">
            {/* Grid 7×5 */}
            <div className="grid grid-cols-7 gap-0.5">
                {cartons.map(n => {
                    const missing = n === MISSING_CARTON
                    return (
                        <div key={n} className={`flex items-center justify-center rounded p-1 text-center min-h-[30px] ${
                            missing
                                ? 'bg-destructive/10 border border-destructive/30'
                                : 'bg-success/5 border border-success/20'
                        }`}>
                            <span className={`text-[9px] font-bold leading-tight ${missing ? 'text-destructive' : 'text-muted-foreground/70'}`}>
                                {missing ? '✗' : `#${n}`}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Missing annotation */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-2.5 py-2 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                <span className="text-[10px] font-bold text-foreground">Carton #34 missing · not received at dock</span>
            </div>
        </div>
    )
}

// ─── Bingo Sheet Card (standard mode) ────────────────────────────────────────

function BingoSheetCard() {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                        <div className="text-[10px] font-bold text-foreground">Bingo Sheet · BD-2026-0412</div>
                        <div className="text-[9px] text-muted-foreground">review required · manual notation detected</div>
                    </div>
                </div>
                <span className="text-[9px] font-bold bg-ai/10 text-ai border border-ai/20 px-1.5 py-0.5 rounded-full">ready for AI</span>
            </div>
            <div className="px-3.5 py-3 space-y-2.5">
                <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={280} />
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => i + 1).map(n => {
                        const missing = n === MISSING_CARTON
                        return (
                            <div key={n} className={`flex flex-col items-center justify-center rounded p-1 text-center ${
                                missing ? 'bg-destructive/10 border border-destructive/30' : 'bg-success/5 border border-success/20'
                            }`}>
                                <span className={`text-[9px] font-bold ${missing ? 'text-destructive' : 'text-success'}`}>{missing ? '✗' : '○'}</span>
                                <span className={`text-[8px] ${missing ? 'text-destructive' : 'text-muted-foreground'}`}>{n}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-lg px-2.5 py-2">
                    <div className="text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">Carton #34 — </span>
                        <span className="italic text-amber-600 dark:text-amber-400">"not rcv'd at dock"</span>
                        {' '}(written manually by Workplace)
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
    if (uploaded) return null
    if (uploading) {
        return (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border bg-muted/30 min-h-[100px]">
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
            className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 px-3.5 py-6 rounded-xl border border-dashed border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group text-center">
            <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
                <div className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
                <div className="text-[9px] text-muted-foreground">Click to attach</div>
            </div>
        </button>
    )
}

// ─── Uploaded File Card ───────────────────────────────────────────────────────

function UploadedFileCard({ filename, label, children }: {
    filename: string; label: string; children: React.ReactNode
}) {
    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border">
                <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground truncate">{label}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{filename}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="text-[9px] font-bold text-success">Uploaded</span>
                </div>
            </div>
            <div className="px-3.5 py-3 space-y-2">
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Imagen de referencia</div>
                {children}
            </div>
        </div>
    )
}

// ─── Lauren Notification Dialog ───────────────────────────────────────────────

function LaurenNotificationDialog({ isOpen, notes, onSent }: { isOpen: boolean; notes: string; onSent: () => void }) {
    const [sent,      setSent]      = useState(false)
    const [fromEmail, setFromEmail] = useState('lena.c@bfifurniture.com')
    const handleSend = () => { setSent(true); setTimeout(() => onSent(), 900) }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>
                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-black text-info">LD</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground">Lauren DeMarco</div>
                                    <div className="text-[10px] text-muted-foreground">lauren.demarco@bfifurniture.com · CoNY Account Manager</div>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="px-5 pt-4 pb-3 border-b border-border/60 space-y-1.5">
                                    <div className="text-[13px] font-bold text-foreground leading-snug">
                                        DOE-2847 · Receiving Complete · Carton #34 missing
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 text-[10px]">
                                            <span className="text-muted-foreground w-7 shrink-0">From:</span>
                                            <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} disabled={sent}
                                                className="flex-1 bg-transparent outline-none text-foreground font-medium border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors disabled:opacity-60 min-w-0" />
                                        </div>
                                        {[
                                            { label: 'To',   value: 'lauren.demarco@bfifurniture.com' },
                                            { label: 'CC',   value: 'walter@conyny.gov · CoNY PM' },
                                            { label: 'Date', value: 'May 11, 2026 · 8:42 AM' },
                                        ].map(r => (
                                            <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                                <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                                <span className={`font-medium truncate ${r.label === 'CC' ? 'text-muted-foreground italic' : 'text-foreground'}`}>{r.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-5 py-4 space-y-3">
                                    <div className="text-[12px] text-foreground leading-relaxed whitespace-pre-line">{notes}</div>

                                    {/* Missing item summary */}
                                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-1.5 text-[11px]">
                                        <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Missing Item — Carton #34</p>
                                        {[
                                            { label: 'Item',     value: 'Monitor Arm Dual Adjustable' },
                                            { label: 'PO line',  value: 'L7 · 1 of 2 units' },
                                            { label: 'Zone',     value: 'C · Install crew' },
                                            { label: 'Status',   value: 'CORE flagged · claim pending' },
                                        ].map(r => (
                                            <div key={r.label} className="flex items-start gap-2">
                                                <span className="text-muted-foreground w-16 shrink-0">{r.label}:</span>
                                                <span className="font-medium text-foreground">{r.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Attachments</div>
                                        {['BD-2026-0412_BingoSheet.pdf', 'DOE-2847-PO.pdf'].map(f => (
                                            <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium w-fit">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    {sent && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Sent to Lauren · May 11 · 8:42 AM</div>
                                                <div className="text-muted-foreground mt-0.5">Carton #34 flagged · CORE updated · claim pending</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 pb-4">
                                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                                </div>
                            </div>

                            {!sent && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button onClick={handleSend}
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm">
                                        <Send className="h-3.5 w-3.5" />
                                        Send to Lauren →
                                    </button>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function WIGBingoCheckScene({ onAnalyze, notificationConfig, uploadMode }: WIGBingoCheckSceneProps) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [phase, setPhase] = useState<'dashboard' | 'checking'>('dashboard')

    useEffect(() => {
        const handler = () => setPhase('checking')
        window.addEventListener('bfi:wig-open', handler)
        return () => window.removeEventListener('bfi:wig-open', handler)
    }, [])

    const [bingoUploaded, setBingoUploaded] = useState(false)
    const [poUploaded,    setPoUploaded]    = useState(false)
    const [notes,         setNotes]         = useState(DEFAULT_NOTES)
    const [coreUpdated,   setCoreUpdated]   = useState(false)
    const [coreUpdating,  setCoreUpdating]  = useState(false)
    const [showNotify,    setShowNotify]    = useState(false)
    const [clicked,       setClicked]       = useState(false)

    const bothUploaded = bingoUploaded && poUploaded

    const pauseAware = useCallback((fn: () => void) => () => {
        if (!isPausedRef.current) { fn(); return }
        const poll = setInterval(() => { if (!isPausedRef.current) { clearInterval(poll); fn() } }, 200)
    }, [])

    const handleAnalyze = () => { setClicked(true); setTimeout(pauseAware(() => onAnalyze?.()), 300) }
    const handleUpdateCore = () => {
        setCoreUpdating(true)
        setTimeout(pauseAware(() => { setCoreUpdating(false); setCoreUpdated(true); setShowNotify(true) }), 1400)
    }

    if (phase === 'dashboard') {
        return (
            <BFIDashboardScene
                staticMode
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
                    {/* Header — only while pending uploads */}
                    {!bothUploaded && (
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-[12px] font-bold text-foreground">DOE-2847 · Warehouse Documents</div>
                                <div className="text-[10px] text-muted-foreground">Attach receiving documents to continue</div>
                            </div>
                        </div>
                    )}

                    {/* Always-2-column grid — each column switches independently */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Left: Bingo Sheet */}
                        {bingoUploaded ? (
                            <UploadedFileCard label="Bingo Sheet · BD-2026-0412" filename="BD-2026-0412_BingoSheet.pdf">
                                <BFIDocViewer {...BFI_DOCS.RR_37577_MISSING} height={260} extractedFields={[]} />
                                <BingoGrid />
                            </UploadedFileCard>
                        ) : (
                            <UploadZone label="Bingo Sheet · BD-2026-0412" filename="BD-2026-0412_BingoSheet.pdf"
                                uploaded={bingoUploaded} onUpload={() => setBingoUploaded(true)} />
                        )}
                        {/* Right: Purchase Order */}
                        {poUploaded ? (
                            <UploadedFileCard label="Purchase Order · DOE-2847" filename="DOE-2847-PO.pdf">
                                <PODocument />
                            </UploadedFileCard>
                        ) : (
                            <UploadZone label="Purchase Order · DOE-2847" filename="DOE-2847-PO.pdf"
                                uploaded={poUploaded} onUpload={() => setPoUploaded(true)} />
                        )}
                    </div>

                    {/* Notes */}
                    {bothUploaded && !coreUpdated && (
                        <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2 animate-in fade-in duration-300">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Notes</span>
                            </div>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
                                className="w-full text-[11px] text-foreground bg-muted/30 border border-border rounded-xl px-3 py-2 leading-relaxed resize-none outline-none focus:border-primary/50 transition-colors" />
                        </div>
                    )}

                    {/* Update CORE button */}
                    {bothUploaded && !coreUpdated && (
                        <button onClick={handleUpdateCore} disabled={coreUpdating}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-all shadow-sm animate-in fade-in duration-300">
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
                                <span className="text-muted-foreground">DOE-2847 · 34/35 cartons · carton #34 (M-ARM) flagged as missing</span>
                            </div>
                        </div>
                    )}

                    <LaurenNotificationDialog isOpen={showNotify} notes={notes}
                        onSent={() => { setShowNotify(false); onAnalyze?.() }} />
                </>
            )}

            {/* ══ STANDARD MODE ════════════════════════════════════════════════ */}
            {!uploadMode && (
                <>
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
