/**
 * w1.1 — ExpenseSubmitScene
 * Employee mobile view: snap receipt → OCR auto-fill → pick manager → submit
 * Wow moment #1: watch fields auto-fill from receipt photo
 *
 * Screen flow (all inside MobileDeviceFrame):
 *   form → [tap Submit] → manager picker → [tap Send] → sending → submitted
 *   form → [tap receipt thumbnail] → receipt detail → [Back] → form
 *   form → [+ Add another] → mini scan animation → carousel of receipts
 */

import { useState, useRef, useCallback } from 'react'
import {
    Camera, Plus, CheckCircle2, Clock, Sparkles, ChevronRight,
    Bell, ArrowLeft, Send, Check, ChevronLeft,
} from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import MobileDeviceFrame from '../simulations/MobileDeviceFrame'

type OCRState    = 'idle' | 'scanning' | 'filling' | 'done'
type ScreenState = 'form' | 'picking' | 'sending' | 'submitted' | 'receipt-detail'
type AddState    = 'idle' | 'scanning' | 'done'

const MANAGERS = [
    {
        id: 'sarah',
        name: 'Sarah Johnson',
        dept: 'Operations · Tampa',
        photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
    },
    {
        id: 'mike',
        name: 'Mike Torres',
        dept: 'Sales · Orlando',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    },
    {
        id: 'ana',
        name: 'Ana Reyes',
        dept: 'Procurement · Miami',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    },
]

const FIELDS = [
    { key: 'vendor',   label: 'Vendor',   value: 'The Capital Grille' },
    { key: 'date',     label: 'Date',     value: 'May 5, 2026' },
    { key: 'amount',   label: 'Amount',   value: '$142.50' },
    { key: 'category', label: 'Category', value: 'Fuel + Parking' },
]

// Labels shown in the carousel — each simulates a different document
const RECEIPT_LABELS = ['Fuel Receipt · $95.00', 'Parking Ticket · $47.50', 'Toll Receipt · $12.00']

export default function ExpenseSubmitScene({ onSubmit }: { onSubmit?: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef = useRef(isPaused)
    isPausedRef.current = isPaused

    const [ocrState, setOcrState]         = useState<OCRState>('idle')
    const [filledFields, setFilledFields] = useState<string[]>([])
    const [receipts, setReceipts]         = useState<number[]>([])       // indices of captured receipts
    const [addState, setAddState]         = useState<AddState>('idle')
    const [carouselIdx, setCarouselIdx]   = useState(0)
    const [screen, setScreen]             = useState<ScreenState>('form')
    const [selectedMgr, setSelectedMgr]  = useState<typeof MANAGERS[0] | null>(null)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        const start = Date.now()
        const tick = () => {
            if (isPausedRef.current) { setTimeout(tick, 100); return }
            if (Date.now() - start >= delay) fn()
            else setTimeout(tick, 100)
        }
        setTimeout(tick, 0)
    }, [])

    const handleCapture = useCallback(() => {
        if (ocrState !== 'idle') return
        setOcrState('scanning')
        pauseAware(() => {
            setOcrState('filling')
            setReceipts([0])
            let idx = 0
            const fillNext = () => {
                if (idx >= FIELDS.length) { setOcrState('done'); return }
                setFilledFields(prev => [...prev, FIELDS[idx++].key])
                pauseAware(fillNext, 240)
            }
            fillNext()
        }, 800)
    }, [ocrState, pauseAware])

    const handleAddAnother = useCallback(() => {
        if (addState !== 'idle') return
        setAddState('scanning')
        pauseAware(() => {
            setReceipts(prev => {
                const next = [...prev, prev.length]
                setCarouselIdx(next.length - 1)
                return next
            })
            setAddState('done')
            pauseAware(() => setAddState('idle'), 400)
        }, 900)
    }, [addState, pauseAware])

    const handleSend = useCallback(() => {
        if (!selectedMgr) return
        setScreen('sending')
        pauseAware(() => {
            setScreen('submitted')
            pauseAware(() => { onSubmit?.() }, 1800)
        }, 900)
    }, [selectedMgr, pauseAware, onSubmit])

    // ── Receipt detail screen ─────────────────────────────────────────────────
    if (screen === 'receipt-detail') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="Receipt Detail" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-300">
                    <button onClick={() => setScreen('form')} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to expense
                    </button>

                    {/* Carousel nav if multiple receipts */}
                    {receipts.length > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <button
                                onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
                                disabled={carouselIdx === 0}
                                className="p-1 rounded-lg bg-muted disabled:opacity-30"
                            >
                                <ChevronLeft className="h-4 w-4 text-foreground" />
                            </button>
                            <p className="text-[11px] font-medium text-muted-foreground">
                                {RECEIPT_LABELS[carouselIdx] ?? `Receipt ${carouselIdx + 1}`}
                                <span className="text-[10px] ml-1.5 text-muted-foreground/60">({carouselIdx + 1} of {receipts.length})</span>
                            </p>
                            <button
                                onClick={() => setCarouselIdx(i => Math.min(receipts.length - 1, i + 1))}
                                disabled={carouselIdx === receipts.length - 1}
                                className="p-1 rounded-lg bg-muted disabled:opacity-30"
                            >
                                <ChevronRight className="h-4 w-4 text-foreground" />
                            </button>
                        </div>
                    )}

                    {/* Scan-style receipt */}
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50">
                        <ReceiptImage variant={carouselIdx === 1 ? 'parking' : 'fuel'} />
                    </div>

                    {/* AI extraction note */}
                    <div className="flex items-start gap-2 bg-ai/5 border border-ai/20 rounded-xl px-3 py-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-ai shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground">
                            Strata extracted <span className="font-semibold">vendor · date · amount · category</span> automatically
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl px-3 py-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{receipts.length} receipt{receipts.length > 1 ? 's' : ''} attached</p>
                        <p className="text-[11px] text-foreground">Fuel $95.00 · Parking $47.50{receipts.length > 2 ? ' · Toll $12.00' : ''}</p>
                        <p className="text-[10px] text-muted-foreground">Visa ···· 4892 · Auth #029441</p>
                    </div>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Manager picker screen ─────────────────────────────────────────────────
    if (screen === 'picking') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-300">
                    <div>
                        <p className="text-sm font-bold text-foreground">Select Approving Manager</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Who should review this $142.50 expense?</p>
                    </div>

                    <div className="space-y-2">
                        {MANAGERS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMgr(m)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                                    selectedMgr?.id === m.id
                                        ? 'border-primary/60 bg-primary/5'
                                        : 'border-border bg-card hover:bg-muted/40'
                                }`}
                            >
                                <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-border">
                                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{m.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{m.dept}</p>
                                    {selectedMgr?.id === m.id && (
                                        <p className="text-[10px] text-ai font-medium mt-0.5 animate-in fade-in duration-200">
                                            ✦ Will review &amp; approve
                                        </p>
                                    )}
                                </div>
                                {selectedMgr?.id === m.id && (
                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!selectedMgr}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            selectedMgr
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                    >
                        <Send className="h-4 w-4" />
                        Send for Approval
                    </button>

                    <button onClick={() => setScreen('form')} className="w-full text-center text-[11px] text-muted-foreground py-1">
                        Cancel
                    </button>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Sending screen ────────────────────────────────────────────────────────
    if (screen === 'sending') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-16 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Send className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground">Sending to {selectedMgr?.name}...</p>
                        <p className="text-[11px] text-muted-foreground">Attaching receipts · routing for approval</p>
                    </div>
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Submitted screen ──────────────────────────────────────────────────────
    if (screen === 'submitted') {
        return (
            <MobileDeviceFrame>
                <MobileNavbar title="New Expense" />
                <div className="px-4 py-4 space-y-4 animate-in fade-in duration-400">
                    <div className="bg-success/10 border border-success/20 rounded-2xl px-4 py-4 flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Expense submitted</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Sent to <span className="font-semibold text-foreground">{selectedMgr?.name}</span> for approval
                            </p>
                            <p className="text-[11px] text-muted-foreground">John Smith · $142.50 · {receipts.length} receipt{receipts.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    {selectedMgr && (
                        <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border">
                                <img src={selectedMgr.photo} alt={selectedMgr.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-foreground">{selectedMgr.name}</p>
                                <p className="text-[10px] text-muted-foreground">{selectedMgr.dept}</p>
                            </div>
                            <span className="text-[10px] bg-ai/10 text-ai border border-ai/20 px-2 py-0.5 rounded-full font-medium">Notified ✓</span>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-2xl px-4 py-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Status</p>
                        {[
                            { label: 'Submitted', done: true,  time: '10:32 AM' },
                            { label: 'In Review', done: false, time: '' },
                            { label: 'Approved',  done: false, time: '' },
                            { label: 'Paid',      done: false, time: '' },
                        ].map((s, i, arr) => (
                            <div key={s.label} className="flex gap-3 items-start">
                                <div className="flex flex-col items-center pt-0.5">
                                    {s.done
                                        ? <div className="h-4 w-4 rounded-full bg-success flex items-center justify-center shrink-0"><Check className="h-2.5 w-2.5 text-white" /></div>
                                        : <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                                    }
                                    {i < arr.length - 1 && <div className={`w-px flex-1 mt-0.5 mb-0.5 h-6 ${s.done ? 'bg-success/40' : 'bg-border'}`} />}
                                </div>
                                <div className="pb-3 flex items-center justify-between flex-1">
                                    <p className={`text-xs ${s.done ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
                                    {s.time && <span className="text-[10px] text-muted-foreground">{s.time}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">Avg approval: <span className="font-semibold text-foreground">1.2 days</span></p>
                    </div>

                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
                </div>
            </MobileDeviceFrame>
        )
    }

    // ── Main form screen ──────────────────────────────────────────────────────
    return (
        <MobileDeviceFrame>
            <MobileNavbar title="New Expense" />

            <div className="px-4 py-4 space-y-4">
                {/* Receipt capture zone */}
                <button
                    onClick={
                        ocrState === 'idle' ? handleCapture
                        : ocrState === 'done' ? () => { setCarouselIdx(0); setScreen('receipt-detail') }
                        : undefined
                    }
                    disabled={ocrState === 'scanning' || ocrState === 'filling'}
                    className={`w-full border-2 border-dashed rounded-2xl transition-all ${
                        ocrState === 'idle' ? 'border-border cursor-pointer'
                        : ocrState === 'done' ? 'border-success/40 cursor-pointer hover:border-success/60'
                        : 'border-border bg-muted/20 cursor-default'
                    }`}
                >
                    {ocrState === 'idle' && (
                        <div className="py-6 flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-full bg-ai/10 flex items-center justify-center">
                                <Camera className="h-7 w-7 text-ai" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground">Tap to scan receipt</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Camera · Gallery · File</p>
                                <p className="text-[10px] text-muted-foreground">JPG PNG PDF · multiple receipts OK</p>
                            </div>
                        </div>
                    )}

                    {ocrState === 'scanning' && (
                        <div className="py-5 flex flex-col items-center gap-3">
                            <div className="relative w-full max-w-[220px] rounded-xl overflow-hidden border border-border">
                                <ReceiptImage variant="fuel" />
                                <div className="absolute inset-0 bg-ai/10 flex flex-col items-center justify-center gap-2">
                                    <Sparkles className="h-5 w-5 text-ai animate-pulse" />
                                    <p className="text-xs font-semibold text-ai">Reading receipt...</p>
                                    <div className="absolute inset-x-0 h-0.5 bg-ai/60 animate-bounce" style={{ top: '50%' }} />
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Extracting vendor · date · amount · category</p>
                        </div>
                    )}

                    {(ocrState === 'filling' || ocrState === 'done') && (
                        <div className="py-3 flex flex-col items-center gap-2">
                            {/* Receipt carousel thumbnails */}
                            <ReceiptCarousel
                                receipts={receipts}
                                activeIdx={carouselIdx}
                                onSelect={setCarouselIdx}
                                addState={addState}
                            />
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                <span className="text-[11px] font-semibold text-success">
                                    {receipts.length} receipt{receipts.length > 1 ? 's' : ''} captured
                                </span>
                                {ocrState === 'done' && (
                                    <span className="text-[10px] text-muted-foreground">· tap to view</span>
                                )}
                            </div>
                        </div>
                    )}
                </button>

                {/* Add another — triggers mini scan */}
                {receipts.length > 0 && ocrState === 'done' && (
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] text-muted-foreground">
                            {receipts.length} receipt{receipts.length > 1 ? 's' : ''} attached
                        </span>
                        <button
                            onClick={e => { e.stopPropagation(); handleAddAnother() }}
                            disabled={addState === 'scanning'}
                            className={`flex items-center gap-1 text-[11px] font-medium transition-all ${
                                addState === 'scanning' ? 'text-muted-foreground' : 'text-ai'
                            }`}
                        >
                            {addState === 'scanning' ? (
                                <>
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-3 w-3" />
                                    Add another
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Form fields */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {FIELDS.map((f, i) => {
                        const filled = filledFields.includes(f.key)
                        return (
                            <div key={f.key} className={`px-4 py-3 ${i < FIELDS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{f.label}</p>
                                {filled ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground animate-in fade-in duration-300">{f.value}</span>
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-ai bg-ai/10 px-1.5 py-0.5 rounded-full">
                                            <Sparkles className="h-2 w-2" /> AI
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-4 bg-muted/60 rounded-md w-3/4" />
                                )}
                            </div>
                        )
                    })}
                    <div className="px-4 py-3 border-t border-border/60">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Approving Manager</p>
                        {ocrState === 'done'
                            ? <p className="text-sm text-muted-foreground">Select when submitting →</p>
                            : <div className="h-4 bg-muted/40 rounded-md w-1/2" />
                        }
                    </div>
                </div>

                {/* Submit CTA */}
                <button
                    onClick={() => ocrState === 'done' && setScreen('picking')}
                    disabled={ocrState !== 'done'}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        ocrState === 'done'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                    Submit Expense
                    <ChevronRight className="h-4 w-4" />
                </button>

                {ocrState === 'filling' && (
                    <p className="text-center text-[11px] text-muted-foreground">Auto-filling from receipt...</p>
                )}
            </div>

            {/* AS-IS contrast + DataSourcesBar — inside the phone */}
            <div className="px-4 pb-6 pt-2 space-y-3">
                <div className="bg-muted/40 border border-border/60 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                        Before Strata: desktop-only form · receipt upload often failed · employees emailed receipts separately
                    </p>
                </div>
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OUTLOOK] }]} />
            </div>
        </MobileDeviceFrame>
    )
}

// ── Receipt carousel (inside the capture zone) ────────────────────────────────

function ReceiptCarousel({ receipts, activeIdx, onSelect, addState }: {
    receipts: number[]
    activeIdx: number
    onSelect: (i: number) => void
    addState: AddState
}) {
    const variants: Array<'fuel' | 'parking' | 'toll'> = ['fuel', 'parking', 'toll']

    return (
        <div className="w-full flex flex-col items-center gap-2">
            {/* Thumbnails row */}
            <div className="flex gap-2 items-end justify-center">
                {receipts.map((_, i) => (
                    <button
                        key={i}
                        onClick={e => { e.stopPropagation(); onSelect(i) }}
                        className={`rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                            activeIdx === i ? 'border-primary scale-105' : 'border-border/60 opacity-70 hover:opacity-90'
                        }`}
                        style={{ width: activeIdx === i ? 120 : 76 }}
                    >
                        <ReceiptImage variant={variants[i] ?? 'fuel'} compact />
                    </button>
                ))}

                {/* Scanning slot — appears while adding */}
                {addState === 'scanning' && (
                    <div className="w-[76px] rounded-xl border-2 border-dashed border-ai/60 bg-ai/5 flex flex-col items-center justify-center py-3 gap-1">
                        <Sparkles className="h-4 w-4 text-ai animate-pulse" />
                        <p className="text-[8px] text-ai font-medium">Scanning</p>
                    </div>
                )}
            </div>

            {/* Dot indicators */}
            {receipts.length > 1 && (
                <div className="flex gap-1.5 items-center">
                    {receipts.map((_, i) => (
                        <button
                            key={i}
                            onClick={e => { e.stopPropagation(); onSelect(i) }}
                            className={`rounded-full transition-all ${
                                activeIdx === i ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-border'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Active receipt label */}
            <p className="text-[10px] text-muted-foreground">
                {RECEIPT_LABELS[activeIdx] ?? `Receipt ${activeIdx + 1}`}
            </p>
        </div>
    )
}

// ── Shared mobile navbar ──────────────────────────────────────────────────────

export function MobileNavbar({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between px-3 pt-8 pb-2.5 border-b border-border/60 bg-card/40">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-[10px] font-black leading-none">S</span>
                </div>
                <div className="pl-1.5 border-l border-border">
                    <p className="text-[9px] text-muted-foreground font-medium leading-none uppercase tracking-wide">Workscapes, Inc.</p>
                    <p className="text-[11px] font-bold text-foreground leading-tight">{title}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex items-center gap-1.5">
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-foreground leading-none">John Smith</p>
                        <p className="text-[9px] text-muted-foreground leading-none">Field Staff</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-muted overflow-hidden shrink-0">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                            alt="John Smith"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Receipt image (realistic paper receipt look) ──────────────────────────────

export function ReceiptImage({ compact, variant = 'fuel' }: {
    compact?: boolean
    variant?: 'fuel' | 'parking' | 'toll'
}) {
    if (variant === 'parking') {
        return (
            <div className={`bg-amber-50 font-mono ${compact ? 'px-3 py-2' : 'px-5 py-4'} space-y-0.5`}>
                <div className="text-center">
                    <p className={`font-black tracking-widest text-gray-900 ${compact ? 'text-[8px]' : 'text-[12px]'}`}>WATERSIDE GARAGE</p>
                    {!compact && <p className="text-[8px] text-gray-500">Tampa Convention Center</p>}
                </div>
                <div className={`border-t border-dashed border-gray-400 ${compact ? 'my-1' : 'my-2'}`} />
                {!compact && (
                    <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Ticket #</span><span className="font-bold">P-4421</span></div>
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Date</span><span>05/05/2026</span></div>
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Duration</span><span>3h 15m</span></div>
                    </div>
                )}
                {!compact && <div className="border-t border-dashed border-gray-300 my-1.5" />}
                <div className="flex justify-between text-[8px] text-gray-800">
                    <span>Parking</span><span className="font-bold">$47.50</span>
                </div>
                <div className={`border-t-2 border-gray-800 ${compact ? 'mt-1' : 'mt-1.5'}`} />
                <div className="flex justify-between font-black text-gray-900">
                    <span className={compact ? 'text-[9px]' : 'text-[11px]'}>TOTAL</span>
                    <span className={compact ? 'text-[9px]' : 'text-[11px]'}>$47.50</span>
                </div>
                {!compact && (
                    <>
                        <div className="border-t border-dashed border-gray-400 mt-2 mb-1.5" />
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Card</span><span>VISA ···· 4892</span></div>
                        <div className="border-t border-dashed border-gray-400 mt-2 mb-1" />
                        <p className="text-center text-[7px] text-gray-400">*** CUSTOMER COPY ***</p>
                    </>
                )}
            </div>
        )
    }

    if (variant === 'toll') {
        return (
            <div className={`bg-amber-50 font-mono ${compact ? 'px-3 py-2' : 'px-5 py-4'} space-y-0.5`}>
                <div className="text-center">
                    <p className={`font-black tracking-widest text-gray-900 ${compact ? 'text-[8px]' : 'text-[12px]'}`}>SUNPASS TOLL</p>
                    {!compact && <p className="text-[8px] text-gray-500">Suncoast Pkwy · Plaza 3</p>}
                </div>
                <div className={`border-t border-dashed border-gray-400 ${compact ? 'my-1' : 'my-2'}`} />
                <div className="flex justify-between text-[8px] text-gray-800">
                    <span>Toll charge</span><span className="font-bold">$12.00</span>
                </div>
                <div className={`border-t-2 border-gray-800 ${compact ? 'mt-1' : 'mt-1.5'}`} />
                <div className="flex justify-between font-black text-gray-900">
                    <span className={compact ? 'text-[9px]' : 'text-[11px]'}>TOTAL</span>
                    <span className={compact ? 'text-[9px]' : 'text-[11px]'}>$12.00</span>
                </div>
                {!compact && (
                    <>
                        <div className="border-t border-dashed border-gray-400 mt-2 mb-1.5" />
                        <p className="text-center text-[7px] text-gray-400">SunPass Account · Trans #887341</p>
                    </>
                )}
            </div>
        )
    }

    // Default: fuel / The Capital Grille
    return (
        <div className={`bg-amber-50 font-mono ${compact ? 'px-3 py-2' : 'px-5 py-4'} space-y-0.5`}>
            <div className="text-center space-y-0">
                <p className={`font-black tracking-widest text-gray-900 ${compact ? 'text-[8px]' : 'text-[12px]'}`}>THE CAPITAL GRILLE</p>
                {!compact && (
                    <>
                        <p className="text-[8px] text-gray-500 tracking-wide">2223 N. West Shore Blvd</p>
                        <p className="text-[8px] text-gray-500">Tampa, FL 33607</p>
                    </>
                )}
            </div>
            <div className={`border-t border-dashed border-gray-400 ${compact ? 'my-1' : 'my-2'}`} />
            {!compact && (
                <div className="space-y-0.5">
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Check #</span><span className="font-bold">2847</span></div>
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Date</span><span>05/05/2026</span></div>
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Server</span><span>Maria V.</span></div>
                </div>
            )}
            {!compact && <div className="border-t border-dashed border-gray-400 my-1.5" />}
            <div className="space-y-0.5">
                {compact ? (
                    <div className="flex justify-between text-[8px] text-gray-800"><span>Fuel</span><span className="font-bold">$95.00</span></div>
                ) : (
                    <>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Business Expenses</p>
                        <div className="flex justify-between text-[8px] text-gray-800 mt-0.5">
                            <span className="flex-1">Fuel — Suncoast Pkwy</span>
                            <span className="ml-2 font-bold">$95.00</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-1" />
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Subtotal</span><span>$95.00</span></div>
                        <div className="flex justify-between text-[8px] text-gray-500"><span>Tax</span><span>$0.00</span></div>
                    </>
                )}
            </div>
            <div className={`border-t-2 border-gray-800 ${compact ? 'mt-1' : 'mt-1.5'}`} />
            <div className="flex justify-between font-black text-gray-900">
                <span className={compact ? 'text-[9px]' : 'text-[11px]'}>TOTAL</span>
                <span className={compact ? 'text-[9px]' : 'text-[11px]'}>{compact ? '$95.00' : '$95.00'}</span>
            </div>
            {!compact && (
                <>
                    <div className="border-t border-dashed border-gray-400 mt-2 mb-1.5" />
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Card</span><span>VISA ···· 4892</span></div>
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Auth #</span><span className="font-bold">029441</span></div>
                    <div className="flex justify-between text-[8px] text-gray-500"><span>Time</span><span>12:47 PM</span></div>
                    <div className="border-t border-dashed border-gray-400 mt-2 mb-1" />
                    <p className="text-center text-[7px] text-gray-400 tracking-wide">THANK YOU FOR YOUR BUSINESS</p>
                    <p className="text-center text-[7px] text-gray-400">*** CUSTOMER COPY ***</p>
                </>
            )}
        </div>
    )
}
